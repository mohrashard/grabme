'use client'

import React, { useState } from 'react'
import { m } from 'framer-motion'
import { MessageCircle, User, ArrowLeft, Fingerprint, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { getAdminContactAction } from '../../actions/getAdminContactAction'
import RegisterHeader from '../../register/components/RegisterHeader'
import Footer from '../../components/Footer'

export default function ForgotPasswordClient() {
    const [name, setName] = useState('')
    const [identifier, setIdentifier] = useState('')

    const handleWhatsAppReset = async () => {
        try {
            const message = `Hi Grab Me, I need to reset my password. My registered phone is: ${identifier} (Name: ${name})`;
            const { url } = await getAdminContactAction(message);
            window.open(url, '_blank');
        } catch {
            alert('Could not connect. Please WhatsApp us directly.');
        }
    };

    return (
        <div className="min-h-screen font-outfit overflow-x-hidden flex flex-col bg-slate-50 relative">
            {/* Premium Background Mesh */}
            <div className="absolute top-0 left-0 right-0 h-full w-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#dbeafe]/40 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-[#dbeafe]/40 blur-[120px] rounded-full" />
                <div className="absolute top-[40%] left-[25%] w-[40%] h-[40%] bg-white blur-[100px] rounded-full opacity-60" />
            </div>

            {/* Nav Reuse */}
            <RegisterHeader scrolled={true} mobileOpen={false} setMobileOpen={() => {}} />

            <div className="flex-1 pt-40 pb-24 px-6 flex justify-center relative items-center">
                <m.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl border-t-8 border-t-[#1d4ed8] overflow-hidden relative z-10"
                >
                    <div className="pt-12 pb-8 px-10 text-center relative">
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-6 shadow-sm rounded-2xl transition-transform hover:scale-110">
                                <ShieldCheck className="w-8 h-8 text-[#1d4ed8]" />
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <span className="text-[#1d4ed8] text-xl font-bold tracking-tight uppercase">Grab Me</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] uppercase">Reset Your Password</h1>
                            <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Manual Identity Verification</p>
                        </div>
                    </div>

                    <div className="px-10 pb-12 space-y-8">
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                            <p className="text-[11px] font-bold text-slate-600 leading-relaxed">
                                Password resets are handled manually. Tap the button below to
                                message our admin on WhatsApp and we&apos;ll reset it within
                                a few hours.
                            </p>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#0f172a]">
                                    Your Full Name
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#64748b] group-focus-within:text-[#1d4ed8] transition-all">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Kasun Perera"
                                        className="w-full pl-14 pr-5 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:bg-white focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe] outline-none text-sm transition-all text-[#0f172a] placeholder:text-[#94a3b8] font-medium" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#0f172a]">
                                    Registered Phone or NIC
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#64748b] group-focus-within:text-[#1d4ed8] transition-all">
                                        <Fingerprint className="w-4 h-4" />
                                    </div>
                                    <input
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        placeholder="07xxxxxxxx or 98xxxxxxXV"
                                        inputMode="text"
                                        className="w-full pl-14 pr-5 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:bg-white focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe] outline-none text-sm transition-all text-[#0f172a] placeholder:text-[#94a3b8] font-bold" 
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleWhatsAppReset}
                                disabled={!name.trim() || !identifier.trim()}
                                className="w-full flex items-center justify-center gap-4 bg-[#1d4ed8] text-white py-4 min-h-[56px] rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/10 hover:bg-[#1e3a8a] hover:shadow-xl transition-all disabled:opacity-30 disabled:scale-100 active:scale-95"
                            >
                                <MessageCircle className="w-4 h-4 fill-white" />
                                Message Admin on WhatsApp
                            </button>

                            <div className="relative flex items-center gap-4 pt-4">
                                <div className="flex-1 h-[1px] bg-[#e2e8f0]" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-[#94a3b8] italic">or</span>
                                <div className="flex-1 h-[1px] bg-[#e2e8f0]" />
                            </div>

                            <Link
                                href="/login"
                                className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1d4ed8] hover:text-[#1e3a8a] transition-colors"
                            >
                                <ArrowLeft className="w-3 h-3" />
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </m.div>
            </div>

            <Footer />
        </div>
    );
}
