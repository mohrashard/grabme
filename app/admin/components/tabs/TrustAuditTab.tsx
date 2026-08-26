import React from 'react';
import { m } from 'framer-motion';
import { User } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';

export const TrustAuditTab = ({
    workers,
    selectedWorker,
    setSelectedWorker,
    imageErrors,
    setImageErrors,
    signedUrls,
    auditOutcome,
    setAuditOutcome,
    auditNote,
    setAuditNote,
    submitAuditNote,
    actionLoading
}: any) => {
    return (
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
                            const w = workers.find((w: any) => w.id === e.target.value) || null;
                            setSelectedWorker(w);
                        }}
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white outline-none [color-scheme:dark] focus:border-[#4F46E5]"
                    >
                        <option value="" className="bg-[#18181B]">Choose a worker...</option>
                        {workers.map((w: any) => (
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
                                    onError={() => setImageErrors((prev: any) => ({ ...prev, [selectedWorker.profile_photo_url]: true }))}
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
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${auditOutcome === o.val
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
    );
};
