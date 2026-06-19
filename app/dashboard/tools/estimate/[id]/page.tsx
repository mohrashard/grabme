'use client'

import React, { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Printer, ChevronLeft, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getestimateAction } from '../actions'

interface LineItem {
    description: string;
    quantity: number;
    unit_price: number;
}

export default function estimatePrintPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = use(params)
    const [estimate, setestimate] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchestimate = async () => {
            const res = await getestimateAction(id)
            if (res.success && res.data) {
                setestimate(res.data)
            }
            setLoading(false)
        }
        fetchestimate()
    }, [id])

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-100">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!estimate) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-100">
                <h1 className="text-2xl font-black text-slate-800">estimate Not Found</h1>
                <Link href="/dashboard/tools" className="mt-4 text-indigo-600 font-bold hover:underline">Return to Tools</Link>
            </div>
        )
    }

    const worker = estimate.workers
    const subtotal = estimate.total_amount

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val)
    }

    return (
        <main className="flex-1 overflow-y-auto h-full bg-slate-100 print:bg-white p-4 md:p-8 pb-32 md:pb-8">
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { 
                        margin: 0;
                        size: A4 portrait;
                    }
                    body { 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact; 
                        padding: 0 !important;
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
                    ::-webkit-scrollbar { display: none; }
                }
            `}} />

            {/* Action Bar (Hidden in print) */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between no-print bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <Link href="/dashboard/tools" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-bold transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Back to Tools
                </Link>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-colors"
                    >
                        <Printer className="w-4 h-4" /> Save as PDF
                    </button>
                </div>
            </div>

            {/* Mobile Scroll Wrapper */}
            <div className="w-full overflow-x-auto print:overflow-visible">
                {/* Printable A4 Container */}
                <div className="w-[210mm] min-w-[210mm] print:w-full print:min-w-0 mx-auto bg-white rounded-none md:rounded-2xl shadow-none md:shadow-lg print:shadow-none border border-transparent md:border-slate-200 print:border-none p-8 md:p-12 print:py-12 min-h-[297mm] print:min-h-0 print:h-auto flex flex-col relative overflow-hidden">
                
                {/* Decorative background element for premium feel */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-bl-[100px] -z-10 opacity-50" />

                {/* Top Header */}
                <header className="flex justify-between items-start mb-12">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 relative overflow-hidden rounded-xl border-2 border-white shadow-md">
                                {worker?.profile_photo_url ? (
                                    <img src={worker.profile_photo_url} alt={worker.full_name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                                ) : (
                                    <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                                        <span className="text-indigo-800 font-black text-xl">{worker?.full_name?.charAt(0) || 'W'}</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{worker?.full_name}</h1>
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-0.5">{worker?.trade_category}</p>
                            </div>
                        </div>
                        {worker?.phone && (
                            <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                                <Phone className="w-3 h-3" /> {worker.phone}
                            </p>
                        )}
                    </div>

                    <div className="text-right">
                        <h2 className="text-4xl font-black text-indigo-950 uppercase tracking-tighter">estimate</h2>
                        <p className="text-sm font-bold text-slate-400 mt-1">#{estimate.id.split('-')[0].toUpperCase()}</p>
                        <div className="mt-4 flex flex-col items-end gap-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Issue Date</p>
                            <p className="text-sm font-bold text-slate-900">{new Date(estimate.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </header>

                {/* Client Info */}
                <div className="grid grid-cols-2 gap-8 mb-12">
                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Billed To</p>
                        <h3 className="text-lg font-black text-slate-900">{estimate.customer_name}</h3>
                        {estimate.customer_contact && (
                            <p className="text-sm font-bold text-slate-600 mt-1">{estimate.customer_contact}</p>
                        )}
                    </div>
                    
                    <div className="flex flex-col items-end justify-center text-right pr-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg mb-2">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">GrabMe Verified Professional</span>
                        </div>
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="mb-12 flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="py-4 px-4 border-y-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                                <th className="py-4 px-4 border-y-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center w-24">Qty</th>
                                <th className="py-4 px-4 border-y-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right w-32">Rate</th>
                                <th className="py-4 px-4 border-y-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right w-32">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {estimate.line_items.map((item: LineItem, idx: number) => (
                                <tr key={idx} className="text-sm font-medium hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-4 text-slate-900 font-bold">
                                        {item.description}
                                        {(item as any).type && (
                                            <span className="block text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">
                                                {(item as any).type === 'labor' ? 'Service / Labor' : 'Material / Part'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-slate-500 text-center">{item.quantity}</td>
                                    <td className="py-4 px-4 text-slate-500 text-right">{formatCurrency(item.unit_price)}</td>
                                    <td className="py-4 px-4 text-slate-900 font-black text-right">{formatCurrency(item.quantity * item.unit_price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Box */}
                <div className="flex justify-end mb-16">
                    <div className="w-72 space-y-4">
                        <div className="flex justify-between items-center px-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subtotal</span>
                            <span className="text-sm font-bold text-slate-600">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center px-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tax</span>
                            <span className="text-sm font-bold text-slate-600">Rs 0</span>
                        </div>
                        <div className="bg-indigo-600 text-white rounded-2xl p-5 flex justify-between items-center shadow-lg shadow-indigo-600/20">
                            <span className="text-xs font-black uppercase tracking-widest">Total Due</span>
                            <span className="text-xl font-black">{formatCurrency(subtotal)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-8 border-t-2 border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Payment Instructions</p>
                        <p className="text-xs font-bold text-slate-500">Please pay within 7 days of estimate issue date.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 relative overflow-hidden rounded-md grayscale opacity-50">
                            <Image src="/grabme.png" alt="GrabMe" fill className="object-cover" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generated via GrabMe</p>
                    </div>
                </div>
                </div>
            </div>
        </main>
    )
}
