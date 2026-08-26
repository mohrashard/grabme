import React from 'react'
import Link from 'next/link'
import { Activity, LogOut } from 'lucide-react'

type TabItem = {
    id: string;
    label: string;
    icon: any;
    count: number | null;
}

interface AdminMobileNavProps {
    tab: string;
    setTab: (tab: string) => void;
    tabs: readonly TabItem[];
    onLogout: () => void;
}

export function AdminMobileNav({ tab, setTab, tabs, onLogout }: AdminMobileNavProps) {
    return (
        <nav className="fixed bottom-0 w-full bg-[#18181B]/95 backdrop-blur-xl border-t border-white/10 z-50 lg:hidden px-2 pb-safe pt-2">
            <div className="flex items-center justify-around pb-2">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative ${tab === t.id ? 'text-red-400' : 'text-white/30 hover:text-white'}`}
                    >
                        <t.icon className="w-5 h-5" />
                        <span className="text-[8px] font-black uppercase tracking-widest">{t.label.split(' ')[0]}</span>
                        {t.count !== null && t.count > 0 && (
                            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#18181B]" />
                        )}
                    </button>
                ))}
                <Link href="/admin/monetization" className="flex flex-col items-center gap-1 p-2 rounded-xl text-amber-500/50 hover:text-amber-400 transition-all">
                    <Activity className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Scale</span>
                </Link>
                <button onClick={onLogout} className="flex flex-col items-center gap-1 p-2 rounded-xl text-red-500/50 hover:text-red-400 transition-all">
                    <LogOut className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Exit</span>
                </button>
            </div>
        </nav>
    )
}
