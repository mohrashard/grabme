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
        <m.div key="6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8 text-center">
            <div className="w-20 h-20 bg-[#4F46E5]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-[#4F46E5]/20 shadow-2xl">
                <ShieldCheck className="w-10 h-10 text-[#4F46E5]" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Final Confirmation</h2>
            <div className="space-y-4 text-left">
                <label className="flex items-start gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl cursor-pointer hover:bg-white/[0.05] transition-all group">
                    <input type="checkbox" checked={formData.agreedConduct} onChange={(e) => setFormData((prev: any) => ({ ...prev, agreedConduct: e.target.checked }))} className="mt-1 w-5 h-5 rounded border-white/10 bg-white/5 text-[#4F46E5]" />
                    <span className="text-sm text-white/40 leading-relaxed font-bold uppercase tracking-widest italic flex flex-wrap gap-x-2 items-center">
                        I agree to <Link href="/conduct" target="_blank" className="text-white underline decoration-white/20 hover:decoration-white transition-all">platform standards </Link> & conduct.
                    </span>
                </label>
                <label className="flex items-start gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl cursor-pointer hover:bg-white/[0.05] transition-all group">
                    <input type="checkbox" checked={formData.agreedTruth} onChange={(e) => setFormData((prev: any) => ({ ...prev, agreedTruth: e.target.checked }))} className="mt-1 w-5 h-5 rounded border-white/10 bg-white/5 text-[#4F46E5]" />
                    <span className="text-sm text-white/40 leading-relaxed font-bold uppercase tracking-widest italic flex flex-wrap gap-x-2 items-center">
                        I certify <Link href="/terms" target="_blank" className="text-white underline decoration-white/20 hover:decoration-white transition-all">all information</Link> is true.
                    </span>
                </label>
            </div>
        </m.div>
    );
}
