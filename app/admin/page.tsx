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
    Briefcase, MapPin, Trash2, Edit3, Save, Upload,
    Camera, Plus, Trash, Globe, ExternalLink, Bell, Loader2, Copy
} from 'lucide-react'
import imageCompression from 'browser-image-compression'
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
import {
    deleteWorkerAction,
    updateWorkerAction,
    deleteCustomerAction,
    deleteClickAction
} from './actions/workerActions'
import { Toaster, toast } from 'sonner'
import { DISTRICTS } from '../register/constants'
import {
    addServiceAction, deleteServiceAction, addSkillAction, deleteSkillAction,
    addKeywordAction, deleteKeywordAction, fetchTaxonomyAdminAction,
    bulkImportTaxonomyAction
} from './actions/taxonomyActions'
import { AdminSidebar } from './components/AdminSidebar'
import { AdminMobileNav } from './components/AdminMobileNav'
import { PipelineTab } from './components/tabs/PipelineTab'
import { DirectoryTab } from './components/tabs/DirectoryTab'
import { AnalyticsTab } from './components/tabs/AnalyticsTab'
import { TrustAuditTab } from './components/tabs/TrustAuditTab'
import { CustomerLeadsTab } from './components/tabs/CustomerLeadsTab'
import { TaxonomyTab } from './components/tabs/TaxonomyTab'

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
    nic_back_url: string;
    selfie_url: string;
    certificate_url: string;
    video_pitch_url: string;
    instagram_url: string;
    tiktok_url: string;
    facebook_url: string;
    home_district: string;
    short_bio: string;
    is_featured: boolean;
    is_identity_verified: boolean;
    is_reference_checked: boolean;
    is_certificate_verified: boolean;
    is_experience_verified: boolean;
    admin_notes: string;
    created_at: string;
    sub_skills: string[];
};

import { StatusBadge } from './components/StatusBadge'
import { ImageModal } from './components/modals/ImageModal'
import { DeleteConfirmationModal } from './components/modals/DeleteConfirmationModal'
import { DeleteTaxonomyModal } from './components/modals/DeleteTaxonomyModal'
import { BulkImportModal } from './components/modals/BulkImportModal'
import { EditWorkerModal } from './components/modals/EditWorkerModal'

export type Lead = {
    id: string;
    full_name: string;
    phone: string;
    district: string;
    lat?: number;
    lng?: number;
    area_name?: string;
    service_needed?: string;
    registered_at: string;
};

export type Tab = 'pipeline' | 'directory' | 'leads' | 'analytics' | 'audit' | 'taxonomy';

export default function AdminPage() {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>('pipeline');
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
    const [selectedImage, setSelectedImage] = useState<{ url: string; label: string; isLocked: boolean } | null>(null);
    const [auditNote, setAuditNote] = useState('');
    const [auditOutcome, setAuditOutcome] = useState('pass');
    const [stats, setStats] = useState({
        total: 0, pending: 0, active: 0, suspended: 0,
        clicksToday: 0, clicksThisWeek: 0,
        mostClickedTrade: 'N/A', mostClickedDistrict: 'N/A',
        totalClicks: 0, topClicks: [] as { label: string, count: number }[]
    });
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
    const [checklists, setChecklists] = useState<Record<string, { nic: boolean, ref: boolean, cert: boolean, exp: boolean, notes: string }>>({});

    // NEW: Edit & Delete & Leads State
    const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
    const [deletingWorker, setDeletingWorker] = useState<Worker | null>(null);
    const [leadsSubTab, setLeadsSubTab] = useState<'future' | 'matrices'>('future');
    const [clicks, setClicks] = useState<any[]>([]);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [uploadingField, setUploadingField] = useState<string | null>(null);

    // Taxonomy management state
    const [taxonomy, setTaxonomy] = useState<any>(null);
    const [taxLoading, setTaxLoading] = useState(false);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [newServiceName, setNewServiceName] = useState('');
    const [newSkillName, setNewSkillName] = useState('');
    const [newKeyword, setNewKeyword] = useState('');

    // Custom Taxonomy Delete state
    const [taxDeleting, setTaxDeleting] = useState<{ id: string, name: string, type: 'Service' | 'Skill' | 'Keyword' } | null>(null);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [isBulkLoading, setIsBulkLoading] = useState(false);

    const fetchTaxonomy = async () => {
        setTaxLoading(true);
        const res = await fetchTaxonomyAdminAction();
        if (res.success) setTaxonomy(res.data);
        setTaxLoading(false);
    };

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
            } else {
                // Fetch taxonomy once authenticated
                fetchTaxonomy();
            }
        } catch {
            localStorage.removeItem('grabme_admin');
            router.push('/admin/login');
        }
    }, [router]);

    const fetchWorkers = useCallback(async () => {
        setLoading(true);
        const { success, workers: data, leads: leadData, clicks: clickData, stats: newStats, error } = await fetchAdminDataAction();

        if (success && data && newStats) {
            const workerList = data as Worker[];
            setWorkers(workerList);
            if (leadData) setLeads(leadData as Lead[]);
            if (clickData) setClicks(clickData);
            setStats(newStats);

            // The original logic kept private documents (NIC/Selfie) locked by default.
            // They are only fetched and unlocked on-demand when the admin clicks them.
        } else {
            console.error('Fetch Error:', error);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchWorkers(); }, [fetchWorkers]);

    const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

    const getSignedUrl = async (path: string) => {
        if (!path) return;

        // GUARD: Only sign paths that belong to worker-documents (private bucket).
        // Profile photos (avatars), certificates, and other public files must NOT be signed.
        const isWorkerDoc = !path.startsWith('http')
            || path.includes('/worker-documents/');
        if (!isWorkerDoc) return;

        // Extract the relative path from any full Supabase storage URL
        let relativePath = path;
        if (path.includes('/storage/v1/object/public/worker-documents/')) {
            relativePath = path.split('/storage/v1/object/public/worker-documents/')[1];
        } else if (path.includes('/storage/v1/object/authenticated/worker-documents/')) {
            relativePath = path.split('/storage/v1/object/authenticated/worker-documents/')[1];
        } else if (path.includes('/worker-documents/')) {
            relativePath = path.split('/worker-documents/')[1];
        }

        const res = await getSignedUrlAction(relativePath);
        if (res.success && res.signedUrl) {
            setSignedUrls(prev => ({ ...prev, [path]: res.signedUrl! }));
            return res.signedUrl;
        } else {
            console.error('Failed to sign URL:', res.error, '| path:', relativePath);
        }
    };

    const openLightbox = async (path: string, label: string) => {
        if (!path) {
            return; // No image exists to open
        }

        const isLocked = path.includes('worker-documents') || !path.startsWith('http');

        if (isLocked && !signedUrls[path]) {
            const toastId = toast.loading('Unlocking secure document...');
            const signed = await getSignedUrl(path);
            if (signed) {
                toast.dismiss(toastId);
                setSelectedImage({ url: signed, label, isLocked: true });
            } else {
                toast.error('Failed to access secure document. It may be corrupted or deleted.', { id: toastId });
            }
        } else {
            setSelectedImage({
                url: signedUrls[path] || path,
                label,
                isLocked
            });
        }
    };

    const getValidPhotos = (input: any): string[] => {
        if (!input) return [];
        if (Array.isArray(input)) return input.filter(p => !!p && typeof p === 'string');
        if (typeof input === 'string') {
            if (input.startsWith('{') && input.endsWith('}')) {
                return input.slice(1, -1).split(',').map(s => s.trim().replace(/^"(.*)"$/, '$1')).filter(p => !!p);
            }
            return input.split(',').map(s => s.trim()).filter(p => !!p);
        }
        return [];
    };

    const updateStatus = async (id: string, status: string, worker?: Worker, forceZap: boolean = false) => {
        setActionLoading(id + (forceZap ? 'zap' : status));
        const toastId = toast.loading(`${forceZap ? 'Ultra-Quick' : 'Updating'} ${worker?.full_name || 'Worker'} to ${status.toUpperCase()}...`);
        try {
            const checklist = checklists[id] || { nic: false, ref: false, cert: false, exp: false, notes: '' };

            // Persist the status AND all checklist fields into the 'workers' table
            const updates: any = {
                is_identity_verified: forceZap ? true : !!checklist.nic,
                is_reference_checked: !!checklist.ref, // Never forced by Zap
                is_certificate_verified: forceZap ? true : !!checklist.cert,
                is_experience_verified: forceZap ? true : !!checklist.exp,
                admin_notes: checklist.notes
            };

            // "Quick Activate" logic: Auto-verify Identity, Cert, and Exp ONLY when zapping or first activating
            if (forceZap) {
                status = 'active'; // Force status if zapping
                updates.activated_at = new Date().toISOString();
            } else if (status === 'active' && worker?.account_status !== 'active') {
                updates.activated_at = new Date().toISOString();
            }

            // Using the bundled transactional action (updates worker AND logs action)
            const { success, error } = await updateStatusWithLogAction(id, status, {
                nic_checked: updates.is_identity_verified,
                reference_called: updates.is_reference_checked,
                certificate_checked: updates.is_certificate_verified,
                experience_checked: updates.is_experience_verified,
                admin_notes: checklist.notes,
                outcome: status === 'active' ? 'pass' : (status === (worker?.account_status || '') ? 'pass' : 'fail')
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

    const handleDeleteWorker = async (id: string) => {
        setIsDeleting(true);
        const toastId = toast.loading('Permenantly deleting worker and all files...');
        try {
            const { success, error } = await deleteWorkerAction(id);
            if (!success) throw new Error(error);
            toast.success('Worker deleted successfully', { id: toastId });
            setDeletingWorker(null);
            await fetchWorkers();
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete worker', { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdateWorker = async (id: string, updates: any) => {
        setIsSaving(true);
        const toastId = toast.loading('Syncing profile updates...');
        try {
            const { success, error } = await updateWorkerAction(id, updates);
            if (!success) throw new Error(error);
            toast.success('Profile updated successfully', { id: toastId });
            setEditingWorker(null);
            await fetchWorkers();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update profile', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (file: File, type: 'avatars' | 'worker-documents' | 'portfolio'): Promise<string | null> => {
        setUploadingField(type);
        try {
            const options = { maxSizeMB: 0.3, maxWidthOrHeight: 1024, useWebWorker: false };
            const processedFile = file.size > 0.3 * 1024 * 1024 ? await imageCompression(file, options) : file;

            const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `admin_edit_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `workers/${fileName}`;

            const { data, error } = await supabase.storage
                .from(type)
                .upload(filePath, processedFile, { upsert: true });

            if (error) throw error;

            // Generate the full public URL
            const { data: { publicUrl } } = supabase.storage.from(type).getPublicUrl(filePath);
            return publicUrl;
        } catch (err: any) {
            toast.error(`Upload failed: ${err.message}`);
            return null;
        } finally {
            setUploadingField(null);
        }
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

    const filtered = workers.filter(w => {
        const s = search.toLowerCase().trim();
        if (!s) return true; // Show all when empty

        const normalize = (n: string) => (n || '').replace(/\D/g, '');
        const stripSL = (digits: string) => {
            if (digits.startsWith('94')) return digits.substring(2);
            if (digits.startsWith('0')) return digits.substring(1);
            return digits;
        };

        const sd = normalize(s);
        const wd = normalize(w.phone || '');
        const sdS = stripSL(sd);
        const wdS = stripSL(wd);

        // Phone match logic: handle direct digits or stripped SL prefixes
        const phoneMatch = sd.length > 0 && (wd.includes(sd) || wdS.includes(sdS));

        return (
            w.full_name?.toLowerCase().includes(s) ||
            w.trade_category?.toLowerCase().includes(s) ||
            w.home_district?.toLowerCase().includes(s) ||
            w.nic_number?.toLowerCase().includes(s) ||
            phoneMatch
        );
    });

    const pipeline = filtered.filter(w => ['pending', 'whatsapp_pinged', 'under_review'].includes(w.account_status));
    const directory = filtered;

    // SEARCH ENHANCEMENT: Filter Leads & Clicks by number / name
    const filteredLeads = leads.filter(l => {
        const s = search.toLowerCase().trim();
        if (!s) return true;

        const normalize = (n: string) => (n || '').replace(/\D/g, '');
        const stripSL = (digits: string) => {
            if (digits.startsWith('94')) return digits.substring(2);
            if (digits.startsWith('0')) return digits.substring(1);
            return digits;
        };

        const sd = normalize(s);
        const ld = normalize(l.phone || '');
        const sdS = stripSL(sd);
        const ldS = stripSL(ld);
        const phoneMatch = sd.length > 0 && (ld.includes(sd) || ldS.includes(sdS));

        return (
            l.full_name?.toLowerCase().includes(s) ||
            l.district?.toLowerCase().includes(s) ||
            l.area_name?.toLowerCase().includes(s) ||
            l.service_needed?.toLowerCase().includes(s) ||
            phoneMatch
        );
    });

    const filteredClicks = clicks.filter(c => {
        const s = search.toLowerCase().trim();
        if (!s) return true;

        const normalize = (n: string) => (n || '').replace(/\D/g, '');
        const sd = normalize(s);

        const customerPhone = normalize(c.customer?.phone || '');
        const workerPhone = normalize(c.worker?.phone || ''); // Added worker phone check if available

        return (
            c.customer?.full_name?.toLowerCase().includes(s) ||
            c.worker?.full_name?.toLowerCase().includes(s) ||
            c.worker?.trade_category?.toLowerCase().includes(s) ||
            customerPhone.includes(sd) ||
            workerPhone.includes(sd)
        );
    });

    const deleteCustomer = async (id: string) => {
        const toastId = toast.loading('Deleting lead...');
        setConfirmingDeleteId(null);
        try {
            const res = await deleteCustomerAction(id);
            if (res.success) {
                toast.success('Lead deleted', { id: toastId });
                setLeads(prev => prev.filter(l => l.id !== id));
                fetchWorkers();
            } else {
                toast.error(res.error || 'Failed to delete lead', { id: toastId });
            }
        } catch {
            toast.error('System error occurred', { id: toastId });
        }
    };

    const deleteClick = async (id: string) => {
        const toastId = toast.loading('Removing record...');
        setConfirmingDeleteId(null);
        try {
            const res = await deleteClickAction(id);
            if (res.success) {
                toast.success('Record removed', { id: toastId });
                setClicks(prev => prev.filter(c => c.id !== id));
                fetchWorkers();
            } else {
                toast.error(res.error || 'Failed to delete record', { id: toastId });
            }
        } catch {
            toast.error('System error occurred', { id: toastId });
        }
    };

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
        { id: 'leads', label: 'Customer Leads', icon: UserCheck, count: leads.length },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, count: null },
        { id: 'audit', label: 'Trust Audit', icon: ClipboardList, count: null },
        { id: 'taxonomy', label: 'Services', icon: Briefcase, count: taxonomy?.services?.length || 0 },
    ] as const;

    return (
        <div className="min-h-screen bg-[#090A0F] text-white font-sans flex">
            {/* ══ MODALS ══ */}
            <ImageModal
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                imageUrl={selectedImage?.url || ''}
                label={selectedImage?.label || ''}
            />

            <DeleteConfirmationModal
                isOpen={!!deletingWorker}
                onClose={() => setDeletingWorker(null)}
                onConfirm={() => deletingWorker && handleDeleteWorker(deletingWorker.id)}
                workerName={deletingWorker?.full_name || ''}
                isDeleting={isDeleting}
            />

            <EditWorkerModal
                isOpen={!!editingWorker}
                onClose={() => setEditingWorker(null)}
                worker={editingWorker}
                onSave={handleUpdateWorker}
                isSaving={isSaving}
                handleFileUpload={handleFileUpload}
                uploadingField={uploadingField}
                taxonomy={taxonomy}
            />

            <DeleteTaxonomyModal
                isOpen={!!taxDeleting}
                onClose={() => setTaxDeleting(null)}
                onConfirm={async () => {
                    if (!taxDeleting) return;
                    setIsDeleting(true);
                    let res;
                    if (taxDeleting.type === 'Service') res = await deleteServiceAction(taxDeleting.id);
                    else if (taxDeleting.type === 'Skill') res = await deleteSkillAction(taxDeleting.id);
                    else if (taxDeleting.type === 'Keyword') res = await deleteKeywordAction(taxDeleting.id);

                    if (res?.success) {
                        toast.success(`${taxDeleting.type} removed successfully`);
                        fetchTaxonomy();
                        setTaxDeleting(null);
                    } else {
                        toast.error(res?.error || 'Failed to delete');
                    }
                    setIsDeleting(false);
                }}
                itemName={taxDeleting?.name || ''}
                itemType={taxDeleting?.type || ''}
                isDeleting={isDeleting}
            />

            <BulkImportModal
                isOpen={isBulkImportOpen}
                onClose={() => setIsBulkImportOpen(false)}
                isImporting={isBulkLoading}
                onImport={async (data: any[]) => {
                    setIsBulkLoading(true);
                    const res = await bulkImportTaxonomyAction(data);
                    if (res && res.success && res.results) {
                        const { created, updated, skills, keywords, errors } = res.results;
                        toast.success(`Import complete: ${created} new services, ${updated} synced.`);
                        if (skills > 0 || keywords > 0) {
                            toast.info(`Plus ${skills} skills and ${keywords} keywords processed.`);
                        }
                        if (errors && errors.length > 0) {
                            console.warn('Import warnings:', errors);
                            toast.warning(`${errors.length} items encountered issues.`);
                        }
                        setIsBulkImportOpen(false);
                        fetchTaxonomy();
                    } else {
                        toast.error(res?.error || 'Import failed');
                    }
                    setIsBulkLoading(false);
                }}
            />

            <Toaster position="top-right" theme="dark" richColors closeButton />
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap'); * { font-family: 'Inter', sans-serif; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }`}</style>

            {/* ── Sidebar ── */}
            <AdminSidebar 
                tab={tab} 
                setTab={(t) => setTab(t as Tab)} 
                stats={stats} 
                tabs={TABS} 
                onLogout={logout} 
            />

            {/* ── Mobile Bottom Nav ── */}
            <AdminMobileNav 
                tab={tab} 
                setTab={(t) => setTab(t as Tab)} 
                tabs={TABS} 
                onLogout={logout} 
            />

            {/* ── Main Content ── */}
            <main className="flex-1 lg:ml-64 pb-24 lg:pb-0 overflow-y-auto">
                {/* Topbar */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 lg:px-8 sticky top-0 bg-[#090A0F]/80 backdrop-blur-xl z-20 gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-[10px] lg:text-sm font-black uppercase tracking-widest text-white truncate">
                            {tab === 'pipeline' && 'Gatekeeper — Approval Pipeline'}
                            {tab === 'directory' && 'Baas Manager — Full Directory'}
                            {tab === 'leads' && 'Customer Leads — Notify Me Queue'}
                            {tab === 'analytics' && 'Traction Pulse — Analytics'}
                            {tab === 'audit' && 'Trust Audit — Verification Logs'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                        <button onClick={fetchWorkers} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                            <RefreshCw className="w-4 h-4 text-white/40" />
                        </button>
                        <div className="relative">
                            <Search className="w-4 h-4 text-white/20 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search..."
                                className="pl-9 pr-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs text-white placeholder:text-white/20 outline-none focus:border-white/10 w-32 lg:w-52 transition-all"
                            />
                        </div>
                    </div>
                </header>

                <div className="p-4 lg:p-8 max-w-6xl mx-auto">
                    <AnimatePresence mode="wait">
                        {tab === 'pipeline' && (
                            <PipelineTab
                                loading={loading} pipeline={pipeline} checklists={checklists} setChecklists={setChecklists}
                                imageErrors={imageErrors} setImageErrors={setImageErrors} signedUrls={signedUrls}
                                openLightbox={openLightbox} updateStatus={updateStatus} actionLoading={actionLoading}
                            />
                        )}
                        {tab === 'directory' && (
                            <DirectoryTab
                                loading={loading} directory={directory} checklists={checklists} setChecklists={setChecklists}
                                imageErrors={imageErrors} signedUrls={signedUrls} openLightbox={openLightbox}
                                updateStatus={updateStatus} actionLoading={actionLoading} setEditingWorker={setEditingWorker}
                                setDeletingWorker={setDeletingWorker} toggleFeatured={toggleFeatured} setTab={setTab}
                            />
                        )}
                        {tab === 'analytics' && (
                            <AnalyticsTab stats={stats} topDistricts={topDistricts} topTrades={topTrades} />
                        )}
                        {tab === 'audit' && (
                            <TrustAuditTab
                                workers={workers} selectedWorker={selectedWorker} setSelectedWorker={setSelectedWorker}
                                imageErrors={imageErrors} setImageErrors={setImageErrors} signedUrls={signedUrls}
                                auditOutcome={auditOutcome} setAuditOutcome={setAuditOutcome} auditNote={auditNote}
                                setAuditNote={setAuditNote} submitAuditNote={submitAuditNote} actionLoading={actionLoading}
                            />
                        )}
                        {tab === 'leads' && (
                            <CustomerLeadsTab
                                leadsSubTab={leadsSubTab} setLeadsSubTab={setLeadsSubTab} filteredLeads={filteredLeads}
                                filteredClicks={filteredClicks} confirmingDeleteId={confirmingDeleteId} setConfirmingDeleteId={setConfirmingDeleteId}
                                deleteCustomer={deleteCustomer} deleteClick={deleteClick}
                            />
                        )}
                        {tab === 'taxonomy' && (
                            <TaxonomyTab
                                taxonomy={taxonomy} fetchTaxonomy={fetchTaxonomy} taxLoading={taxLoading}
                                setIsBulkImportOpen={setIsBulkImportOpen} newServiceName={newServiceName} setNewServiceName={setNewServiceName}
                                selectedServiceId={selectedServiceId} setSelectedServiceId={setSelectedServiceId} setTaxDeleting={setTaxDeleting}
                                newSkillName={newSkillName} setNewSkillName={setNewSkillName} newKeyword={newKeyword} setNewKeyword={setNewKeyword}
                            />
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