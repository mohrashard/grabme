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
        <m.div key="3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
            <div className="space-y-8">
                {/* Primary Trade Selector */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Primary Trade</label>
                    {loadingTaxonomy ? (
                        <div className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center gap-3 text-slate-400 text-sm font-bold">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                            Loading specialized services...
                        </div>
                    ) : (
                        <CustomSelect
                            options={serviceOptions}
                            value={formData.tradeCategory}
                            onChange={(val: string) => {
                                handleInputChange({ target: { name: 'tradeCategory', value: val } } as any);
                                setSubSkills([]);
                            }}
                            placeholder="Select your main profession"
                        />
                    )}
                </div>

                {/* Sub-Skills (Fixed Height Display) */}
                {formData.tradeCategory && (
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Specialized Skills</label>
                        
                        <CustomSelect
                            isMulti
                            options={availableSubSkills}
                            value={formData.subSkills}
                            onChange={(vals: string[]) => setSubSkills(vals)}
                            placeholder="Add your specific skills..."
                        />

                        {formData.subSkills.length > 0 && (
                            <div className="flex overflow-x-auto gap-2 no-scrollbar pb-2 px-1 snap-x">
                                {formData.subSkills.map((s: string) => (
                                    <button
                                        key={s}
                                        onClick={() => toggleSubSkill(s)}
                                        className="flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 border border-blue-100 text-blue-700 flex items-center gap-2 active:bg-red-50 active:border-red-100 active:text-red-600 transition-all snap-start"
                                    >
                                        {s} <X className="w-3 h-3 text-blue-400" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Experience & Bio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Years Active</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                name="yearsExperience" 
                                value={formData.yearsExperience} 
                                onChange={handleInputChange} 
                                placeholder="0"
                                className={`w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#1d4ed8] focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold transition-all placeholder:text-slate-300 ${fieldErrors.yearsExperience ? 'border-[#dc2626] bg-[#fef2f2] focus:ring-[#fecaca]' : ''}`} 
                            />
                            <Briefcase className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        </div>
                        {renderHint('yearsExperience', 'Numerical value only')}
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Last Employer</label>
                        <div className="relative">
                            <input 
                                name="previousEmployer" 
                                value={formData.previousEmployer} 
                                onChange={handleInputChange} 
                                placeholder="Company or Individual" 
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#1d4ed8] focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold placeholder:text-slate-300" 
                            />
                            <GraduationCap className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Professional Bio</label>
                        <textarea
                            name="shortBio"
                            value={formData.shortBio}
                            onChange={handleInputChange}
                            placeholder="Tell customers why they should hire you..."
                            rows={4}
                            className={`w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:bg-white focus:border-[#1d4ed8] focus:ring-4 focus:ring-blue-50 outline-none text-sm font-medium leading-relaxed resize-none transition-all placeholder:text-slate-300 ${fieldErrors.shortBio ? 'border-[#dc2626] bg-[#fef2f2] focus:ring-[#fecaca]' : ''}`}
                        />
                        {renderHint('shortBio', 'Min 20 characters required')}
                    </div>
                </div>
            </div>
        </m.div>
    );
}
