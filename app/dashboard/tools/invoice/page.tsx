'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, Trash2, FileText, Send } from 'lucide-react'
import Link from 'next/link'
import { createInvoiceAction } from './actions'
import { addLedgerEntryAction } from '../../ledger/actions'
import { CustomSelect } from '../../../components/ui/CustomSelect'
import { toast } from 'sonner'

interface LineItem {
    id: string;
    type: 'labor' | 'material';
    description: string;
    quantity: number;
    unit_price: number;
}

export default function InvoiceBuilderPage() {
    const router = useRouter()
    const [workerId, setWorkerId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [addToWallet, setAddToWallet] = useState(true)

    const [customerName, setCustomerName] = useState('')
    const [customerContact, setCustomerContact] = useState('')
    const [leadSource, setLeadSource] = useState<'grabme' | 'direct' | 'referral' | 'other'>('grabme')
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { id: '1', type: 'labor', description: '', quantity: 1, unit_price: 0 }
    ])

    useEffect(() => {
        const userStr = localStorage.getItem('grabme_user')
        if (!userStr) {
            router.push('/login')
            return
        }
        const user = JSON.parse(userStr)
        if (user.subscription_tier !== 'pro') {
            router.push('/dashboard/billing')
            return
        }
        setWorkerId(user.id)
        setLoading(false)
    }, [router])

    const handleAddLine = () => {
        setLineItems([...lineItems, { id: Math.random().toString(), type: 'material', description: '', quantity: 1, unit_price: 0 }])
    }

    const handleRemoveLine = (id: string) => {
        if (lineItems.length === 1) return
        setLineItems(lineItems.filter(item => item.id !== id))
    }

    const handleUpdateLine = (id: string, field: keyof LineItem, value: any) => {
        setLineItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item))
    }

    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!workerId || !customerName) return
        
        const validItems = lineItems.filter(i => i.description.trim() !== '')
        if (validItems.length === 0) {
            toast.error('Please add at least one line item.')
            return
        }

        setIsSubmitting(true)
        const toastId = toast.loading('Generating invoice...')

        const invoiceData = {
            worker_id: workerId,
            customer_name: customerName,
            customer_contact: customerContact,
            amount: subtotal, // Satisfies legacy schema
            total_amount: subtotal,
            status: addToWallet ? 'paid' : 'unpaid',
            lead_source: leadSource,
            job_description: validItems[0]?.description || 'Invoice', // Satisfies the not-null constraint
            line_items: validItems
        }

        const res = await createInvoiceAction(invoiceData)
        if (res.success && res.data) {
            if (addToWallet) {
                await addLedgerEntryAction({
                    worker_id: workerId,
                    type: 'income',
                    amount: subtotal,
                    category: 'Service',
                    lead_source: leadSource,
                    description: `Invoice: ${customerName} - ${validItems[0]?.description || 'Services'}`,
                    entry_date: new Date().toISOString().split('T')[0]
                })
            }
            toast.success('Invoice generated successfully!', { id: toastId })
            router.push(`/dashboard/tools/invoice/${res.data.id}`)
        } else {
            toast.error(res.error || 'Failed to create invoice.', { id: toastId })
            setIsSubmitting(false)
        }
    }

    if (loading) return <div className="flex-1 flex items-center justify-center min-h-screen bg-[#f8fafc]"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>

    return (
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] pb-24">
            {/* Header */}
            <header className="h-20 border-b border-slate-200 flex items-center px-8 lg:px-12 bg-white sticky top-0 z-20 shadow-sm">
                <Link href="/dashboard/tools" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-bold transition-colors">
                    <ChevronLeft className="w-5 h-5" /> Back to Tools
                </Link>
                <div className="ml-auto flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Pro Feature
                </div>
            </header>

            <div className="p-6 lg:p-12 max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <FileText className="w-6 h-6 text-indigo-600" /> New Invoice
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Create a professional branded invoice for your client.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                    {/* Client Details Section */}
                    <div className="p-8 border-b border-slate-100 space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Client Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Client Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 font-bold outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Contact / Address (Optional)</label>
                                <input
                                    type="text"
                                    value={customerContact}
                                    onChange={(e) => setCustomerContact(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 font-bold outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all"
                                    placeholder="Phone number or address"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Where did this client find you?</label>
                                <CustomSelect
                                    value={leadSource}
                                    onChange={(val: any) => setLeadSource(val)}
                                    options={[
                                        { label: 'GrabMe App', value: 'grabme' },
                                        { label: 'Direct Client (Walk-in/Call)', value: 'direct' },
                                        { label: 'Referral from friend/client', value: 'referral' },
                                        { label: 'Other', value: 'other' }
                                    ]}
                                    placeholder="Select a source"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Line Items Section */}
                    <div className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Line Items</h2>
                        </div>
                        
                        <div className="space-y-4">
                            {lineItems.map((item, idx) => (
                                <div key={item.id} className="flex flex-col gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 relative">
                                    <div className="flex items-center gap-3">
                                        <div className="w-48">
                                            <CustomSelect 
                                                value={item.type}
                                                onChange={(val: any) => {
                                                    setLineItems(prev => prev.map(i => {
                                                        if (i.id === item.id) {
                                                            return { ...i, type: val, quantity: val === 'labor' ? 1 : i.quantity }
                                                        }
                                                        return i
                                                    }))
                                                }}
                                                options={[
                                                    { label: 'Work / Service', value: 'labor' },
                                                    { label: 'Material / Item', value: 'material' }
                                                ]}
                                                variant="pill"
                                                placeholder="Type"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                                        <div className="flex-1 w-full flex flex-col gap-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">
                                                {item.type === 'labor' ? 'Description of Work' : 'Material Name'}
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={item.description}
                                                onChange={(e) => handleUpdateLine(item.id, 'description', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-600 transition-all"
                                                placeholder={item.type === 'labor' ? "e.g. Fixed main water pipe" : "e.g. 1/2 inch PVC Pipe"}
                                            />
                                        </div>
                                        <div className="flex gap-4 w-full md:w-auto items-end">
                                            {item.type === 'material' && (
                                                <div className="w-20 flex flex-col gap-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Qty</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        required
                                                        value={item.quantity}
                                                        onChange={(e) => handleUpdateLine(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-2 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-600 transition-all text-center"
                                                        placeholder="1"
                                                    />
                                                </div>
                                            )}
                                            <div className="w-32 flex flex-col gap-1.5">
                                                <label className={`text-[10px] font-black uppercase tracking-widest text-right pr-1 ${item.type === 'material' ? 'text-amber-600' : 'text-slate-500'}`}>
                                                    {item.type === 'material' ? '1 PCS Price' : 'Price'}
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        required
                                                        value={item.unit_price}
                                                        onChange={(e) => handleUpdateLine(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                                                        className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-600 transition-all text-right"
                                                        placeholder="0"
                                                    />
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rs</span>
                                                </div>
                                            </div>
                                            <div className="w-28 text-right bg-white border border-slate-200 rounded-xl py-2 px-3 shadow-sm h-[46px] flex flex-col justify-center">
                                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block mb-0.5">Line Total</span>
                                                <span className="text-sm text-indigo-950 font-black">{(item.quantity * item.unit_price).toLocaleString()}</span>
                                            </div>
                                            {lineItems.length > 1 && (
                                                <button 
                                                    type="button"
                                                    onClick={() => handleRemoveLine(item.id)}
                                                    className="w-12 h-[46px] flex items-center justify-center bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex-shrink-0"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleAddLine}
                            className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors border border-indigo-100 border-dashed"
                        >
                            <Plus className="w-4 h-4" /> Add Item
                        </button>
                    </div>

                    {/* Totals Section */}
                    <div className="p-8 bg-slate-900 text-white">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Amount</p>
                                <p className="text-3xl font-black">Rs. {subtotal.toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col gap-4 w-full md:w-auto items-start md:items-end">
                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input 
                                            type="checkbox" 
                                            checked={addToWallet}
                                            onChange={(e) => setAddToWallet(e.target.checked)}
                                            className="peer appearance-none w-5 h-5 border-2 border-slate-600 rounded bg-slate-800 checked:bg-indigo-500 checked:border-indigo-500 transition-all focus:ring-2 focus:ring-indigo-500/50" 
                                        />
                                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Add to Wallet as Income</span>
                                </label>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full md:w-auto flex items-center justify-center gap-2 py-4 px-8 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Generating...' : <><Send className="w-4 h-4" /> Generate Invoice</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    )
}
