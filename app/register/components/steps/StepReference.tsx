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
        <m.div key="5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Referee Name</label>
                    <input 
                        name="referenceName" 
                        value={formData.referenceName} 
                        onChange={handleInputChange} 
                        placeholder="e.g. Ruwan Perera" 
                        className={`w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#1d4ed8] focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold transition-all placeholder:text-slate-300 ${fieldErrors.referenceName ? 'border-[#dc2626] bg-[#fef2f2] focus:ring-[#fecaca]' : ''}`} 
                    />
                    {renderHint('referenceName', 'Contact for verification')}
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Referee Phone</label>
                    <input 
                        name="referencePhone" 
                        value={formData.referencePhone} 
                        onChange={handleInputChange} 
                        placeholder="07x xxxxxxx" 
                        className={`w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#1d4ed8] focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold transition-all placeholder:text-slate-300 ${fieldErrors.referencePhone ? 'border-[#dc2626] bg-[#fef2f2] focus:ring-[#fecaca]' : ''}`} 
                    />
                    {renderHint('referencePhone', 'Cannot use your own number')}
                </div>
            </div>
        </m.div>
    );
}
