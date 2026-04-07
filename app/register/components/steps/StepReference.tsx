'use client'
import { m } from 'framer-motion'

interface StepReferenceProps {
    formData: any;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fieldErrors?: Record<string, string>;
}

export default function StepReference({ formData, handleInputChange, fieldErrors = {} }: StepReferenceProps) {
    const renderHint = (field: string, hint: string) => (
        <div className="flex justify-between items-center px-1">
            <p className={`text-[8px] font-bold uppercase tracking-wider ${fieldErrors[field] ? 'text-[#dc2626]' : 'text-slate-400'}`}>
                {fieldErrors[field] || hint}
            </p>
        </div>
    );
    return (
        <m.div key="5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900">Reference</h2>
                <p className="text-sm text-slate-500">Provide one contact for verification.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Contact Name</label>
                    <input name="referenceName" value={formData.referenceName} onChange={handleInputChange} placeholder="Name of referee" className={`w-full px-5 py-4 bg-white border rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none text-sm transition-all placeholder:text-slate-300 ${fieldErrors.referenceName ? 'border-[#dc2626] bg-[#fef2f2] focus:ring-[#fecaca]' : 'border-slate-200'}`} />
                    {renderHint('referenceName', 'Min 2 characters')}
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Contact Phone</label>
                    <input name="referencePhone" value={formData.referencePhone} onChange={handleInputChange} placeholder=" referee's phone" className={`w-full px-5 py-4 bg-white border rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none text-sm transition-all placeholder:text-slate-300 ${fieldErrors.referencePhone ? 'border-[#dc2626] bg-[#fef2f2] focus:ring-[#fecaca]' : 'border-slate-200'}`} />
                    {renderHint('referencePhone', 'Cannot be your own number')}
                </div>
            </div>
        </m.div>
    );
}
