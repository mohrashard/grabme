import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Activity, LogOut } from 'lucide-react'

type TabItem = {
    id: string;
    label: string;
    icon: any;
    count: number | null;
}

interface AdminSidebarProps {
    tab: string;
    setTab: (tab: string) => void;
    stats: {
        active: number;
        pending: number;
        suspended: number;
    };
    tabs: readonly TabItem[];
    onLogout: () => void;
}

export function AdminSidebar({ tab, setTab, stats, tabs, onLogout }: AdminSidebarProps) {
    return (
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
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-sm font-bold transition-all ${tab === t.id ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                    >
                        <span className="flex items-center gap-3"><t.icon className="w-4 h-4" />{t.label}</span>
                        {t.count !== null && <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${tab === t.id ? 'bg-red-500/20 text-red-300' : 'bg-white/5 text-white/30'}`}>{t.count}</span>}
                    </button>
                ))}
                <div className="pt-2 mt-2 border-t border-white/5">
                    <Link href="/admin/monetization" className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-sm font-bold transition-all text-amber-400/80 hover:text-amber-400 hover:bg-amber-500/10">
                        <span className="flex items-center gap-3"><Activity className="w-4 h-4" />Monetization & Scale</span>
                    </Link>
                </div>
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
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all">
                    <LogOut className="w-4 h-4" /> Logout
                </button>
            </div>
        </aside>
    )
}
