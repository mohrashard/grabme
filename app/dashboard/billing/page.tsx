'use client'

import React, { useEffect, useState } from 'react'
import { m } from 'framer-motion'
import {
    LayoutDashboard,
    User,
    LogOut,
    Wrench,
    CreditCard,
    CheckCircle2,
    Clock,
    Zap,
    ShieldCheck,
    Star,
    Video,
    MessageSquare,
    TrendingUp,
    QrCode
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function BillingPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            const raw = localStorage.getItem('grabme_user')
            if (!raw) { router.push('/login'); return }
            
            const localUser = JSON.parse(raw)
            
            if (localUser.role === 'worker') {
                const { getWorkerStatusAction } = await import('../actions/getWorkerStatusAction')
                const res = await getWorkerStatusAction(localUser.id)
                if (res.success && res.data) {
                    const updatedUser = { ...localUser, ...res.data }
                    setUser(updatedUser)
                    localStorage.setItem('grabme_user', JSON.stringify(updatedUser))
                } else {
                    setUser(localUser)
                }
            } else {
                setUser(localUser)
            }
            
            setLoading(false)
        }
        checkAuth()
    }, [router])


    // Calculate days remaining
    let daysRemaining = 0
    let isPro = user?.subscription_tier === 'pro'
    
    if (isPro && user?.pro_expires_at) {
        const expiresAt = new Date(user.pro_expires_at).getTime()
        const now = new Date().getTime()
        daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))
        if (daysRemaining < 0) daysRemaining = 0
    }

    if (loading) return (
        <main className="flex-1 overflow-y-auto flex items-center justify-center pb-24 lg:pb-0">
            <div className="w-8 h-8 border-4 border-[#1d4ed8] border-t-transparent rounded-full animate-spin" />
        </main>
    )

    return (
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
                {/* Header */}
                <header className="h-20 border-b border-[#e2e8f0] flex items-center justify-between px-8 lg:px-12 bg-white/95 sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors lg:hidden">
                            <LayoutDashboard className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-sm font-black text-[#0f172a] uppercase tracking-widest flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#1d4ed8]" /> Billing & Plan
                            </h1>
                        </div>
                    </div>
                    {/* Mobile nav links */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <Link href="/dashboard" className="p-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold">Overview</Link>
                        <Link href="/dashboard/tools" className="p-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold">Tools</Link>
                    </div>
                </header>

                <div className="p-6 lg:p-12 max-w-4xl mx-auto space-y-8">
                    
                    {/* Active Plan Card */}
                    <m.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
                        className="relative rounded-3xl overflow-hidden shadow-2xl p-8 lg:p-10"
                        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)' }}
                    >
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-10 left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl" />

                        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <div className="space-y-4 text-white">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-widest">
                                    <CheckCircle2 className="w-4 h-4" /> Active Plan
                                </div>
                                
                                <div>
                                    <h2 className="text-4xl font-black tracking-tight flex items-center gap-3">
                                        Pro Tier <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                                    </h2>
                                    <p className="text-blue-200 font-bold mt-2 text-lg">Founding Member Grant</p>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center min-w-[200px]">
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Cost Today</p>
                                <p className="text-white text-3xl font-black">LKR 0 <span className="text-sm font-bold text-white/50 line-through ml-1">750</span></p>
                                
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Free Access Expires In</p>
                                    <p className="text-emerald-400 text-2xl font-black flex items-center justify-center gap-2">
                                        <Clock className="w-5 h-5" /> {daysRemaining} Days
                                    </p>
                                </div>
                            </div>
                        </div>
                    </m.div>

                    {/* What's Included */}
                    <m.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white rounded-3xl p-8 border border-[#e2e8f0] shadow-sm"
                    >
                        <h3 className="text-lg font-black text-[#0f172a] mb-6 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" /> Everything included in your Pro Plan
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {[
                                { icon: TrendingUp, title: "Pinned to Top", desc: "You appear above Free & Basic workers in search results." },
                                { icon: ShieldCheck, title: "Elite Partner Badge", desc: "A gold trust badge that proves you are a top-tier professional." },
                                { icon: Video, title: "Video Sales Engine", desc: "Upload your video pitch and work videos to win trust instantly." },
                                { icon: QrCode, title: "Digital Business Card", desc: "Generate a custom card with a QR code to share on WhatsApp." },
                                { icon: MessageSquare, title: "WhatsApp Quick Replies", desc: "Copy-paste professional templates to close jobs faster." },
                                { icon: Clock, title: "Available NOW Switch", desc: "Turn on the green light for emergency dispatch jobs." },
                            ].map((feature, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1d4ed8] flex items-center justify-center flex-shrink-0">
                                        <feature.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-[#0f172a] font-bold">{feature.title}</h4>
                                        <p className="text-sm text-[#64748b] mt-1 leading-relaxed">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </m.div>

                </div>
            </main>
    )
}
