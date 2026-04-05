'use client'

import React, { useState } from 'react'
import { m } from 'framer-motion'
import { MessageCircle, User, ArrowLeft, Fingerprint, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { getAdminContactAction } from '../actions/getAdminContactAction'
import RegisterHeader from '../register/components/RegisterHeader'
import RegisterFooter from '../register/components/RegisterFooter'

export default function ForgotPasswordPage() {
    const [name, setName] = useState('')
    const [identifier, setIdentifier] = useState('')

    const handleWhatsAppReset = async () => {
        try {
            const message = `Hi Grab Me, I need to reset my password. My registered phone is: ${identifier} (Name: ${name})`;
            const { url } = await getAdminContactAction(message);
            window.open(url, '_blank');
        } catch {
            // If action fails, surface a friendly message rather than crashing
            alert('Could not connect. Please WhatsApp us directly.');
        }
    };

    return (
        <div className="min-h-screen font-sans overflow-x-hidden flex flex-col" style={{ background: '#090A0F', color: '#FFFFFF' }}>
            <RegisterHeader scrolled={true} mobileOpen={false} setMobileOpen={() => {}} />

            <div className="flex-1 pt-40 pb-24 px-6 flex justify-center relative items-center">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-[#18181B] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative z-10"
                >
                    {/* Header */}
                    <div className="pt-14 pb-8 px-10 text-center relative overflow-hidden">
                        <div
                            className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{ background: 'radial-gradient(circle at center, #4F46E5 0%, transparent 70%)' }}
                        />
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-xl">
                                <ShieldCheck className="w-8 h-8 text-[#4F46E5]" />
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-white mb-2 uppercase">
                                Reset Your Password
                            </h1>
                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">
                                Manual Identity Verification
                            </p>
                        </div>
                    </div>

                    <div className="px-10 pb-16 space-y-8">
                        {/* Info Banner */}
                        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-5">
                            <p className="text-[11px] font-bold text-indigo-300/70 leading-relaxed">
                                Password resets are handled manually. Tap the button below to
                                message our admin on WhatsApp and we&apos;ll reset it within
                                a few hours.
                            </p>
                        </div>

                        <div className="space-y-5">
                            {/* Name Field */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">
                                    Your Full Name
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#4F46E5] transition-all">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Kasun Perera"
                                        className="w-full pl-14 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#4F46E5] outline-none text-sm transition-all placeholder:text-white/10 text-white font-medium"
                                    />
                                </div>
                            </div>

                            {/* Phone / NIC Field */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">
                                    Registered Phone or NIC
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#4F46E5] transition-all">
                                        <Fingerprint className="w-4 h-4" />
                                    </div>
                                    <input
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        placeholder="07xxxxxxxx or 98xxxxxxXV"
                                        inputMode="text"
                                        className="w-full pl-14 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#4F46E5] outline-none text-sm transition-all placeholder:text-white/10 text-white font-medium"
                                    />
                                </div>
                            </div>

                            {/* WhatsApp Button */}
                            <button
                                onClick={handleWhatsAppReset}
                                disabled={!name.trim() || !identifier.trim()}
                                className="w-full flex items-center justify-center gap-3 bg-[#4F46E5] text-white py-5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-500/20 hover:bg-indigo-400 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <MessageCircle className="w-4 h-4 fill-white" />
                                Message Admin on WhatsApp
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-4 pt-2">
                                <div className="flex-1 h-[1px] bg-white/5" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/10">or</span>
                                <div className="flex-1 h-[1px] bg-white/5" />
                            </div>

                            {/* Back Link */}
                            <Link
                                href="/login"
                                className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-indigo-400 transition-colors"
                            >
                                <ArrowLeft className="w-3 h-3" />
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </m.div>
            </div>

            <RegisterFooter />
        </div>
    );
}
