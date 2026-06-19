'use client'

import React, { useEffect, useState } from 'react'
import { m } from 'framer-motion'
import {
    TrendingUp, Eye, MousePointerClick, MapPin, Lock, Play, Star,
    ArrowRight, Sparkles, Wallet, FileText, ReceiptText, BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { getAnalyticsDataAction, getRevenueAnalyticsAction } from './analyticsActions'
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

function CheckCircle2(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}

const PIE_COLORS = ['#1d4ed8', '#10b981', '#f59e0b', '#8b5cf6']

function StatCard({ icon: Icon, label, value, sub, color = 'blue' }: any) {
    const colors: any = {
        blue: 'bg-blue-100 text-blue-700 bg-blue-50',
        emerald: 'bg-emerald-100 text-emerald-700 bg-emerald-50',
        amber: 'bg-amber-100 text-amber-700 bg-amber-50',
        purple: 'bg-purple-100 text-purple-700 bg-purple-50',
    }
    return (
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-7 flex flex-col gap-4 relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-30 group-hover:scale-150 transition-transform duration-500 ${colors[color].split(' ')[2]}`} />
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-3xl font-black text-slate-900">{value}</p>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mt-1">{label}</p>
                {sub && <p className="text-xs font-bold text-slate-400 mt-1">{sub}</p>}
            </div>
        </div>
    )
}

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true)
    const [profileData, setProfileData] = useState<any>(null)
    const [revenueData, setRevenueData] = useState<any>(null)
    const [activeTab, setActiveTab] = useState<'profile' | 'money'>('profile')

    useEffect(() => {
        const fetchAll = async () => {
            const raw = localStorage.getItem('grabme_user')
            if (!raw) return
            const user = JSON.parse(raw)
            const [pRes, rRes] = await Promise.all([
                getAnalyticsDataAction(user.id),
                getRevenueAnalyticsAction(user.id)
            ])
            if (pRes.success) setProfileData(pRes)
            if (rRes.success) setRevenueData(rRes)
            setLoading(false)
        }
        fetchAll()
    }, [])

    if (loading) return (
        <main className="flex-1 overflow-y-auto pb-32 lg:pb-12 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </main>
    )

    if (!profileData) return null

    if (!profileData.isPro) {
        return (
            <main className="flex-1 overflow-y-auto pb-32 lg:pb-12">
                <div className="p-5 md:p-10 max-w-7xl mx-auto w-full">
                    <div className="mb-8">
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-blue-600" /> Performance Analytics
                        </h1>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-2">Track your profile views &amp; revenue</p>
                    </div>
                    <div className="relative bg-white border border-slate-200 rounded-[3rem] p-10 md:p-16 overflow-hidden text-center shadow-sm">
                        <div className="absolute inset-0 opacity-20 filter blur-sm pointer-events-none flex flex-col justify-center">
                            <div className="flex items-end justify-between px-10 h-40 gap-4 mb-10">
                                {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                                    <div key={i} className="w-full bg-blue-600 rounded-t-xl" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </div>
                        <div className="relative z-10 max-w-md mx-auto space-y-6">
                            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <Lock className="w-10 h-10 text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Advanced Analytics is a Pro Feature</h2>
                                <p className="text-sm font-medium text-slate-600 mt-4 leading-relaxed">
                                    See exactly how many customers view your profile, track your revenue, and understand where your money comes from.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-left bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                {['Profile Views', 'Lead Funnel', 'Revenue Stats', '6-Month Trends'].map(f => (
                                    <div key={f} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {f}
                                    </div>
                                ))}
                            </div>
                            <Link href="/dashboard/billing" className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">
                                Upgrade to Pro
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="flex-1 overflow-y-auto pb-32 lg:pb-12">
            <div className="p-5 md:p-10 max-w-7xl mx-auto w-full space-y-8">

                {/* Header */}
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-blue-600" /> Analytics
                        </h1>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-2">Your business intelligence dashboard</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-full max-w-xs">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === 'profile' ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Eye className="w-3.5 h-3.5" /> Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('money')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === 'money' ? 'bg-white shadow text-emerald-700' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Wallet className="w-3.5 h-3.5" /> Money
                    </button>
                </div>

                {/* ─── PROFILE TAB ─── */}
                {activeTab === 'profile' && (
                    <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Funnel Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard icon={Eye} label="Total Profile Views" value={profileData.funnel.views} sub="Last 30 days" color="blue" />
                            <StatCard icon={MousePointerClick} label="WhatsApp Clicks" value={profileData.funnel.clicks} sub="Last 30 days" color="emerald" />
                            <div className="bg-slate-900 border border-slate-800 shadow-xl rounded-3xl p-7 flex flex-col gap-4 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-white">{profileData.funnel.rate}%</p>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">View-to-Lead Rate</p>
                                    <p className="text-xs font-bold text-slate-500 mt-1">Conversion rate</p>
                                </div>
                            </div>
                        </div>

                        {/* Traffic Chart */}
                        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-8">Traffic & Lead Trends (Last 7 Days)</h3>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={profileData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gClicks" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 700 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 700 }} />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        <Area type="monotone" dataKey="views" name="Profile Views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#gViews)" />
                                        <Area type="monotone" dataKey="clicks" name="WhatsApp Clicks" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#gClicks)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Top Districts */}
                            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-rose-500" /> Where Your Leads Come From
                                </h3>
                                {profileData.topDistricts.length > 0 ? (
                                    <div className="space-y-4">
                                        {profileData.topDistricts.map((d: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                <span className="text-sm font-bold text-slate-700">{d.district}</span>
                                                <span className="text-xs font-black bg-white px-3 py-1 rounded-full border border-slate-200 text-blue-600">{d.count} Leads</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-sm font-bold text-slate-400">Not enough location data yet.</div>
                                )}
                            </div>

                            {/* Profile Optimizer */}
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 shadow-sm rounded-3xl p-8">
                                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-900 mb-6 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-indigo-600" /> Profile Optimizer
                                </h3>
                                <div className="space-y-4">
                                    {!profileData.insights.hasVideo ? (
                                        <div className="bg-white p-5 rounded-2xl border border-indigo-100 flex items-start gap-4">
                                            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Play className="w-4 h-4 text-rose-600 ml-0.5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900">Add a Video Pitch</h4>
                                                <p className="text-xs font-medium text-slate-600 mt-1 mb-3">Profiles with a video convert 40% more viewers into leads.</p>
                                                <Link href="/dashboard/profile" className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-1">
                                                    Update Profile <ArrowRight className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                            <span className="text-sm font-black text-emerald-900">Video pitch is active! Great job.</span>
                                        </div>
                                    )}
                                    {!profileData.insights.hasReviews ? (
                                        <div className="bg-white p-5 rounded-2xl border border-indigo-100 flex items-start gap-4">
                                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Star className="w-4 h-4 text-amber-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900">Collect Your First Review</h4>
                                                <p className="text-xs font-medium text-slate-600 mt-1 mb-3">Ask past clients to rate you on your public profile.</p>
                                                <Link href="/dashboard/reviews" className="text-xs font-black uppercase tracking-widest text-amber-600 flex items-center gap-1">
                                                    View Reviews <ArrowRight className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                            <span className="text-sm font-black text-emerald-900">You have customer reviews! Keep it up.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </m.div>
                )}

                {/* ─── MONEY TAB ─── */}
                {activeTab === 'money' && revenueData && (
                    <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                        {/* Top Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="bg-slate-900 rounded-3xl p-7 relative overflow-hidden col-span-1 md:col-span-2 lg:col-span-1 flex flex-col gap-3">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-white">Rs. {revenueData.thisMonthTotal.toLocaleString()}</p>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">Earned This Month</p>
                                    {revenueData.growth !== null && (
                                        <p className={`text-xs font-bold mt-1 ${revenueData.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {revenueData.growth >= 0 ? '+' : ''}{revenueData.growth}% vs last month
                                        </p>
                                    )}
                                </div>
                            </div>
                            <StatCard icon={ReceiptText} label="Awaiting Payment" value={`Rs. ${revenueData.unpaidTotal.toLocaleString()}`} sub="Unpaid invoices" color="amber" />
                            <StatCard icon={FileText} label="Pending Quotes" value={`Rs. ${revenueData.pendingEstimatesTotal.toLocaleString()}`} sub="Open estimates" color="purple" />
                            <StatCard icon={BarChart3} label="Total Invoices" value={revenueData.totalInvoices} sub={`${revenueData.totalEstimates} estimates sent`} color="blue" />
                        </div>

                        {/* 6-Month Bar Chart */}
                        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-8">6-Month Income Trend</h3>
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData.monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 700 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 700 }} />
                                        <Tooltip
                                            formatter={(v: any) => [`Rs. ${Number(v).toLocaleString()}`, 'Income']}
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="income" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Revenue by Lead Source */}
                            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Revenue by Source</h3>
                                {revenueData.revenueBySource.length > 0 ? (
                                    <div className="h-[220px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={revenueData.revenueBySource} dataKey="amount" nameKey="source" cx="50%" cy="50%" outerRadius={80} label={({ source, percent }: any) => `${source} ${(percent * 100).toFixed(0)}%`}>
                                                    {revenueData.revenueBySource.map((_: any, i: number) => (
                                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(v: any) => `Rs. ${Number(v).toLocaleString()}`} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                                        <Wallet className="w-10 h-10 text-slate-200" />
                                        <p className="text-sm font-bold text-slate-400">No income data yet. Add entries in your Wallet to see stats here.</p>
                                    </div>
                                )}
                            </div>

                            {/* Revenue by Category */}
                            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Revenue by Service</h3>
                                {revenueData.revenueByCategory.length > 0 ? (
                                    <div className="space-y-3">
                                        {revenueData.revenueByCategory.slice(0, 5).map((c: any, i: number) => {
                                            const max = revenueData.revenueByCategory[0].amount
                                            const pct = Math.round((c.amount / max) * 100)
                                            return (
                                                <div key={i} className="space-y-1.5">
                                                    <div className="flex justify-between text-xs font-bold text-slate-700">
                                                        <span>{c.category}</span>
                                                        <span>Rs. {c.amount.toLocaleString()}</span>
                                                    </div>
                                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700" style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                                        <BarChart3 className="w-10 h-10 text-slate-200" />
                                        <p className="text-sm font-bold text-slate-400">No category data yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </m.div>
                )}

                {activeTab === 'money' && !revenueData && (
                    <div className="text-center py-20 text-sm font-bold text-slate-400">Failed to load revenue data.</div>
                )}

            </div>
        </main>
    )
}
