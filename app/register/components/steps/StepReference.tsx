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
            <p className={`text-[8px] font-bold uppercase tracking-wider ${fieldErrors[field] ? 'text-red-400' : 'text-white/20'}`}>
                {fieldErrors[field] || hint}
            </p>
        </div>
    );
    return (
        <m.div key="5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">Reference</h2>
                <p className="text-sm text-white/30">Provide one contact for verification.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Contact Name</label>
                    <input name="referenceName" value={formData.referenceName} onChange={handleInputChange} className={`w-full px-5 py-4 bg-white/5 border rounded-2xl focus:border-[#4F46E5] outline-none text-sm transition-all ${fieldErrors.referenceName ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`} />
                    {renderHint('referenceName', 'Min 2 characters')}
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Contact Phone</label>
                    <input name="referencePhone" value={formData.referencePhone} onChange={handleInputChange} className={`w-full px-5 py-4 bg-white/5 border rounded-2xl focus:border-[#4F46E5] outline-none text-sm transition-all ${fieldErrors.referencePhone ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`} />
                    {renderHint('referencePhone', 'Cannot be your own number')}
                </div>
            </div>
        </m.div>
    );
}
