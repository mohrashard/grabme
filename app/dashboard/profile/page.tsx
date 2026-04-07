'use client'

import React, { useEffect, useState } from 'react'
import { m } from 'framer-motion'
import { 
    LayoutDashboard, 
    Briefcase, 
    User, 
    Settings, 
    LogOut, 
    ShieldCheck, 
    MapPin, 
    Phone,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    Award,
    Star,
    Globe,
    Music,
    Save,
    Share2,
    Calendar,
    BriefcaseIcon,
    ChevronLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { updateWorkerSocialsAction } from '../actions/updateWorkerSocialsAction'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { getAdminContactAction } from '../../actions/getAdminContactAction'

export default function WorkerProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [fullProfile, setFullProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [savingSocials, setSavingSocials] = useState(false);
    const [socialLinks, setSocialLinks] = useState({
        instagram_url: '',
        tiktok_url: '',
        facebook_url: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const localUserRaw = localStorage.getItem('grabme_user');
            if (!localUserRaw) {
                router.push('/login');
                return;
            }

            const localUser = JSON.parse(localUserRaw);
            setUser(localUser);
            
            // Fetch the FULL profile
            const { data, error } = await supabase
                .from('workers')
                .select(`
  id,
  full_name,
  email,
  phone,
  nic_number,
  trade_category,
  sub_skills,
  years_experience,
  short_bio,
  home_district,
  specific_areas,
  districts_covered,
  profile_photo_url,
  nic_front_url,
  nic_back_url,
  selfie_url,
  certificate_url,
  past_work_photos,
  account_status,
  is_featured,
  is_identity_verified,
  is_reference_checked,
  reference_name,
  reference_phone,
  previous_employer,
  address,
  emergency_contact,
  agreed_to_code_of_conduct,
  whatsapp_pinged_at,
  activated_at,
  created_at,
  instagram_url,
  tiktok_url,
  facebook_url
`)
                .eq('id', localUser.id)
                .maybeSingle();

            if (data) {
                setFullProfile(data);
                setSocialLinks({
                    instagram_url: data.instagram_url || '',
                    tiktok_url: data.tiktok_url || '',
                    facebook_url: data.facebook_url || ''
                });
                // Sync session just in case
                localStorage.setItem('grabme_user', JSON.stringify({ ...localUser, ...data }));
            }
            
            setLoading(false);
        };
        fetchProfile();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('grabme_user');
        router.push('/login');
    };

    const handleSocialSave = async () => {
        if (!fullProfile?.id) return;
        setSavingSocials(true);
        const toastId = toast.loading('Updating social profiles...');

        try {
            const res = await updateWorkerSocialsAction({
                workerId: fullProfile.id,
                ...socialLinks
            });

            if (res.success) {
                toast.success('Social profiles updated!', { id: toastId });
                setFullProfile((prev: any) => ({ ...prev, ...socialLinks }));
            } else {
                toast.error(res.error || 'Failed to update', { id: toastId });
            }
        } catch (err) {
            toast.error('Connection error', { id: toastId });
        } finally {
            setSavingSocials(false);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'active': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Verified Active' };
            case 'pending': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Under Review' };
            case 'suspended': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'Suspended' };
            default: return { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20', label: 'Processing' };
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#1d4ed8] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const statusVis = getStatusStyles(fullProfile?.account_status || 'pending');

    return (
        <div className="min-h-screen font-sans flex bg-[#f1f5f9] text-[#0f172a]">
            {/* Sidebar */}
            <aside className="w-64 border-r border-[#e2e8f0] bg-white shadow-sm flex flex-col hidden lg:flex z-30">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-[#e2e8f0] shadow-md">
                            <Image src="/grabme.png" alt="Grab Me" fill className="object-cover" />
                        </div>
                        <span className="text-[#0f172a] text-lg font-bold tracking-tight">Portal</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {[
                        { icon: LayoutDashboard, label: 'Overview', href: '/dashboard', active: false },
                        { icon: User, label: 'Profile', href: '/dashboard/profile', active: true },
                    ].map((item, i) => (
                        <Link 
                            key={i} 
                            href={item.href}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${item.active ? 'bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/20' : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'}`}
                        >
                            <item.icon className="w-5 h-5" /> {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-[#e2e8f0]">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-32 lg:pb-12">
                <header className="h-20 border-b border-[#e2e8f0] flex items-center justify-between px-8 lg:px-12 bg-white/95 backdrop-blur-xl sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="w-10 h-10 rounded-full bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0] transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <h2 className="text-sm font-bold text-[#0f172a] uppercase tracking-widest">My Partner Profile</h2>
                    </div>
                </header>

                <div className="p-8 lg:p-12 max-w-5xl mx-auto space-y-12">
                    {/* Public Preview Info Banner */}
                    <m.div 
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#eff6ff] border border-[#bfdbfe] rounded-3xl p-6 flex items-center gap-6 shadow-sm"
                    >
                        <div className="w-12 h-12 bg-[#dbeafe] rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Eye className="w-6 h-6 text-[#1d4ed8]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-black text-[#1e3a8a] uppercase tracking-tight">Public Preview Mode</h3>
                            <p className="text-[11px] font-bold text-[#1e3a8a]/70 uppercase tracking-widest leading-relaxed">
                                This is exactly how customers see your profile on the directory. To update your info or trade, contact Admin via WhatsApp.
                            </p>
                        </div>
                    </m.div>
                    {/* Profile Hero section */}
                    <div className="relative pt-20">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-[#dbeafe]/50 to-transparent blur-[80px] rounded-full pointer-events-none" />
                        
                        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-[#bfdbfe] blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-all pointer-events-none" />
                                <div className="relative w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-white">
                                    <Image 
                                        src={fullProfile?.profile_photo_url || '/grabme.png'} 
                                        alt={fullProfile?.full_name || 'Profile'} 
                                        fill 
                                        className="object-cover" 
                                    />
                                </div>
                                <div className={`absolute -bottom-2 -right-2 w-10 h-10 ${statusVis.bg} ${statusVis.border} border rounded-2xl flex items-center justify-center shadow-md bg-white`}>
                                    {fullProfile?.account_status === 'active' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Clock className="w-5 h-5 text-amber-500" />}
                                </div>
                            </div>
                            
                            <div className="flex-1 text-center md:text-left space-y-3 pb-2">
                                <span className={`inline-flex items-center gap-2 px-3 py-1 ${statusVis.bg} ${statusVis.border} border rounded-full text-xs font-black uppercase tracking-widest ${statusVis.text} bg-white shadow-sm`}>
                                    {statusVis.label}
                                </span>
                                <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none text-[#0f172a] ">{fullProfile?.full_name}</h1>
                                <div className="flex flex-wrap justify-center md:justify-start gap-y-2 gap-x-6">
                                    <p className="flex items-center gap-2 text-[#475569] text-sm font-bold uppercase tracking-widest"><BriefcaseIcon className="w-4 h-4" /> {fullProfile?.trade_category}</p>
                                    <p className="flex items-center gap-2 text-[#475569] text-sm font-bold uppercase tracking-widest"><MapPin className="w-4 h-4" /> {fullProfile?.home_district}, {fullProfile?.town}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Stats Summary */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-white border border-[#e2e8f0] rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#1d4ed8] flex items-center gap-2">
                                    <Award className="w-4 h-4" /> Professional Pulse
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[#64748b] text-sm font-bold uppercase tracking-widest">Experience</p>
                                        <p className="text-[#0f172a] font-black">{fullProfile?.years_experience}+ Years</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[#64748b] text-sm font-bold uppercase tracking-widest">ID Verified</p>
                                        <p className={fullProfile?.is_identity_verified ? 'text-emerald-600 font-black' : 'text-[#64748b] font-bold'}>{fullProfile?.is_identity_verified ? 'YES' : 'PENDING'}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[#64748b] text-sm font-bold uppercase tracking-widest">Reference</p>
                                        <p className={fullProfile?.is_reference_checked ? 'text-emerald-600 font-black' : 'text-[#64748b] font-bold'}>{fullProfile?.is_reference_checked ? 'VERIFIED' : 'PENDING'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-[#e2e8f0] rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#1d4ed8] flex items-center gap-2">
                                    <Phone className="w-4 h-4" /> Identity Contact
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#64748b] mb-1">WhatsApp</p>
                                        <p className="text-sm font-bold text-[#0f172a]">{fullProfile?.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#64748b] mb-1">NIC Number</p>
                                        <p className="text-sm font-bold text-[#0f172a]">{fullProfile?.nic_number}</p>
                                    </div>
                                </div>
                            </div>

                            {/* SOCIAL MEDIA HUB */}
                            <div className="bg-white border border-[#e2e8f0] rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group shadow-sm">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#eff6ff] blur-3xl group-hover:scale-150 transition-transform" />
                                
                                <div className="flex items-center justify-between relative z-10">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-[#1d4ed8] flex items-center gap-2">
                                        <Share2 className="w-4 h-4" /> Digital Footprint
                                    </h3>
                                    <button 
                                        onClick={handleSocialSave}
                                        disabled={savingSocials}
                                        className="text-[10px] font-black uppercase tracking-widest text-[#1d4ed8] hover:text-[#1e3a8a] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        <Save className="w-3.5 h-3.5" /> {savingSocials ? 'Saving...' : 'Save Links'}
                                    </button>
                                </div>

                                {/* Trust Booster Nudge */}
                                <div className="p-4 bg-[#eff6ff] border border-[#bfdbfe] rounded-2xl relative z-10">
                                    <p className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider leading-relaxed">
                                        💡 Tip: Partners with social links are <span className="text-[#1d4ed8] font-black">70% more likely</span> to be hired. It builds instant trust!
                                    </p>
                                </div>

                                <div className="space-y-5 relative z-10">
                                    {[
                                        { id: 'instagram_url', icon: Globe, label: 'Instagram URL', placeholder: 'https://instagram.com/work...' },
                                        { id: 'tiktok_url', icon: Music, label: 'TikTok URL', placeholder: 'https://tiktok.com/@yourname...' },
                                        { id: 'facebook_url', icon: Share2, label: 'Facebook URL', placeholder: 'https://facebook.com/page...' },
                                    ].map((social) => (
                                        <div key={social.id} className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-[#64748b] uppercase tracking-[0.2em] ml-1">
                                                <social.icon className="w-3 h-3 text-[#1d4ed8]" /> {social.label}
                                            </label>
                                            <input 
                                                type="url"
                                                value={(socialLinks as any)[social.id]}
                                                onChange={(e) => setSocialLinks((prev: any) => ({ ...prev, [social.id]: e.target.value }))}
                                                placeholder={social.placeholder}
                                                className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#1d4ed8] transition-all shadow-inner"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Details */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white border border-[#e2e8f0] shadow-sm rounded-[3rem] p-10 md:p-12 space-y-10">
                                {/* Bio Section */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[#64748b] border-l-2 border-[#1d4ed8] pl-4 py-1">About My Craft</h3>
                                    <p className="text-lg text-[#0f172a] leading-relaxed font-medium italic">
                                        "{fullProfile?.short_bio || 'No bio provided.'}"
                                    </p>
                                </div>

                                {/* Skills Section */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[#64748b] border-l-2 border-[#1d4ed8] pl-4 py-1">Expertise & Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {fullProfile?.sub_skills?.map((skill: string, i: number) => (
                                            <span key={i} className="px-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs font-bold text-[#475569]">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Network Section */}
                                <div className="space-y-6 pt-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[#64748b] border-l-2 border-[#1d4ed8] pl-4 py-1">Service Coverage</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-4 p-4 bg-white border border-[#e2e8f0] shadow-sm rounded-2xl">
                                            <div className="w-10 h-10 bg-[#eff6ff] rounded-xl flex items-center justify-center text-[#1d4ed8]">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-[#64748b] uppercase tracking-widest">Base District</p>
                                                <p className="text-sm font-black text-[#0f172a]">{fullProfile?.home_district}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-white border border-[#e2e8f0] shadow-sm rounded-2xl">
                                            <div className="w-10 h-10 bg-[#f0fdf4] rounded-xl flex items-center justify-center text-emerald-600">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-[#64748b] uppercase tracking-widest">Partner Since</p>
                                                <p className="text-sm font-black text-[#0f172a]">{new Date(fullProfile?.created_at).toLocaleDateString('en-GB')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl">
                                        <p className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-3 px-2">Districts Covered</p>
                                        <div className="flex flex-wrap gap-2">
                                            {fullProfile?.districts_covered?.map((d: string, i: number) => (
                                                <span key={i} className="text-[11px] font-bold text-[#0f172a] bg-white border border-[#e2e8f0] px-3 py-1 rounded-lg shadow-sm">
                                                    {d}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Help Banner */}
                            <div className="bg-[#1d4ed8] rounded-[2.5rem] p-8 relative overflow-hidden group shadow-xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] group-hover:scale-150 transition-all duration-700 rounded-full" />
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="text-center md:text-left">
                                        <h4 className="text-xl font-black text-white mb-2">Need to update your data?</h4>
                                        <p className="text-blue-100 text-sm font-bold uppercase tracking-wider">Contact Mr² Labs Admin on WhatsApp for profile edits.</p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            const { url } = await getAdminContactAction(`Requesting profile update for ${fullProfile?.full_name || ''}`);
                                            window.open(url, '_blank');
                                        }}
                                        className="px-8 py-4 bg-white text-[#1d4ed8] rounded-full text-xs font-black uppercase tracking-widest hover:bg-zinc-50 transition-all shadow active:scale-95 whitespace-nowrap"
                                    >
                                        Message Founder
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-12 py-10 border-t border-[#e2e8f0] flex justify-between items-center text-xs font-bold text-[#64748b] uppercase tracking-widest mt-12">
                     <span>© 2026 Grab Me Professional Portal</span>
                     <span className="text-[#334155]">Powered by Mr² Labs</span>
                </div>
            </main>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-[#e2e8f0] flex justify-around items-center h-20 z-50 px-4 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <Link href="/dashboard" className="flex flex-col items-center gap-1.5 p-3 text-[#64748b] hover:text-[#0f172a] transition-all">
                    <LayoutDashboard className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Overview</span>
                </Link>
                <Link href="/dashboard/profile" className="flex flex-col items-center gap-1.5 p-3 text-[#1d4ed8] transition-all">
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Profile</span>
                </Link>
                <button onClick={handleLogout} className="flex flex-col items-center gap-1.5 p-3 text-red-500/80 hover:text-red-600 transition-all">
                    <LogOut className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                </button>
            </nav>
        </div>
    );
}
