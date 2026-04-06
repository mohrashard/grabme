'use client'
import { useState, useEffect } from 'react'
import { m } from 'framer-motion'
import { Plus, X, GraduationCap, Briefcase, Loader2 } from 'lucide-react'
import { fetchTaxonomyAction, type TaxonomyData } from '@/app/lib/taxonomyActions'

interface StepExperienceProps {
    formData: any;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    toggleSubSkill: (skill: string) => void;
    fieldErrors?: Record<string, string>;
}

export default function StepExperience({ formData, handleInputChange, toggleSubSkill, fieldErrors = {} }: StepExperienceProps) {
    const renderHint = (field: string, hint: string) => (
        <div className="flex justify-between items-center px-1">
            <p className={`text-[8px] font-bold uppercase tracking-wider ${fieldErrors[field] ? 'text-red-400' : 'text-white/20'}`}>
                {fieldErrors[field] || hint}
            </p>
        </div>
    );

    const [customSkill, setCustomSkill] = useState('');
    const [taxonomy, setTaxonomy] = useState<TaxonomyData | null>(null);
    const [loadingTaxonomy, setLoadingTaxonomy] = useState(true);

    useEffect(() => {
        fetchTaxonomyAction().then(data => {
            setTaxonomy(data);
            setLoadingTaxonomy(false);
        });
    }, []);

    const services = taxonomy?.services ?? [];
    const availableSubSkills = taxonomy?.skillsByService?.[formData.tradeCategory]?.map(sk => sk.name) ?? [];

    const handleAddCustom = () => {
        if (customSkill.trim()) {
            toggleSubSkill(customSkill.trim());
            setCustomSkill('');
        }
    };

    return (
        <m.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">Experience & Skills</h2>
                <p className="text-sm text-white/30">Highlight your expertise and background.</p>
            </div>
            
            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Primary Trade</label>
                    {loadingTaxonomy ? (
                        <div className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 text-white/30 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading services...
                        </div>
                    ) : (
                        <select name="tradeCategory" value={formData.tradeCategory} onChange={handleInputChange} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#4F46E5] outline-none text-sm [color-scheme:dark]">
                            <option value="" className="bg-[#18181B]">Select Trade</option>
                            {services.map(s => <option key={s.id} value={s.name} className="bg-[#18181B]">{s.name}</option>)}
                        </select>
                    )}
                </div>

                {formData.tradeCategory && (
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Specific Skills (Suggestions for {formData.tradeCategory})</label>
                        <div className="flex flex-wrap gap-2">
                            {availableSubSkills.map(skill => (
                                <button
                                    key={skill}
                                    onClick={() => toggleSubSkill(skill)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${formData.subSkills.includes(skill)
                                        ? 'bg-[#4F46E5] border-[#4F46E5] text-white'
                                        : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                                    }`}
                                >
                                    {skill}
                                </button>
                            ))}
                            {/* User's custom skills that are NOT in suggestions */}
                            {formData.subSkills.filter((s: string) => !availableSubSkills.includes(s)).map((s: string) => (
                                <button
                                    key={s}
                                    onClick={() => toggleSubSkill(s)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all border bg-[#4F46E5] border-[#4F46E5] text-white flex items-center gap-2"
                                >
                                    {s} <X className="w-3 h-3 text-white/40" />
                                </button>
                            ))}
                        </div>
                        
                        {/* Custom Skill Input */}
                        <div className="flex gap-2">
                            <input
                                placeholder="Add other specific skill..."
                                value={customSkill}
                                onChange={(e) => setCustomSkill(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustom())}
                                className="flex-1 px-5 py-3 bg-white/2 border border-white/5 rounded-xl focus:border-[#4F46E5] outline-none text-xs placeholder:text-white/10"
                            />
                            <button
                                onClick={handleAddCustom}
                                className="bg-white/5 hover:bg-white/10 border border-white/5 px-4 rounded-xl transition-all"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Years Active</label>
                        <input type="number" name="yearsExperience" value={formData.yearsExperience} onChange={handleInputChange} className={`w-full px-5 py-4 bg-white/5 border rounded-2xl focus:border-[#4F46E5] outline-none text-sm transition-all ${fieldErrors.yearsExperience ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`} />
                        {renderHint('yearsExperience', 'Numerical value only')}
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Last Employer</label>
                        <input name="previousEmployer" value={formData.previousEmployer} onChange={handleInputChange} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#4F46E5] outline-none text-sm" />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Short Bio / About You</label>
                        <textarea
                            name="shortBio"
                            value={formData.shortBio}
                            onChange={handleInputChange}
                            placeholder="Tell customers why they should hire you (e.g. 'I am a master electrician with 10 years experience in house wiring...')"
                            rows={3}
                            className={`w-full px-5 py-4 bg-white/5 border rounded-2xl focus:border-[#4F46E5] outline-none text-sm resize-none transition-all ${fieldErrors.shortBio ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`}
                        />
                        {renderHint('shortBio', 'Min 20 chars • Avoid profanity')}
                    </div>
                </div>
            </div>
        </m.div>
    );
}
