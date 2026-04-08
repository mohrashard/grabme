'use client'

import React from 'react'
import { m } from 'framer-motion'
import { ArrowRight, User, Fingerprint, ChevronLeft, BookOpen } from 'lucide-react'
import Link from 'next/link'

// Hooks & Navigation
import { useLogin } from '../hooks/useLogin'

export default function LoginClient() {
    const { 
        loading, identifier, setIdentifier, password, setPassword,
        error, handleLogin 
    } = useLogin();

    return (
        <div className="min-h-[100dvh] font-outfit flex flex-col bg-white relative">
            {/* Native App Top Header */}
            <header className="fixed top-0 w-full z-50 bg-white pt-4 pb-3 px-5 flex items-center justify-between">
                <Link href="/" className="w-10 h-10 rounded-full bg-[#f8fafc] flex items-center justify-center border border-[#e2e8f0] hover:bg-[#e2e8f0] active:scale-95 transition-all shadow-sm">
                    <ChevronLeft className="w-5 h-5 text-[#0f172a]" />
                </Link>

                <Link href="/how-it-works" className="flex items-center gap-2 rounded-full bg-[#f8fafc] px-4 py-2 border border-[#e2e8f0] hover:bg-[#e2e8f0] active:scale-95 transition-all shadow-sm">
                    <BookOpen className="w-4 h-4 text-[#1d4ed8]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0f172a]">Guide</span>
                </Link>
            </header>

            <div className="flex-1 pt-24 pb-12 px-6 flex justify-center relative items-center">

                <m.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl border-t-4 border-[#1d4ed8] overflow-hidden relative z-10"
                >
                    {/* Header Section */}
                    <div className="pt-12 pb-8 px-10 text-center relative">
                        <div className="relative z-10">
                            <Fingerprint className="w-12 h-12 text-[#1d4ed8] mx-auto mb-4" />
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <span className="text-[#1d4ed8] text-xl font-bold tracking-tight uppercase">Grab Me</span>
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-[#0f172a] uppercase">Partner Login</h1>
                            <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Worker Dashboard Entry</p>
                        </div>
                    </div>

                    <div className="px-10 pb-12">
                        <div className="space-y-6">
                            {/* Local Error Banner */}
                            {error && (
                                <m.div 
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                    className="p-4 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] rounded-xl text-xs font-semibold flex items-center gap-3 shadow-sm"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#dc2626] animate-pulse" />
                                    {error}
                                </m.div>
                            )}

                            <div className="space-y-2.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#0f172a]">Identifier (Email, NIC or Phone)</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#64748b] group-focus-within:text-[#1d4ed8] transition-all">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input 
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        placeholder="partner@email.com / 98xxxxxV" 
                                        className="w-full pl-14 pr-5 py-4 md:py-5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:bg-white focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe] outline-none text-base transition-all text-[#0f172a] placeholder:text-[#94a3b8] font-medium" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#0f172a]">Password</label>
                                    <Link href="/forgot-password" title="Restore access" className="text-[10px] font-black uppercase tracking-widest text-[#1d4ed8] hover:text-[#1e3a8a] transition-colors">
                                        Forgot Password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#64748b] group-focus-within:text-[#1d4ed8] transition-all">
                                        <Fingerprint className="w-4 h-4" />
                                    </div>
                                    <input 
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••" 
                                        className="w-full pl-14 pr-5 py-4 md:py-5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:bg-white focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe] outline-none text-base transition-all text-[#0f172a] placeholder:text-[#94a3b8] font-bold" 
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleLogin}
                                disabled={!identifier || !password || loading}
                                className="w-full flex items-center justify-center gap-4 bg-[#1d4ed8] text-white py-4 min-h-[56px] rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/10 hover:bg-[#1e3a8a] hover:shadow-xl transition-all disabled:opacity-30 disabled:scale-100 active:scale-95"
                            >
                                {loading ? 'Checking Portal...' : 'Access My Account'} <ArrowRight className="w-4 h-4" />
                            </button>

                            <div className="relative flex items-center gap-4 pt-4">
                                <div className="flex-1 h-[1px] bg-[#e2e8f0]" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-[#94a3b8] italic">Identity Verification Required</span>
                                <div className="flex-1 h-[1px] bg-[#e2e8f0]" />
                            </div>

                            <p className="text-[10px] text-center text-[#64748b] font-medium leading-relaxed px-4">
                                This portal is for registered workers and partners only. If you are not registered yet, please apply below.
                            </p>
                        </div>
                    </div>
                </m.div>
            </div>

            <div className="mt-auto pt-8 pb-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">
                    Don&apos;t have an account? <Link href="/register" className="text-[#1d4ed8] font-semibold hover:text-[#1e3a8a] transition-colors ml-1">Apply as Worker</Link>
                </p>
            </div>
        </div>
    );
}
