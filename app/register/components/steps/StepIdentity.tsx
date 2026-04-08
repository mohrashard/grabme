'use client'
import { m } from 'framer-motion'

interface StepIdentityProps {
    formData: any;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fieldErrors?: Record<string, string>;
}

export default function StepIdentity({ formData, handleInputChange, fieldErrors = {} }: StepIdentityProps) {
    const renderHint = (field: string, hint: string) => (
        <div className="flex justify-between items-center px-1">
            <p className={`text-[8px] font-bold uppercase tracking-wider ${fieldErrors[field] ? 'text-[#dc2626]' : 'text-slate-400'}`}>
                {fieldErrors[field] || hint}
            </p>
        </div>
    );

    return (
        <m.div key="1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Full Name */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Full Name (as per NIC)</label>
                    <input 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleInputChange} 
                        placeholder="e.g. Arshad Mohammed" 
                        autoComplete="name" 
                        className={`w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold transition-all placeholder:text-slate-300 ${fieldErrors.fullName ? 'border-[#dc2626] bg-[#fef2f2] focus:ring-[#fecaca]' : ''}`} 
                    />
                    {renderHint('fullName', 'Official documents only')}
                </div>

                {/* WhatsApp */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">WhatsApp Number</label>
                    <input 
                        name="phone" 
                        type="tel" 
                        inputMode="numeric" 
                        autoComplete="tel" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        placeholder="07x xxxxxxx" 
                        className={`w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold transition-all placeholder:text-slate-300 ${fieldErrors.phone ? 'border-[#dc2626] bg-[#fef2f2] focus:ring-[#fecaca]' : ''}`} 
                    />
                    {renderHint('phone', 'For account verification')}
                </div>

                {/* Email */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Email Address (Portal ID)</label>
                    <input 
                        name="email" 
                        type="email" 
                        autoComplete="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        placeholder="your@email.com" 
                        className={`w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold transition-all placeholder:text-slate-300 ${fieldErrors.email ? 'border-[#dc2626] bg-[#fef2f2] focus:ring-[#fecaca]' : ''}`} 
                    />
                    {renderHint('email', 'For secure portal login')}
                </div>

                {/* Password */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Portal Password</label>
                    <input 
                        name="password" 
                        type="password" 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        placeholder="••••••••" 
                        className={`w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold transition-all placeholder:text-slate-300 ${fieldErrors.password ? 'border-[#dc2626] bg-[#fef2f2] focus:ring-[#fecaca]' : ''}`} 
                    />
                    {renderHint('password', 'Min 8 characters with numbers')}
                </div>

                {/* NIC */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">NIC Number</label>
                    <input 
                        name="nicNumber" 
                        value={formData.nicNumber} 
                        onChange={handleInputChange} 
                        placeholder="e.g. 921234567V" 
                        className={`w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold transition-all placeholder:text-slate-300 ${fieldErrors.nicNumber ? 'border-[#dc2626] bg-[#fef2f2] focus:ring-[#fecaca]' : ''}`} 
                    />
                    {renderHint('nicNumber', 'Old (9+V) or New (12 digits)')}
                </div>

                {/* Emergency Contact */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Emergency (Relative WA)</label>
                    <input 
                        name="emergencyContact" 
                        type="tel" 
                        inputMode="numeric" 
                        autoComplete="tel" 
                        value={formData.emergencyContact} 
                        onChange={handleInputChange} 
                        placeholder="07x xxxxxxx" 
                        className={`w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold transition-all placeholder:text-slate-300 ${fieldErrors.emergencyContact ? 'border-[#dc2626] bg-[#fef2f2] focus:ring-[#fecaca]' : ''}`} 
                    />
                    {renderHint('emergencyContact', 'Relative or friend contact')}
                </div>

                {/* DOB */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date of Birth</label>
                    <input 
                        type="date" 
                        name="dob" 
                        value={formData.dob} 
                        onChange={handleInputChange} 
                        className={`w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold transition-all ${fieldErrors.dob ? 'border-[#dc2626] bg-[#fef2f2] focus:ring-[#fecaca]' : ''}`} 
                    />
                    {renderHint('dob', 'Matches birth year in NIC')}
                </div>

                {/* Address */}
                <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Home Address</label>
                    <input 
                        name="address" 
                        value={formData.address} 
                        onChange={handleInputChange} 
                        placeholder="e.g. 123/A, Temple Road, Colombo" 
                        className={`w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#1d4ed8] focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold transition-all placeholder:text-slate-300 ${fieldErrors.address ? 'border-[#dc2626] bg-[#fef2f2] focus:ring-[#fecaca]' : ''}`} 
                    />
                    {renderHint('address', 'Matches NIC address exactly')}
                </div>
            </div>
        </m.div>
    );
}
