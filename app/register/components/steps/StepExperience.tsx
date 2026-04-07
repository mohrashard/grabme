'use client'
import { useState, useEffect } from 'react'
import { m } from 'framer-motion'
import { Plus, X, GraduationCap, Briefcase, Loader2 } from 'lucide-react'
import { fetchTaxonomyAction, type TaxonomyData } from '@/app/lib/taxonomyActions'
import { CustomSelect } from '@/app/components/ui/CustomSelect'

interface StepExperienceProps {
    formData: any;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    toggleSubSkill: (skill: string) => void;
    setSubSkills: (skills: string[]) => void;
    fieldErrors?: Record<string, string>;
}

export default function StepExperience({ formData, handleInputChange, toggleSubSkill, setSubSkills, fieldErrors = {} }: StepExperienceProps) {
    const renderHint = (field: string, hint: string) => (
        <div className="flex justify-between items-center px-1">
            <p className={`text-[8px] font-bold uppercase tracking-wider ${fieldErrors[field] ? 'text-[#dc2626]' : 'text-slate-400'}`}>
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

    // Map services with their keywords for better searching
    const serviceOptions = services.map(s => {
        const keywords: string[] = [];
        if (taxonomy?.keywordMap) {
            Object.entries(taxonomy.keywordMap).forEach(([word, svcs]) => {
                if (svcs.includes(s.name)) keywords.push(word);
            });
        }
        return { value: s.name, label: s.name, keywords };
    });

    return (
        <m.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#0f172a]">Experience & Skills</h2>
                <p className="text-sm text-[#64748b]">Highlight your expertise and background.</p>
            </div>
            
            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Primary Trade</label>
                    {loadingTaxonomy ? (
                        <div className="w-full px-5 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl flex items-center gap-3 text-[#64748b] text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading services...
                        </div>
                    ) : (
                        <CustomSelect
                            options={serviceOptions}
                            value={formData.tradeCategory}
                            onChange={(val: string) => {
                                handleInputChange({ target: { name: 'tradeCategory', value: val } } as any);
                                // Clear subskills when trade changes to ensure consistency
                                setSubSkills([]);
                            }}
                            placeholder="Search and select trade..."
                        />
                    )}
                </div>

                {formData.tradeCategory && (
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Specific Skills (Search or Select)</label>
                        
                        <CustomSelect
                            isMulti
                            options={availableSubSkills}
                            value={formData.subSkills}
                            onChange={(vals: string[]) => setSubSkills(vals)}
                            placeholder="Search and select skills..."
                        />

                        {formData.subSkills.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {formData.subSkills.map((s: string) => (
                                    <button
                                        key={s}
                                        onClick={() => toggleSubSkill(s)}
                                        className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all bg-blue-50 border border-blue-100 text-blue-700 flex items-center gap-2 group hover:bg-red-50 hover:border-red-100 hover:text-red-600 shadow-sm"
                                    >
                                        {s} <X className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Years Active</label>
                        <input type="number" name="yearsExperience" value={formData.yearsExperience} onChange={handleInputChange} className={`w-full px-5 py-4 bg-white border rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none text-sm transition-all placeholder:text-slate-300 ${fieldErrors.yearsExperience ? 'border-[#dc2626] bg-[#fef2f2] focus:ring-[#fecaca]' : 'border-slate-200'}`} />
                        {renderHint('yearsExperience', 'Numerical value only')}
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Last Employer</label>
                        <input name="previousEmployer" value={formData.previousEmployer} onChange={handleInputChange} placeholder="Company or House Name" className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none text-sm placeholder:text-slate-300" />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Short Bio / About You</label>
                        <textarea
                            name="shortBio"
                            value={formData.shortBio}
                            onChange={handleInputChange}
                            placeholder="Tell customers why they should hire you (e.g. 'I am a master electrician with 10 years experience in house wiring...')"
                            rows={3}
                            className={`w-full px-5 py-4 bg-white border rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none text-sm resize-none transition-all placeholder:text-slate-300 ${fieldErrors.shortBio ? 'border-[#dc2626] bg-[#fef2f2] focus:ring-[#fecaca]' : 'border-slate-200'}`}
                        />
                        {renderHint('shortBio', 'Min 20 chars • Avoid profanity')}
                    </div>
                </div>
            </div>
        </m.div>
    );
}
