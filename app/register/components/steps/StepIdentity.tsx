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
            <p className={`text-[8px] font-bold uppercase tracking-wider ${fieldErrors[field] ? 'text-red-400' : 'text-white/20'}`}>
                {fieldErrors[field] || hint}
            </p>
        </div>
    );

    return (
        <m.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">Identity Basics</h2>
                <p className="text-sm text-white/30">Tell us who you are. Matches NIC exactly.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Full Name (as per NIC)</label>
                    <input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="As per NIC" autoComplete="name" className={`w-full px-5 py-4 bg-white/5 border rounded-2xl focus:border-[#4F46E5] outline-none text-sm transition-all ${fieldErrors.fullName ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`} />
                    {renderHint('fullName', 'Min 5 chars • Letters/Dots only')}
                </div>

                {/* WhatsApp */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">WhatsApp Number</label>
                    <input name="phone" type="tel" inputMode="numeric" autoComplete="tel" value={formData.phone} onChange={handleInputChange} placeholder="07x xxxxxxx" className={`w-full px-5 py-4 bg-white/5 border rounded-2xl focus:border-[#4F46E5] outline-none text-sm transition-all ${fieldErrors.phone ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`} />
                    {renderHint('phone', 'SL format: 07x/947x • Used for verification')}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Email Address (Portal ID)</label>
                    <input name="email" type="email" autoComplete="email" value={formData.email} onChange={handleInputChange} placeholder="partner@email.com" className={`w-full px-5 py-4 bg-white/5 border rounded-2xl focus:border-[#4F46E5] outline-none text-sm transition-all ${fieldErrors.email ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`} />
                    {renderHint('email', 'Standard email • Used for secure login')}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Portal Password</label>
                    <input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className={`w-full px-5 py-4 bg-white/5 border rounded-2xl focus:border-[#4F46E5] outline-none text-sm transition-all ${fieldErrors.password ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`} />
                    {renderHint('password', '8+ chars • Uppercase + Number + Special')}
                </div>

                {/* NIC */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">NIC Number</label>
                    <input name="nicNumber" inputMode="numeric" value={formData.nicNumber} onChange={handleInputChange} placeholder="e.g. 92xxxxxxxV" className={`w-full px-5 py-4 bg-white/5 border rounded-2xl focus:border-[#4F46E5] outline-none text-sm transition-all ${fieldErrors.nicNumber ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`} />
                    {renderHint('nicNumber', 'Old (9+V/X) or New (12 digits)')}
                </div>

                {/* Emergency Contact */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Emergency Contact (WA)</label>
                    <input name="emergencyContact" type="tel" inputMode="numeric" autoComplete="tel" value={formData.emergencyContact} onChange={handleInputChange} placeholder="Relative's WhatsApp" className={`w-full px-5 py-4 bg-white/5 border rounded-2xl focus:border-[#4F46E5] outline-none text-sm transition-all ${fieldErrors.emergencyContact ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`} />
                    {renderHint('emergencyContact', 'Family or friend WhatsApp number')}
                </div>

                {/* DOB */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Date of Birth</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className={`w-full px-5 py-4 bg-white/5 border rounded-2xl focus:border-[#4F46E5] outline-none text-sm transition-all [color-scheme:dark] ${fieldErrors.dob ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`} />
                    {renderHint('dob', 'Must match birth year in NIC')}
                </div>

                {/* Address */}
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Home Address</label>
                    <input name="address" value={formData.address} onChange={handleInputChange} placeholder="Current residence address" className={`w-full px-5 py-4 bg-white/5 border rounded-2xl focus:border-[#4F46E5] outline-none text-sm transition-all ${fieldErrors.address ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`} />
                    {renderHint('address', 'Full address required for trust verification')}
                </div>
            </div>
        </m.div>
    );
}
