'use client'
import { m } from 'framer-motion'
import { ShieldCheck, Check } from 'lucide-react'
import Link from 'next/link'

interface StepConfirmationProps {
    formData: any;
    setFormData: (data: any) => void;
}

export default function StepConfirmation({ formData, setFormData }: StepConfirmationProps) {
    return (
        <m.div key="6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10 py-4">
            <div className="flex flex-col items-center gap-6 text-center">
                <div className="w-24 h-24 bg-blue-50 border-8 border-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/10 relative">
                    <ShieldCheck className="w-10 h-10 text-blue-600" />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-black text-[#0f172a] uppercase tracking-[0.2em]">Final Declaration</h2>
                    <p className="text-xs font-medium text-slate-400 max-w-[240px] leading-relaxed mx-auto italic lowercase tracking-wider">Please confirm your commitment to our community standards.</p>
                </div>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
                <label className={`flex items-center gap-4 p-6 rounded-[2rem] cursor-pointer transition-all border-2 active:scale-95 ${formData.agreedConduct ? 'bg-blue-50/30 border-blue-100 shadow-lg shadow-blue-500/5' : 'bg-slate-50 border-slate-100 opacity-70'}`}>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.agreedConduct ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200'}`}>
                        {formData.agreedConduct && <Check className="w-4 h-4" />}
                    </div>
                    <input type="checkbox" checked={formData.agreedConduct} onChange={(e) => setFormData((prev: any) => ({ ...prev, agreedConduct: e.target.checked }))} className="hidden" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-relaxed">
                        I agree to <Link href="/conduct" target="_blank" className="text-blue-700 underline decoration-blue-200/50">platform standards</Link> & code of conduct.
                    </span>
                </label>
                
                <label className={`flex items-center gap-4 p-6 rounded-[2rem] cursor-pointer transition-all border-2 active:scale-95 ${formData.agreedTruth ? 'bg-blue-50/30 border-blue-100 shadow-lg shadow-blue-500/5' : 'bg-slate-50 border-slate-100 opacity-70'}`}>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.agreedTruth ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200'}`}>
                        {formData.agreedTruth && <Check className="w-4 h-4" />}
                    </div>
                    <input type="checkbox" checked={formData.agreedTruth} onChange={(e) => setFormData((prev: any) => ({ ...prev, agreedTruth: e.target.checked }))} className="hidden" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-relaxed">
                        I certify that <Link href="/terms" target="_blank" className="text-blue-700 underline decoration-blue-200/50">all information</Link> provided is true & accurate.
                    </span>
                </label>
            </div>
            
            <div className="pt-4 text-center">
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">Ready to launch your profile</p>
            </div>
        </m.div>
    );
}
