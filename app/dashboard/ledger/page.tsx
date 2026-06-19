'use client'

import React, { useEffect, useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Wallet, LayoutDashboard, TrendingUp, TrendingDown, Plus, CreditCard, Wrench, Briefcase, Truck, Users, Megaphone, ArrowUpRight, ArrowDownRight, Search, FileText, X, FileDown, Lock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { addLedgerEntryAction, getLedgerEntriesAction } from './actions'

interface FinancialEntry {
    id: string;
    worker_id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    lead_source: 'grabme' | 'direct' | 'referral' | 'other' | null;
    description: string;
    entry_date: string;
    created_at: string;
}

export default function LedgerPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [workerId, setWorkerId] = useState<string | null>(null)
    const [entries, setEntries] = useState<FinancialEntry[]>([])
    const [subscriptionTier, setSubscriptionTier] = useState('free')
    
    // Modal states
    const [showReportModal, setShowReportModal] = useState(false)
    const [timeline, setTimeline] = useState('this_month')
    
    // Form state
    const [showForm, setShowForm] = useState(false)
    const [type, setType] = useState<'income' | 'expense'>('income')
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState('')
    const [leadSource, setLeadSource] = useState<'grabme' | 'direct' | 'referral' | 'other'>('grabme')
    const [description, setDescription] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [toastMessage, setToastMessage] = useState<{title: string, message: string, type: 'success'|'error'} | null>(null)

    const showToast = (title: string, message: string, type: 'success'|'error' = 'error') => {
        setToastMessage({title, message, type});
        setTimeout(() => setToastMessage(null), 4000);
    };

    useEffect(() => {
        const fetchLedger = async () => {
            const userStr = localStorage.getItem('grabme_user')
            if (!userStr) {
                router.push('/login')
                return
            }

            const user = JSON.parse(userStr)
            setWorkerId(user.id)
            setSubscriptionTier(user.subscription_tier || 'free')

            const res = await getLedgerEntriesAction(user.id)

            if (res.success) {
                setEntries(res.entries)
            }
            setLoading(false)
        }
        fetchLedger()
    }, [router])

    const totalIncome = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0)
    const totalExpense = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
    const netProfit = totalIncome - totalExpense

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!workerId || !amount || !category) return

        setIsSubmitting(true)
        const newEntry = {
            worker_id: workerId,
            type,
            amount: parseFloat(amount),
            category,
            lead_source: type === 'income' ? leadSource : null,
            description,
            entry_date: new Date().toISOString().split('T')[0]
        }

        const res = await addLedgerEntryAction(newEntry)

        if (res.success && res.data) {
            setEntries([res.data, ...entries])
            setShowForm(false)
            setAmount('')
            setDescription('')
            setCategory('')
            showToast('Success', `Successfully added ${type}.`, 'success')
        } else {
            console.error('[Ledger Insert Error]', res.error)
            showToast('Failed to add entry', res.error || 'Please try again.', 'error')
        }
        setIsSubmitting(false)
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val)
    }

    const incomeCategories = ['Labor', 'Materials Markup', 'Call-out Fee', 'Other']
    const expenseCategories = ['Materials', 'Transport / Fuel', 'Tool Repair / Rental', 'Marketing', 'Helper Wages', 'Other']

    const getCategoryIcon = (cat: string) => {
        const lower = cat.toLowerCase()
        if (lower.includes('material')) return <Wrench className="w-4 h-4" />
        if (lower.includes('transport') || lower.includes('fuel')) return <Truck className="w-4 h-4" />
        if (lower.includes('labor') || lower.includes('wages')) return <Users className="w-4 h-4" />
        if (lower.includes('marketing')) return <Megaphone className="w-4 h-4" />
        if (lower.includes('call-out')) return <Briefcase className="w-4 h-4" />
        return <FileText className="w-4 h-4" />
    }

    if (loading) return (
        <main className="flex-1 overflow-y-auto flex items-center justify-center pb-24 lg:pb-0">
            <div className="w-8 h-8 border-4 border-[#1d4ed8] border-t-transparent rounded-full animate-spin" />
        </main>
    )

    return (
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-0 bg-[#f8fafc]">
            {/* Header */}
            <header className="h-20 border-b border-[#e2e8f0] flex items-center justify-between px-8 lg:px-12 bg-white/95 sticky top-0 z-20 shadow-sm backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors lg:hidden">
                        <LayoutDashboard className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-sm font-black text-[#0f172a] uppercase tracking-widest flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-[#1d4ed8]" /> My Wallet
                        </h1>
                        <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Track your business growth securely</p>
                    </div>
                </div>
                {/* Mobile nav links */}
                <div className="flex items-center gap-2 lg:hidden">
                    <Link href="/dashboard/tools" className="p-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest">Tools</Link>
                </div>
            </header>

            {/* Report Generation Modal */}
            <AnimatePresence>
                {showReportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <m.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl relative"
                        >
                            <button onClick={() => setShowReportModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            
                            <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center mb-6 border border-blue-100">
                                <FileDown className="w-8 h-8 text-blue-600" />
                            </div>
                            
                            <h2 className="text-xl font-black text-[#0f172a] tracking-tight">Generate Report</h2>
                            <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">
                                Download a verified breakdown of your income and expenses for bank loans or visa applications.
                            </p>

                            <div className="mt-8 space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Select Timeline</label>
                                <div className="space-y-3">
                                    {['this_month', 'last_month', 'last_3_months'].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setTimeline(val)}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                                                timeline === val 
                                                ? 'border-blue-600 bg-blue-50/50' 
                                                : 'border-slate-100 hover:border-slate-200'
                                            }`}
                                        >
                                            <span className={`text-sm font-bold ${timeline === val ? 'text-blue-900' : 'text-slate-600'}`}>
                                                {val === 'this_month' && 'This Month'}
                                                {val === 'last_month' && 'Last Month'}
                                                {val === 'last_3_months' && 'Last 3 Months'}
                                            </span>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                timeline === val ? 'border-blue-600' : 'border-slate-300'
                                            }`}>
                                                {timeline === val && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8">
                                <button 
                                    onClick={() => router.push(`/dashboard/ledger/report?timeline=${timeline}`)}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-blue-600/20"
                                >
                                    Download PDF Report
                                </button>
                            </div>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <m.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-5 py-4 rounded-2xl bg-[#0f172a] text-white shadow-2xl flex items-start gap-4 min-w-[320px] border border-slate-700"
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            toastMessage.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                            {toastMessage.type === 'success' ? <TrendingUp className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-200">{toastMessage.title}</h4>
                            <p className="text-[11px] font-bold text-slate-400 mt-1">{toastMessage.message}</p>
                        </div>
                        <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </m.div>
                )}
            </AnimatePresence>

            <div className="p-6 lg:p-12 max-w-5xl mx-auto space-y-8">
                
                {/* ══════════════════════════════════
                    SUMMARY CARDS & HEADER ACTIONS
                ══════════════════════════════════ */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <h2 className="text-sm font-black text-[#0f172a] uppercase tracking-widest">Financial Overview</h2>
                    <button
                        onClick={() => {
                            if (subscriptionTier !== 'pro') {
                                router.push('/dashboard/billing')
                            } else {
                                setShowReportModal(true)
                            }
                        }}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#e2e8f0] bg-white hover:bg-slate-50 text-xs font-black uppercase tracking-widest text-[#0f172a] transition-colors shadow-sm"
                    >
                        {subscriptionTier !== 'pro' ? <Lock className="w-4 h-4 text-slate-400" /> : <FileDown className="w-4 h-4 text-blue-600" />}
                        Generate PDF Report
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-[2rem] border border-[#e2e8f0] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-4 text-[#64748b]">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-slate-600" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Net Profit</span>
                        </div>
                        <div className={`text-3xl font-black ${netProfit >= 0 ? 'text-[#0f172a]' : 'text-red-600'}`}>
                            {formatCurrency(netProfit)}
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-[2rem] border border-emerald-100 p-8 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-24 h-24 text-emerald-500" />
                        </div>
                        <div className="flex items-center gap-3 mb-4 text-emerald-700 relative z-10">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Total Income</span>
                        </div>
                        <div className="text-3xl font-black text-emerald-900 relative z-10">
                            {formatCurrency(totalIncome)}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-red-100 p-8 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                            <TrendingDown className="w-24 h-24 text-red-500" />
                        </div>
                        <div className="flex items-center gap-3 mb-4 text-red-700 relative z-10">
                            <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                                <ArrowDownRight className="w-5 h-5 text-red-600" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Total Expenses</span>
                        </div>
                        <div className="text-3xl font-black text-red-900 relative z-10">
                            {formatCurrency(totalExpense)}
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════
                    ADD ENTRY & TRANSACTIONS
                ══════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* ADD ENTRY FORM (Always visible on desktop, toggle on mobile) */}
                    <div className={`lg:col-span-1 bg-white rounded-[2.5rem] border border-[#e2e8f0] p-8 shadow-sm ${showForm ? 'block' : 'hidden lg:block'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-sm font-black text-[#0f172a] uppercase tracking-widest">New Entry</h2>
                            <button onClick={() => setShowForm(false)} className="lg:hidden text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Type Toggle */}
                            <div className="flex p-1 bg-slate-100 rounded-2xl">
                                <button
                                    type="button"
                                    onClick={() => { setType('income'); setCategory(''); }}
                                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                                        type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    Income
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setType('expense'); setCategory(''); }}
                                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                                        type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    Expense
                                </button>
                            </div>

                            {/* Amount */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Amount (LKR)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-slate-400 font-bold">Rs.</span>
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 pl-12 pr-4 text-[#0f172a] font-bold outline-none focus:border-[#1d4ed8] focus:ring-4 focus:ring-[#1d4ed8]/10 transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Category / Reason */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">What was this for?</label>
                                <input
                                    type="text"
                                    required
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl px-4 py-4 text-[#0f172a] font-bold outline-none focus:border-[#1d4ed8] focus:ring-4 focus:ring-[#1d4ed8]/10 transition-all"
                                    placeholder={type === 'income' ? "e.g. Fixed a leaky pipe" : "e.g. Bought PVC pipes"}
                                />
                            </div>

                            {/* Lead Source (Income only) */}
                            {type === 'income' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Where did this client find you?</label>
                                    <select
                                        required
                                        value={leadSource}
                                        onChange={(e) => setLeadSource(e.target.value as any)}
                                        className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl px-4 py-4 text-[#0f172a] font-bold outline-none focus:border-[#1d4ed8] focus:ring-4 focus:ring-[#1d4ed8]/10 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="grabme">GrabMe App</option>
                                        <option value="direct">Direct Client (Walk-in/Call)</option>
                                        <option value="referral">Referral from friend/client</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            )}

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Short Note (Optional)</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl px-4 py-4 text-[#0f172a] font-bold outline-none focus:border-[#1d4ed8] focus:ring-4 focus:ring-[#1d4ed8]/10 transition-all"
                                    placeholder="e.g., Fixed leaky pipe for John"
                                    maxLength={100}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-[#1d4ed8] hover:bg-[#1e3a8a] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Saving...' : `Save ${type}`}
                            </button>
                        </form>
                    </div>

                    {/* RECENT TRANSACTIONS */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black text-[#0f172a] uppercase tracking-widest">Recent Transactions</h2>
                            <button 
                                onClick={() => setShowForm(true)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md"
                            >
                                <Plus className="w-3 h-3" /> Add Entry
                            </button>
                        </div>

                        {entries.length === 0 ? (
                            <div className="bg-white rounded-[2rem] border border-[#e2e8f0] p-12 text-center shadow-sm">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-base font-black text-[#0f172a] uppercase tracking-widest">No Transactions Yet</h3>
                                <p className="text-sm text-[#64748b] mt-2 max-w-sm mx-auto">Start recording your income and expenses to track your business growth.</p>
                                <button 
                                    onClick={() => setShowForm(true)}
                                    className="hidden lg:inline-flex items-center gap-2 mt-6 px-6 py-3 bg-[#1d4ed8] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md shadow-blue-500/20 hover:-translate-y-0.5 transition-all"
                                >
                                    <Plus className="w-4 h-4" /> Add First Entry
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2rem] border border-[#e2e8f0] overflow-hidden shadow-sm">
                                <div className="divide-y divide-[#e2e8f0]">
                                    {entries.map((entry) => (
                                        <div key={entry.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                                                    entry.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                    {getCategoryIcon(entry.category)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-[#0f172a]">{entry.category}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
                                                            {new Date(entry.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                        {entry.lead_source && (
                                                            <>
                                                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                                                    {entry.lead_source === 'grabme' ? 'App' : entry.lead_source}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-base font-black ${entry.type === 'income' ? 'text-emerald-600' : 'text-[#0f172a]'}`}>
                                                    {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                                                </span>
                                                {entry.description && (
                                                    <p className="text-xs text-[#64748b] mt-1 max-w-[150px] truncate">{entry.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </main>
    )
}
