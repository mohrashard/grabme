import React from 'react';
import { m } from 'framer-motion';
import { ShieldCheck, User, Lock, Eye, Globe, ExternalLink, Zap, CheckCircle2, MessageSquare, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { StatusBadge } from '../StatusBadge';

export const PipelineTab = ({
    loading,
    pipeline,
    checklists,
    setChecklists,
    imageErrors,
    setImageErrors,
    signedUrls,
    openLightbox,
    updateStatus,
    actionLoading,
}: any) => {
    return (
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
            ) : pipeline.map((w: any) => (
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
                                {
                                    url: w.certificate_url && !w.certificate_url.startsWith('http')
                                        ? supabase.storage.from('avatars').getPublicUrl(w.certificate_url).data.publicUrl
                                        : w.certificate_url,
                                    label: 'Certificate',
                                    bucket: 'avatars'
                                }

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
                                                    onError={() => setImageErrors((prev: any) => ({ ...prev, [img.url]: true }))}
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


                        {/* Social Links */}
                        {(w.video_pitch_url || w.instagram_url || w.tiktok_url || w.facebook_url) && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60">Social / Portfolio</p>
                                <div className="flex flex-wrap gap-2">
                                    {w.video_pitch_url && (
                                        <a href={w.video_pitch_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">
                                            <Globe className="w-3 h-3" /> Video Pitch
                                        </a>
                                    )}
                                    {w.instagram_url && (
                                        <a href={w.instagram_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-pink-500/20 transition-all">
                                            <ExternalLink className="w-3 h-3" /> Instagram
                                        </a>
                                    )}
                                    {w.tiktok_url && (
                                        <a href={w.tiktok_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white/60 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                                            <ExternalLink className="w-3 h-3" /> TikTok
                                        </a>
                                    )}
                                    {w.facebook_url && (
                                        <a href={w.facebook_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all">
                                            <ExternalLink className="w-3 h-3" /> Facebook
                                        </a>
                                    )}
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
                                            onChange={(e) => setChecklists((prev: any) => ({
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
                                onChange={(e) => setChecklists((prev: any) => ({
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
    );
};
