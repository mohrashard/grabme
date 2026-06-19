'use client'

import React, { useEffect, useState } from 'react'
import { m } from 'framer-motion'
import { 
    ReceiptText, 
    CheckCircle2, 
    Clock, 
    Wallet, 
    ExternalLink,
    Filter,
    ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { getInvoicesAction, markInvoiceAsPaidAction } from './actions'

export default function InvoicesPage() {
    const [loading, setLoading] = useState(true)
    const [invoices, setInvoices] = useState<any[]>([])
    const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all')
    const [user, setUser] = useState<any>(null)
    const [processingId, setProcessingId] = useState<string | null>(null)

    useEffect(() => {
        const fetchInvoices = async () => {
            const raw = localStorage.getItem('grabme_user')
            if (!raw) return
            const u = JSON.parse(raw)
            setUser(u)

            const res = await getInvoicesAction(u.id)
            if (res.success && res.data) {
                setInvoices(res.data)
            }
            setLoading(false)
        }
        fetchInvoices()
    }, [])

    const handleMarkAsPaid = async (invoiceId: string) => {
        if (!user) return
        setProcessingId(invoiceId)
        
        try {
            const res = await markInvoiceAsPaidAction(invoiceId, user.id)
            if (res.success) {
                toast.success('Invoice marked as paid and added to your Wallet!')
                // Update local state
                setInvoices(prev => prev.map(inv => 
                    inv.id === invoiceId ? { ...inv, status: 'paid' } : inv
                ))
            } else {
                toast.error(res.error || 'Failed to update invoice.')
            }
        } catch (err) {
            toast.error('An unexpected error occurred.')
        } finally {
            setProcessingId(null)
        }
    }

    const filteredInvoices = invoices.filter(inv => {
        if (filter === 'all') return true
        return inv.status === filter
    })

    if (loading) {
        return (
            <main className="flex-1 overflow-y-auto pb-32 lg:pb-12 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </main>
        )
    }

    return (
        <main className="flex-1 overflow-y-auto pb-32 lg:pb-12">
            <div className="p-5 md:p-10 max-w-5xl mx-auto w-full space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                    <div>
                        <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors mb-4">
                            <ArrowLeft className="w-4 h-4" /> Back to Tools
                        </Link>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <ReceiptText className="w-6 h-6 text-indigo-600" /> Invoice History
                        </h1>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-2">Manage your transactions and outstanding payments</p>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
                        <Filter className="w-4 h-4 text-slate-400 ml-2" />
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${filter === 'all' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unpaid')}
                            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${filter === 'unpaid' ? 'bg-amber-100 text-amber-800 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Unpaid
                        </button>
                        <button
                            onClick={() => setFilter('paid')}
                            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${filter === 'paid' ? 'bg-emerald-100 text-emerald-800 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Paid
                        </button>
                    </div>
                </div>

                {/* Invoices List */}
                {filteredInvoices.length === 0 ? (
                    <div className="bg-white border border-dashed border-slate-300 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <ReceiptText className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">No invoices found</h3>
                        <p className="text-sm text-slate-500 mt-2 max-w-sm">
                            {filter === 'all' 
                                ? "You haven't generated any professional invoices yet." 
                                : `You don't have any ${filter} invoices right now.`}
                        </p>
                        {filter === 'all' && (
                            <Link href="/dashboard/tools/invoice" className="mt-6 px-6 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
                                Create an Invoice
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredInvoices.map((inv, idx) => (
                            <m.div 
                                key={inv.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${inv.status === 'paid' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                                        {inv.status === 'paid' ? (
                                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                        ) : (
                                            <Clock className="w-6 h-6 text-amber-600" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-black text-slate-900">{inv.customer_name}</h3>
                                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                                {inv.status}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-500 mt-1">{inv.job_description}</p>
                                        <p className="text-xs text-slate-400 mt-2">
                                            {new Date(inv.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-4 lg:w-auto w-full">
                                    <div className="text-center sm:text-right w-full sm:w-auto">
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Amount</p>
                                        <p className="text-xl font-black text-slate-900">Rs. {(inv.total_amount || inv.amount).toLocaleString()}</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        {inv.status === 'unpaid' && (
                                            <button
                                                onClick={() => handleMarkAsPaid(inv.id)}
                                                disabled={processingId === inv.id}
                                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50"
                                            >
                                                {processingId === inv.id ? (
                                                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Wallet className="w-4 h-4" />
                                                )}
                                                <span className="hidden sm:inline">Add to Wallet</span>
                                                <span className="sm:hidden">Pay</span>
                                            </button>
                                        )}
                                        <Link
                                            href={`/dashboard/tools/invoice/${inv.id}`}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-slate-900/20"
                                        >
                                            <ExternalLink className="w-4 h-4" /> PDF
                                        </Link>
                                    </div>
                                </div>
                            </m.div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
