'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { m } from 'framer-motion'
import { 
    LayoutDashboard, 
    User, 
    LogOut, 
    Bell, 
    ShieldCheck, 
    Zap, 
    CheckCircle2,
    Clock,
    AlertCircle,
    MessageSquare,
    ThumbsUp,
    TrendingUp,
    Award,
    Star,
    Trophy,
    Target,
    Wrench,
    Flame,
    MapPin,
    Activity,
    Eye,
    CreditCard,
    Lock
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { getAdminContactAction } from '../../actions/getAdminContactAction'
import { getWorkerStatusAction } from '../actions/getWorkerStatusAction'
import { toggleAvailableNowAction } from '../actions/toggleAvailableNowAction'
import { toast } from 'sonner'
import { DashboardSidebar } from './DashboardSidebar'

export default function DashboardClient() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [reviewCount, setReviewCount] = useState(0);
    const [isAvailableNow, setIsAvailableNow] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const localUserRaw = localStorage.getItem('grabme_user');
            if (!localUserRaw) {
                router.push('/login');
                return;
            }

            const localUser = JSON.parse(localUserRaw);
            
            if (localUser.role === 'worker') {
                const res = await getWorkerStatusAction(localUser.id);

                if (res.success && res.data) {
                    const data = res.data;
                    const updatedUser = { ...localUser, ...data };
                    setUser(updatedUser);
                    setIsAvailableNow(data.is_available_now || false);
                    localStorage.setItem('grabme_user', JSON.stringify(updatedUser));
                } else {
                    setUser(localUser);
                }
            } else {
                setUser(localUser);
            }
            
            setLoading(false);

            // Fetch real review count
            if (localUser.role === 'worker') {
                const { count } = await supabase
                    .from('reviews')
                    .select('*', { count: 'exact', head: true })
                    .eq('worker_id', localUser.id);
                setReviewCount(count || 0);
            }
        };
        checkAuth();
    }, [router]);

    const handleToggleAvailable = async () => {
        if (isToggling || user?.subscription_tier !== 'pro') return;
        setIsToggling(true);
        const newState = !isAvailableNow;
        
        setIsAvailableNow(newState); // Optimistic update
        
        const res = await toggleAvailableNowAction(user.id, newState);
        if (res.success) {
            toast.success(newState ? 'You are now LIVE for emergency dispatch!' : 'Emergency mode disabled.');
        } else {
            toast.error(res.error || 'Failed to update status.');
            setIsAvailableNow(!newState); // revert
        }
        setIsToggling(false);
    };

    // Calculate Profile Strength
    let profileStrength = 20; // Base score
    const missingSteps: {text: string, percent: number, href: string}[] = [];
    
    if (user?.role === 'worker') {
        if (user?.profile_photo_url) {
            profileStrength += 15;
        } else {
            missingSteps.push({ text: 'Upload Profile Photo', percent: 15, href: '/dashboard/profile' });
        }
        
        if (user?.short_bio && user.short_bio.trim() !== '') {
            profileStrength += 15;
        } else {
            missingSteps.push({ text: 'Add a Short Bio', percent: 15, href: '/dashboard/profile' });
        }
        
        if (user?.video_pitch_url) {
            profileStrength += 20;
        } else {
            missingSteps.push({ text: 'Upload Video Pitch (Get 3x more clicks)', percent: 20, href: '/dashboard/profile' });
        }
        
        if (user?.certificate_url) {
            profileStrength += 15;
        } else {
            missingSteps.push({ text: 'Add a Trust Certificate', percent: 15, href: '/dashboard/profile' });
        }
        
        if (user?.base_visiting_fee || (user?.price_estimates && user.price_estimates.length > 0)) {
            profileStrength += 15;
        } else {
            missingSteps.push({ text: 'Add Base Visiting Fee', percent: 15, href: '/dashboard/profile' });
        }
    }

    // Calculate Trust Tier
    let currentTier = 1;
    let tierName = "Level 1: Starter";
    let tierDescription = "Basic visibility in the directory.";
    let tierColor = "text-[#64748b]";
    let tierBg = "bg-slate-100";
    let nextTierGoal = "Upload an ID and Certificate to reach Level 2.";
    let tierProgress = 33;

    if (user?.role === 'worker') {
        if (user?.is_identity_verified && user?.certificate_url) {
            currentTier = 2;
            tierName = "Level 2: Verified Pro";
            tierDescription = "Enhanced visibility & trust badges.";
            tierColor = "text-[#1d4ed8]";
            tierBg = "bg-blue-100";
            tierProgress = 66;

            const missingEliteSteps = [];
            if (!user?.video_pitch_url) missingEliteSteps.push("a video pitch");
            if ((user?.likes_count || 0) < 5) missingEliteSteps.push(`${5 - (user?.likes_count || 0)} more likes`);
            if (profileStrength < 100) missingEliteSteps.push("100% profile strength");

            if (missingEliteSteps.length > 0) {
                nextTierGoal = `Get ${missingEliteSteps.join(' & ')} to reach Elite.`;
            } else {
                currentTier = 3;
                tierName = "Level 3: Elite Partner";
                tierDescription = "Maximum trust. Prioritized at the top of search results.";
                tierColor = "text-[#f59e0b]";
                tierBg = "bg-amber-100";
                nextTierGoal = "You are at the maximum trust tier!";
                tierProgress = 100;
            }
        }
    }

    // Calculate Competitive Benchmark
    let topPercentile = 60;
    if (profileStrength >= 80) topPercentile = 30;
    if (currentTier >= 2) topPercentile = 15;
    if (currentTier === 3 || (user?.likes_count || 0) >= 10) topPercentile = 5;
    
    const tradeName = user?.trade_category ? `${user.trade_category}s` : 'professionals';
    const areaName = user?.home_district ? user.home_district : 'your area';

    // Generate FOMO Engine Data (Hot Leads)
    const fomoEvents = useMemo(() => {
        if (!user || user.role !== 'worker') return [];
        const singleTrade = user.trade_category || 'professional';
        const pluralTrade = user.trade_category ? `${user.trade_category}s` : 'professionals';
        const area = user.home_district || 'your area';
        
        // Generate a deterministic number based on date and user id so it doesn't change on refresh
        const dateStr = new Date().toISOString().split('T')[0];
        const hashStr = (user.id || '') + dateStr + singleTrade;
        let hash = 0;
        for (let i = 0; i < hashStr.length; i++) {
            hash = (hash << 5) - hash + hashStr.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        
        const baseSearches = Math.abs(hash) % 15 + 24; // 24-38
        const hoursAgo = (Math.abs(hash) % 5) + 1; // 1-5 hours ago
        const percentage = (Math.abs(hash) % 12) + 10; // 10-21%
        
        return [
            { 
                icon: Flame, 
                color: 'text-orange-500', 
                bg: 'bg-orange-100 border-orange-200', 
                text: <><span className="font-bold text-orange-600">{baseSearches} people</span> searched for {pluralTrade} in {area} this week.</>
            },
            { 
                icon: Activity, 
                color: 'text-blue-500', 
                bg: 'bg-blue-100 border-blue-200', 
                text: <>A top-rated {singleTrade} near you was <span className="font-bold text-blue-600">contacted {hoursAgo} hours ago.</span></>
            },
            { 
                icon: TrendingUp, 
                color: 'text-emerald-500', 
                bg: 'bg-emerald-100 border-emerald-200', 
                text: <>Demand for {pluralTrade} is <span className="font-bold text-emerald-600">up {percentage}%</span>. Update your pricing to win more jobs!</>
            },
        ];
    }, [user?.trade_category, user?.home_district, user?.role, user?.id]);

    if (loading) return (
        <main className="flex-1 overflow-y-auto flex items-center justify-center pb-24 lg:pb-0">
            <div className="w-8 h-8 border-4 border-[#1d4ed8] border-t-transparent rounded-full animate-spin" />
        </main>
    );

    return (
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
            {/* Header */}
                <header className="h-20 border-b border-[#e2e8f0] flex items-center justify-between px-8 lg:px-12 bg-white/95 backdrop-blur-xl sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#dbeafe] border border-[#bfdbfe] flex items-center justify-center text-[#1d4ed8] font-black text-xs">
                            {user?.name?.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-[#0f172a]">Welcome, {user?.name?.split(' ')[0]}</h2>
                            <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">{user?.role === 'worker' ? 'Partner Account' : 'Customer Account'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4">
                        {user?.role === 'worker' && (
                            <a 
                                href={user?.slug ? `/worker/${user.slug}` : `/worker/${user?.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                            >
                                <Eye className="w-4 h-4" /> View as Customer
                            </a>
                        )}
                        <button className="p-3 bg-[#f1f5f9] rounded-xl border border-[#e2e8f0] hover:bg-[#e2e8f0] transition-all relative flex-shrink-0">
                            <Bell className="w-5 h-5 text-[#475569]" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
                        </button>
                    </div>
                </header>

                <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-10">
                    {/* Hero Card */}
                    <m.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="relative rounded-[2.5rem] p-10 overflow-hidden bg-gradient-to-br from-[#1e3a8a] to-[#1d4ed8] shadow-xl text-white border-none"
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="flex-1 space-y-4">
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-[#dbeafe]">
                                    <ShieldCheck className="w-4 h-4" /> Account Secured
                                </span>
                                <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none">Your Service <br /><span className="text-[#93c5fd] drop-shadow-sm">Intelligence.</span></h1>
                                <p className="text-[#bfdbfe] text-sm font-medium max-w-sm">Manage your profile, jobs, and communication from your personal portal.</p>
                            </div>
                            <div className="w-64 h-64 relative hidden md:block">
                                <div className="absolute inset-0 bg-white/10 blur-[60px] animate-pulse rounded-full" />
                                <LayoutDashboard className="w-full h-full text-white/20" />
                            </div>
                        </div>
                    </m.div>

                    {/* Available NOW Emergency Switch */}
                    {user?.role === 'worker' && user?.account_status === 'active' && (
                        <m.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className={`p-6 lg:p-8 rounded-3xl shadow-sm border transition-all duration-500 relative overflow-hidden ${isAvailableNow ? 'bg-emerald-500 border-emerald-400' : 'bg-white border-[#e2e8f0]'}`}
                        >
                            {isAvailableNow && (
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 blur-3xl rounded-full pointer-events-none" />
                            )}
                            
                            {user?.subscription_tier !== 'pro' && (
                                <div className="absolute inset-0 z-20 backdrop-blur-[2px] bg-white/80 flex flex-col items-center justify-center rounded-3xl">
                                    <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm mb-2">
                                        <Lock className="w-3.5 h-3.5" /> Pro Feature
                                    </div>
                                    <p className="text-[#475569] text-xs font-bold px-4 text-center">Upgrade your plan to unlock Emergency Dispatch ranking.</p>
                                    <Link href="/dashboard/billing" className="mt-3 bg-[#1d4ed8] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">
                                        View Plans
                                    </Link>
                                </div>
                            )}

                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${isAvailableNow ? 'bg-white text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <Zap className={`w-7 h-7 ${isAvailableNow ? 'animate-pulse' : ''}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className={`text-xl font-black transition-colors ${isAvailableNow ? 'text-white' : 'text-[#0f172a]'}`}>
                                                Emergency Dispatch
                                            </h3>
                                            {isAvailableNow && (
                                                <span className="relative flex h-3 w-3">
                                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-sm font-medium mt-1 transition-colors ${isAvailableNow ? 'text-emerald-50' : 'text-[#64748b]'}`}>
                                            {isAvailableNow 
                                                ? "You are pinned to the top of customer searches right now."
                                                : "Turn this on when you are available immediately for emergency jobs."}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleToggleAvailable}
                                    disabled={isToggling}
                                    className={`relative w-20 h-10 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 border-2 ${isAvailableNow ? 'bg-white border-white' : 'bg-slate-200 border-slate-300'}`}
                                >
                                    <span className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full transition-transform duration-300 shadow-sm ${isAvailableNow ? 'translate-x-10 bg-emerald-500' : 'translate-x-0 bg-white'}`} />
                                </button>
                            </div>
                        </m.div>
                    )}

                    {/* FOMO Engine: Hot Leads Feed */}
                    {user?.role === 'worker' && user?.account_status === 'active' && (
                        <m.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                            className="bg-white border border-[#e2e8f0] p-6 lg:p-8 rounded-3xl shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </div>
                                    <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-widest">Live Local Demand</h3>
                                </div>
                                <span className="text-[10px] font-bold text-[#64748b] bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3" /> {areaName}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {fomoEvents.map((event, idx) => (
                                    <m.div 
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + (idx * 0.1) }}
                                        className={`flex flex-col gap-4 p-5 rounded-2xl border ${event.bg.replace('bg-', 'bg-opacity-30 bg-')} transition-colors hover:bg-opacity-100`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-white shadow-sm border border-white/50`}>
                                            <event.icon className={`w-5 h-5 ${event.color}`} />
                                        </div>
                                        <p className="text-sm text-[#475569] leading-relaxed">
                                            {event.text}
                                        </p>
                                    </m.div>
                                ))}
                            </div>
                        </m.div>
                    )}

                    {/* Profile Strength Meter */}
                    {user?.role === 'worker' && (
                        <m.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="bg-white border border-[#e2e8f0] p-8 rounded-3xl shadow-sm"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                                <div>
                                    <h3 className="text-lg font-black text-[#0f172a]">Profile Strength</h3>
                                    <p className="text-sm text-[#64748b]">Complete your profile to rank higher and get more jobs.</p>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-[#1d4ed8]">{profileStrength}%</span>
                                    <span className="text-xs font-bold text-[#64748b] uppercase tracking-widest">Complete</span>
                                </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-6">
                                <m.div 
                                    initial={{ width: 0 }} animate={{ width: `${profileStrength}%` }} transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                                    className={`h-full rounded-full ${profileStrength === 100 ? 'bg-emerald-500' : 'bg-[#1d4ed8]'}`}
                                />
                            </div>

                            {/* Actionable Next Steps */}
                            {missingSteps.length > 0 && (
                                <div className="space-y-4 pt-2 border-t border-slate-100">
                                    <p className="text-[10px] font-black text-[#64748b] uppercase tracking-widest flex items-center gap-2">
                                        <Zap className="w-3.5 h-3.5 text-amber-500" /> Action Required to boost visibility
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {missingSteps.slice(0, 2).map((step, idx) => (
                                            <Link key={idx} href={step.href} className="flex items-center justify-between p-4 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors group">
                                                <span className="text-sm font-bold text-blue-900">{step.text}</span>
                                                <span className="text-[10px] font-black text-blue-600 bg-white px-2.5 py-1.5 rounded-lg border border-blue-200 shadow-sm group-hover:scale-105 transition-transform">+{step.percent}%</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {profileStrength === 100 && (
                                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                    <span className="text-sm font-bold text-emerald-900">Your profile is 100% complete! You are prioritized in search rankings.</span>
                                </div>
                            )}
                        </m.div>
                    )}

                    {/* Live Performance Stats */}
                    {user?.role === 'worker' && user?.account_status === 'active' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <m.div 
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                className="bg-[#0f172a] p-8 rounded-3xl shadow-lg relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] group-hover:scale-110 transition-all duration-500">
                                    <MessageSquare className="w-48 h-48 text-white -mt-10 -mr-10" />
                                </div>
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-[#3b82f6]" /> WhatsApp Clicks
                                    </p>
                                    <div>
                                        <div className="flex items-end gap-4 mb-2">
                                            <p className="text-6xl font-black text-white leading-none">{user?.visits_count || 0}</p>
                                            <span className="flex items-center gap-1 text-sm font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg mb-1">
                                                <TrendingUp className="w-3.5 h-3.5" /> +12%
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-[#cbd5e1]">Direct leads generated this week</p>
                                    </div>
                                </div>
                            </m.div>

                            <m.div 
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="bg-gradient-to-br from-[#1d4ed8] to-[#2563eb] p-8 rounded-3xl shadow-lg relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                                    <ThumbsUp className="w-48 h-48 text-white -mt-10 -mr-10" />
                                </div>
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <p className="text-xs font-bold text-[#93c5fd] uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <ThumbsUp className="w-4 h-4 text-white" /> Profile Likes
                                    </p>
                                    <div>
                                        <div className="flex items-end gap-4 mb-2">
                                            <p className="text-6xl font-black text-white leading-none">{user?.likes_count || 0}</p>
                                            <span className="flex items-center gap-1 text-sm font-bold text-white bg-white/20 px-2 py-1 rounded-lg mb-1">
                                                <TrendingUp className="w-3.5 h-3.5" /> Active
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-[#bfdbfe]">Community trust score</p>
                                    </div>
                                </div>
                            </m.div>
                        </div>
                    )}

                    {/* Competitive Benchmarking Banner */}
                    {user?.role === 'worker' && user?.account_status === 'active' && (
                        <m.div 
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}
                            className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-[2px] rounded-3xl shadow-md overflow-hidden relative group"
                        >
                            <div className="absolute inset-0 bg-white/20 blur-xl group-hover:bg-white/30 transition-all" />
                            <div className="bg-white rounded-[22px] p-6 md:p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-5 w-full md:w-auto">
                                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 border-4 border-amber-50 shadow-inner">
                                        <Trophy className="w-8 h-8 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                            <Target className="w-3 h-3" /> Market Ranking
                                        </p>
                                        <h4 className="text-xl md:text-2xl font-black text-[#0f172a] leading-tight">
                                            Top {topPercentile}% of {tradeName}
                                        </h4>
                                        <p className="text-sm font-bold text-[#64748b]">in {areaName} this month.</p>
                                    </div>
                                </div>
                                <div className="hidden md:block w-px h-16 bg-slate-100 mx-4" />
                                <div className="text-left md:text-right w-full md:w-auto bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-xl">
                                    <p className="text-sm font-bold text-[#475569] leading-relaxed max-w-[250px]">
                                        Keep updating your pricing and getting reviews to beat the competition and win more jobs!
                                    </p>
                                </div>
                            </div>
                        </m.div>
                    )}

                    {/* Trust Tier System */}
                    {user?.role === 'worker' && (
                        <m.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className="bg-white border border-[#e2e8f0] p-8 rounded-3xl shadow-sm"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                                <div>
                                    <h3 className="text-lg font-black text-[#0f172a]">Trust Tier Status</h3>
                                    <p className="text-sm text-[#64748b]">Elite Partners get prioritized at the top of search results.</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col md:flex-row items-center gap-8 bg-[#f8fafc] p-6 md:p-8 rounded-2xl border border-slate-100">
                                <div className={`w-32 h-32 rounded-[2rem] ${tierBg} flex items-center justify-center flex-shrink-0 shadow-inner rotate-3`}>
                                    <Award className={`w-16 h-16 ${tierColor} -rotate-3`} />
                                </div>
                                <div className="flex-1 text-center md:text-left space-y-3 w-full">
                                    <div>
                                        <h4 className={`text-3xl font-black tracking-tight ${tierColor}`}>{tierName}</h4>
                                        <p className="text-sm font-bold text-[#475569]">{tierDescription}</p>
                                    </div>
                                    
                                    <div className="pt-4 pb-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#64748b] mb-3">
                                            <span>Tier Progress</span>
                                            <span>{tierProgress}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                                            <div className={`h-full ${tierColor.replace('text-', 'bg-')} transition-all duration-1000`} style={{ width: `${tierProgress}%` }} />
                                        </div>
                                    </div>
                                    
                                    {currentTier < 3 && (
                                        <p className="text-xs font-black text-[#1d4ed8] uppercase tracking-widest mt-2 flex items-center justify-center md:justify-start gap-1.5 bg-blue-50 py-2 px-4 rounded-xl border border-blue-100 w-fit mx-auto md:mx-0">
                                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Next Goal: {nextTierGoal}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </m.div>
                    )}

                    {/* Review Chase Module */}
                    {user?.role === 'worker' && user?.account_status === 'active' && (() => {
                        const REVIEW_GOAL = 5;
                        const hasUnlocked = reviewCount >= REVIEW_GOAL;
                        const profileUrl = user?.slug
                            ? `https://www.grabme.page/worker/${user.slug}`
                            : `https://www.grabme.page/worker/${user?.id}`;
                        const waMessage = encodeURIComponent(
                            `Hi! I'm ${user?.full_name}, a verified ${user?.trade_category || 'professional'} on Grab Me. I'd really appreciate if you could leave me a quick review - it only takes 30 seconds! 🙏\n\n${profileUrl}`
                        );
                        const waLink = `https://wa.me/?text=${waMessage}`;

                        return (
                            <m.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                                className="bg-white border border-[#e2e8f0] p-8 rounded-3xl shadow-sm"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                    <div>
                                        <h3 className="text-lg font-black text-[#0f172a]">Review Chase</h3>
                                        <p className="text-sm text-[#64748b]">Unlock the <span className="font-bold text-amber-500">"Highly Recommended" Badge</span> with 5 verified reviews.</p>
                                    </div>
                                    {hasUnlocked && (
                                        <span className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl">
                                            <Trophy className="w-4 h-4 text-amber-500" /> Badge Unlocked!
                                        </span>
                                    )}
                                </div>

                                {/* Star Tracker */}
                                <div className="flex items-center justify-center gap-3 mb-6">
                                    {Array.from({ length: REVIEW_GOAL }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 h-14 rounded-2xl flex items-center justify-center border-2 transition-all ${
                                                i < reviewCount
                                                    ? 'bg-amber-400 border-amber-300 shadow-md shadow-amber-200'
                                                    : 'bg-slate-100 border-slate-200'
                                            }`}
                                        >
                                            <Star className={`w-6 h-6 ${
                                                i < reviewCount ? 'text-white fill-white' : 'text-slate-300'
                                            }`} />
                                        </div>
                                    ))}
                                </div>

                                <p className="text-center text-sm font-bold text-[#64748b] mb-8">
                                    {hasUnlocked
                                        ? '🎉 Congratulations! You have unlocked the Highly Recommended badge.'
                                        : `You have ${reviewCount} review${reviewCount !== 1 ? 's' : ''}. Get ${REVIEW_GOAL - reviewCount} more to unlock your badge and stand out!`
                                    }
                                </p>

                                {/* WhatsApp Share Button */}
                                <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-sm uppercase tracking-widest py-4 px-6 rounded-2xl shadow-md shadow-green-200 transition-colors"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    Share My Review Link on WhatsApp
                                </a>
                            </m.div>
                        );
                    })()}

                    {/* Conditional Status Messages */}
                    {user?.role === 'worker' && user?.account_status !== 'active' && (
                        <div className="bg-amber-50 border border-amber-200 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                            <div className="flex items-center gap-6 text-center md:text-left">
                                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                                    <AlertCircle className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-amber-900">Trust Check Underway</h3>
                                    <p className="text-sm text-amber-700/80">Our verification engine is currently reviewing your identity and NIC data. We'll ping you on WhatsApp as soon as your profile goes live.</p>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    const { url } = await getAdminContactAction('Hi, I registered on Grab Me and want to check my status.');
                                    window.open(url, '_blank');
                                }}
                                className="px-8 py-3 bg-[#1d4ed8] text-white rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all text-center shadow hover:shadow-md"
                            >
                                Contact Founder
                            </button>
                        </div>
                    )}

                    {user?.role === 'worker' && user?.account_status === 'suspended' && (
                        <m.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border border-red-200 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
                        >
                            <div className="flex items-center gap-6 text-center md:text-left">
                                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-red-900">Account Suspended</h3>
                                    <p className="text-sm text-red-700/80 max-w-sm">
                                        Your account has been suspended. If you believe this is a mistake, contact us on WhatsApp.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    const { url } = await getAdminContactAction(`My Grab Me account has been suspended. My NIC is: ${user?.nic || ''}`);
                                    window.open(url, '_blank');
                                }}
                                className="flex items-center gap-2 px-8 py-3 bg-[#1d4ed8] text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#1e3a8a] shadow hover:shadow-md hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Contact Support
                            </button>
                        </m.div>
                    )}

                    {user?.role === 'worker' && user?.account_status === 'active' && (
                        <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                            <div className="flex items-center gap-6 text-center md:text-left">
                                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-emerald-900">Profile is Live!</h3>
                                    <p className="text-sm text-emerald-700/80">Congratulations! You are now visible to customers in our home service directory. Keep your phone close to your bed!</p>
                                </div>
                            </div>
                            <span className="px-8 py-3 bg-white border border-[#e2e8f0] shadow-sm rounded-full text-[10px] font-black uppercase tracking-widest text-[#1d4ed8]">Active Channel</span>
                        </div>
                    )}
                </div>

                {/* Footer Attribution */}
                <div className="px-12 py-10 border-t border-[#e2e8f0] flex justify-between items-center text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
                    <span>&copy; 2026 Grab Me Dash</span>
                    <span className="text-[#475569]">Powered by Mr² Labs</span>
                    <span>v1.0.4 - Alpha</span>
                </div>
            </main>
    );
}
