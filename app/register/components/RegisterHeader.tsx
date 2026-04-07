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
            className="fixed top-0 w-full z-50 transition-all duration-500 bg-white/95 backdrop-blur-sm border-b border-[#e2e8f0] shadow-sm"
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-[#e2e8f0] shadow-sm">
                        <Image src="/grabme.png" alt="Grab Me" fill className="object-cover" />
                    </div>
                    <span className="text-[#1d4ed8] text-lg font-bold tracking-tight">Grab Me</span>
                </Link>
                <div className="flex items-center gap-2 md:gap-4">
                    <Link href="/how-it-works" className="text-[#334155] hover:text-[#1d4ed8] font-medium transition-colors px-3 py-2 rounded-lg text-sm">How It Works</Link>
                    <Link href="/" className="bg-[#1d4ed8] text-white hover:bg-[#1e3a8a] rounded-lg font-semibold shadow-sm hover:shadow-md transition-all px-4 py-2 text-sm">Back to Home</Link>
                </div>
            </div>
            {/* Mobile menu (optional, if needed for register) */}
        </nav>
    );
}
