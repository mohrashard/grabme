'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
    ShieldCheck, Users, BarChart3, ClipboardList,
    LogOut, CheckCircle2, X, AlertTriangle, Star,
    Phone, Eye, MessageSquare, Search, Filter,
    PauseCircle, UserCheck, Activity, TrendingUp, User,
    Zap, RefreshCw, Lock, ChevronRight, Clock,
    Briefcase, MapPin
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { 
    updateWorkerStatusAction, 
    getSignedUrlAction, 
    toggleFeaturedAction, 
    insertVerificationLogAction,
    fetchAdminDataAction,
    updateStatusWithLogAction,
    resetWorkerPasswordAction,
    logoutAdminAction
} from './actions/authActions'
import { Toaster, toast } from 'sonner'
import { TRADES } from '../register/constants'

const ADMIN_WHATSAPP_ACTIVATION_MSG = (name: string) =>
    encodeURIComponent(`Hi ${name}! 🎉 Your Grab Me Partner profile is now LIVE! Customers in your area can now find and contact you directly. Welcome to the team! — Grab Me Team`);

type Worker = {
    id: string;
    full_name: string;
    phone: string;
    email: string;
    nic_number: string;
    trade_category: string;
    account_status: string;
    profile_photo_url: string;
    nic_front_url: string;
    selfie_url: string;
    home_district: string;
    short_bio: string;
    is_featured: boolean;
    is_identity_verified: boolean;
    is_reference_checked: boolean;
    created_at: string;
    sub_skills: string[];
};

type Tab = 'pipeline' | 'directory' | 'analytics' | 'audit';

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { color: string; label: string }> = {
        pending: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Pending' },
        whatsapp_pinged: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'WA Pinged' },
        under_review: { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'Under Review' },
        active: { color: 'bg-green-500/10 text-green-400 border-green-500/20', label: 'Active' },
        rejected: { color: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Rejected' },
        suspended: { color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', label: 'Suspended' },
    };
    const c = map[status] ?? map['pending'];
    return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${c.color}`}>{c.label}</span>;
}

export default function AdminPage() {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>('pipeline');
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
    const [auditNote, setAuditNote] = useState('');
    const [auditOutcome, setAuditOutcome] = useState('pass');
    const [stats, setStats] = useState({ 
        total: 0, pending: 0, active: 0, suspended: 0, 
        clicksToday: 0, clicksThisWeek: 0,
        mostClickedTrade: 'N/A', mostClickedDistrict: 'N/A',
        totalClicks: 0, topClicks: [] as { label: string, count: number }[] 
    });
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
    const [checklists, setChecklists] = useState<Record<string, { nic: boolean, ref: boolean, notes: string }>>({});

    // Admin auth guard with 8-hour hardening
    useEffect(() => {
        const raw = localStorage.getItem('grabme_admin');
        if (!raw) { router.push('/admin/login'); return; }
        try {
            const session = JSON.parse(raw);
            const EIGHT_HOURS = 8 * 60 * 60 * 1000;
            const isExpired = Date.now() - session.loggedInAt > EIGHT_HOURS;

            if (session.role !== 'admin' || isExpired) {
                localStorage.removeItem('grabme_admin');
                router.push('/admin/login');
            }
        } catch {
            localStorage.removeItem('grabme_admin');
            router.push('/admin/login');
        }
    }, [router]);

    const fetchWorkers = useCallback(async () => {
        setLoading(true);
        const { success, workers: data, stats: newStats, error } = await fetchAdminDataAction();
        
        if (success && data && newStats) {
            const workerList = data as Worker[];
            setWorkers(workerList);
            setStats(newStats);

            // AUTO-SIGN: Proactively sign all PRIVATE images
            workerList.forEach(w => {
                // Profile photo is PUBLIC (avatars bucket) - no signing needed
                
                // Only pipeline workers need NIC/Selfie signed to save bandwidth
                if (['pending', 'whatsapp_pinged', 'under_review'].includes(w.account_status)) {
                    if (w.nic_front_url) getSignedUrl(w.nic_front_url);
                    if (w.selfie_url) getSignedUrl(w.selfie_url);
                }
            });
        } else {
            console.error('Fetch Error:', error);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchWorkers(); }, [fetchWorkers]);

    const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

    const getSignedUrl = async (path: string) => {
        if (!path) return;

        // Only generate signed URLs for the 'worker-documents' bucket (NIC, selfie).
        // Never generate signed URLs for the 'avatars' bucket — those are already
        // publicly accessible via their full public URL and require no signing.
        // Extract relative path if stored as full URL
        let relativePath = path;
        if (path.includes('/storage/v1/object/public/worker-documents/')) {
            relativePath = path.split('/storage/v1/object/public/worker-documents/')[1];
        } else if (path.includes('/worker-documents/')) {
            relativePath = path.split('/worker-documents/')[1];
        }

        const res = await getSignedUrlAction(relativePath);
        if (res.success && res.signedUrl) {
            setSignedUrls(prev => ({ ...prev, [path]: res.signedUrl! }));
            return res.signedUrl;
        } else {
            console.error('Failed to sign URL:', res.error);
        }
    };

    const updateStatus = async (id: string, status: string, worker?: Worker) => {
        setActionLoading(id + status);
        const toastId = toast.loading(`Updating ${worker?.full_name || 'Worker'} to ${status.toUpperCase()}...`);
        try {
            const checklist = checklists[id] || { nic: false, ref: false, notes: '' };
            
            const updates: any = {};
            if (status === 'active') {
                updates.activated_at = new Date().toISOString();
                updates.is_identity_verified = true;
                updates.is_reference_checked = checklist.ref;
            }

            // Using the bundled transactional action
            const { success, error } = await updateStatusWithLogAction(id, status, {
                nic_checked: checklist.nic,
                reference_called: checklist.ref,
                admin_notes: checklist.notes,
                outcome: status === 'active' ? 'pass' : 'fail'
            }, updates);

            if (!success) throw new Error(error);

            await fetchWorkers();
            
            if (status === 'active' && worker) {
                toast.success(
                    <div className="flex flex-col gap-2 w-full">
                        <span>Success: {worker.full_name} is now ACTIVE</span>
                        <a 
                            href={`https://wa.me/${worker.phone}?text=${ADMIN_WHATSAPP_ACTIVATION_MSG(worker.full_name)}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="mt-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#25D366] text-white rounded-lg text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                        >
                            Ping on WhatsApp
                        </a>
                    </div>, 
                    { id: toastId }
                );
            } else {
                toast.success(`Success: ${worker?.full_name || 'Worker'} is now ${status.toUpperCase()}`, { id: toastId });
            }
        } catch (err: any) {
            toast.error(`ERROR: ${err.message}`, { id: toastId });
        } finally {
            setActionLoading(null);
        }
    };

    const toggleFeatured = async (id: string, current: boolean) => {
        setActionLoading(id + 'featured');
        const { success } = await toggleFeaturedAction(id, !current);
        if (success) {
            toast.success(current ? 'Removed from Featured' : 'Added to Global Featured');
            await fetchWorkers();
        } else {
            toast.error('Failed to toggle featured status');
        }
        setActionLoading(null);
    };

    const submitAuditNote = async () => {
        if (!selectedWorker || !auditNote) return;
        setActionLoading('audit');
        const toastId = toast.loading('Saving audit record...');
        
        const { success, error } = await insertVerificationLogAction({
            worker_id: selectedWorker.id,
            action: 'reference_called',
            outcome: auditOutcome,
            admin_notes: auditNote,
        });

        if (success) {
            if (auditOutcome === 'pass') {
                await updateWorkerStatusAction(selectedWorker.id, selectedWorker.account_status, { is_reference_checked: true });
            }
            toast.success('Audit successfully logged', { id: toastId });
        } else {
            toast.error('Failed to save audit: ' + error, { id: toastId });
        }

        setAuditNote('');
        setSelectedWorker(null);
        await fetchWorkers();
        setActionLoading(null);
    };

    const updateTradeCategory = async (id: string, trade: string) => {
        await updateWorkerStatusAction(id, undefined as any, { trade_category: trade });
        await fetchWorkers();
    };

    const logout = async () => {
        await logoutAdminAction();
        localStorage.removeItem('grabme_admin');
        router.push('/admin/login');
    };

    const handleResetPassword = async (workerId: string, name: string) => {
        const newPass = window.prompt(`Reset Password for ${name}\nEnter new password (min 6 chars):`);
        if (!newPass || newPass.length < 6) {
            if (newPass) toast.error('Password too short (min 6 characters)');
            return;
        }

        const toastId = toast.loading('Hashing & Syncing New Password...');
        const { success, error } = await resetWorkerPasswordAction(workerId, newPass);
        
        if (success) {
            toast.success('Password successfully reset!', { id: toastId });
        } else {
            toast.error('Reset Failed: ' + error, { id: toastId });
        }
    };

    const filtered = workers.filter(w =>
        w.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        w.trade_category?.toLowerCase().includes(search.toLowerCase()) ||
        w.home_district?.toLowerCase().includes(search.toLowerCase()) ||
        w.nic_number?.toLowerCase().includes(search.toLowerCase())
    );

    const pipeline = filtered.filter(w => ['pending', 'whatsapp_pinged', 'under_review'].includes(w.account_status));
    const directory = filtered;

    // District analytics from workers
    const districtCounts = workers.reduce<Record<string, number>>((acc, w) => {
        const d = w.home_district || 'Unknown';
        acc[d] = (acc[d] || 0) + 1;
        return acc;
    }, {});
    const topDistricts = Object.entries(districtCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

    const tradeCounts = workers.reduce<Record<string, number>>((acc, w) => {
        const t = w.trade_category || 'Unknown';
        acc[t] = (acc[t] || 0) + 1;
        return acc;
    }, {});
    const topTrades = Object.entries(tradeCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

    const TABS = [
        { id: 'pipeline', label: 'Pipeline', icon: ShieldCheck, count: stats.pending },
        { id: 'directory', label: 'Directory', icon: Users, count: stats.total },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, count: null },
        { id: 'audit', label: 'Trust Audit', icon: ClipboardList, count: null },
    ] as const;

    return (
        <div className="min-h-screen bg-[#090A0F] text-white font-sans flex">
            <Toaster position="top-right" theme="dark" richColors closeButton />
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap'); * { font-family: 'Inter', sans-serif; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }`}</style>

            {/* ── Sidebar ── */}
            <aside className="w-64 bg-[#18181B] border-r border-white/5 flex flex-col fixed h-full z-30">
                {/* Logo */}
                <div className="p-7 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-white/10">
                            <Image src="/grabme.png" alt="Grab Me" fill sizes="32px" className="object-cover" />
                        </div>
                        <div>
                            <p className="text-white font-black text-sm tracking-tight leading-none">Grab Me</p>
                            <p className="text-[8px] font-black uppercase tracking-widest text-red-400">Ops Center</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id as Tab)}
                            className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-sm font-bold transition-all ${tab === t.id ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="flex items-center gap-3"><t.icon className="w-4 h-4" />{t.label}</span>
                            {t.count !== null && <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${tab === t.id ? 'bg-red-500/20 text-red-300' : 'bg-white/5 text-white/30'}`}>{t.count}</span>}
                        </button>
                    ))}
                </nav>

                {/* Stats */}
                <div className="p-4 border-t border-white/5 space-y-2">
                    {[
                        { label: 'Active Workers', val: stats.active, color: 'text-green-400' },
                        { label: 'In Pipeline', val: stats.pending, color: 'text-amber-400' },
                        { label: 'Suspended', val: stats.suspended, color: 'text-red-400' },
                    ].map(s => (
                        <div key={s.label} className="flex justify-between text-[11px] font-bold">
                            <span className="text-white/30">{s.label}</span>
                            <span className={s.color}>{s.val}</span>
                        </div>
                    ))}
                </div>

                {/* Logout */}
                <div className="p-4 border-t border-white/5">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 ml-64 overflow-y-auto">
                {/* Topbar */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#090A0F]/80 backdrop-blur-xl z-20">
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-widest text-white">
                            {tab === 'pipeline' && 'Gatekeeper — Approval Pipeline'}
                            {tab === 'directory' && 'Baas Manager — Full Directory'}
                            {tab === 'analytics' && 'Traction Pulse — Analytics'}
                            {tab === 'audit' && 'Trust Audit — Verification Logs'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchWorkers} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                            <RefreshCw className="w-4 h-4 text-white/40" />
                        </button>
                        <div className="relative">
                            <Search className="w-4 h-4 text-white/20 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search workers..."
                                className="pl-9 pr-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs text-white placeholder:text-white/20 outline-none focus:border-white/10 w-52 transition-all"
                            />
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-6xl mx-auto">
                    <AnimatePresence mode="wait">

                        {/* ══ PIPELINE TAB ══ */}
                        {tab === 'pipeline' && (
                            <m.div key="pipeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                                {loading ? (
                                    <div className="text-center py-40">
                                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                        <p className="text-white/20 text-xs font-bold tracking-widest uppercase">Loading Pipeline</p>
                                    </div>
                                ) : pipeline.length === 0 ? (
                                    <m.div 
                                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-32 bg-[#18181B] border border-white/5 rounded-[2.5rem] space-y-6"
                                    >
                                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20 shadow-2xl">
                                            <ShieldCheck className="w-10 h-10 text-green-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black text-white">Inbox Zero</h3>
                                            <p className="text-white/30 text-xs font-bold uppercase tracking-widest">No pending verifications at the moment.</p>
                                        </div>
                                    </m.div>
                                ) : pipeline.map(w => (
                                    <m.div
                                        key={w.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-[#18181B] border border-white/5 rounded-2xl p-6 flex flex-col lg:flex-row gap-6"
                                    >
                                        {/* Photo comparison */}
                                        <div className="flex gap-4 flex-shrink-0">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Profile</p>
                                                {!w.profile_photo_url || imageErrors[w.profile_photo_url]
                                                    ? (
                                                        <div className="w-24 h-24 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                                                            <User className="w-8 h-8 text-white/20" />
                                                        </div>
                                                      )
                                                    : (
                                                        <div className="relative group overflow-hidden rounded-xl border border-white/10">
                                                            <img 
                                                                src={w.profile_photo_url} 
                                                                alt="profile" 
                                                                onError={() => setImageErrors(prev => ({ ...prev, [w.profile_photo_url]: true }))}
                                                                className="w-24 h-24 object-cover" 
                                                            />
                                                        </div>
                                                    )
                                                }
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-white/20">NIC Front</p>
                                                {w.nic_front_url
                                                    ? (
                                                        <div className="relative group">
                                                            <img 
                                                                src={signedUrls[w.nic_front_url] || w.nic_front_url} 
                                                                alt="nic" 
                                                                className="w-24 h-24 rounded-xl object-cover border border-white/10" 
                                                            />
                                                            {!signedUrls[w.nic_front_url] && (
                                                                <button 
                                                                    onClick={() => getSignedUrl(w.nic_front_url)}
                                                                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                                                                >
                                                                    <Lock className="w-4 h-4 text-white" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )
                                                    : <div className="w-24 h-24 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/10 text-xs">No NIC</div>
                                                }
                                            </div>
                                            {w.selfie_url && (
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Selfie</p>
                                                    <div className="relative group">
                                                        <img 
                                                            src={signedUrls[w.selfie_url] || w.selfie_url} 
                                                            alt="selfie" 
                                                            className="w-24 h-24 rounded-xl object-cover border border-white/10" 
                                                        />
                                                        {!signedUrls[w.selfie_url] && (
                                                            <button 
                                                                onClick={() => getSignedUrl(w.selfie_url)}
                                                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                                                            >
                                                                <Lock className="w-4 h-4 text-white" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="text-lg font-black text-white">{w.full_name}</h3>
                                                    <p className="text-xs text-white/40">{w.trade_category} · {w.home_district} · NIC: {w.nic_number}</p>
                                                </div>
                                                <StatusBadge status={w.account_status} />
                                            </div>
                                            
                                            {/* VERIFICATION CHECKLIST UI */}
                                            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60 mb-2">Verification Checklist</p>
                                                <div className="flex gap-4">
                                                    <label className="flex items-center gap-2 cursor-pointer group">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={checklists[w.id]?.nic || false}
                                                            onChange={(e) => setChecklists(prev => ({ ...prev, [w.id]: { ...(prev[w.id] || { nic: false, ref: false, notes: '' }), nic: e.target.checked } }))}
                                                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-offset-0 focus:ring-0" 
                                                        />
                                                        <span className="text-[10px] font-bold text-white/40 group-hover:text-white/60 transition-colors">NIC CHECKED</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer group">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={checklists[w.id]?.ref || false}
                                                            onChange={(e) => setChecklists(prev => ({ ...prev, [w.id]: { ...(prev[w.id] || { nic: false, ref: false, notes: '' }), ref: e.target.checked } }))}
                                                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-offset-0 focus:ring-0" 
                                                        />
                                                        <span className="text-[10px] font-bold text-white/40 group-hover:text-white/60 transition-colors">REFERENCE CALLED</span>
                                                    </label>
                                                </div>
                                                <textarea 
                                                    placeholder="Admin notes (e.g. Reference confirmed identity and skills...)"
                                                    value={checklists[w.id]?.notes || ''}
                                                    onChange={(e) => setChecklists(prev => ({ ...prev, [w.id]: { ...(prev[w.id] || { nic: false, ref: false, notes: '' }), notes: e.target.value } }))}
                                                    className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-[11px] text-white outline-none focus:border-white/10 transition-all resize-none h-20"
                                                />
                                            </div>

                                            <p className="text-xs text-white/30 leading-relaxed">{w.short_bio || 'No bio provided.'}</p>
                                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-white/30">
                                                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {w.phone}</span>
                                                <span>·</span>
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(w.created_at).toLocaleDateString('en-GB')}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 min-w-[140px]">
                                            <button
                                                onClick={() => updateStatus(w.id, 'active', w)}
                                                disabled={!!actionLoading}
                                                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-green-400 transition-all disabled:opacity-50"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                {actionLoading === w.id + 'active' ? '...' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => updateStatus(w.id, 'under_review')}
                                                disabled={!!actionLoading}
                                                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/20 border border-purple-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-purple-400 hover:bg-purple-500/30 transition-all disabled:opacity-50"
                                            >
                                                <Eye className="w-4 h-4" /> Review
                                            </button>
                                            <a
                                                href={`https://wa.me/${w.phone}?text=${encodeURIComponent('Hi! This is the Grab Me team. We want to verify your registration.')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-green-400 hover:border-green-500/20 transition-all"
                                            >
                                                <MessageSquare className="w-4 h-4" /> Ping WA
                                            </a>
                                            <button
                                                onClick={() => updateStatus(w.id, 'rejected')}
                                                disabled={!!actionLoading}
                                                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400/60 hover:text-red-400 hover:border-red-500/20 transition-all disabled:opacity-50"
                                            >
                                                <X className="w-4 h-4" /> Reject
                                            </button>
                                        </div>
                                    </m.div>
                                ))}
                            </m.div>
                        )}

                        {/* ══ DIRECTORY TAB ══ */}
                        {tab === 'directory' && (
                            <m.div key="directory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                                {loading ? (
                                    <div className="text-center py-20 text-white/20 text-sm">Loading directory...</div>
                                ) : directory.map(w => (
                                    <div key={w.id} className="bg-[#18181B] border border-white/5 rounded-2xl p-5 flex items-center gap-5">
                                        {/* Avatar */}
                                        {!w.profile_photo_url || imageErrors[w.profile_photo_url]
                                            ? (
                                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 flex-shrink-0 font-black">
                                                    {w.full_name?.[0]}
                                                </div>
                                              )
                                            : (
                                                <img 
                                                    src={signedUrls[w.profile_photo_url] || w.profile_photo_url} 
                                                    alt="Avatar"
                                                    onError={() => setImageErrors(prev => ({ ...prev, [w.profile_photo_url]: true }))}
                                                    className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0" 
                                                />
                                              )
                                        }

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-black text-white truncate">{w.full_name}</h3>
                                                {w.is_featured && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
                                            </div>
                                            <p className="text-[11px] text-white/30">{w.trade_category} · {w.home_district}</p>
                                        </div>

                                        {/* Trade edit */}
                                        <select
                                            value={w.trade_category || ''}
                                            onChange={e => updateTradeCategory(w.id, e.target.value)}
                                            className="hidden lg:block bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white/60 outline-none [color-scheme:dark] hover:border-white/20 transition-all max-w-[150px]"
                                        >
                                            <option value="" disabled>Change Trade...</option>
                                            {TRADES.map(t => (
                                                <option key={t} value={t} className="bg-[#18181B]">{t}</option>
                                            ))}
                                        </select>

                                        <StatusBadge status={w.account_status} />

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => toggleFeatured(w.id, w.is_featured)}
                                                disabled={!!actionLoading}
                                                className={`p-2 rounded-xl border transition-all disabled:opacity-50 ${w.is_featured ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-white/5 border-white/5 text-white/20 hover:text-amber-400'}`}
                                                title="Toggle Featured"
                                            >
                                                <Star className={`w-4 h-4 ${w.is_featured ? 'fill-amber-400' : ''}`} />
                                            </button>
                                            {w.account_status === 'active' && (
                                                <button
                                                    onClick={() => updateStatus(w.id, 'suspended')}
                                                    disabled={!!actionLoading}
                                                    className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/20 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all disabled:opacity-50"
                                                    title="Suspend Worker"
                                                >
                                                    <PauseCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            {w.account_status === 'suspended' && (
                                                <button
                                                    onClick={() => updateStatus(w.id, 'active')}
                                                    disabled={!!actionLoading}
                                                    className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 transition-all disabled:opacity-50"
                                                    title="Reactivate Worker"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {w.account_status === 'pending' && (
                                                <button
                                                    onClick={() => updateStatus(w.id, 'active', w)}
                                                    disabled={!!actionLoading}
                                                    className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 transition-all disabled:opacity-50 flex-shrink-0"
                                                    title="Quick Activate"
                                                >
                                                    <Zap className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleResetPassword(w.id, w.full_name)}
                                                className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/20 hover:text-indigo-400 hover:border-indigo-500/20 transition-all font-bold group/reset flex-shrink-0"
                                                title="Reset Password"
                                            >
                                                <Lock className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedWorker(w); setTab('audit'); }}
                                                className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/20 hover:text-white/40 transition-all"
                                                title="Log Audit Note"
                                            >
                                                <ClipboardList className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </m.div>
                        )}

                        {/* ══ ANALYTICS TAB ══ */}
                        {tab === 'analytics' && (
                            <m.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                                {/* Phase 1 Launch Analytics Header */}
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        { label: 'Total Workers', value: stats.total, icon: Users, color: 'text-white' },
                                        { label: 'Verified Partners', value: stats.active, icon: UserCheck, color: 'text-green-400' },
                                        { label: 'Clicks Today', value: stats.clicksToday, icon: MessageSquare, color: 'text-indigo-400' },
                                        { label: 'Clicks This Week', value: stats.clicksThisWeek, icon: TrendingUp, color: 'text-indigo-400' },
                                        { label: 'Top Trade', value: stats.mostClickedTrade, icon: Briefcase, color: 'text-indigo-400' },
                                        { label: 'Top District', value: stats.mostClickedDistrict, icon: MapPin, color: 'text-indigo-400' },
                                    ].map((k, i) => (
                                        <div key={i} className="bg-[#18181B] border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl group-hover:scale-150 transition-transform rounded-full" />
                                            <div className="relative z-10 flex flex-col items-start gap-4">
                                                <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${k.color}`}>
                                                    <k.icon className="w-6 h-6" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className={`${typeof k.value === 'number' ? 'text-4xl lg:text-5xl' : 'text-xl lg:text-2xl leading-tight'} font-black tracking-tight ${k.color}`}>{k.value}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{k.label}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid lg:grid-cols-2 gap-6">
                                    {/* District Bar Chart */}
                                    <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Workers by District</h3>
                                            <TrendingUp className="w-4 h-4 text-white/20" />
                                        </div>
                                        <div className="space-y-3">
                                            {topDistricts.length === 0
                                                ? <p className="text-white/20 text-xs text-center py-8">No data yet</p>
                                                : topDistricts.map(([district, count]) => (
                                                <div key={district} className="space-y-1">
                                                    <div className="flex justify-between text-[11px] font-bold">
                                                        <span className="text-white/60">{district}</span>
                                                        <span className="text-white/40">{count}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-500 rounded-full transition-all"
                                                            style={{ width: `${(count / (topDistricts[0]?.[1] || 1)) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Trade Distribution */}
                                    <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Workers by Trade</h3>
                                            <Activity className="w-4 h-4 text-white/20" />
                                        </div>
                                        <div className="space-y-3">
                                            {topTrades.length === 0
                                                ? <p className="text-white/20 text-xs text-center py-8">No data yet</p>
                                                : topTrades.map(([trade, count]) => (
                                                <div key={trade} className="flex items-center justify-between">
                                                    <span className="text-[11px] font-bold text-white/50">{trade}</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex gap-0.5">
                                                            {Array.from({ length: Math.min(count, 10) }).map((_, i) => (
                                                                <div key={i} className="w-1.5 h-5 bg-indigo-500/40 rounded-sm" />
                                                            ))}
                                                        </div>
                                                        <span className="text-[11px] font-black text-white/40 w-5 text-right">{count}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Activation Rate */}
                                    <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6">Activation Rate</h3>
                                        <div className="flex items-center gap-6">
                                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-green-500 rounded-full transition-all"
                                                    style={{ width: stats.total > 0 ? `${(stats.active / stats.total) * 100}%` : '0%' }}
                                                />
                                            </div>
                                            <span className="text-xl font-black text-white">
                                                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-3">
                                            {stats.active} of {stats.total} workers approved and live on directory
                                        </p>
                                    </div>

                                    {/* DEMAND HOTSPOTS (Clicks by Trade & District) */}
                                    <div className="bg-[#18181B] border border-white/5 rounded-[2rem] p-8 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Demand Hotspots — WhatsApp Click Throughs</h3>
                                            <TrendingUp className="w-4 h-4 text-white/20" />
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {stats.topClicks?.length === 0 ? (
                                                <p className="text-white/20 text-[10px] font-bold uppercase py-10 text-center col-span-full italic">No clicks tracked yet.</p>
                                            ) : (
                                                stats.topClicks?.map((hotspot, idx) => (
                                                    <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-between group hover:bg-indigo-500/5 transition-all">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400/60">Rank #{idx+1}</span>
                                                                <span className="text-sm font-black text-white">{hotspot.count} <span className="text-[10px] text-white/20">Clicks</span></span>
                                                            </div>
                                                            <p className="text-[11px] font-bold text-white/60 group-hover:text-white leading-tight transition-colors">
                                                                {hotspot.label.split('|')[0].trim()}
                                                            </p>
                                                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                                                                {hotspot.label.split('|')[1]?.trim()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                            </m.div>
                        )}

                        {/* ══ TRUST AUDIT TAB ══ */}
                        {tab === 'audit' && (
                            <m.div key="audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                                {/* Audit Form */}
                                <div className="bg-[#18181B] border border-white/5 rounded-2xl p-8 space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Log Reference Check</h3>

                                    {/* Worker Selector */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Select Worker</label>
                                        <select
                                            value={selectedWorker?.id || ''}
                                            onChange={e => {
                                                const w = workers.find(w => w.id === e.target.value) || null;
                                                setSelectedWorker(w);
                                            }}
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white outline-none [color-scheme:dark] focus:border-[#4F46E5]"
                                        >
                                            <option value="" className="bg-[#18181B]">Choose a worker...</option>
                                            {workers.map(w => (
                                                <option key={w.id} value={w.id} className="bg-[#18181B]">
                                                    {w.full_name} — {w.trade_category} ({w.account_status})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedWorker && (
                                        <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                                            {selectedWorker.profile_photo_url && !imageErrors[selectedWorker.profile_photo_url] ? (
                                                <img 
                                                    src={signedUrls[selectedWorker.profile_photo_url] || selectedWorker.profile_photo_url} 
                                                    alt="" 
                                                    onError={() => setImageErrors(prev => ({ ...prev, [selectedWorker.profile_photo_url]: true }))}
                                                    className="w-12 h-12 rounded-xl object-cover border border-white/10" 
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center flex-shrink-0">
                                                    <User className="w-5 h-5 text-white/20" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-black text-white">{selectedWorker.full_name}</p>
                                                <p className="text-[11px] text-white/30">{selectedWorker.trade_category} · {selectedWorker.phone}</p>
                                            </div>
                                            <div className="ml-auto">
                                                <StatusBadge status={selectedWorker.account_status} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Outcome</label>
                                        <div className="flex gap-3">
                                            {[
                                                { val: 'pass', label: 'Pass ✓', color: 'green' },
                                                { val: 'fail', label: 'Fail ✗', color: 'red' },
                                                { val: 'no_answer', label: 'No Answer', color: 'amber' },
                                                { val: 'suspicious', label: 'Suspicious', color: 'purple' },
                                            ].map(o => (
                                                <button
                                                    key={o.val}
                                                    onClick={() => setAuditOutcome(o.val)}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                        auditOutcome === o.val
                                                            ? o.color === 'green' ? 'bg-green-500/20 border-green-500/30 text-green-400'
                                                            : o.color === 'red' ? 'bg-red-500/20 border-red-500/30 text-red-400'
                                                            : o.color === 'amber' ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                                                            : 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                                                            : 'bg-white/5 border-white/5 text-white/30'
                                                    }`}
                                                >
                                                    {o.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Admin Notes</label>
                                        <textarea
                                            value={auditNote}
                                            onChange={e => setAuditNote(e.target.value)}
                                            placeholder="e.g. Called former employer Mr. Perera. He confirmed this Baas is reliable but tends to be 30 mins late..."
                                            rows={4}
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm placeholder:text-white/10 outline-none focus:border-[#4F46E5] resize-none transition-colors"
                                        />
                                    </div>

                                    <button
                                        onClick={submitAuditNote}
                                        disabled={!selectedWorker || !auditNote || actionLoading === 'audit'}
                                        className="px-8 py-4 bg-indigo-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        {actionLoading === 'audit' ? 'Saving...' : 'Save Audit Note'}
                                    </button>
                                </div>
                            </m.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="border-t border-white/5 px-8 py-6 flex justify-between text-[10px] font-black uppercase tracking-widest text-white/10">
                    <span>Grab Me Admin — Alpha v1.0.4</span>
                    <span>Powered by Mr² Labs</span>
                </div>
            </main>
        </div>
    );
}
