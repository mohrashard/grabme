'use client'

import React, { useState } from 'react'
import { LayoutDashboard, User, Star, Wrench, CreditCard, LogOut, Menu, X, TrendingUp, Wallet, ReceiptText } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export function DashboardSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut()
        localStorage.removeItem('grabme_user')
        router.push('/login')
    }

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
        { icon: TrendingUp, label: 'Analytics', href: '/dashboard/analytics' },
        { icon: Star, label: 'Reviews', href: '/dashboard/reviews' },
        { icon: User, label: 'Profile', href: '/dashboard/profile' },
        { icon: Wallet, label: 'Wallet', href: '/dashboard/ledger' },
        { icon: Wrench, label: 'Tools', href: '/dashboard/tools' },
        { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
    ];

    // Bottom mobile nav items (first 3 + menu)
    const mobileBottomItems = [
        { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
        { icon: Star, label: 'Reviews', href: '/dashboard/reviews' },
        { icon: User, label: 'Profile', href: '/dashboard/profile' },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-64 border-r border-[#e2e8f0] bg-white shadow-sm flex-col hidden lg:flex z-30 flex-shrink-0 h-full">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-[#e2e8f0] shadow-md">
                            <Image src="/grabme.png" alt="Grab Me" fill sizes="32px" className="object-cover" />
                        </div>
                        <span className="text-[#0f172a] text-lg font-bold tracking-tight">Portal</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {navItems.map((item, i) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link 
                                key={i} 
                                href={item.href}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${isActive ? 'bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/20' : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'}`}
                            >
                                <item.icon className="w-5 h-5" /> {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-[#e2e8f0]">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-[#e2e8f0] flex justify-around items-center h-20 z-50 px-2 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                {mobileBottomItems.map((item, i) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={i} href={item.href} className={`flex flex-col items-center gap-1.5 p-3 transition-all ${isActive ? 'text-[#1d4ed8]' : 'text-[#64748b] hover:text-[#0f172a]'}`}>
                            <item.icon className="w-6 h-6" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                        </Link>
                    );
                })}
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="flex flex-col items-center gap-1.5 p-3 text-[#64748b] hover:text-[#0f172a] transition-all"
                >
                    <Menu className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">More</span>
                </button>
            </nav>

            {/* Mobile Full Screen Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-[60] bg-[#f8fafc] flex flex-col h-full animate-in slide-in-from-right-full duration-200">
                    <div className="flex items-center justify-between p-6 bg-white border-b border-[#e2e8f0]">
                        <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-[#e2e8f0] shadow-md">
                                <Image src="/grabme.png" alt="Grab Me" fill sizes="32px" className="object-cover" />
                            </div>
                            <span className="text-[#0f172a] text-lg font-bold tracking-tight">Menu</span>
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 rounded-full bg-[#f1f5f9] flex items-center justify-center text-slate-600 hover:bg-[#e2e8f0] transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-3">
                        {navItems
                            .filter(item => !['Overview', 'Reviews', 'Profile'].includes(item.label))
                            .map((item, i) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link 
                                    key={i} 
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-bold transition-all ${isActive ? 'bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/20' : 'bg-white text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a] shadow-sm border border-[#e2e8f0]'}`}
                                >
                                    <item.icon className="w-6 h-6" /> {item.label}
                                </Link>
                            )
                        })}
                    </div>
                    <div className="p-6 bg-white border-t border-[#e2e8f0] pb-safe mb-[80px]">
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-base font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-all border border-red-100 shadow-sm"
                        >
                            <LogOut className="w-6 h-6" /> Logout
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
