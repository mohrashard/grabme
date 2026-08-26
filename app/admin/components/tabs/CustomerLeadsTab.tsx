import React from 'react';
import { m } from 'framer-motion';
import { User, Phone, MapPin, Bell, Trash2, BarChart3, Zap, ExternalLink } from 'lucide-react';

export const CustomerLeadsTab = ({
    leadsSubTab,
    setLeadsSubTab,
    filteredLeads,
    filteredClicks,
    confirmingDeleteId,
    setConfirmingDeleteId,
    deleteCustomer,
    deleteClick
}: any) => {
    return (
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
                    ) : filteredLeads.map((l: any) => (
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
                                        href={`https://wa.me/${l.phone.replace(/^0/, '94')}?text=${encodeURIComponent(`Hi ${l.full_name}, we added your ${l.service_needed || 'requested'} service on Grab Me! Please visit here to hire the right worker: ${typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/browse?service=${encodeURIComponent(l.service_needed || '')}` : ''}`)}`}
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
                    ) : filteredClicks.map((c: any) => (
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
    );
};
