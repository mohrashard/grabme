'use client'

import React, { useEffect, useState } from 'react'
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
    MessageSquare
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { getAdminContactAction } from '../../actions/getAdminContactAction'
import { getWorkerStatusAction } from '../actions/getWorkerStatusAction'

export default function DashboardClient() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
                    localStorage.setItem('grabme_user', JSON.stringify(updatedUser));
                } else {
                    setUser(localUser);
                }
            } else {
                setUser(localUser);
            }
            
            setLoading(false);
        };
        checkAuth();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('grabme_user');
        router.push('/login');
    };

    if (loading) return (
        <div className="min-h-screen bg-[#090A0F] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen font-sans flex bg-[#090A0F] text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-[#18181B] flex flex-col hidden lg:flex">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                            <Image src="/grabme.png" alt="Grab Me" fill sizes="32px" className="object-cover" />
                        </div>
                        <span className="text-white text-lg font-bold tracking-tight">Portal</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {[
                        { icon: LayoutDashboard, label: 'Overview', href: '/dashboard', active: true },
                        { icon: User, label: 'Profile', href: '/dashboard/profile', active: false },
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
            <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 lg:px-12 bg-[#090A0F]/50 backdrop-blur-xl sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xs">
                            {user?.name?.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white">Welcome, {user?.name?.split(' ')[0]}</h2>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{user?.role === 'worker' ? 'Partner Account' : 'Customer Account'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all relative">
                            <Bell className="w-5 h-5 text-white/40" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#090A0F]" />
                        </button>
                    </div>
                </header>

                <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-10">
                    {/* Hero Card */}
                    <m.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="relative rounded-[2.5rem] p-10 overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/5"
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="flex-1 space-y-4">
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-[#4F46E5]">
                                    <ShieldCheck className="w-4 h-4" /> Account Secured
                                </span>
                                <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none">Your Service <br /><span className="text-white/30">Intelligence.</span></h1>
                                <p className="text-white/40 text-sm font-medium max-w-sm">Manage your profile, jobs, and communication from your personal portal.</p>
                            </div>
                            <div className="w-64 h-64 relative hidden md:block">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] animate-pulse" />
                                <LayoutDashboard className="w-full h-full text-white/10" />
                            </div>
                        </div>
                    </m.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { 
                                label: 'Account Status', 
                                value: user?.account_status === 'active' ? 'Verified Active' : user?.account_status === 'rejected' ? 'Action Required' : 'Pending Review', 
                                icon: user?.account_status === 'active' ? CheckCircle2 : Clock, 
                                color: user?.account_status === 'active' ? 'text-emerald-400' : 'text-amber-400' 
                            },
                            { 
                                label: 'Trust Verification', 
                                value: user?.is_identity_verified && user?.is_reference_checked ? 'Level 2: Elite' : user?.is_identity_verified ? 'Level 1: Verified' : 'Level 0: Starter', 
                                icon: ShieldCheck, 
                                color: 'text-[#4F46E5]' 
                            },
                            { 
                                label: 'Marketplace Impact', 
                                value: user?.is_featured ? 'Global Featured' : 'Normal Slot', 
                                icon: Zap, 
                                color: user?.is_featured ? 'text-amber-400' : 'text-white/20' 
                            },
                        ].map((stat, i) => (
                            <m.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                className="bg-[#18181B] border border-white/5 p-8 rounded-3xl"
                            >
                                <stat.icon className={`w-8 h-8 ${stat.color} mb-6`} />
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-white/20 uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-2xl font-black text-white">{stat.value}</p>
                                </div>
                            </m.div>
                        ))}
                    </div>

                    {/* Conditional Status Messages */}
                    {user?.role === 'worker' && user?.account_status !== 'active' && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6 text-center md:text-left">
                                <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                                    <AlertCircle className="w-6 h-6 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white">Trust Check Underway</h3>
                                    <p className="text-sm text-white/40">Our verification engine is currently reviewing your identity and NIC data. We'll ping you on WhatsApp as soon as your profile goes live.</p>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    const { url } = await getAdminContactAction('Hi, I registered on Grab Me and want to check my status.');
                                    window.open(url, '_blank');
                                }}
                                className="px-8 py-3 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all text-center"
                            >
                                Contact Founder
                            </button>
                        </div>
                    )}

                    {user?.role === 'worker' && user?.account_status === 'suspended' && (
                        <m.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-6 text-center md:text-left">
                                <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                                    <AlertCircle className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white">Account Suspended</h3>
                                    <p className="text-sm text-white/40 max-w-sm">
                                        Your account has been suspended. If you believe this is a mistake, contact us on WhatsApp.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    const { url } = await getAdminContactAction(`My Grab Me account has been suspended. My NIC is: ${user?.nic || ''}`);
                                    window.open(url, '_blank');
                                }}
                                className="flex items-center gap-2 px-8 py-3 bg-red-500 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-400 hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Contact Support
                            </button>
                        </m.div>
                    )}

                    {user?.role === 'worker' && user?.account_status === 'active' && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6 text-center md:text-left">
                                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white">Profile is Live!</h3>
                                    <p className="text-sm text-white/40">Congratulations! You are now visible to customers in our home service directory. Keep your phone close to your bed!</p>
                                </div>
                            </div>
                            <span className="px-8 py-3 bg-[#18181B] border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#4F46E5]">Active Channel</span>
                        </div>
                    )}
                </div>

                {/* Footer Attribution */}
                <div className="px-12 py-10 border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-white/10 uppercase tracking-widest">
                    <span>&copy; 2026 Grab Me Dash</span>
                    <span className="text-white/20">Powered by Mr2 Labs</span>
                    <span>v1.0.4 - Alpha</span>
                </div>
            </main>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#090A0F]/90 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center h-20 z-50 px-4 pb-safe shadow-2xl">
                <Link href="/dashboard" className="flex flex-col items-center gap-1.5 p-3 text-[#4F46E5] transition-all">
                    <LayoutDashboard className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Overview</span>
                </Link>
                <Link href="/dashboard/profile" className="flex flex-col items-center gap-1.5 p-3 text-white/40 hover:text-white transition-all">
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Profile</span>
                </Link>
                <button onClick={handleLogout} className="flex flex-col items-center gap-1.5 p-3 text-red-500/60 hover:text-red-500 transition-all">
                    <LogOut className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                </button>
            </nav>
        </div>
    );
}
