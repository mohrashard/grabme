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
    Star,
    ChevronLeft,
    Share2,
    Calendar,
    BriefcaseIcon,
    Award,
    Eye
} from 'lucide-react'
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
  created_at
`)
                .eq('id', localUser.id)
                .maybeSingle();

            if (data) {
                setFullProfile(data);
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

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'active': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Verified Active' };
            case 'pending': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Under Review' };
            case 'suspended': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'Suspended' };
            default: return { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20', label: 'Processing' };
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#090A0F] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const statusVis = getStatusStyles(fullProfile?.account_status || 'pending');

    return (
        <div className="min-h-screen font-sans flex bg-[#090A0F] text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-[#18181B] flex flex-col hidden lg:flex">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                            <Image src="/grabme.png" alt="Grab Me" fill className="object-cover" />
                        </div>
                        <span className="text-white text-lg font-bold tracking-tight">Portal</span>
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
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${item.active ? 'bg-[#4F46E5] text-white shadow-lg shadow-indigo-500/20' : 'text-white/30 hover:bg-white/5 hover:text-white'}`}
                        >
                            <item.icon className="w-5 h-5" /> {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-24">
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 lg:px-12 bg-[#090A0F]/50 backdrop-blur-xl sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest">My Partner Profile</h2>
                    </div>
                </header>

                <div className="p-8 lg:p-12 max-w-5xl mx-auto space-y-12">
                    {/* Public Preview Info Banner */}
                    <m.div 
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-6 flex items-center gap-6"
                    >
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Eye className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-black text-white uppercase tracking-tight">Public Preview Mode</h3>
                            <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">
                                This is exactly how customers see your profile on the directory. To update your info or trade, contact Admin via WhatsApp.
                            </p>
                        </div>
                    </m.div>
                    {/* Profile Hero section */}
                    <div className="relative pt-20">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-indigo-500/10 to-transparent blur-[120px] rounded-full pointer-events-none" />
                        
                        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-all" />
                                <div className="relative w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-[#18181B] shadow-2xl">
                                    <Image 
                                        src={fullProfile?.profile_photo_url || '/grabme.png'} 
                                        alt={fullProfile?.full_name || 'Profile'} 
                                        fill 
                                        className="object-cover" 
                                    />
                                </div>
                                <div className={`absolute -bottom-2 -right-2 w-10 h-10 ${statusVis.bg} ${statusVis.border} border rounded-2xl flex items-center justify-center shadow-xl`}>
                                    {fullProfile?.account_status === 'active' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Clock className="w-5 h-5 text-amber-500" />}
                                </div>
                            </div>
                            
                            <div className="flex-1 text-center md:text-left space-y-3 pb-2">
                                <span className={`inline-flex items-center gap-2 px-3 py-1 ${statusVis.bg} ${statusVis.border} border rounded-full text-xs font-black uppercase tracking-widest ${statusVis.text}`}>
                                    {statusVis.label}
                                </span>
                                <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none text-white ">{fullProfile?.full_name}</h1>
                                <div className="flex flex-wrap justify-center md:justify-start gap-y-2 gap-x-6">
                                    <p className="flex items-center gap-2 text-white/30 text-sm font-bold uppercase tracking-widest"><BriefcaseIcon className="w-4 h-4" /> {fullProfile?.trade_category}</p>
                                    <p className="flex items-center gap-2 text-white/30 text-sm font-bold uppercase tracking-widest"><MapPin className="w-4 h-4" /> {fullProfile?.home_district}, {fullProfile?.town}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Stats Summary */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-[#18181B] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#4F46E5] flex items-center gap-2">
                                    <Award className="w-4 h-4" /> Professional Pulse
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Experience</p>
                                        <p className="text-white font-black">{fullProfile?.years_experience}+ Years</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">ID Verified</p>
                                        <p className={fullProfile?.is_identity_verified ? 'text-emerald-400 font-black' : 'text-zinc-600 font-bold'}>{fullProfile?.is_identity_verified ? 'YES' : 'PENDING'}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Reference</p>
                                        <p className={fullProfile?.is_reference_checked ? 'text-emerald-400 font-black' : 'text-zinc-600 font-bold'}>{fullProfile?.is_reference_checked ? 'VERIFIED' : 'PENDING'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#18181B] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#4F46E5] flex items-center gap-2">
                                    <Phone className="w-4 h-4" /> Identity Contact
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/20 mb-1">WhatsApp</p>
                                        <p className="text-sm font-bold text-white">{fullProfile?.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/20 mb-1">NIC Number</p>
                                        <p className="text-sm font-bold text-white">{fullProfile?.nic_number}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Details */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-[#18181B] border border-white/5 rounded-[3rem] p-10 md:p-12 space-y-10">
                                {/* Bio Section */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.25em] text-white/30 border-l-2 border-indigo-500 pl-4 py-1">About My Craft</h3>
                                    <p className="text-lg text-white/60 leading-relaxed font-medium italic">
                                        "{fullProfile?.short_bio || 'No bio provided.'}"
                                    </p>
                                </div>

                                {/* Skills Section */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.25em] text-white/30 border-l-2 border-indigo-500 pl-4 py-1">Expertise & Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {fullProfile?.sub_skills?.map((skill: string, i: number) => (
                                            <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/60">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Network Section */}
                                <div className="space-y-6 pt-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.25em] text-white/30 border-l-2 border-indigo-500 pl-4 py-1">Service Coverage</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                                            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Base District</p>
                                                <p className="text-sm font-black text-white">{fullProfile?.home_district}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Partner Since</p>
                                                <p className="text-sm font-black text-white">{new Date(fullProfile?.created_at).toLocaleDateString('en-GB')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                                        <p className="text-xs font-bold text-white/20 uppercase tracking-widest mb-3 px-2">Districts Covered</p>
                                        <div className="flex flex-wrap gap-2">
                                            {fullProfile?.districts_covered?.map((d: string, i: number) => (
                                                <span key={i} className="text-[11px] font-bold text-white/40 bg-zinc-900 px-3 py-1 rounded-lg">
                                                    {d}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Help Banner */}
                            <div className="bg-indigo-600 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl shadow-indigo-500/20">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] group-hover:scale-150 transition-all duration-700 rounded-full" />
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="text-center md:text-left">
                                        <h4 className="text-xl font-black text-white mb-2">Need to update your data?</h4>
                                        <p className="text-white/60 text-sm font-bold uppercase tracking-wider">Contact Mr² Labs Admin on WhatsApp for profile edits.</p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            const { url } = await getAdminContactAction(`Requesting profile update for ${fullProfile?.full_name || ''}`);
                                            window.open(url, '_blank');
                                        }}
                                        className="px-8 py-4 bg-white text-[#4F46E5] rounded-full text-xs font-black uppercase tracking-widest hover:bg-zinc-100 transition-all shadow-lg active:scale-95"
                                    >
                                        Message Founder
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-12 py-10 border-t border-white/5 flex justify-between items-center text-xs font-bold text-white/10 uppercase tracking-widest mt-12">
                     <span>© 2026 Grab Me Professional Portal</span>
                     <span>Powered by Mr² Labs</span>
                </div>
            </main>
        </div>
    );
}
