import React from 'react';
import { m } from 'framer-motion';
import { Eye, Star, Zap, Edit3, Trash2, PauseCircle, CheckCircle2, ClipboardList } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';

export const DirectoryTab = ({
    loading,
    directory,
    checklists,
    setChecklists,
    imageErrors,
    signedUrls,
    openLightbox,
    updateStatus,
    actionLoading,
    setEditingWorker,
    setDeletingWorker,
    toggleFeatured,
    setTab
}: any) => {
    return (
        <m.div key="directory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {loading ? (
                <div className="text-center py-20 text-white/20 text-sm">Loading directory...</div>
            ) : directory.map((w: any) => (
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
                                        onChange={(e) => setChecklists((prev: any) => ({
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
    );
};
