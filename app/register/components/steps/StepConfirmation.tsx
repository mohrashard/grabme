'use client'
import { m } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import Link from 'next/link'

interface StepConfirmationProps {
    formData: any;
    setFormData: (data: any) => void;
}

export default function StepConfirmation({ formData, setFormData }: StepConfirmationProps) {
    return (
        <m.div key="6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8 text-center pt-8">
            <div className="w-20 h-20 bg-blue-50 border-4 border-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-100">
                <ShieldCheck className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Final Confirmation</h2>
            
            <div className="space-y-4 text-left max-w-lg mx-auto">
                <label className="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-[2rem] cursor-pointer hover:bg-blue-50/50 hover:border-blue-200/50 transition-all group shadow-sm">
                    <input type="checkbox" checked={formData.agreedConduct} onChange={(e) => setFormData((prev: any) => ({ ...prev, agreedConduct: e.target.checked }))} className="mt-1 w-5 h-5 rounded border-slate-200 bg-white text-blue-600 focus:ring-blue-100" />
                    <span className="text-sm text-slate-500 leading-relaxed font-bold uppercase tracking-widest italic flex flex-wrap gap-x-2 items-center">
                        I agree to <Link href="/conduct" target="_blank" className="text-blue-700 underline decoration-blue-200/50 hover:decoration-blue-700 transition-all">platform standards </Link> & conduct.
                    </span>
                </label>
                
                <label className="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-[2rem] cursor-pointer hover:bg-blue-50/50 hover:border-blue-200/50 transition-all group shadow-sm">
                    <input type="checkbox" checked={formData.agreedTruth} onChange={(e) => setFormData((prev: any) => ({ ...prev, agreedTruth: e.target.checked }))} className="mt-1 w-5 h-5 rounded border-slate-200 bg-white text-blue-600 focus:ring-blue-100" />
                    <span className="text-sm text-slate-500 leading-relaxed font-bold uppercase tracking-widest italic flex flex-wrap gap-x-2 items-center">
                        I certify <Link href="/terms" target="_blank" className="text-blue-700 underline decoration-blue-200/50 hover:decoration-blue-700 transition-all">all information</Link> is true.
                    </span>
                </label>
            </div>
        </m.div>
    );
}
