'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#f8fafc] border-t border-[#e2e8f0] pt-24 pb-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        
        {/* Column 1: Brand & Identity */}
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[#e2e8f0] shadow-md transition-transform group-hover:scale-110">
              <Image src="/grabme.png" alt="Grab Me Logo" fill className="object-cover" />
            </div>
            <span className="text-[#0f172a] text-xl font-bold tracking-tight">Grab Me</span>
          </Link>
          <p className="text-[#475569] text-sm font-medium leading-relaxed max-w-xs">
            Sri Lanka&apos;s verified directory for home services. We connect you directly with trusted professionals for every repair.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <div className="w-8 h-8 rounded-full bg-[#dbeafe] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#1d4ed8]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#1d4ed8]">100% NIC Verified</span>
          </div>
        </div>

        {/* Column 2: Popular Services */}
        <div className="space-y-6">
          <h4 className="text-[#0f172a] text-sm font-bold uppercase tracking-widest">Popular Services</h4>
          <div className="grid grid-cols-1 gap-3 text-sm font-semibold text-[#64748b]">
            <Link href="/browse?service=Electrician" className="hover:text-[#1d4ed8] transition-colors">Electricians</Link>
            <Link href="/browse?service=Plumber" className="hover:text-[#1d4ed8] transition-colors">Plumbers</Link>
            <Link href="/browse?service=AC Repair" className="hover:text-[#1d4ed8] transition-colors">AC Repair & Service</Link>
            <Link href="/browse?service=Carpenter" className="hover:text-[#1d4ed8] transition-colors">Carpentry</Link>
            <Link href="/browse?service=Painter" className="hover:text-[#1d4ed8] transition-colors">Painters</Link>
          </div>
        </div>

        {/* Column 3: Company & Support */}
        <div className="space-y-6">
          <h4 className="text-[#0f172a] text-sm font-bold uppercase tracking-widest">Platform</h4>
          <div className="grid grid-cols-1 gap-3 text-sm font-semibold text-[#64748b]">
            <Link href="/how-it-works" className="hover:text-[#1d4ed8] transition-colors">How It Works</Link>
            <Link href="/register" className="hover:text-[#1d4ed8] transition-colors">Join as a Worker</Link>
            <Link href="/login" className="hover:text-[#1d4ed8] transition-colors">Partner Login</Link>
            <Link href="/browse" className="hover:text-[#1d4ed8] transition-colors">Browse Services</Link>
          </div>
        </div>

        {/* Column 4: Legal & Contact */}
        <div className="space-y-6">
          <h4 className="text-[#0f172a] text-sm font-bold uppercase tracking-widest">Legal & Local</h4>
          <div className="grid grid-cols-1 gap-3 text-sm font-semibold text-[#64748b]">
            <Link href="/terms" className="hover:text-[#1d4ed8] transition-colors">Terms of Use</Link>
            <Link href="/privacy" className="hover:text-[#1d4ed8] transition-colors">Privacy Policy</Link>
            <Link href="/conduct" className="hover:text-[#1d4ed8] transition-colors">Code of Conduct</Link>
            <div className="pt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#16a34a]">Live in Sri Lanka</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto border-t border-[#e2e8f0] pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#94a3b8]">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
          <span>&copy; {new Date().getFullYear()} Grab Me</span>
          <span className="hidden md:block w-1 h-1 rounded-full bg-[#cbd5e1]" />
          <span>
            Powered by{' '}
            <a href="https://www.mohamedrashard.dev/" target="_blank" rel="noopener noreferrer" className="text-[#1d4ed8] hover:text-[#1e3a8a] transition-colors font-black">
              Mr² Labs
            </a>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#cbd5e1]">Made with ♥ in Sri Lanka</span>
        </div>
      </div>
    </footer>
  )
}
