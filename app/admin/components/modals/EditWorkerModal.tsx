import React, { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { X, User, Briefcase, Camera, Lock, RefreshCw, Plus, Upload, Save } from 'lucide-react'
import Image from 'next/image'
import { DISTRICTS } from '../../../register/constants'

export const EditWorkerModal = ({ isOpen, onClose, worker, onSave, isSaving, handleFileUpload, uploadingField, taxonomy }: any) => {
    const [formData, setFormData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('basic');

    useEffect(() => {
        if (worker) {
            setFormData({
                ...worker,
                password: '', // Hidden by default
            });
        }
    }, [worker]);

    if (!formData) return null;

    const handleFieldChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave(formData.id, formData);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <m.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="bg-[#1C1C1E] border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em]">Edit Profiler</h2>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Worker ID: {worker.id}</p>
                            </div>
                            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/40 hover:text-white transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 p-6 bg-white/[0.01] border-b border-white/5 overflow-x-auto no-scrollbar">
                            {[
                                { id: 'basic', label: 'Basic Info', icon: User },
                                { id: 'skills', label: 'Trade & Skills', icon: Briefcase },
                                { id: 'media', label: 'Media & Proof', icon: Camera },
                                { id: 'security', label: 'Security', icon: Lock },
                            ].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white'}`}
                                >
                                    <t.icon className="w-3.5 h-3.5" />
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                            {activeTab === 'basic' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Full Name</label>
                                        <input
                                            value={formData.full_name}
                                            onChange={e => handleFieldChange('full_name', e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-indigo-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Phone Number</label>
                                        <input
                                            value={formData.phone}
                                            onChange={e => handleFieldChange('phone', e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-indigo-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Short Bio</label>
                                        <textarea
                                            value={formData.short_bio}
                                            onChange={e => handleFieldChange('short_bio', e.target.value)}
                                            className="w-full h-24 bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-indigo-500/50 outline-none transition-all resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Home District</label>
                                        <select
                                            value={formData.home_district}
                                            onChange={e => handleFieldChange('home_district', e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-indigo-500/50 outline-none transition-all appearance-none"
                                        >
                                            {DISTRICTS.map(d => <option key={d} value={d} className="bg-[#1C1C1E]">{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Email (Optional)</label>
                                        <input
                                            value={formData.email || ''}
                                            onChange={e => handleFieldChange('email', e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-indigo-500/50 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'skills' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Main Trade</label>
                                            <select
                                                value={formData.trade_category}
                                                onChange={e => {
                                                    handleFieldChange('trade_category', e.target.value);
                                                    handleFieldChange('sub_skills', []); // Clear sub skills when trade changes
                                                }}
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-indigo-500/50 outline-none transition-all appearance-none"
                                            >
                                                <option value="General" className="bg-[#1C1C1E]">General Handyman</option>
                                                {taxonomy?.services?.map((s: any) => (
                                                    <option key={s.id} value={s.name} className="bg-[#1C1C1E]">{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Years of Experience</label>
                                            <input
                                                type="number"
                                                value={formData.years_experience || 0}
                                                onChange={e => handleFieldChange('years_experience', parseInt(e.target.value))}
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-indigo-500/50 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Sub Skills Specialist</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {(taxonomy?.skills?.filter((sk: any) => {
                                                const svc = taxonomy.services.find((s: any) => s.name === formData.trade_category);
                                                return sk.service_id === svc?.id;
                                            }) || []).map((skill: any) => (
                                                <label key={skill.id} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${formData.sub_skills?.includes(skill.name) ? 'bg-indigo-500/10 border-indigo-500/30 text-white' : 'bg-white/5 border-white/5 text-white/30 hover:border-white/10'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.sub_skills?.includes(skill.name)}
                                                        onChange={() => {
                                                            const current = formData.sub_skills || [];
                                                            handleFieldChange('sub_skills', current.includes(skill.name) ? current.filter((s: string) => s !== skill.name) : [...current, skill.name]);
                                                        }}
                                                        className="hidden"
                                                    />
                                                    <span className="text-[11px] font-bold">{skill.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'media' && (
                                <div className="space-y-10">
                                    {/* Profile Photo */}
                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-2 border-dashed border-white/10 group">
                                            <Image src={formData.profile_photo_url || '/placeholder.png'} alt="Profile" fill className="object-cover" />
                                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                                                <Camera className="w-8 h-8 text-white" />
                                                <input type="file" className="hidden" accept="image/*" onChange={async e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const url = await handleFileUpload(file, 'avatars');
                                                        if (url) handleFieldChange('profile_photo_url', url);
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h4 className="text-white font-black uppercase text-sm">Profile Avatar</h4>
                                            <p className="text-white/40 text-xs mt-1">Change the worker's face profile photo</p>
                                        </div>
                                    </div>

                                    {/* Certificate */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Skilling Certificate</label>
                                            {uploadingField === 'worker-documents' && <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />}
                                        </div>
                                        <div className="group relative h-48 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center gap-3 overflow-hidden transition-all hover:bg-white/[0.04] hover:border-white/20">
                                            {formData.certificate_url ? (
                                                <>
                                                    <Image src={formData.certificate_url} alt="Cert" fill className="object-cover opacity-50" />
                                                    <label className="z-10 bg-black/60 px-6 py-3 rounded-2xl border border-white/10 cursor-pointer flex items-center gap-2 hover:bg-black transition-all">
                                                        <Plus className="w-4 h-4 text-white" />
                                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Replace Certificate</span>
                                                        <input type="file" className="hidden" accept="image/*" onChange={async e => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const url = await handleFileUpload(file, 'worker-documents');
                                                                if (url) handleFieldChange('certificate_url', url);
                                                            }
                                                        }} />
                                                    </label>
                                                </>
                                            ) : (
                                                <label className="flex flex-col items-center gap-3 cursor-pointer">
                                                    <div className="p-4 bg-white/5 rounded-2xl"><Upload className="w-6 h-6 text-white/30" /></div>
                                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Upload Certificate</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={async e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const url = await handleFileUpload(file, 'worker-documents');
                                                            if (url) handleFieldChange('certificate_url', url);
                                                        }
                                                    }} />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    {/* Social Media & Video Pitch */}
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Video Pitch URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://youtube.com/..."
                                            value={formData.video_pitch_url || ''}
                                            onChange={e => handleFieldChange('video_pitch_url', e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-indigo-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Instagram URL</label>
                                            <input
                                                type="url"
                                                placeholder="https://instagram.com/..."
                                                value={formData.instagram_url || ''}
                                                onChange={e => handleFieldChange('instagram_url', e.target.value)}
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-indigo-500/50 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">TikTok URL</label>
                                            <input
                                                type="url"
                                                placeholder="https://tiktok.com/..."
                                                value={formData.tiktok_url || ''}
                                                onChange={e => handleFieldChange('tiktok_url', e.target.value)}
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-indigo-500/50 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Facebook URL</label>
                                            <input
                                                type="url"
                                                placeholder="https://facebook.com/..."
                                                value={formData.facebook_url || ''}
                                                onChange={e => handleFieldChange('facebook_url', e.target.value)}
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-indigo-500/50 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Protected Section */}
                                    <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-amber-500" />
                                            <h5 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Protected Trust Documents</h5>
                                        </div>
                                        <p className="text-[9px] text-amber-500/60 leading-relaxed font-bold">
                                            NIC Front, Back, and Selfies are permanently locked for the security of the trust audit process. These cannot be edited via the admin console once submitted.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1 text-red-400">Security: Manual Password Override</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                            <input
                                                type="password"
                                                placeholder="Enter new password to override..."
                                                value={formData.password || ''}
                                                onChange={e => handleFieldChange('password', e.target.value)}
                                                className="w-full bg-white/5 border border-red-500/10 rounded-2xl p-4 pl-12 text-sm text-white focus:border-red-500/50 outline-none transition-all"
                                            />
                                        </div>
                                        <p className="text-[10px] text-white/30 italic px-2 font-bold leading-relaxed">
                                            Leave this blank to keep the current password. If updated, the change is instant and irreversible. Worker must use the new password to login.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-white/5 flex items-center justify-end gap-3 bg-white/[0.02]">
                            <button
                                onClick={onClose}
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !!uploadingField}
                                className="px-10 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving ? 'Syncing...' : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Commit Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </m.div>
                </m.div>
            )}
        </AnimatePresence>
    );
};
