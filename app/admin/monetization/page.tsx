// app/admin/monetization/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { m } from 'framer-motion'
import { Database, HardDrive, Users, Activity, ShieldCheck, Zap, Power, ArrowLeft, Skull } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import Link from 'next/link'
import { getAdminRunwayMetricsAction, toggleMonetizationSwitchAction } from '../actions/monetizationActions'

export default function AdminMonetizationPage() {
    const [loading, setLoading] = useState(true)
    const [metrics, setMetrics] = useState({
        totalWorkers: 0,
        dbSizeBytes: 0,
        storageSizeBytes: 0,
        isMonetized: false
    })

    // Infrastructure Constants
    const DB_LIMIT_BYTES = 500 * 1024 * 1024 // 500MB
    const STORAGE_LIMIT_BYTES = 1 * 1024 * 1024 * 1024 // 1GB

    // THE BRUTAL TRUTH CONSTANTS (Worst-Case Pro User generating data for 1 full year)
    // 1 MB of text/json (Invoices, Estimates, Clicks, Ledger)
    const EST_DB_BYTES_PER_PRO_YEAR = 1 * 1024 * 1024
    // 1.2 MB of images (Based on your actual current 2.21MB / 2 users average)
    const EST_STORAGE_BYTES_PER_USER = 1.2 * 1024 * 1024

    useEffect(() => {
        const fetchMetrics = async () => {
            const res = await getAdminRunwayMetricsAction()
            if (res.success && res.metrics) {
                setMetrics(res.metrics)
            } else {
                toast.error('Failed to load metrics')
            }
            setLoading(false)
        }
        fetchMetrics()
    }, [])

    const handleToggle = async () => {
        const newState = !metrics.isMonetized
        const msg = newState
            ? "Are you absolutely sure you want to turn ON monetization? New users will now get a 14-day trial instead of full free access."
            : "Are you sure you want to revert to the Free Founding Member phase?"

        if (!window.confirm(msg)) return

        toast.loading(newState ? 'Activating Paywall Protocol...' : 'Deactivating Paywall...', { id: 'toggle' })

        const res = await toggleMonetizationSwitchAction(newState)
        if (res.success) {
            setMetrics(prev => ({ ...prev, isMonetized: newState }))
            toast.success(newState ? 'Monetization Activated. Paywall is live.' : 'Platform is now Free again.', { id: 'toggle' })
        } else {
            toast.error(res.error || 'Failed to toggle switch', { id: 'toggle' })
        }
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num)
    }

    // --- BRUTAL REALITY CALCULATIONS --- //

    // 1. Database Runway (Accounting for fixed overhead)
    const totalCurrentUserDataDB = metrics.totalWorkers * EST_DB_BYTES_PER_PRO_YEAR
    const dbBaseOverheadBytes = Math.max(0, metrics.dbSizeBytes - totalCurrentUserDataDB)
    const availableDbBytes = Math.max(0, DB_LIMIT_BYTES - dbBaseOverheadBytes)
    const dbRunway = Math.floor(availableDbBytes / EST_DB_BYTES_PER_PRO_YEAR)

    // 2. Storage Runway (Images)
    const availableStorageBytes = Math.max(0, STORAGE_LIMIT_BYTES - metrics.storageSizeBytes)
    const storageRunway = Math.floor(availableStorageBytes / EST_STORAGE_BYTES_PER_USER)

    // 3. Find the actual bottleneck (whichever limit is hit first)
    const trueBottleneckRunway = Math.min(dbRunway, storageRunway)
    const bottleneckSource = dbRunway < storageRunway ? 'Database' : 'Storage'

    const dbPercentage = Math.min(100, (metrics.dbSizeBytes / DB_LIMIT_BYTES) * 100)
    const storagePercentage = Math.min(100, (metrics.storageSizeBytes / STORAGE_LIMIT_BYTES) * 100)

    const projectedTotalUsers = metrics.totalWorkers + trueBottleneckRunway

    if (loading) {
        return (
            <div className="min-h-screen bg-[#090A0F] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-[#090A0F] text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-200 pb-32 font-sans">
            <Toaster position="top-right" theme="dark" richColors />

            <div className="sticky top-0 z-50 bg-[#090A0F]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center gap-4">
                    <Link href="/admin" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                        <ArrowLeft className="w-5 h-5 text-white/40" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white tracking-widest uppercase">Scale & Monetization</h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Architecture</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">

                {/* Master Switch Section */}
                <m.section
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className={`relative overflow-hidden rounded-[2.5rem] border-2 p-10 md:p-16 transition-colors duration-700 ${metrics.isMonetized
                            ? 'bg-gradient-to-br from-emerald-950/40 to-[#020617] border-emerald-500/30'
                            : 'bg-gradient-to-br from-indigo-950/40 to-[#020617] border-indigo-500/20'
                        }`}
                >
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="max-w-xl space-y-4 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${metrics.isMonetized ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                                <span className="text-xs font-black uppercase tracking-widest text-white/80">
                                    {metrics.isMonetized ? 'Phase 2: Monetized' : 'Phase 1: Free Grant'}
                                </span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
                                Master <span className={metrics.isMonetized ? 'text-emerald-400' : 'text-indigo-400'}>Monetization</span> Switch
                            </h2>
                            <p className="text-sm font-medium text-slate-400 leading-relaxed">
                                {metrics.isMonetized
                                    ? "The platform is currently MONETIZED. New registrations will automatically receive a 14-day free trial. After that, they hit the PayHere paywall."
                                    : "The platform is currently operating as a FREE Founding Member grant. Keep this OFF until you are nearing the Supabase free-tier limit."}
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <button
                                onClick={handleToggle}
                                className={`relative group w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 border-[8px] ${metrics.isMonetized
                                        ? 'bg-emerald-500 border-emerald-950 shadow-[0_0_80px_rgba(16,185,129,0.4)]'
                                        : 'bg-slate-800 border-slate-900 shadow-xl'
                                    }`}
                            >
                                <Power className={`w-12 h-12 transition-colors duration-500 ${metrics.isMonetized ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                            </button>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Click to toggle state
                            </span>
                        </div>
                    </div>
                </m.section>

                <div className="space-y-6">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" /> Infrastructure Limits
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#18181B] border border-white/5 rounded-[2rem] p-8 flex flex-col">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <Users className="w-6 h-6 text-indigo-400" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Active Workers</p>
                            <p className="text-4xl font-black text-white">{formatNumber(metrics.totalWorkers)}</p>

                            <div className="mt-auto pt-6 space-y-2">
                                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">DB Base Overhead</p>
                                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">{formatBytes(dbBaseOverheadBytes)}</p>
                                </div>
                            </div>
                        </m.div>

                        <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#18181B] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6">
                                    <Database className="w-6 h-6 text-amber-400" />
                                </div>
                                <div className="flex justify-between items-end mb-1">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Database (Text/JSON)</p>
                                    <span className="text-xs font-black text-amber-400">{dbPercentage.toFixed(1)}%</span>
                                </div>
                                <p className="text-4xl font-black text-white">{formatBytes(metrics.dbSizeBytes)}</p>

                                <div className="w-full h-2 bg-white/5 rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-amber-400 rounded-full transition-all duration-1000" style={{ width: `${dbPercentage}%` }} />
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
                                    <div className="flex justify-between">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Free Tier Limit</p>
                                        <p className="text-[10px] font-bold text-white uppercase tracking-widest">500 MB</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pro User Avg (1 Yr)</p>
                                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">~1 MB</p>
                                    </div>
                                </div>
                            </div>
                        </m.div>

                        <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#18181B] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center mb-6">
                                    <HardDrive className="w-6 h-6 text-sky-400" />
                                </div>
                                <div className="flex justify-between items-end mb-1">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Storage (Images)</p>
                                    <span className="text-xs font-black text-sky-400">{storagePercentage.toFixed(1)}%</span>
                                </div>
                                <p className="text-4xl font-black text-white">{formatBytes(metrics.storageSizeBytes)}</p>

                                <div className="w-full h-2 bg-white/5 rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-sky-400 rounded-full transition-all duration-1000" style={{ width: `${storagePercentage}%` }} />
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
                                    <div className="flex justify-between">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Free Tier Limit</p>
                                        <p className="text-[10px] font-bold text-white uppercase tracking-widest">1 GB</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Img Avg</p>
                                        <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">~1.2 MB</p>
                                    </div>
                                </div>
                            </div>
                        </m.div>

                    </div>
                </div>

                {/* The Brutal Truth Runway Estimator */}
                <m.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="bg-rose-950/30 border border-rose-500/20 rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl shadow-rose-900/10"
                >
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-rose-500 rounded-full blur-[100px] opacity-10 pointer-events-none" />

                    <div className="relative z-10 flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-rose-500/20 rounded-full mb-6">
                            <Skull className="w-4 h-4 text-rose-400" />
                            <span className="text-xs font-black uppercase tracking-widest text-rose-200">Worst-Case Pro Scenario</span>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-4 leading-tight">
                            You will hit the {bottleneckSource} limit at <br className="hidden md:block" />
                            <span className="text-rose-400">~{formatNumber(projectedTotalUsers)} Active Users</span>
                        </h3>
                        <p className="text-rose-100/60 text-sm font-medium max-w-xl leading-relaxed">
                            This is the brutal truth estimation. It assumes <strong>every</strong> user you onboard is a highly active Pro User generating 1.2MB of images, plus 1MB of database text via weekly invoices, estimates, and analytics over a full 12-month period.
                        </p>
                    </div>

                    <div className="relative z-10 w-full md:w-auto grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center p-6 bg-black/40 backdrop-blur-md rounded-3xl border border-white/5">
                            <Database className="w-6 h-6 text-amber-500/50 mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center mb-1">DB Max Limit</p>
                            <p className="text-xl font-black text-white text-center">{formatNumber(dbRunway + metrics.totalWorkers)}</p>
                        </div>
                        <div className="flex flex-col items-center p-6 bg-black/40 backdrop-blur-md rounded-3xl border border-white/5">
                            <HardDrive className="w-6 h-6 text-sky-500/50 mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center mb-1">Storage Max</p>
                            <p className="text-xl font-black text-white text-center">{formatNumber(storageRunway + metrics.totalWorkers)}</p>
                        </div>
                    </div>
                </m.div>

            </div>
        </main>
    )
}