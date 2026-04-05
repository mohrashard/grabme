'use client'

import React, { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Mail, Phone, ArrowRight, Globe, User, Fingerprint } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// Hooks & Navigation
import { useLogin } from './hooks/useLogin'
import RegisterHeader from '../register/components/RegisterHeader'
import RegisterFooter from '../register/components/RegisterFooter'

export default function LoginPage() {
    const { 
        loading, identifier, setIdentifier, password, setPassword,
        handleLogin 
    } = useLogin();

    return (
        <div className="min-h-screen font-sans overflow-x-hidden flex flex-col" style={{ background: '#090A0F', color: '#FFFFFF' }}>
            {/* Nav Reuse */}
            <RegisterHeader scrolled={true} mobileOpen={false} setMobileOpen={() => {}} />

            <div className="flex-1 pt-40 pb-24 px-6 flex justify-center relative items-center">
                {/* Cinematic Background Glows */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

                <m.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-[#18181B] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative z-10"
                >
                    {/* Header Section */}
                    <div className="pt-14 pb-8 px-10 text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{ background: 'radial-gradient(circle at center, #4F46E5 0%, transparent 70%)' }} />
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-xl">
                                <Fingerprint className="w-8 h-8 text-[#4F46E5]" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">Partner Login</h1>
                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">Worker Dashboard Entry</p>
                        </div>
                    </div>

                    <div className="px-10 pb-16">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Identifier (Email, NIC or Phone)</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#4F46E5] transition-all">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input 
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        placeholder="partner@email.com / 98xxxxxV" 
                                        className="w-full pl-14 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#4F46E5] outline-none text-sm transition-all shadow-inner placeholder:text-white/10" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Password</label>
                                    <Link href="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
                                        Forgot Password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#4F46E5] transition-all">
                                        <Fingerprint className="w-4 h-4" />
                                    </div>
                                    <input 
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••" 
                                        className="w-full pl-14 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#4F46E5] outline-none text-sm transition-all shadow-inner placeholder:text-white/10 text-white font-medium" 
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleLogin}
                                disabled={!identifier || !password || loading}
                                className="w-full flex items-center justify-center gap-4 bg-white text-black py-5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30"
                            >
                                {loading ? 'Checking Portal...' : 'Access My Account'} <ArrowRight className="w-4 h-4" />
                            </button>

                            <div className="relative flex items-center gap-4 pt-4">
                                <div className="flex-1 h-[1px] bg-white/5" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/5 italic italic">Identity Verification Required</span>
                                <div className="flex-1 h-[1px] bg-white/5" />
                            </div>

                            <p className="text-[10px] text-center text-white/20 font-medium leading-relaxed px-4">
                                This portal is for registered workers and partners only. If you are not registered yet, please apply below.
                            </p>
                        </div>

                        <div className="mt-10 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                                Not a partner? <Link href="/register" className="text-white hover:underline">Apply as Worker</Link>
                            </p>
                        </div>
                    </div>
                </m.div>
            </div>

            <RegisterFooter />
        </div>
    );
}
