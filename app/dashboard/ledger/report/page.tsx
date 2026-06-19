'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Printer, ChevronLeft, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getLedgerEntriesAction } from '../actions'

interface FinancialEntry {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    entry_date: string;
}

function ReportContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const timeline = searchParams.get('timeline') || 'this_month'
    
    const [loading, setLoading] = useState(true)
    const [entries, setEntries] = useState<FinancialEntry[]>([])
    const [workerName, setWorkerName] = useState('')
    const [dateRangeStr, setDateRangeStr] = useState('')

    useEffect(() => {
        const fetchReportData = async () => {
            const userStr = localStorage.getItem('grabme_user')
            if (!userStr) {
                router.push('/login')
                return
            }

            const user = JSON.parse(userStr)
            setWorkerName(user.full_name || 'Verified Professional')

            if (user.subscription_tier !== 'pro') {
                router.push('/dashboard/billing')
                return
            }

            // Calculate date range based on timeline
            const now = new Date()
            let startDate = new Date()
            let endDate = new Date()

            if (timeline === 'this_month') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                setDateRangeStr(`${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`)
            } else if (timeline === 'last_month') {
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                endDate = new Date(now.getFullYear(), now.getMonth(), 0)
                setDateRangeStr(`${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`)
            } else if (timeline === 'last_3_months') {
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                setDateRangeStr(`${startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`)
            }

            const res = await getLedgerEntriesAction(user.id)

            if (res.success) {
                const filtered = res.entries.filter((e: FinancialEntry) => {
                    const d = e.entry_date
                    const startStr = startDate.toISOString().split('T')[0]
                    const endStr = endDate.toISOString().split('T')[0]
                    return d >= startStr && d <= endStr
                })
                setEntries(filtered.sort((a: FinancialEntry, b: FinancialEntry) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()))
            }
            setLoading(false)
        }

        fetchReportData()
    }, [router, timeline])

    const totalIncome = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0)
    const totalExpense = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
    const netProfit = totalIncome - totalExpense

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val)
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <main className="flex-1 overflow-y-auto h-full bg-slate-100 print:bg-white p-4 md:p-8">
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { 
                        margin: 0; /* This forces the browser to hide its default URL/Date headers and footers */
                        size: A4 portrait;
                    }
                    body { 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact; 
                        padding: 15mm !important; /* Move the margin to the body so content isn't cut off */
                        background-color: white !important;
                    }
                    .no-print { display: none !important; }
                    aside { display: none !important; }
                    nav { display: none !important; }
                    main { 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        max-width: 100% !important; 
                        overflow: visible !important; 
                        height: auto !important; 
                    }
                }
            `}} />

            {/* Action Bar (Hidden in print) */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between no-print bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <Link href="/dashboard/ledger" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-bold transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Back to Wallet
                </Link>
                <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-colors"
                >
                    <Printer className="w-4 h-4" /> Print / Save as PDF
                </button>
            </div>

            {/* Printable A4 Container */}
            <div className="max-w-[210mm] mx-auto bg-white rounded-none md:rounded-2xl shadow-none md:shadow-lg print:shadow-none border border-transparent md:border-slate-200 print:border-none p-8 md:p-12 min-h-[297mm]">
                
                {/* Header */}
                <header className="flex items-start justify-between border-b-2 border-slate-100 pb-8 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 relative overflow-hidden rounded-xl border border-slate-200">
                                <Image src="/grabme.png" alt="GrabMe" fill className="object-cover" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 tracking-tight">Verified Earnings Report</h1>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">GrabMe Professional Network</p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Prepared For</h2>
                            <p className="text-2xl font-black text-slate-900">{workerName}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg mb-6">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">System Verified</span>
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Statement Period</h2>
                            <p className="text-base font-black text-slate-900">{dateRangeStr}</p>
                        </div>
                        <div className="mt-2 text-[10px] font-bold text-slate-400">
                            Generated: {new Date().toLocaleDateString('en-US')}
                        </div>
                    </div>
                </header>

                {/* Summary Overview */}
                <div className="grid grid-cols-3 gap-6 mb-10">
                    <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-1">Total Income</p>
                        <p className="text-xl font-black text-emerald-900">{formatCurrency(totalIncome)}</p>
                    </div>
                    <div className="bg-red-50/50 border border-red-100 p-5 rounded-2xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-700 mb-1">Total Expenses</p>
                        <p className="text-xl font-black text-red-900">{formatCurrency(totalExpense)}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Net Profit</p>
                        <p className="text-2xl font-black text-slate-900">{formatCurrency(netProfit)}</p>
                    </div>
                </div>

                {/* Ledger Entries */}
                <div className="mb-12">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4 border-b border-slate-200 pb-2">Itemized Transactions</h3>
                    
                    {entries.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-8">No transactions recorded for this period.</p>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="py-3 px-4 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 w-24">Date</th>
                                    <th className="py-3 px-4 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">Category / Description</th>
                                    <th className="py-3 px-4 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {entries.map(entry => (
                                    <tr key={entry.id} className="text-sm font-medium">
                                        <td className="py-3 px-4 text-slate-500">
                                            {new Date(entry.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-slate-900 font-bold">{entry.category}</p>
                                        </td>
                                        <td className={`py-3 px-4 text-right font-black ${entry.type === 'income' ? 'text-emerald-600' : 'text-slate-600'}`}>
                                            {entry.type === 'income' ? '' : '-'}
                                            {formatCurrency(entry.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-auto pt-8 border-t border-slate-200 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        This document is a system-generated summary of user-reported financial entries via the GrabMe Partner Application. 
                        It is intended to serve as a proof of business activity and wallet overview.
                    </p>
                </div>
            </div>
        </main>
    )
}

export default function LedgerReportPage() {
    return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center h-full bg-slate-100"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
            <ReportContent />
        </Suspense>
    )
}
