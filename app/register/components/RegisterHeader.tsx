'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

interface RegisterHeaderProps {
    scrolled?: boolean;
    mobileOpen?: boolean;
    setMobileOpen?: (open: boolean) => void;
}

export default function RegisterHeader({ scrolled = false, mobileOpen = false, setMobileOpen }: RegisterHeaderProps) {
    return (
        <nav
            className="fixed top-0 w-full z-50 transition-all duration-500"
            style={{
                background: scrolled ? 'rgba(9,10,15,0.85)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
            }}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                        <Image src="/grabme.png" alt="Grab Me" fill className="object-cover" />
                    </div>
                    <span className="text-white text-lg font-bold tracking-tight">Grab Me</span>
                </Link>
                <div className="flex items-center gap-2 md:gap-4">
                    <Link href="/how-it-works" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg border border-white/5 transition-all">How It Works</Link>
                    <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg border border-white/5 transition-all">Back to Home</Link>
                </div>
            </div>
            {/* Mobile menu (optional, if needed for register) */}
        </nav>
    );
}
