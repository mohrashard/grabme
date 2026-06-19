'use client'

import React, { useEffect, useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { 
    FileText, 
    CheckCircle2, 
    Clock, 
    XCircle,
    ExternalLink,
    Filter,
    ArrowLeft,
    Search,
    Trash2,
    Check
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { 
    getEstimatesAction, 
    rejectEstimateAction, 
    deleteEstimateAction, 
    acceptEstimateFlowAction 
} from './actions'

export default function EstimatesPage() {
    const [loading, setLoading] = useState(true)
    const [estimates, setEstimates] = useState<any[]>([])
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [user, setUser] = useState<any>(null)
    const [processingId, setProcessingId] = useState<string | null>(null)

    // Modal state for Accept Flow
    const [showAcceptModal, setShowAcceptModal] = useState<string | null>(null)
    const [createInvoice, setCreateInvoice] = useState(true)
    const [addToWallet, setAddToWallet] = useState(false)

    useEffect(() => {
        const fetchEstimates = async () => {
            const raw = localStorage.getItem('grabme_user')
            if (!raw) return
            const u = JSON.parse(raw)
            setUser(u)

            const res = await getEstimatesAction(u.id)
            if (res.success && res.data) {
                setEstimates(res.data)
            }
            setLoading(false)
        }
        fetchEstimates()
    }, [])

    const handleReject = async (id: string) => {
        if (!user) return
        setProcessingId(id)
        const res = await rejectEstimateAction(id, user.id)
        if (res.success) {
            toast.success('Estimate marked as rejected.')
            setEstimates(prev => prev.map(e => e.id === id ? { ...e, status: 'rejected' } : e))
        } else {
            toast.error(res.error || 'Failed to reject.')
        }
        setProcessingId(null)
    }

    const handleDelete = async (id: string) => {
        if (!user || !window.confirm('Are you sure you want to completely delete this estimate?')) return
        setProcessingId(id)
        const res = await deleteEstimateAction(id, user.id)
        if (res.success) {
            toast.success('Estimate deleted.')
            setEstimates(prev => prev.filter(e => e.id !== id))
        } else {
            toast.error(res.error || 'Failed to delete.')
        }
        setProcessingId(null)
    }

    const handleAcceptConfirm = async () => {
        if (!user || !showAcceptModal) return
        const id = showAcceptModal
        setProcessingId(id)
        setShowAcceptModal(null)

        const res = await acceptEstimateFlowAction(id, user.id, createInvoice, addToWallet)
        if (res.success) {
            toast.success('Awesome! Estimate marked as accepted.')
            if (createInvoice) toast.success('Invoice auto-generated successfully.')
            if (addToWallet) toast.success('Income added to your Wallet.')
            
            setEstimates(prev => prev.map(e => e.id === id ? { ...e, status: 'accepted', generated_invoice_id: res.newInvoiceId } : e))
        } else {
            toast.error(res.error || 'Failed to process.')
        }
        setProcessingId(null)
    }

    const filtered = estimates.filter(est => {
        if (filter !== 'all' && est.status !== filter) return false
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase()
            const nameMatch = est.customer_name?.toLowerCase().includes(q)
            const phoneMatch = est.customer_contact?.toLowerCase().includes(q)
            if (!nameMatch && !phoneMatch) return false
        }
        return true
    })

    if (loading) {
        return (
            <main className="flex-1 overflow-y-auto pb-32 lg:pb-12 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </main>
        )
    }

    return (
        <main className="flex-1 overflow-y-auto pb-32 lg:pb-12">
            <div className="p-5 md:p-10 max-w-5xl mx-auto w-full space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                    <div>
                        <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-teal-600 transition-colors mb-4">
                            <ArrowLeft className="w-4 h-4" /> Back to Tools
                        </Link>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <FileText className="w-6 h-6 text-teal-600" /> Estimate History
                        </h1>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-2">Track quotes you've sent to clients</p>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        {/* Search Bar */}
                        <div className="relative w-full">
                            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text"
                                placeholder="Search by name or phone..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                        
                        {/* Filters */}
                        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm overflow-x-auto whitespace-nowrap">
                            <Filter className="w-4 h-4 text-slate-400 ml-2" />
                            {['all', 'pending', 'accepted', 'rejected'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f as any)}
                                    className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                                        filter === f 
                                            ? 'bg-slate-900 text-white shadow-md' 
                                            : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* List */}
                {filtered.length === 0 ? (
                    <div className="bg-white border border-dashed border-slate-300 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <FileText className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">No estimates found</h3>
                        <p className="text-sm text-slate-500 mt-2 max-w-sm">
                            {searchQuery ? 'Try adjusting your search terms.' : "You haven't generated any estimates yet."}
                        </p>
                        {filter === 'all' && !searchQuery && (
                            <Link href="/dashboard/tools/estimate" className="mt-6 px-6 py-3 bg-teal-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20">
                                Create an Estimate
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filtered.map((est, idx) => (
                            <m.div 
                                key={est.id}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                                        est.status === 'accepted' ? 'bg-emerald-50' : 
                                        est.status === 'rejected' ? 'bg-rose-50' : 'bg-amber-50'
                                    }`}>
                                        {est.status === 'accepted' ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : 
                                         est.status === 'rejected' ? <XCircle className="w-6 h-6 text-rose-600" /> :
                                         <Clock className="w-6 h-6 text-amber-600" />}
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="text-lg font-black text-slate-900">{est.customer_name}</h3>
                                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full ${
                                                est.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 
                                                est.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {est.status}
                                            </span>
                                            {est.customer_contact && (
                                                <span className="text-xs font-bold text-slate-400">({est.customer_contact})</span>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold text-slate-500 mt-1">{est.job_description}</p>
                                        <p className="text-xs text-slate-400 mt-2">
                                            {new Date(est.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-3 lg:w-auto w-full">
                                    <div className="text-center sm:text-right w-full sm:w-auto px-4">
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Quote Value</p>
                                        <p className="text-xl font-black text-slate-900">Rs. {(est.total_amount || est.amount).toLocaleString()}</p>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
                                        {est.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleReject(est.id)}
                                                    disabled={processingId === est.id}
                                                    className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => setShowAcceptModal(est.id)}
                                                    disabled={processingId === est.id}
                                                    className="px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50"
                                                >
                                                    Accept
                                                </button>
                                            </>
                                        )}

                                        {est.status === 'rejected' && (
                                            <button
                                                onClick={() => handleDelete(est.id)}
                                                disabled={processingId === est.id}
                                                className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" /> Delete
                                            </button>
                                        )}
                                        
                                        <Link
                                            href={`/dashboard/tools/estimate/${est.id}`}
                                            className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-colors flex items-center gap-2"
                                        >
                                            <ExternalLink className="w-4 h-4" /> Estimate
                                        </Link>

                                        {est.generated_invoice_id && (
                                            <Link
                                                href={`/dashboard/tools/invoice/${est.generated_invoice_id}`}
                                                className="px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-widest rounded-xl transition-colors flex items-center gap-2"
                                            >
                                                <ExternalLink className="w-4 h-4" /> Invoice
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </m.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Accept Flow Modal */}
            <AnimatePresence>
                {showAcceptModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <m.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setShowAcceptModal(null)}
                        />
                        <m.div 
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100"
                        >
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-black text-center text-slate-900 mb-2">Quote Accepted!</h2>
                            <p className="text-sm font-medium text-slate-500 text-center mb-8">
                                Congratulations on winning the job. Would you like to automate the next steps?
                            </p>

                            <div className="space-y-4 mb-8">
                                <label className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <div className="relative flex items-center justify-center w-6 h-6 mt-0.5">
                                        <input 
                                            type="checkbox" 
                                            className="peer appearance-none w-6 h-6 border-2 border-slate-300 rounded-md checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer"
                                            checked={createInvoice}
                                            onChange={e => setCreateInvoice(e.target.checked)}
                                        />
                                        <Check className="w-4 h-4 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900">Transform to Invoice</h4>
                                        <p className="text-xs font-bold text-slate-500 mt-1">Automatically create an identical invoice so you don't have to type it again.</p>
                                    </div>
                                </label>

                                <label className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors cursor-pointer ${!createInvoice ? 'opacity-50 border-slate-100' : 'border-slate-200 hover:bg-slate-50'}`}>
                                    <div className="relative flex items-center justify-center w-6 h-6 mt-0.5">
                                        <input 
                                            type="checkbox" 
                                            disabled={!createInvoice}
                                            className="peer appearance-none w-6 h-6 border-2 border-slate-300 rounded-md checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer disabled:cursor-not-allowed"
                                            checked={addToWallet}
                                            onChange={e => setAddToWallet(e.target.checked)}
                                        />
                                        <Check className="w-4 h-4 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900">Add to Wallet</h4>
                                        <p className="text-xs font-bold text-slate-500 mt-1">Mark the invoice as paid immediately and add the income to your wallet.</p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowAcceptModal(null)}
                                    className="flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleAcceptConfirm}
                                    disabled={processingId !== null}
                                    className="flex-[2] py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                                >
                                    Confirm & Process
                                </button>
                            </div>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    )
}
