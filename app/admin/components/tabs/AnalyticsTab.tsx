import React from 'react';
import { m } from 'framer-motion';
import { Users, UserCheck, MessageSquare, TrendingUp, Briefcase, MapPin, Activity } from 'lucide-react';

export const AnalyticsTab = ({ stats, topDistricts, topTrades }: any) => {
    return (
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
                            : topDistricts.map(([district, count]: any) => (
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
                            : topTrades.map(([trade, count]: any) => (
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
                        stats.topClicks?.map((hotspot: any, idx: number) => (
                            <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-between group hover:bg-indigo-500/5 transition-all">
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400/60">Rank #{idx + 1}</span>
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
    );
};
