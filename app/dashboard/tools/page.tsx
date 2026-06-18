'use client'

import React, { useEffect, useState, useRef } from 'react'
import { m } from 'framer-motion'
import {
    LayoutDashboard,
    User,
    LogOut,
    Wrench,
    Copy,
    Check,
    CheckCircle2,
    MessageSquare,
    QrCode,
    Download,
    Share2,
    Zap,
    ChevronRight,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

// ─── QR Code via Google Charts API (no npm needed) ────────────────────────────
function QRCodeImage({ url, size = 180 }: { url: string; size?: number }) {
    const encoded = encodeURIComponent(url)
    const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&color=1d4ed8&bgcolor=FFFFFF&margin=1`
    return (
        <img
            src={src}
            alt="QR Code"
            width={size}
            height={size}
            className="rounded-2xl border-4 border-white shadow-xl"
        />
    )
}

export default function ToolsPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
    const cardRef = useRef<HTMLDivElement>(null)

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

    const handleLogout = async () => {
        await supabase.auth.signOut()
        localStorage.removeItem('grabme_user')
        router.push('/login')
    }

    const profileUrl = user?.slug
        ? `https://www.grabme.page/worker/${user.slug}`
        : `https://www.grabme.page/worker/${user?.id}`

    const name = user?.full_name || user?.name || 'Your Name'
    const trade = user?.trade_category || 'Professional'

    // ── Quick Reply Templates ───────────────────────────────────────────────
    const templates = [
        {
            label: '📥 New Lead Reply',
            tag: 'Use when a customer first contacts you',
            color: 'bg-blue-50 border-blue-200',
            tagColor: 'bg-blue-100 text-blue-700',
            body: `Hi! I'm ${name}, a verified ${trade} registered on Grab Me. I'd be happy to help you! 😊\n\nCould you please send me a photo or short video of the issue? This helps me give you an accurate quote right away.\n\nThank you!`,
        },
        {
            label: '🔄 Follow-Up Message',
            tag: 'Use if a customer goes silent after first contact',
            color: 'bg-indigo-50 border-indigo-200',
            tagColor: 'bg-indigo-100 text-indigo-700',
            body: `Hi! This is ${name} again - just checking if you still need help with the issue you mentioned. 🙏\n\nI'm available and can come by at a time that suits you. No pressure at all - just want to make sure you get it sorted!\n\nFeel free to reply anytime.`,
        },
        {
            label: '✅ Job Completed',
            tag: 'Send after finishing a job to collect a review',
            color: 'bg-emerald-50 border-emerald-200',
            tagColor: 'bg-emerald-100 text-emerald-700',
            body: `Hi! It was a pleasure working for you today. I hope you're happy with the job! 😊\n\nIf you have a moment, it would mean the world to me if you could leave a quick review on my Grab Me profile - it only takes 30 seconds and helps me grow.\n\nHere's the link: ${profileUrl}\n\nThank you so much! 🙏`,
        },
        {
            label: '💰 Pricing Enquiry',
            tag: 'When a customer asks for a quote',
            color: 'bg-amber-50 border-amber-200',
            tagColor: 'bg-amber-100 text-amber-700',
            body: `Hi! Great question. Here's how my pricing works:\n\n🔹 My base visiting fee is Rs. [YOUR FEE] - this covers my travel and initial inspection.\n🔹 After I see the issue in person, I'll give you a full transparent quote with no hidden charges.\n🔹 All my work comes with a [WARRANTY PERIOD] guarantee.\n\nWould you like to book a visit?`,
        },
    ]

    const handleCopy = (text: string, idx: number) => {
        navigator.clipboard.writeText(text)
        setCopiedIdx(idx)
        toast.success('Template copied! Ready to paste in WhatsApp.')
        setTimeout(() => setCopiedIdx(null), 2500)
    }

    if (loading) return (
        <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#1d4ed8] border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="h-screen overflow-hidden font-sans flex bg-[#f1f5f9] text-[#0f172a]">

            {/* ── Sidebar ── */}
            <aside className="w-64 border-r border-[#e2e8f0] bg-white shadow-sm flex flex-col hidden lg:flex z-30">
                <div className="p-8">
                    <Link href="/dashboard" className="flex items-center gap-3 mb-2">
                        <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-[#e2e8f0] shadow-md">
                            <Image src="/grabme.png" alt="Grab Me" fill sizes="32px" className="object-cover" />
                        </div>
                        <span className="text-[#0f172a] text-lg font-bold tracking-tight">Portal</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {[
                        { icon: LayoutDashboard, label: 'Overview', href: '/dashboard', active: false },
                        { icon: User, label: 'Profile', href: '/dashboard/profile', active: false },
                        { icon: Wrench, label: 'Tools', href: '/dashboard/tools', active: true },
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

            {/* ── Main Content ── */}
            <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
                {/* Header */}
                <header className="h-20 border-b border-[#e2e8f0] flex items-center justify-between px-8 lg:px-12 bg-white/95 sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors lg:hidden">
                            <LayoutDashboard className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-sm font-black text-[#0f172a] uppercase tracking-widest flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-[#1d4ed8]" /> Partner Tools
                            </h1>
                            <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Win more jobs. Look more professional.</p>
                        </div>
                    </div>
                    {/* Mobile nav links */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <Link href="/dashboard" className="p-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold">Overview</Link>
                        <Link href="/dashboard/profile" className="p-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold">Profile</Link>
                    </div>
                </header>

                <div className="p-6 lg:p-12 max-w-6xl mx-auto space-y-12">

                    {/* ══════════════════════════════════
                        SECTION 1: DIGITAL BUSINESS CARD
                    ══════════════════════════════════ */}
                    <section>
                        <m.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
                            className="flex items-center gap-3 mb-6"
                        >
                            <div className="w-10 h-10 bg-[#dbeafe] rounded-2xl flex items-center justify-center">
                                <QrCode className="w-5 h-5 text-[#1d4ed8]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-[#0f172a]">Digital Business Card</h2>
                                <p className="text-sm text-[#64748b]">Share on Facebook, TikTok, or WhatsApp status to attract more customers.</p>
                            </div>
                        </m.div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* The Card Preview */}
                            <m.div
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                            >
                                {/* ─── The Card (printable / shareable) ─── */}
                                <div
                                    ref={cardRef}
                                    className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-square max-w-[400px] mx-auto lg:mx-0"
                                    style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)' }}
                                >
                                    {/* Background decorative circles */}
                                    <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
                                    <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/5" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-500/5" />

                                    {/* Grab Me watermark top-left */}
                                    <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
                                        <div className="relative w-6 h-6 rounded-lg overflow-hidden">
                                            <Image src="/grabme.png" alt="Grab Me" fill sizes="24px" className="object-cover" />
                                        </div>
                                        <span className="text-white/70 text-xs font-black uppercase tracking-widest">Grab Me</span>
                                    </div>

                                    {/* Verified badge top-right */}
                                    <div className="absolute top-6 right-6 flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full z-10">
                                        <CheckCircle2 className="w-3 h-3" /> Verified
                                    </div>

                                    {/* Center content */}
                                    <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 py-16 text-center gap-5">
                                        {/* Profile photo */}
                                        <div className="w-28 h-28 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                            {user?.profile_photo_url ? (
                                                <img src={user.profile_photo_url} alt={name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-12 h-12 text-white/40" />
                                            )}
                                        </div>

                                        {/* Name & Trade */}
                                        <div>
                                            <h3 className="text-white text-2xl font-black tracking-tight leading-tight">{name}</h3>
                                            <p className="text-[#93c5fd] text-sm font-bold mt-1">{trade}</p>
                                        </div>

                                        {/* Divider */}
                                        <div className="w-12 h-[2px] bg-white/20 rounded-full" />

                                        {/* QR Code */}
                                        <QRCodeImage url={profileUrl} size={110} />
                                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest -mt-2">Scan to view profile</p>
                                    </div>
                                </div>
                            </m.div>

                            {/* Share Actions */}
                            <m.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                className="space-y-4"
                            >
                                <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 space-y-4">
                                    <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-widest">Share Your Card</h3>

                                    {/* Share on WhatsApp Status */}
                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent(`Hey! I'm ${name}, a verified ${trade} on Grab Me. Book me directly here:\n${profileUrl}`)}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="flex items-center justify-between w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-sm px-5 py-4 rounded-2xl transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <MessageSquare className="w-5 h-5" />
                                            <span>Share on WhatsApp</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </a>

                                    {/* Copy Profile Link */}
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(profileUrl)
                                            toast.success('Profile link copied!')
                                        }}
                                        className="flex items-center justify-between w-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] font-bold text-sm px-5 py-4 rounded-2xl transition-colors group border border-[#e2e8f0]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Copy className="w-5 h-5 text-[#64748b]" />
                                            <span className="text-sm truncate max-w-[200px] text-[#475569]">{profileUrl}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    {/* Web Share API */}
                                    <button
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({ title: `${name} - ${trade} on Grab Me`, url: profileUrl })
                                            } else {
                                                navigator.clipboard.writeText(profileUrl)
                                                toast.success('Profile link copied!')
                                            }
                                        }}
                                        className="flex items-center justify-between w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-sm px-5 py-4 rounded-2xl transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Share2 className="w-5 h-5" />
                                            <span>Share My Profile</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                                    <Zap className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs font-bold text-amber-800 leading-relaxed">
                                        <span className="text-amber-600">Pro tip:</span> Post this card on your WhatsApp Status, Facebook profile, and any local community groups. Workers who share regularly get <strong>3x more profile views.</strong>
                                    </p>
                                </div>
                            </m.div>
                        </div>
                    </section>

                    {/* ══════════════════════════════════
                        SECTION 2: QUICK REPLY TEMPLATES
                    ══════════════════════════════════ */}
                    <section>
                        <m.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                            className="flex items-center gap-3 mb-6"
                        >
                            <div className="w-10 h-10 bg-[#dbeafe] rounded-2xl flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-[#1d4ed8]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-[#0f172a]">WhatsApp Quick Replies</h2>
                                <p className="text-sm text-[#64748b]">Copy these templates to reply like a professional and win more jobs.</p>
                            </div>
                        </m.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {templates.map((t, idx) => (
                                <m.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + idx * 0.08 }}
                                    className={`border rounded-3xl p-6 flex flex-col gap-4 ${t.color}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h4 className="text-base font-black text-[#0f172a]">{t.label}</h4>
                                            <span className={`inline-block mt-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${t.tagColor}`}>
                                                {t.tag}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Message body preview */}
                                    <div className="bg-white/70 rounded-2xl p-4 border border-white/80">
                                        <p className="text-sm text-[#334155] leading-relaxed whitespace-pre-line">{t.body}</p>
                                    </div>

                                    {/* Copy Button */}
                                    <button
                                        onClick={() => handleCopy(t.body, idx)}
                                        className={`flex items-center justify-center gap-2 w-full py-3 px-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                                            copiedIdx === idx
                                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                                                : 'bg-white text-[#1d4ed8] border border-blue-200 hover:bg-blue-50 shadow-sm'
                                        }`}
                                    >
                                        {copiedIdx === idx ? (
                                            <><Check className="w-4 h-4" /> Copied to Clipboard!</>
                                        ) : (
                                            <><Copy className="w-4 h-4" /> Copy Template</>
                                        )}
                                    </button>
                                </m.div>
                            ))}
                        </div>

                        <m.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                            className="mt-6 bg-[#0f172a] text-white rounded-3xl p-6 flex flex-col md:flex-row items-center gap-4"
                        >
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <Zap className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <h4 className="font-black text-white">Why does this matter?</h4>
                                <p className="text-sm text-[#94a3b8] mt-1 leading-relaxed">
                                    Most customers contact 3–4 workers at once. The one who replies <strong className="text-white">fast and professionally</strong> almost always wins the job. These templates help you reply in 10 seconds and look like a premium service provider.
                                </p>
                            </div>
                        </m.div>
                    </section>

                </div>
            </main>
        </div>
    )
}
