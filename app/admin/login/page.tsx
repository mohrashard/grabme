'use client'

import { m } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react'
import { useAdminAuth } from '../hooks/useAdminAuth'

export default function AdminLoginPage() {
    const { email, setEmail, password, setPassword, loading, error, login } = useAdminAuth();

    return (
        <div className="min-h-screen flex items-center justify-center font-sans" style={{ background: '#090A0F' }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap'); * { font-family: 'Inter', sans-serif; }`}</style>

            {/* Background glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 blur-[120px] rounded-full" />
            </div>

            <m.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm mx-4 relative z-10"
            >
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-10">
                    <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-white/10">
                        <Image src="/grabme.png" alt="Grab Me" fill className="object-cover" />
                    </div>
                    <div>
                        <p className="text-white font-black text-lg tracking-tight leading-none">Grab Me</p>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500">Admin Access</p>
                    </div>
                </div>

                <div className="bg-[#18181B] border border-white/5 rounded-[2rem] p-10 shadow-2xl space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-1">
                        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-6 h-6 text-red-400" />
                        </div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Ops Center</h1>
                        <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Restricted Access</p>
                    </div>

                    {/* Fields */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Admin Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && login()}
                                placeholder="admin@grabme.lk"
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-red-500/40 outline-none text-sm placeholder:text-white/10 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && login()}
                                placeholder="••••••••"
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-red-500/40 outline-none text-sm placeholder:text-white/10 transition-colors"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-[11px] text-red-400 font-bold text-center">{error}</p>
                    )}

                    <button
                        onClick={login}
                        disabled={!email || !password || loading}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-red-500 text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-red-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Authenticating...' : 'Enter Ops Center'} <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-center text-[10px] text-white/10 font-bold uppercase tracking-widest mt-8">
                    Powered by Mr² Labs
                </p>
            </m.div>
        </div>
    );
}
