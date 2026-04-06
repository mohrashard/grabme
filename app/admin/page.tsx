'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
    ShieldCheck, Users, BarChart3, ClipboardList,
    LogOut, CheckCircle2, X, AlertTriangle, Star,
    Phone, Eye, MessageSquare, Search, Filter,
    PauseCircle, UserCheck, Activity, TrendingUp, User,
    Zap, RefreshCw, Lock, ChevronRight, Clock,
    Briefcase, MapPin, Trash2, Edit3, Save, Upload,
    Camera, Plus, Trash, Globe, ExternalLink, Bell, Loader2, Copy
} from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { supabase } from '../lib/supabase'
import { 
    updateWorkerStatusAction, 
    getSignedUrlAction, 
    toggleFeaturedAction, 
    insertVerificationLogAction,
    fetchAdminDataAction,
    updateStatusWithLogAction,
    resetWorkerPasswordAction,
    logoutAdminAction
} from './actions/authActions'
import { 
    deleteWorkerAction, 
    updateWorkerAction, 
    deleteCustomerAction, 
    deleteClickAction 
} from './actions/workerActions'
import { Toaster, toast } from 'sonner'
import { DISTRICTS } from '../register/constants'
import { 
    addServiceAction, deleteServiceAction, addSkillAction, deleteSkillAction,
    addKeywordAction, deleteKeywordAction, fetchTaxonomyAdminAction,
    bulkImportTaxonomyAction
} from './actions/taxonomyActions'

const ADMIN_WHATSAPP_ACTIVATION_MSG = (name: string) =>
    encodeURIComponent(`Hi ${name}! 🎉 Your Grab Me Partner profile is now LIVE! Customers in your area can now find and contact you directly. Welcome to the team! — Grab Me Team`);

type Worker = {
    id: string;
    full_name: string;
    phone: string;
    email: string;
    nic_number: string;
    trade_category: string;
    account_status: string;
    profile_photo_url: string;
    nic_front_url: string;
    nic_back_url: string;
    selfie_url: string;
    certificate_url: string;
    past_work_photos: string[];
    home_district: string;
    short_bio: string;
    is_featured: boolean;
    is_identity_verified: boolean;
    is_reference_checked: boolean;
    is_certificate_verified: boolean;
    is_experience_verified: boolean;
    admin_notes: string;
    created_at: string;
    sub_skills: string[];
};

const ImageModal = ({ isOpen, onClose, imageUrl, label }: { isOpen: boolean, onClose: () => void, imageUrl: string, label: string }) => (
    <AnimatePresence>
        {isOpen && (
            <m.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                onClick={onClose}
            >
                <m.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center gap-4"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="absolute top-0 right-0 -mt-12 group">
                        <button 
                            onClick={onClose}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all border border-white/10 group-hover:rotate-90"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="w-full h-full rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-[#18181B] flex items-center justify-center">
                        <img 
                            src={imageUrl} 
                            alt={label} 
                            className="max-w-full max-h-[80vh] object-contain"
                        />
                    </div>
                    <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                        <p className="text-sm font-black text-white/80 uppercase tracking-[0.3em]">{label}</p>
                    </div>
                </m.div>
            </m.div>
        )}
    </AnimatePresence>
);

type Lead = {
    id: string;
    full_name: string;
    phone: string;
    district: string;
    lat?: number;
    lng?: number;
    area_name?: string;
    service_needed?: string;
    registered_at: string;
};

type Tab = 'pipeline' | 'directory' | 'leads' | 'analytics' | 'audit' | 'taxonomy';

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { color: string; label: string }> = {
        pending: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Pending' },
        whatsapp_pinged: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'WA Pinged' },
        under_review: { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'Under Review' },
        active: { color: 'bg-green-500/10 text-green-400 border-green-500/20', label: 'Active' },
        rejected: { color: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Rejected' },
        suspended: { color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', label: 'Suspended' },
    };
    const c = map[status] ?? map['pending'];
    return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${c.color}`}>{c.label}</span>;
}

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, workerName, isDeleting }: any) => (
    <AnimatePresence>
        {isOpen && (
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <m.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-wider">Permenant Deletion</h3>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Are you absolutely sure you want to delete <span className="text-white font-bold">{workerName}</span>? 
                            This will instantly remove their profile, verification logs, click history, and all stored media files. **This cannot be undone.**
                        </p>
                        <div className="flex flex-col w-full gap-3 mt-4">
                            <button 
                                onClick={onConfirm}
                                disabled={isDeleting}
                                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
                            >
                                {isDeleting ? 'Nuking Data...' : 'Yes, Delete Everything'}
                            </button>
                            <button 
                                onClick={onClose}
                                disabled={isDeleting}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl font-black uppercase tracking-widest transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </m.div>
            </m.div>
        )}
    </AnimatePresence>
);

const DeleteTaxonomyModal = ({ isOpen, onClose, onConfirm, itemName, itemType, isDeleting }: any) => (
    <AnimatePresence>
        {isOpen && (
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <m.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
                            <Trash2 className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-wider">Delete {itemType}</h3>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Are you sure you want to remove <span className="text-red-400 font-bold">{itemName}</span>? 
                            {itemType === 'Service' && " This will also delete all skills and keywords associated with it."}
                        </p>
                        <div className="flex flex-col w-full gap-3 mt-4">
                            <button 
                                onClick={onConfirm}
                                disabled={isDeleting}
                                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                {isDeleting ? 'Removing...' : `Delete ${itemType}`}
                            </button>
                            <button 
                                onClick={onClose}
                                disabled={isDeleting}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl font-black uppercase tracking-widest transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </m.div>
            </m.div>
        )}
    </AnimatePresence>
);

const BulkImportModal = ({ isOpen, onClose, onImport, isImporting }: any) => {
    const [jsonInput, setJsonInput] = useState('');
    
    const handleStart = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (!Array.isArray(parsed)) throw new Error('Root must be an array');
            onImport(parsed);
        } catch (e: any) {
            toast.error('Invalid JSON: ' + e.message);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <m.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#1C1C1E] border border-white/10 rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-wider">Bulk Taxonomy Import</h3>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Paste your JSON data below</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => {
                                        const template = `[
  {
    "nameEn": "Tree & Coconut Plucking",
    "nameSi": "ගස් කැපීම සහ පොල් කැඩීම",
    "skills": [
      { "nameEn": "Coconut Plucking", "nameSi": "පොල් කැඩීම" },
      { "nameEn": "Tree Pruning", "nameSi": "අතු කැපීම" }
    ],
    "keywords": ["pol", "coconut", "cutting", "garden"]
  }
]`;
                                        navigator.clipboard.writeText(template);
                                        toast.success('Format copied to clipboard');
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-indigo-500/20"
                                >
                                    <Copy className="w-3 h-3" />
                                    Copy Format
                                </button>
                                <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 transition-all"><X className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder='[ { "nameEn": "...", "nameSi": "...", "skills": [...], "keywords": [...] } ]'
                            className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-6 text-xs text-white outline-none focus:border-indigo-500 transition-all font-mono no-scrollbar"
                            disabled={isImporting}
                        />

                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleStart}
                                disabled={isImporting || !jsonInput.trim()}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                {isImporting ? 'Processing Data...' : 'Start Bulk Import'}
                            </button>
                            <p className="text-[9px] text-white/20 text-center font-bold uppercase tracking-widest">
                                Tip: You can ask AI to generate data in this format
                            </p>
                        </div>
                    </m.div>
                </m.div>
            )}
        </AnimatePresence>
    );
};

const EditWorkerModal = ({ isOpen, onClose, worker, onSave, isSaving, handleFileUpload, uploadingField, taxonomy }: any) => {
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

                                    {/* Past Work Photos */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Past Work Gallery</label>
                                            <span className="text-[9px] font-black text-white/20 uppercase">{(formData.past_work_photos || []).length} / 5</span>
                                        </div>
                                        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                            {(formData.past_work_photos || []).map((url: string, idx: number) => (
                                                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-white/5">
                                                    <Image src={url} alt="Work" fill className="object-cover" />
                                                    <button 
                                                        onClick={() => {
                                                            const current = formData.past_work_photos || [];
                                                            handleFieldChange('past_work_photos', current.filter((_: any, i: number) => i !== idx));
                                                        }}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                                    >
                                                        <Trash className="w-3.5 h-3.5 text-white" />
                                                    </button>
                                                </div>
                                            ))}
                                            {(formData.past_work_photos || []).length < 5 && (
                                                <label className="aspect-square rounded-2xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/[0.04] transition-all">
                                                    <Plus className="w-5 h-5 text-white/20" />
                                                    <span className="text-[8px] font-black text-white/30 uppercase">Add Photo</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={async e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const url = await handleFileUpload(file, 'portfolio');
                                                            if (url) handleFieldChange('past_work_photos', [...(formData.past_work_photos || []), url]);
                                                        }
                                                    }} />
                                                </label>
                                            )}
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

export default function AdminPage() {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>('pipeline');
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
    const [selectedImage, setSelectedImage] = useState<{ url: string; label: string; isLocked: boolean } | null>(null);
    const [auditNote, setAuditNote] = useState('');
    const [auditOutcome, setAuditOutcome] = useState('pass');
    const [stats, setStats] = useState({ 
        total: 0, pending: 0, active: 0, suspended: 0, 
        clicksToday: 0, clicksThisWeek: 0,
        mostClickedTrade: 'N/A', mostClickedDistrict: 'N/A',
        totalClicks: 0, topClicks: [] as { label: string, count: number }[] 
    });
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
    const [checklists, setChecklists] = useState<Record<string, { nic: boolean, ref: boolean, cert: boolean, exp: boolean, notes: string }>>({});
    
    // NEW: Edit & Delete & Leads State
    const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
    const [deletingWorker, setDeletingWorker] = useState<Worker | null>(null);
    const [leadsSubTab, setLeadsSubTab] = useState<'future' | 'matrices'>('future');
    const [clicks, setClicks] = useState<any[]>([]);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
    
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [uploadingField, setUploadingField] = useState<string | null>(null);

    // Taxonomy management state
    const [taxonomy, setTaxonomy] = useState<any>(null);
    const [taxLoading, setTaxLoading] = useState(false);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [newServiceName, setNewServiceName] = useState('');
    const [newSkillName, setNewSkillName] = useState('');
    const [newKeyword, setNewKeyword] = useState('');

    // Custom Taxonomy Delete state
    const [taxDeleting, setTaxDeleting] = useState<{ id: string, name: string, type: 'Service' | 'Skill' | 'Keyword' } | null>(null);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [isBulkLoading, setIsBulkLoading] = useState(false);

    const fetchTaxonomy = async () => {
        setTaxLoading(true);
        const res = await fetchTaxonomyAdminAction();
        if (res.success) setTaxonomy(res.data);
        setTaxLoading(false);
    };

    // Admin auth guard with 8-hour hardening
    useEffect(() => {
        const raw = localStorage.getItem('grabme_admin');
        if (!raw) { router.push('/admin/login'); return; }
        try {
            const session = JSON.parse(raw);
            const EIGHT_HOURS = 8 * 60 * 60 * 1000;
            const isExpired = Date.now() - session.loggedInAt > EIGHT_HOURS;

            if (session.role !== 'admin' || isExpired) {
                localStorage.removeItem('grabme_admin');
                router.push('/admin/login');
            } else {
                // Fetch taxonomy once authenticated
                fetchTaxonomy();
            }
        } catch {
            localStorage.removeItem('grabme_admin');
            router.push('/admin/login');
        }
    }, [router]);

    const fetchWorkers = useCallback(async () => {
        setLoading(true);
        const { success, workers: data, leads: leadData, clicks: clickData, stats: newStats, error } = await fetchAdminDataAction();
        
        if (success && data && newStats) {
            const workerList = data as Worker[];
            setWorkers(workerList);
            if (leadData) setLeads(leadData as Lead[]);
            if (clickData) setClicks(clickData);
            setStats(newStats);

            // AUTO-SIGN: Proactively sign all PRIVATE images
            workerList.forEach(w => {
                // Profile photo is PUBLIC (avatars bucket) - no signing needed
                
                // Only pipeline workers need NIC/Selfie signed to save bandwidth
                if (['pending', 'whatsapp_pinged', 'under_review'].includes(w.account_status)) {
                    if (w.nic_front_url) getSignedUrl(w.nic_front_url);
                    if (w.selfie_url) getSignedUrl(w.selfie_url);
                }
            });
        } else {
            console.error('Fetch Error:', error);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchWorkers(); }, [fetchWorkers]);

    const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

    const getSignedUrl = async (path: string) => {
        if (!path) return;

        // Only generate signed URLs for the 'worker-documents' bucket (NIC, selfie).
        // Never generate signed URLs for the 'avatars' bucket — those are already
        // publicly accessible via their full public URL and require no signing.
        // Extract relative path if stored as full URL
        let relativePath = path;
        if (path.includes('/storage/v1/object/public/worker-documents/')) {
            relativePath = path.split('/storage/v1/object/public/worker-documents/')[1];
        } else if (path.includes('/worker-documents/')) {
            relativePath = path.split('/worker-documents/')[1];
        }

        const res = await getSignedUrlAction(relativePath);
        if (res.success && res.signedUrl) {
            setSignedUrls(prev => ({ ...prev, [path]: res.signedUrl! }));
            return res.signedUrl;
        } else {
            console.error('Failed to sign URL:', res.error);
        }
    };

    const openLightbox = async (path: string, label: string) => {
        const isLocked = path.includes('worker-documents') || !path.startsWith('http');
        
        if (isLocked && !signedUrls[path]) {
            const signed = await getSignedUrl(path);
            if (signed) {
                setSelectedImage({ url: signed, label, isLocked: true });
            }
        } else {
            setSelectedImage({ 
                url: signedUrls[path] || path, 
                label, 
                isLocked 
            });
        }
    };

    const getValidPhotos = (input: any): string[] => {
        if (!input) return [];
        if (Array.isArray(input)) return input.filter(p => !!p && typeof p === 'string');
        if (typeof input === 'string') {
            if (input.startsWith('{') && input.endsWith('}')) {
                return input.slice(1, -1).split(',').map(s => s.trim().replace(/^"(.*)"$/, '$1')).filter(p => !!p);
            }
            return input.split(',').map(s => s.trim()).filter(p => !!p);
        }
        return [];
    };

    const updateStatus = async (id: string, status: string, worker?: Worker, forceZap: boolean = false) => {
        setActionLoading(id + (forceZap ? 'zap' : status));
        const toastId = toast.loading(`${forceZap ? 'Ultra-Quick' : 'Updating'} ${worker?.full_name || 'Worker'} to ${status.toUpperCase()}...`);
        try {
            const checklist = checklists[id] || { nic: false, ref: false, cert: false, exp: false, notes: '' };
            
            // Persist the status AND all checklist fields into the 'workers' table
            const updates: any = {
                is_identity_verified: forceZap ? true : !!checklist.nic,
                is_reference_checked: !!checklist.ref, // Never forced by Zap
                is_certificate_verified: forceZap ? true : !!checklist.cert,
                is_experience_verified: forceZap ? true : !!checklist.exp,
                admin_notes: checklist.notes
            };
            
            // "Quick Activate" logic: Auto-verify Identity, Cert, and Exp ONLY when zapping or first activating
            if (forceZap) {
                status = 'active'; // Force status if zapping
                updates.activated_at = new Date().toISOString();
            } else if (status === 'active' && worker?.account_status !== 'active') {
                updates.activated_at = new Date().toISOString();
            }

            // Using the bundled transactional action (updates worker AND logs action)
            const { success, error } = await updateStatusWithLogAction(id, status, {
                nic_checked: updates.is_identity_verified,
                reference_called: updates.is_reference_checked,
                certificate_checked: updates.is_certificate_verified,
                experience_checked: updates.is_experience_verified,
                admin_notes: checklist.notes,
                outcome: status === 'active' ? 'pass' : (status === (worker?.account_status || '') ? 'pass' : 'fail')
            }, updates);

            if (!success) throw new Error(error);

            await fetchWorkers();
            
            if (status === 'active' && worker) {
                toast.success(
                    <div className="flex flex-col gap-2 w-full">
                        <span>Success: {worker.full_name} is now ACTIVE</span>
                        <a 
                            href={`https://wa.me/${worker.phone}?text=${ADMIN_WHATSAPP_ACTIVATION_MSG(worker.full_name)}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="mt-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#25D366] text-white rounded-lg text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                        >
                            Ping on WhatsApp
                        </a>
                    </div>, 
                    { id: toastId }
                );
            } else {
                toast.success(`Success: ${worker?.full_name || 'Worker'} is now ${status.toUpperCase()}`, { id: toastId });
            }
        } catch (err: any) {
            toast.error(`ERROR: ${err.message}`, { id: toastId });
        } finally {
            setActionLoading(null);
        }
    };

    const toggleFeatured = async (id: string, current: boolean) => {
        setActionLoading(id + 'featured');
        const { success } = await toggleFeaturedAction(id, !current);
        if (success) {
            toast.success(current ? 'Removed from Featured' : 'Added to Global Featured');
            await fetchWorkers();
        } else {
            toast.error('Failed to toggle featured status');
        }
        setActionLoading(null);
    };

    const submitAuditNote = async () => {
        if (!selectedWorker || !auditNote) return;
        setActionLoading('audit');
        const toastId = toast.loading('Saving audit record...');
        
        const { success, error } = await insertVerificationLogAction({
            worker_id: selectedWorker.id,
            action: 'reference_called',
            outcome: auditOutcome,
            admin_notes: auditNote,
        });

        if (success) {
            if (auditOutcome === 'pass') {
                await updateWorkerStatusAction(selectedWorker.id, selectedWorker.account_status, { is_reference_checked: true });
            }
            toast.success('Audit successfully logged', { id: toastId });
        } else {
            toast.error('Failed to save audit: ' + error, { id: toastId });
        }

        setAuditNote('');
        setSelectedWorker(null);
        await fetchWorkers();
        setActionLoading(null);
    };

    const updateTradeCategory = async (id: string, trade: string) => {
        await updateWorkerStatusAction(id, undefined as any, { trade_category: trade });
        await fetchWorkers();
    };

    const logout = async () => {
        await logoutAdminAction();
        localStorage.removeItem('grabme_admin');
        router.push('/admin/login');
    };

    const handleDeleteWorker = async (id: string) => {
        setIsDeleting(true);
        const toastId = toast.loading('Permenantly deleting worker and all files...');
        try {
            const { success, error } = await deleteWorkerAction(id);
            if (!success) throw new Error(error);
            toast.success('Worker deleted successfully', { id: toastId });
            setDeletingWorker(null);
            await fetchWorkers();
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete worker', { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdateWorker = async (id: string, updates: any) => {
        setIsSaving(true);
        const toastId = toast.loading('Syncing profile updates...');
        try {
            const { success, error } = await updateWorkerAction(id, updates);
            if (!success) throw new Error(error);
            toast.success('Profile updated successfully', { id: toastId });
            setEditingWorker(null);
            await fetchWorkers();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update profile', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (file: File, type: 'avatars' | 'worker-documents' | 'portfolio'): Promise<string | null> => {
        setUploadingField(type);
        try {
            const options = { maxSizeMB: 0.3, maxWidthOrHeight: 1024, useWebWorker: false };
            const processedFile = file.size > 0.3 * 1024 * 1024 ? await imageCompression(file, options) : file;
            
            const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `admin_edit_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `workers/${fileName}`;

            const { data, error } = await supabase.storage
                .from(type)
                .upload(filePath, processedFile, { upsert: true });

            if (error) throw error;
            
            // Generate the full public URL
            const { data: { publicUrl } } = supabase.storage.from(type).getPublicUrl(filePath);
            return publicUrl;
        } catch (err: any) {
            toast.error(`Upload failed: ${err.message}`);
            return null;
        } finally {
            setUploadingField(null);
        }
    };

    const handleResetPassword = async (workerId: string, name: string) => {
        const newPass = window.prompt(`Reset Password for ${name}\nEnter new password (min 6 chars):`);
        if (!newPass || newPass.length < 6) {
            if (newPass) toast.error('Password too short (min 6 characters)');
            return;
        }

        const toastId = toast.loading('Hashing & Syncing New Password...');
        const { success, error } = await resetWorkerPasswordAction(workerId, newPass);
        
        if (success) {
            toast.success('Password successfully reset!', { id: toastId });
        } else {
            toast.error('Reset Failed: ' + error, { id: toastId });
        }
    };

    const filtered = workers.filter(w => {
        const s = search.toLowerCase().trim();
        if (!s) return true; // Show all when empty

        const normalize = (n: string) => (n || '').replace(/\D/g, '');
        const stripSL = (digits: string) => {
            if (digits.startsWith('94')) return digits.substring(2);
            if (digits.startsWith('0')) return digits.substring(1);
            return digits;
        };

        const sd = normalize(s);
        const wd = normalize(w.phone || '');
        const sdS = stripSL(sd);
        const wdS = stripSL(wd);

        // Phone match logic: handle direct digits or stripped SL prefixes
        const phoneMatch = sd.length > 0 && (wd.includes(sd) || wdS.includes(sdS));

        return (
            w.full_name?.toLowerCase().includes(s) ||
            w.trade_category?.toLowerCase().includes(s) ||
            w.home_district?.toLowerCase().includes(s) ||
            w.nic_number?.toLowerCase().includes(s) ||
            phoneMatch
        );
    });

    const pipeline = filtered.filter(w => ['pending', 'whatsapp_pinged', 'under_review'].includes(w.account_status));
    const directory = filtered;

    // SEARCH ENHANCEMENT: Filter Leads & Clicks by number / name
    const filteredLeads = leads.filter(l => {
        const s = search.toLowerCase().trim();
        if (!s) return true;

        const normalize = (n: string) => (n || '').replace(/\D/g, '');
        const stripSL = (digits: string) => {
            if (digits.startsWith('94')) return digits.substring(2);
            if (digits.startsWith('0')) return digits.substring(1);
            return digits;
        };

        const sd = normalize(s);
        const ld = normalize(l.phone || '');
        const sdS = stripSL(sd);
        const ldS = stripSL(ld);
        const phoneMatch = sd.length > 0 && (ld.includes(sd) || ldS.includes(sdS));

        return (
            l.full_name?.toLowerCase().includes(s) ||
            l.district?.toLowerCase().includes(s) ||
            l.area_name?.toLowerCase().includes(s) ||
            l.service_needed?.toLowerCase().includes(s) ||
            phoneMatch
        );
    });

    const filteredClicks = clicks.filter(c => {
        const s = search.toLowerCase().trim();
        if (!s) return true;

        const normalize = (n: string) => (n || '').replace(/\D/g, '');
        const sd = normalize(s);

        const customerPhone = normalize(c.customer?.phone || '');
        const workerPhone = normalize(c.worker?.phone || ''); // Added worker phone check if available

        return (
            c.customer?.full_name?.toLowerCase().includes(s) ||
            c.worker?.full_name?.toLowerCase().includes(s) ||
            c.worker?.trade_category?.toLowerCase().includes(s) ||
            customerPhone.includes(sd) ||
            workerPhone.includes(sd)
        );
    });

    const deleteCustomer = async (id: string) => {
        const toastId = toast.loading('Deleting lead...');
        setConfirmingDeleteId(null);
        try {
            const res = await deleteCustomerAction(id);
            if (res.success) {
                toast.success('Lead deleted', { id: toastId });
                setLeads(prev => prev.filter(l => l.id !== id));
                fetchWorkers();
            } else {
                toast.error(res.error || 'Failed to delete lead', { id: toastId });
            }
        } catch {
            toast.error('System error occurred', { id: toastId });
        }
    };

    const deleteClick = async (id: string) => {
        const toastId = toast.loading('Removing record...');
        setConfirmingDeleteId(null);
        try {
            const res = await deleteClickAction(id);
            if (res.success) {
                toast.success('Record removed', { id: toastId });
                setClicks(prev => prev.filter(c => c.id !== id));
                fetchWorkers();
            } else {
                toast.error(res.error || 'Failed to delete record', { id: toastId });
            }
        } catch {
            toast.error('System error occurred', { id: toastId });
        }
    };

    const districtCounts = workers.reduce<Record<string, number>>((acc, w) => {
        const d = w.home_district || 'Unknown';
        acc[d] = (acc[d] || 0) + 1;
        return acc;
    }, {});
    const topDistricts = Object.entries(districtCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

    const tradeCounts = workers.reduce<Record<string, number>>((acc, w) => {
        const t = w.trade_category || 'Unknown';
        acc[t] = (acc[t] || 0) + 1;
        return acc;
    }, {});
    const topTrades = Object.entries(tradeCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

    const TABS = [
        { id: 'pipeline', label: 'Pipeline', icon: ShieldCheck, count: stats.pending },
        { id: 'directory', label: 'Directory', icon: Users, count: stats.total },
        { id: 'leads', label: 'Customer Leads', icon: UserCheck, count: leads.length },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, count: null },
        { id: 'audit', label: 'Trust Audit', icon: ClipboardList, count: null },
        { id: 'taxonomy', label: 'Services', icon: Briefcase, count: taxonomy?.services?.length || 0 },
    ] as const;

    return (
        <div className="min-h-screen bg-[#090A0F] text-white font-sans flex">
            {/* ══ MODALS ══ */}
            <ImageModal 
                isOpen={!!selectedImage} 
                onClose={() => setSelectedImage(null)} 
                imageUrl={selectedImage?.url || ''} 
                label={selectedImage?.label || ''} 
            />

            <DeleteConfirmationModal
                isOpen={!!deletingWorker}
                onClose={() => setDeletingWorker(null)}
                onConfirm={() => deletingWorker && handleDeleteWorker(deletingWorker.id)}
                workerName={deletingWorker?.full_name || ''}
                isDeleting={isDeleting}
            />

            <EditWorkerModal
                isOpen={!!editingWorker}
                onClose={() => setEditingWorker(null)}
                worker={editingWorker}
                onSave={handleUpdateWorker}
                isSaving={isSaving}
                handleFileUpload={handleFileUpload}
                uploadingField={uploadingField}
                taxonomy={taxonomy}
            />

            <DeleteTaxonomyModal
                isOpen={!!taxDeleting}
                onClose={() => setTaxDeleting(null)}
                onConfirm={async () => {
                    if (!taxDeleting) return;
                    setIsDeleting(true);
                    let res;
                    if (taxDeleting.type === 'Service') res = await deleteServiceAction(taxDeleting.id);
                    else if (taxDeleting.type === 'Skill') res = await deleteSkillAction(taxDeleting.id);
                    else if (taxDeleting.type === 'Keyword') res = await deleteKeywordAction(taxDeleting.id);
                    
                    if (res?.success) {
                        toast.success(`${taxDeleting.type} removed successfully`);
                        fetchTaxonomy();
                        setTaxDeleting(null);
                    } else {
                        toast.error(res?.error || 'Failed to delete');
                    }
                    setIsDeleting(false);
                }}
                itemName={taxDeleting?.name || ''}
                itemType={taxDeleting?.type || ''}
                isDeleting={isDeleting}
            />

            <BulkImportModal
                isOpen={isBulkImportOpen}
                onClose={() => setIsBulkImportOpen(false)}
                isImporting={isBulkLoading}
                onImport={async (data: any[]) => {
                    setIsBulkLoading(true);
                    const res = await bulkImportTaxonomyAction(data);
                    if (res && res.success && res.results) {
                        const { created, updated, skills, keywords, errors } = res.results;
                        toast.success(`Import complete: ${created} new services, ${updated} synced.`);
                        if (skills > 0 || keywords > 0) {
                            toast.info(`Plus ${skills} skills and ${keywords} keywords processed.`);
                        }
                        if (errors && errors.length > 0) {
                            console.warn('Import warnings:', errors);
                            toast.warning(`${errors.length} items encountered issues.`);
                        }
                        setIsBulkImportOpen(false);
                        fetchTaxonomy();
                    } else {
                        toast.error(res?.error || 'Import failed');
                    }
                    setIsBulkLoading(false);
                }}
            />

            <Toaster position="top-right" theme="dark" richColors closeButton />
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap'); * { font-family: 'Inter', sans-serif; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }`}</style>

            {/* ── Sidebar ── */}
            <aside className="hidden lg:flex w-64 bg-[#18181B] border-r border-white/5 flex-col fixed h-full z-30">
                {/* Logo */}
                <div className="p-7 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-white/10">
                            <Image src="/grabme.png" alt="Grab Me" fill sizes="32px" className="object-cover" />
                        </div>
                        <div>
                            <p className="text-white font-black text-sm tracking-tight leading-none">Grab Me</p>
                            <p className="text-[8px] font-black uppercase tracking-widest text-red-400">Ops Center</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id as Tab)}
                            className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-sm font-bold transition-all ${tab === t.id ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="flex items-center gap-3"><t.icon className="w-4 h-4" />{t.label}</span>
                            {t.count !== null && <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${tab === t.id ? 'bg-red-500/20 text-red-300' : 'bg-white/5 text-white/30'}`}>{t.count}</span>}
                        </button>
                    ))}
                </nav>

                {/* Stats */}
                <div className="p-4 border-t border-white/5 space-y-2">
                    {[
                        { label: 'Active Workers', val: stats.active, color: 'text-green-400' },
                        { label: 'In Pipeline', val: stats.pending, color: 'text-amber-400' },
                        { label: 'Suspended', val: stats.suspended, color: 'text-red-400' },
                    ].map(s => (
                        <div key={s.label} className="flex justify-between text-[11px] font-bold">
                            <span className="text-white/30">{s.label}</span>
                            <span className={s.color}>{s.val}</span>
                        </div>
                    ))}
                </div>

                {/* Logout */}
                <div className="p-4 border-t border-white/5">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </aside>

            {/* ── Mobile Bottom Nav ── */}
            <nav className="fixed bottom-0 w-full bg-[#18181B]/95 backdrop-blur-xl border-t border-white/10 z-50 lg:hidden px-2 pb-safe pt-2">
                <div className="flex items-center justify-around pb-2">
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id as Tab)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative ${tab === t.id ? 'text-red-400' : 'text-white/30 hover:text-white'}`}
                        >
                            <t.icon className="w-5 h-5" />
                            <span className="text-[8px] font-black uppercase tracking-widest">{t.label.split(' ')[0]}</span>
                            {t.count !== null && t.count > 0 && (
                                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#18181B]" />
                            )}
                        </button>
                    ))}
                    <button onClick={logout} className="flex flex-col items-center gap-1 p-2 rounded-xl text-red-500/50 hover:text-red-400 transition-all">
                        <LogOut className="w-5 h-5" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Exit</span>
                    </button>
                </div>
            </nav>

            {/* ── Main Content ── */}
            <main className="flex-1 lg:ml-64 pb-24 lg:pb-0 overflow-y-auto">
                {/* Topbar */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 lg:px-8 sticky top-0 bg-[#090A0F]/80 backdrop-blur-xl z-20 gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-[10px] lg:text-sm font-black uppercase tracking-widest text-white truncate">
                            {tab === 'pipeline' && 'Gatekeeper — Approval Pipeline'}
                            {tab === 'directory' && 'Baas Manager — Full Directory'}
                            {tab === 'leads' && 'Customer Leads — Notify Me Queue'}
                            {tab === 'analytics' && 'Traction Pulse — Analytics'}
                            {tab === 'audit' && 'Trust Audit — Verification Logs'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                        <button onClick={fetchWorkers} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                            <RefreshCw className="w-4 h-4 text-white/40" />
                        </button>
                        <div className="relative">
                            <Search className="w-4 h-4 text-white/20 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search..."
                                className="pl-9 pr-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs text-white placeholder:text-white/20 outline-none focus:border-white/10 w-32 lg:w-52 transition-all"
                            />
                        </div>
                    </div>
                </header>

                <div className="p-4 lg:p-8 max-w-6xl mx-auto">
                    <AnimatePresence mode="wait">
                        {/* ══ PIPELINE TAB ══ */}
                        {tab === 'pipeline' && (
                            <m.div key="pipeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                                {loading ? (
                                    <div className="text-center py-40">
                                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                        <p className="text-white/20 text-xs font-bold tracking-widest uppercase">Loading Pipeline</p>
                                    </div>
                                ) : pipeline.length === 0 ? (
                                    <m.div 
                                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-32 bg-[#18181B] border border-white/5 rounded-[2.5rem] space-y-6"
                                    >
                                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20 shadow-2xl">
                                            <ShieldCheck className="w-10 h-10 text-green-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black text-white">Inbox Zero</h3>
                                            <p className="text-white/30 text-xs font-bold uppercase tracking-widest">No pending verifications at the moment.</p>
                                        </div>
                                    </m.div>
                                ) : pipeline.map(w => (
                                    <m.div 
                                        key={w.id} 
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="bg-[#18181B] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row gap-8 relative group items-start"
                                    >
                                        <div className="flex flex-col gap-4">
                                            {/* Media Grid */}
                                            <div className="grid grid-cols-2 gap-2 shrink-0">
                                                {[
                                                    { url: w.profile_photo_url, label: 'Profile', bucket: 'avatars' },
                                                    { url: w.nic_front_url, label: 'NIC Front', bucket: 'worker-documents' },
                                                    { url: w.nic_back_url, label: 'NIC Back', bucket: 'worker-documents' },
                                                    { url: w.selfie_url, label: 'Selfie+NIC', bucket: 'worker-documents' },
                                                    { url: w.certificate_url, label: 'Certificate', bucket: 'worker-documents' }
                                                ].map((img, i) => (
                                                    <div key={i} className="space-y-1">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20">{img.label}</p>
                                                        <div 
                                                            className="relative group cursor-pointer overflow-hidden rounded-xl border border-white/10 hover:border-indigo-500/50 transition-all font-bold"
                                                            onClick={() => openLightbox(img.url, img.label)}
                                                        >
                                                            {!img.url || imageErrors[img.url] ? (
                                                                <div className="w-20 h-20 bg-white/5 flex items-center justify-center">
                                                                    {img.label === 'Profile' ? <User className="w-6 h-6 text-white/10" /> : <Lock className="w-4 h-4 text-white/5 font-bold" />}
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <img 
                                                                        src={signedUrls[img.url] || img.url} 
                                                                        alt={img.label}
                                                                        onError={() => setImageErrors(prev => ({ ...prev, [img.url]: true }))}
                                                                        className="w-20 h-20 object-cover" 
                                                                    />
                                                                    <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <Eye className="w-5 h-5 text-white" />
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Info & Checklist */}
                                        <div className="flex-1 space-y-4 w-full">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="text-lg font-black text-white">{w.full_name}</h3>
                                                    <p className="text-xs text-white/40">{w.trade_category} · {w.home_district} · NIC: {w.nic_number}</p>
                                                </div>
                                                <StatusBadge status={w.account_status} />
                                            </div>

                                            {/* Portfolio */}
                                            {getValidPhotos(w.past_work_photos).length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60">Portfolio</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {getValidPhotos(w.past_work_photos).map((p, idx) => (
                                                            <div 
                                                                key={idx}
                                                                className="relative group cursor-pointer w-12 h-12 rounded-lg overflow-hidden border border-white/5 hover:border-indigo-500/50 transition-all bg-white/5"
                                                                onClick={() => openLightbox(p, `Work ${idx+1}`)}
                                                            >
                                                                <img src={p} className="w-full h-full object-cover" alt="" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Verification Checklist */}
                                            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-4">
                                                <div className="flex flex-wrap gap-4">
                                                    {[
                                                        { id: 'nic', label: 'NIC Checked', val: w.is_identity_verified },
                                                        { id: 'ref', label: 'Ref Called', val: w.is_reference_checked },
                                                        { id: 'cert', label: 'Cert Checked', val: w.is_certificate_verified },
                                                        { id: 'exp', label: 'Exp Verified', val: w.is_experience_verified },
                                                    ].map((item) => (
                                                        <label key={item.id} className="flex items-center gap-2 cursor-pointer group">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={!!(checklists[w.id]?.[item.id as keyof typeof checklists[string]] ?? item.val ?? false)}
                                                                onChange={(e) => setChecklists(prev => ({ 
                                                                    ...prev, 
                                                                    [w.id]: { 
                                                                        ...(prev[w.id] || { nic: !!w.is_identity_verified, ref: !!w.is_reference_checked, cert: !!w.is_certificate_verified, exp: !!w.is_experience_verified, notes: w.admin_notes || '' }), 
                                                                        [item.id]: e.target.checked 
                                                                    } 
                                                                }))}
                                                                className="w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-offset-0 focus:ring-0" 
                                                            />
                                                            <span className="text-[10px] font-bold text-white/40 group-hover:text-white/60 transition-colors uppercase tracking-widest">{item.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                <textarea 
                                                    placeholder="Admin notes..."
                                                    value={checklists[w.id]?.notes ?? w.admin_notes ?? ''}
                                                    onChange={(e) => setChecklists(prev => ({ 
                                                        ...prev, 
                                                        [w.id]: { 
                                                            ...(prev[w.id] || { nic: w.is_identity_verified, ref: w.is_reference_checked, cert: w.is_certificate_verified, exp: w.is_experience_verified, notes: w.admin_notes || '' }), 
                                                            notes: e.target.value 
                                                        } 
                                                    }))}
                                                    className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-[11px] text-white outline-none focus:border-white/10 transition-all resize-none h-16"
                                                />
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 min-w-[140px] w-full md:w-auto">
                                            <button
                                                onClick={() => updateStatus(w.id, 'active', w, true)}
                                                disabled={!!actionLoading}
                                                className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/20 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 group-hover:scale-[1.02]"
                                                title="Thunderbolt: Quick Verify & Activate"
                                            >
                                                <Zap className="w-4 h-4 fill-white" />
                                                {actionLoading === w.id + 'zap' ? 'Zapping...' : 'Quick Activate'}
                                            </button>
                                            <button
                                                onClick={() => updateStatus(w.id, 'active', w)}
                                                disabled={!!actionLoading}
                                                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-green-400 transition-all disabled:opacity-50 shadow-lg shadow-green-500/10"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                {actionLoading === w.id + 'active' ? 'Saving...' : 'Activate'}
                                            </button>

                                            <button
                                                onClick={() => updateStatus(w.id, 'under_review')}
                                                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/20 border border-purple-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-purple-400 hover:bg-purple-500/30 transition-all"
                                            >
                                                <Eye className="w-4 h-4" /> Review
                                            </button>
                                            <a
                                                href={`https://wa.me/${w.phone}?text=${encodeURIComponent('Hi! This is the Grab Me team. We want to verify your registration.')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-green-400 hover:border-green-500/20 transition-all font-bold"
                                            >
                                                <MessageSquare className="w-4 h-4 font-bold" /> Ping WA
                                            </a>
                                            <button
                                                onClick={() => updateStatus(w.id, 'rejected')}
                                                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400/60 transition-all font-bold"
                                            >
                                                <X className="w-4 h-4 font-bold" /> Reject
                                            </button>
                                        </div>
                                    </m.div>
                                ))}
                            </m.div>
                        )}

                        {/* ══ DIRECTORY TAB ══ */}
                        {tab === 'directory' && (
                            <m.div key="directory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                                {loading ? (
                                    <div className="text-center py-20 text-white/20 text-sm">Loading directory...</div>
                                ) : directory.map(w => (
                                    <div key={w.id} className="bg-[#18181B] border border-white/5 rounded-2xl p-4 lg:p-5 flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-5">
                                        <div className="flex items-center gap-4 w-full lg:w-auto flex-1">
                                            <div className="cursor-pointer relative group flex-shrink-0" onClick={() => openLightbox(w.profile_photo_url, `${w.full_name} Profile`)}>
                                                {!w.profile_photo_url || imageErrors[w.profile_photo_url] ? (
                                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 font-black">{w.full_name?.[0]}</div>
                                                ) : (
                                                    <>
                                                        <img src={signedUrls[w.profile_photo_url] || w.profile_photo_url} alt="Avatar" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                                                        <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl"><Eye className="w-4 h-4 text-white" /></div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-black text-white truncate">{w.full_name}</h3>
                                                    {w.is_featured && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0 font-bold" />}
                                                </div>
                                                <p className="text-[11px] text-white/30 truncate">{w.trade_category} · {w.home_district}</p>
                                            </div>
                                            <div className="lg:hidden shrink-0">
                                                <StatusBadge status={w.account_status} />
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                                            <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2">
                                                {[
                                                    { id: 'nic', label: 'NIC', val: w.is_identity_verified },
                                                    { id: 'ref', label: 'Ref', val: w.is_reference_checked },
                                                    { id: 'cert', label: 'Cert', val: w.is_certificate_verified },
                                                    { id: 'exp', label: 'Exp', val: w.is_experience_verified },
                                                ].map((item) => (
                                                    <label key={item.id} className="flex items-center gap-1.5 cursor-pointer group">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={!!(checklists[w.id]?.[item.id as keyof typeof checklists[string]] ?? item.val ?? false)}
                                                            onChange={(e) => setChecklists(prev => ({ 
                                                                ...prev, 
                                                                [w.id]: { 
                                                                    ...(prev[w.id] || { nic: !!w.is_identity_verified, ref: !!w.is_reference_checked, cert: !!w.is_certificate_verified, exp: !!w.is_experience_verified, notes: w.admin_notes || '' }), 
                                                                    [item.id]: e.target.checked 
                                                                } 
                                                            }))}
                                                            className="w-3.5 h-3.5 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-offset-0 focus:ring-0" 
                                                        />
                                                        <span className="text-[9px] font-bold text-white/30 group-hover:text-white/50 transition-colors uppercase">{item.label}</span>
                                                    </label>
                                                ))}
                                                <button 
                                                    onClick={() => updateStatus(w.id, w.account_status, w)}
                                                    className="ml-2 text-[9px] font-black uppercase text-indigo-400 hover:text-white px-2 py-1 bg-indigo-500/10 rounded-md transition-all active:scale-95 font-bold"
                                                >
                                                    {actionLoading === w.id + w.account_status ? '...' : 'Save'}
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                                <button 
                                                    onClick={() => updateStatus(w.id, 'active', w, true)}
                                                    className="p-2 lg:p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all font-bold group"
                                                    title="Thunderbolt: Quick Verify ALL & Activate"
                                                >
                                                    <Zap className="w-4 h-4 font-bold fill-indigo-400 group-hover:fill-white" />
                                                </button>
                                                <button 
                                                    onClick={() => setEditingWorker(w)}
                                                    className="p-2 lg:p-2.5 rounded-xl bg-white/5 border border-white/5 text-white/20 hover:text-amber-400 hover:border-amber-500/20 transition-all font-bold"
                                                    title="Edit Worker Profile"
                                                >
                                                    <Edit3 className="w-4 h-4 font-bold" />
                                                </button>
                                                <button 
                                                    onClick={() => setDeletingWorker(w)}
                                                    className="p-2 lg:p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all font-bold"
                                                    title="Delete Worker"
                                                >
                                                    <Trash2 className="w-4 h-4 font-bold" />
                                                </button>
                                                <button onClick={() => toggleFeatured(w.id, w.is_featured)} className={`p-2 lg:p-2.5 rounded-xl border transition-all ${w.is_featured ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-white/5 border-white/5 text-white/20 hover:text-amber-400'}`} title={w.is_featured ? "Remove Featured" : "Make Featured"}>
                                                    <Star className={`w-4 h-4 ${w.is_featured ? 'fill-amber-400' : ''} font-bold`} />
                                                </button>
                                                {w.account_status === 'active' ? (
                                                    <button onClick={() => updateStatus(w.id, 'suspended')} className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/20 hover:text-red-400 transition-all font-bold">
                                                        <PauseCircle className="w-4 h-4 font-bold" />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => updateStatus(w.id, 'active')} className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-bold">
                                                        <CheckCircle2 className="w-4 h-4 font-bold" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        updateStatus(w.id, 'under_review');
                                                        setTab('pipeline');
                                                    }}
                                                    className="p-2 lg:p-2.5 rounded-xl bg-white/5 border border-white/5 text-white/20 hover:text-purple-400 hover:border-purple-500/20 transition-all font-bold"
                                                    title="Send to Trust Audit (Pipeline)"
                                                >
                                                    <ClipboardList className="w-4 h-4 font-bold" />
                                                </button>
                                                <a
                                                    href={`/worker/${w.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 lg:p-2.5 rounded-xl bg-white/5 border border-white/5 text-white/20 hover:text-indigo-400 hover:border-indigo-500/20 transition-all font-bold"
                                                    title="View Public Profile"
                                                >
                                                    <Eye className="w-4 h-4 font-bold" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </m.div>
                        )}

                        {/* ══ ANALYTICS TAB ══ */}
                        {tab === 'analytics' && (
                            <m.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                                {/* Phase 1 Launch Analytics Header */}
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        { label: 'Total Workers', value: stats.total, icon: Users, color: 'text-white' },
                                        { label: 'Verified Partners', value: stats.active, icon: UserCheck, color: 'text-green-400' },
                                        { label: 'Clicks Today', value: stats.clicksToday, icon: MessageSquare, color: 'text-indigo-400' },
                                        { label: 'Clicks This Week', value: stats.clicksThisWeek, icon: TrendingUp, color: 'text-indigo-400' },
                                        { label: 'Top Trade', value: stats.mostClickedTrade, icon: Briefcase, color: 'text-indigo-400' },
                                        { label: 'Top District', value: stats.mostClickedDistrict, icon: MapPin, color: 'text-indigo-400' },
                                    ].map((k, i) => (
                                        <div key={i} className="bg-[#18181B] border border-white/5 rounded-[2rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden group">
                                            <div className="hidden sm:block absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl group-hover:scale-150 transition-transform rounded-full will-change-transform" />
                                            <div className="relative z-10 flex flex-col items-start gap-3 lg:gap-4">
                                                <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${k.color}`}>
                                                    <k.icon className="w-6 h-6" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className={`${typeof k.value === 'number' ? 'text-4xl lg:text-5xl' : 'text-xl lg:text-2xl leading-tight'} font-black tracking-tight ${k.color}`}>{k.value}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{k.label}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid lg:grid-cols-2 gap-6">
                                    {/* District Bar Chart */}
                                    <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Workers by District</h3>
                                            <TrendingUp className="w-4 h-4 text-white/20" />
                                        </div>
                                        <div className="space-y-3">
                                            {topDistricts.length === 0
                                                ? <p className="text-white/20 text-xs text-center py-8">No data yet</p>
                                                : topDistricts.map(([district, count]) => (
                                                <div key={district} className="space-y-1">
                                                    <div className="flex justify-between text-[11px] font-bold">
                                                        <span className="text-white/60">{district}</span>
                                                        <span className="text-white/40">{count}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-500 rounded-full transition-all"
                                                            style={{ width: `${(count / (topDistricts[0]?.[1] || 1)) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Trade Distribution */}
                                    <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Workers by Trade</h3>
                                            <Activity className="w-4 h-4 text-white/20" />
                                        </div>
                                        <div className="space-y-3">
                                            {topTrades.length === 0
                                                ? <p className="text-white/20 text-xs text-center py-8">No data yet</p>
                                                : topTrades.map(([trade, count]) => (
                                                <div key={trade} className="flex items-center justify-between">
                                                    <span className="text-[11px] font-bold text-white/50">{trade}</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex gap-0.5">
                                                            {Array.from({ length: Math.min(count, 10) }).map((_, i) => (
                                                                <div key={i} className="w-1.5 h-5 bg-indigo-500/40 rounded-sm" />
                                                            ))}
                                                        </div>
                                                        <span className="text-[11px] font-black text-white/40 w-5 text-right">{count}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Activation Rate */}
                                    <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6">Activation Rate</h3>
                                        <div className="flex items-center gap-6">
                                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-green-500 rounded-full transition-all"
                                                    style={{ width: stats.total > 0 ? `${(stats.active / stats.total) * 100}%` : '0%' }}
                                                />
                                            </div>
                                            <span className="text-xl font-black text-white">
                                                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-3">
                                            {stats.active} of {stats.total} workers approved and live on directory
                                        </p>
                                    </div>

                                    {/* DEMAND HOTSPOTS (Clicks by Trade & District) */}
                                    <div className="bg-[#18181B] border border-white/5 rounded-[2rem] p-8 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Demand Hotspots — WhatsApp Click Throughs</h3>
                                            <TrendingUp className="w-4 h-4 text-white/20" />
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {stats.topClicks?.length === 0 ? (
                                                <p className="text-white/20 text-[10px] font-bold uppercase py-10 text-center col-span-full italic">No clicks tracked yet.</p>
                                            ) : (
                                                stats.topClicks?.map((hotspot, idx) => (
                                                    <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-between group hover:bg-indigo-500/5 transition-all">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400/60">Rank #{idx+1}</span>
                                                                <span className="text-sm font-black text-white">{hotspot.count} <span className="text-[10px] text-white/20">Clicks</span></span>
                                                            </div>
                                                            <p className="text-[11px] font-bold text-white/60 group-hover:text-white leading-tight transition-colors">
                                                                {hotspot.label.split('|')[0].trim()}
                                                            </p>
                                                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                                                                {hotspot.label.split('|')[1]?.trim()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                            </m.div>
                        )}

                        {/* ══ TRUST AUDIT TAB ══ */}
                        {tab === 'audit' && (
                            <m.div key="audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                                {/* Audit Form */}
                                <div className="bg-[#18181B] border border-white/5 rounded-2xl p-4 sm:p-6 lg:p-8 space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Log Reference Check</h3>

                                    {/* Worker Selector */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Select Worker</label>
                                        <select
                                            value={selectedWorker?.id || ''}
                                            onChange={e => {
                                                const w = workers.find(w => w.id === e.target.value) || null;
                                                setSelectedWorker(w);
                                            }}
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white outline-none [color-scheme:dark] focus:border-[#4F46E5]"
                                        >
                                            <option value="" className="bg-[#18181B]">Choose a worker...</option>
                                            {workers.map(w => (
                                                <option key={w.id} value={w.id} className="bg-[#18181B]">
                                                    {w.full_name} — {w.trade_category} ({w.account_status})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedWorker && (
                                        <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            <div className="flex items-center gap-4 w-full sm:w-auto flex-1 max-w-full">
                                                {selectedWorker.profile_photo_url && !imageErrors[selectedWorker.profile_photo_url] ? (
                                                    <img 
                                                        src={signedUrls[selectedWorker.profile_photo_url] || selectedWorker.profile_photo_url} 
                                                        alt="" 
                                                        onError={() => setImageErrors(prev => ({ ...prev, [selectedWorker.profile_photo_url]: true }))}
                                                        className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0" 
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center flex-shrink-0">
                                                        <User className="w-5 h-5 text-white/20" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-white truncate">{selectedWorker.full_name}</p>
                                                    <p className="text-[11px] text-white/30 truncate">{selectedWorker.trade_category} · {selectedWorker.phone}</p>
                                                </div>
                                                <div className="sm:hidden flex-shrink-0">
                                                    <StatusBadge status={selectedWorker.account_status} />
                                                </div>
                                            </div>
                                            <div className="hidden sm:block sm:ml-auto">
                                                <StatusBadge status={selectedWorker.account_status} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Outcome</label>
                                        <div className="flex flex-wrap gap-2 lg:gap-3">
                                            {[
                                                { val: 'pass', label: 'Pass ✓', color: 'green' },
                                                { val: 'fail', label: 'Fail ✗', color: 'red' },
                                                { val: 'no_answer', label: 'No Answer', color: 'amber' },
                                                { val: 'suspicious', label: 'Suspicious', color: 'purple' },
                                            ].map(o => (
                                                <button
                                                    key={o.val}
                                                    onClick={() => setAuditOutcome(o.val)}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                        auditOutcome === o.val
                                                            ? o.color === 'green' ? 'bg-green-500/20 border-green-500/30 text-green-400'
                                                            : o.color === 'red' ? 'bg-red-500/20 border-red-500/30 text-red-400'
                                                            : o.color === 'amber' ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                                                            : 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                                                            : 'bg-white/5 border-white/5 text-white/30'
                                                    }`}
                                                >
                                                    {o.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Admin Notes</label>
                                        <textarea
                                            value={auditNote}
                                            onChange={e => setAuditNote(e.target.value)}
                                            placeholder="e.g. Called former employer Mr. Perera. He confirmed this Baas is reliable but tends to be 30 mins late..."
                                            rows={4}
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm placeholder:text-white/10 outline-none focus:border-[#4F46E5] resize-none transition-colors"
                                        />
                                    </div>

                                    <button
                                        onClick={submitAuditNote}
                                        disabled={!selectedWorker || !auditNote || actionLoading === 'audit'}
                                        className="w-full lg:w-auto px-8 py-4 bg-indigo-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        {actionLoading === 'audit' ? 'Saving...' : 'Save Audit Note'}
                                    </button>
                                </div>
                            </m.div>
                        )}

                        {/* ══ CUSTOMER LEADS TAB ══ */}
                        {tab === 'leads' && (
                            <m.div key="leads" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                {/* Header & Sub-Tabs */}
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                                    <div>
                                        <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-2">Demand Hub</h2>
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                            Track incoming demand and active engagement in real-time.
                                        </p>
                                    </div>
                                    <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                                        <button 
                                            onClick={() => setLeadsSubTab('future')}
                                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${leadsSubTab === 'future' ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'text-white/30 hover:text-white'}`}
                                        >
                                            Future Leads
                                        </button>
                                        <button 
                                            onClick={() => setLeadsSubTab('matrices')}
                                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${leadsSubTab === 'matrices' ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'text-white/30 hover:text-white'}`}
                                        >
                                            Matrices
                                        </button>
                                    </div>
                                </div>

                                {leadsSubTab === 'future' ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {filteredLeads.length === 0 ? (
                                            <div className="bg-[#18181B] border border-white/5 rounded-[2.5rem] p-32 text-center text-white/10 uppercase tracking-[0.2em] font-black italic">
                                                No matches found
                                            </div>
                                        ) : filteredLeads.map(l => (
                                            <m.div key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#18181B] border border-white/5 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-6 group hover:border-indigo-500/30 transition-all shadow-lg hover:shadow-indigo-500/5 text-left">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full md:w-auto overflow-hidden">
                                                    <div className="hidden sm:flex w-16 h-16 bg-white/5 rounded-[1.5rem] items-center justify-center border border-white/5 shadow-inner shrink-0">
                                                        <User className="w-8 h-8 text-white/20" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight truncate">{l.full_name}</h3>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                                                                <Phone className="w-3.5 h-3.5 text-white/40 shrink-0" />
                                                                <span className="text-[11px] font-black text-white/60">{l.phone}</span>
                                                            </div>
                                                            {l.lat && l.lng ? (
                                                                <a 
                                                                    href={`https://www.google.com/maps?q=${l.lat},${l.lng}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg border border-indigo-500/20 transition-all group/map"
                                                                    title="View on Google Maps"
                                                                >
                                                                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 group-hover/map:scale-110 transition-transform" />
                                                                    <span className="text-[11px] font-black text-white/60 truncate group-hover/map:text-indigo-300 transition-colors">{l.area_name || l.district}</span>
                                                                </a>
                                                            ) : (
                                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/5 min-w-0">
                                                                    <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0" />
                                                                    <span className="text-[11px] font-black text-white/60 truncate">{l.area_name || l.district}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col md:flex-col items-center md:items-end justify-between md:justify-end gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-white/5 md:border-t-0 shrink-0 self-stretch md:self-center w-full md:w-auto">
                                                    <div className="flex items-center gap-2 flex-wrap justify-end w-full md:w-auto">
                                                        <div className="bg-indigo-500/10 border border-indigo-500/20 px-3 md:px-4 py-2 rounded-xl min-w-0 shrink-0">
                                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.1em] block">
                                                                <span className="opacity-50 mr-1">Target:</span>
                                                                {l.service_needed || 'General Baas'}
                                                            </span>
                                                        </div>

                                                        {/* Notify Button */}
                                                        <a 
                                                            href={`https://wa.me/${l.phone.replace(/^0/, '94')}?text=${encodeURIComponent(`Hi ${l.full_name}, we added your ${l.service_needed || 'requested'} service on Grab Me! Please visit here to hire the right worker: ${window.location.protocol}//${window.location.host}/browse?service=${encodeURIComponent(l.service_needed || '')}`)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:text-green-300 hover:bg-green-500/20 transition-all hover:scale-110 active:scale-95 flex items-center justify-center shadow-lg group/notify shrink-0"
                                                            title="Notify Customer on WhatsApp"
                                                        >
                                                            <Bell className="w-4 h-4 group-hover/notify:animate-bounce" />
                                                        </a>

                                                        {confirmingDeleteId === l.id ? (
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                <button
                                                                    onClick={() => deleteCustomer(l.id)}
                                                                    className="px-3 py-2.5 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95"
                                                                >
                                                                    Confirm
                                                                </button>
                                                                <button
                                                                    onClick={() => setConfirmingDeleteId(null)}
                                                                    className="px-3 py-2.5 rounded-xl bg-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(l.id); }}
                                                                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all hover:scale-110 active:scale-95 shrink-0"
                                                                title="Delete Lead"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-[9px] font-black text-white/10 uppercase tracking-widest self-end">{new Date(l.registered_at).toLocaleDateString()}</p>
                                                </div>
                                            </m.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {filteredClicks.length === 0 ? (
                                            <div className="bg-[#18181B] border border-white/5 rounded-[2.5rem] p-32 text-center">
                                                <BarChart3 className="w-12 h-12 text-white/5 mx-auto mb-4" />
                                                <p className="text-white/10 uppercase tracking-[0.2em] font-black italic">No records found</p>
                                            </div>
                                        ) : filteredClicks.map(c => (
                                            <m.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#18181B] border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-6 relative overflow-hidden group hover:border-green-500/30 transition-all shadow-xl text-left">
                                                <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
                                                
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full md:w-auto overflow-hidden">
                                                    <div className="hidden sm:flex w-14 h-14 bg-green-500/10 rounded-2xl items-center justify-center border border-green-500/20 shadow-inner shrink-0">
                                                        <Zap className="w-7 h-7 text-green-400 fill-green-400/20" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="text-lg font-black text-white uppercase tracking-tight truncate">{c.customer?.full_name || 'Anonymous User'}</h3>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/5 min-w-0">
                                                                <Phone className="w-3.5 h-3.5 text-white/40 shrink-0" />
                                                                <span className="text-[11px] font-black text-white/60 truncate">{c.customer?.phone || 'No Number'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 min-w-0 mt-1 sm:mt-0">
                                                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest hidden sm:inline shrink-0">Clicked On:</span>
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        window.open(`/worker/${c.worker_id}`, '_blank');
                                                                    }}
                                                                    className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all group/w shrink-0 max-w-[160px] sm:max-w-none"
                                                                    title="View Worker Profile"
                                                                >
                                                                    <ExternalLink className="w-3 h-3 text-white/30 group-hover/w:text-indigo-400 shrink-0" />
                                                                    <span className="text-[10px] font-black text-indigo-400 group-hover:underline truncate">{c.worker?.full_name || 'Worker'}</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col md:flex-col items-center md:items-end justify-between md:justify-end gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-white/5 md:border-t-0 self-stretch md:self-center w-full md:w-auto shrink-0">
                                                    <div className="flex flex-col items-start md:items-end gap-1.5 overflow-hidden w-full md:w-auto">
                                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest hidden md:block">Customer Origin</p>
                                                        <div className="flex items-center justify-start md:justify-end gap-2 text-[10px] md:text-xs font-bold text-white/60 truncate w-full md:w-auto">
                                                            {c.customer?.lat && c.customer?.lng ? (
                                                                <a 
                                                                    href={`https://www.google.com/maps?q=${c.customer.lat},${c.customer.lng}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 px-2 py-1 bg-green-500/10 hover:bg-green-500/20 rounded-md border border-green-500/20 transition-all group/map shrink-0 min-w-0"
                                                                    title="Open GPS Location"
                                                                >
                                                                    <span className="truncate group-hover/map:text-green-300 transition-colors">{c.customer?.area_name || c.customer?.district || 'Unknown'}</span>
                                                                    <MapPin className="w-3.5 h-3.5 text-green-400 shrink-0 group-hover/map:scale-110 transition-transform" />
                                                                    <span className="text-[8px] font-black text-green-400 uppercase hidden sm:inline">GPS</span>
                                                                </a>
                                                            ) : (
                                                                <span className="truncate flex-1 md:flex-none">{c.customer?.area_name || c.customer?.district || 'Unknown'}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2 shrink-0 w-full md:w-auto">
                                                        <div className="flex items-center gap-2 flex-wrap justify-end w-full md:w-auto">
                                                            <div className="px-3 py-1.5 md:px-4 md:py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-center shrink-0 min-w-0">
                                                                <span className="text-[9px] md:text-[10px] font-black text-green-400 uppercase tracking-widest block">{c.worker?.trade_category || 'Service'}</span>
                                                            </div>
                                                            {confirmingDeleteId === c.id ? (
                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                    <button
                                                                        onClick={() => deleteClick(c.id)}
                                                                        className="px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl bg-red-500 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95 shrink-0"
                                                                    >
                                                                        Confirm
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setConfirmingDeleteId(null)}
                                                                        className="px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl bg-white/10 text-white/60 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95 shrink-0"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(c.id); }}
                                                                    className="p-2 md:p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all hover:scale-110 active:scale-95 shrink-0"
                                                                    title="Delete matrix entry"
                                                                >
                                                                    <Trash2 className="w-4 h-4 md:w-4 md:h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-[8px] md:text-[9px] font-black text-white/10 uppercase tracking-widest mt-1 text-right w-full">
                                                            {new Date(c.clicked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(c.clicked_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </m.div>
                                        ))}
                                    </div>
                                )}
                            </m.div>
                        )}

                        {/* ══ TAXONOMY TAB ══ */}
                        {tab === 'taxonomy' && (
                            <m.div key="taxonomy" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
                                    <div>
                                        <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-2">Service Taxonomy</h2>
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Manage services, skills, and smart search keywords dynamically.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setIsBulkImportOpen(true)}
                                            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                                        >
                                            <Upload className="w-4 h-4" />
                                            Import JSON
                                        </button>
                                        <button
                                            onClick={fetchTaxonomy}
                                            disabled={taxLoading}
                                            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-400 transition-all disabled:opacity-30"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${taxLoading ? 'animate-spin' : ''}`} />
                                            {taxonomy ? 'Refresh' : 'Load Taxonomy'}
                                        </button>
                                    </div>
                                </div>

                                {!taxonomy ? (
                                    <div className="bg-[#18181B] border border-white/5 rounded-[2.5rem] p-32 text-center">
                                        <Briefcase className="w-12 h-12 text-white/5 mx-auto mb-4" />
                                        <p className="text-white/10 uppercase tracking-[0.2em] font-black">Click "Load Taxonomy" to begin</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Add New Service */}
                                        <div className="bg-[#18181B] border border-indigo-500/20 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
                                            <input
                                                placeholder="Add new service (e.g. Solar Technician)..."
                                                value={newServiceName}
                                                onChange={e => setNewServiceName(e.target.value)}
                                                onKeyPress={async e => {
                                                    if (e.key === 'Enter' && newServiceName.trim()) {
                                                        const res = await addServiceAction(newServiceName.trim());
                                                        if (res && res.success) { 
                                                            setNewServiceName(''); 
                                                            fetchTaxonomy(); 
                                                            toast.success('Service synced/added!'); 
                                                        } else {
                                                            toast.error(res?.error || 'Failed to add service');
                                                        }
                                                    }
                                                }}
                                                className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-all"
                                            />
                                            <button
                                                onClick={async () => {
                                                    if (!newServiceName.trim()) return;
                                                    const res = await addServiceAction(newServiceName.trim());
                                                    if (res && res.success) { 
                                                        setNewServiceName(''); 
                                                        fetchTaxonomy(); 
                                                        toast.success('Service synced/added!'); 
                                                    } else {
                                                        toast.error(res?.error || 'Failed to add service');
                                                    }
                                                }}
                                                className="px-5 py-3 w-full md:w-auto justify-center bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-400 transition-all flex items-center gap-2 shrink-0"
                                            >
                                                <Plus className="w-4 h-4" /> Add Service
                                            </button>
                                        </div>

                                        {/* Services List */}
                                        {taxonomy.services.map((svc: any) => {
                                            const svcSkills = taxonomy.skills.filter((sk: any) => sk.service_id === svc.id);
                                            const svcKeywords = taxonomy.keywords.filter((kw: any) => kw.service_id === svc.id);
                                            const isExpanded = selectedServiceId === svc.id;

                                            return (
                                                <div key={svc.id} className="bg-[#18181B] border border-white/5 rounded-[2rem] overflow-hidden">
                                                    {/* Service Header */}
                                                    <div
                                                        onClick={() => setSelectedServiceId(isExpanded ? null : svc.id)}
                                                        className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-white/5 transition-all cursor-pointer gap-2"
                                                    >
                                                        <div className="flex flex-row items-center gap-3 md:gap-4 min-w-0">
                                                            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                                                                <Briefcase className="w-5 h-5 text-indigo-400 shrink-0" />
                                                            </div>
                                                            <div className="text-left min-w-0 pr-2">
                                                                <p className="text-white font-black text-sm truncate">{svc.name}</p>
                                                                <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest truncate">
                                                                    {svcSkills.length} skills · {svcKeywords.length} keywords
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                                                            <button
                                                                onClick={async e => {
                                                                    e.stopPropagation();
                                                                    setTaxDeleting({ id: svc.id, name: svc.name, type: 'Service' });
                                                                }}
                                                                className="p-1.5 md:p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all hover:scale-110 active:scale-95"
                                                                title="Delete service"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                            </button>
                                                            <ChevronRight className={`w-4 h-4 text-white/30 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                                        </div>
                                                    </div>

                                                    {/* Expanded Skills + Keywords */}
                                                    {isExpanded && (
                                                        <div className="border-t border-white/5 p-6 space-y-6">
                                                            {/* Skills Section */}
                                                            <div className="space-y-3">
                                                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Skills</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {svcSkills.map((sk: any) => (
                                                                        <div key={sk.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                                                                            <span className="text-xs text-white/70 font-bold">{sk.name}</span>
                                                                            <button
                                                                                onClick={() => setTaxDeleting({ id: sk.id, name: sk.name, type: 'Skill' })}
                                                                                className="text-red-400/60 hover:text-red-400 transition-colors"
                                                                            >
                                                                                <X className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        placeholder="Add skill (e.g. Drone Repair)..."
                                                                        value={selectedServiceId === svc.id ? newSkillName : ''}
                                                                        onChange={e => setNewSkillName(e.target.value)}
                                                                        onKeyPress={async e => {
                                                                            if (e.key === 'Enter' && newSkillName.trim()) {
                                                                                const res = await addSkillAction(svc.id, newSkillName.trim());
                                                                                if (res.success) { setNewSkillName(''); fetchTaxonomy(); toast.success('Skill added!'); }
                                                                                else toast.error(res.error);
                                                                            }
                                                                        }}
                                                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-all"
                                                                    />
                                                                    <button
                                                                        onClick={async () => {
                                                                            if (!newSkillName.trim()) return;
                                                                            const res = await addSkillAction(svc.id, newSkillName.trim());
                                                                            if (res.success) { setNewSkillName(''); fetchTaxonomy(); toast.success('Skill added!'); }
                                                                            else toast.error(res.error);
                                                                        }}
                                                                        className="px-4 py-2.5 bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase rounded-xl hover:bg-white/10 transition-all"
                                                                    >
                                                                        <Plus className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Keywords Section */}
                                                            <div className="space-y-3">
                                                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Smart Search Keywords</p>
                                                                <p className="text-[9px] text-white/20 font-bold">Users who type these words will find this service — e.g. add "bike", "broken", "engine" for Vehicle Mechanic</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {svcKeywords.map((kw: any) => (
                                                                        <div key={kw.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/5 border border-green-500/20 rounded-lg">
                                                                            <span className="text-xs text-green-400 font-bold">{kw.keyword}</span>
                                                                            <button
                                                                                onClick={() => setTaxDeleting({ id: kw.id, name: kw.keyword, type: 'Keyword' })}
                                                                                className="text-red-400/60 hover:text-red-400 transition-colors"
                                                                            >
                                                                                <X className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        placeholder="Add keyword (e.g. bike, broken, engine)..."
                                                                        value={selectedServiceId === svc.id ? newKeyword : ''}
                                                                        onChange={e => setNewKeyword(e.target.value)}
                                                                        onKeyPress={async e => {
                                                                            if (e.key === 'Enter' && newKeyword.trim()) {
                                                                                const res = await addKeywordAction(svc.id, newKeyword.trim());
                                                                                if (res.success) { setNewKeyword(''); fetchTaxonomy(); toast.success('Keyword added!'); }
                                                                                else toast.error(res.error);
                                                                            }
                                                                        }}
                                                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-green-500 transition-all"
                                                                    />
                                                                    <button
                                                                        onClick={async () => {
                                                                            if (!newKeyword.trim()) return;
                                                                            const res = await addKeywordAction(svc.id, newKeyword.trim());
                                                                            if (res.success) { setNewKeyword(''); fetchTaxonomy(); toast.success('Keyword added!'); }
                                                                            else toast.error(res.error);
                                                                        }}
                                                                        className="px-4 py-2.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase rounded-xl hover:bg-green-500/20 transition-all"
                                                                    >
                                                                        <Plus className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </m.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="border-t border-white/5 px-8 py-6 flex justify-between text-[10px] font-black uppercase tracking-widest text-white/10">
                    <span>Grab Me Admin — Alpha v1.0.4</span>
                    <span>Powered by Mr² Labs</span>
                </div>
            </main>
        </div>
    );
}
