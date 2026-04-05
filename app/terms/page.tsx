import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-white p-8 lg:p-24 font-sans selection:bg-indigo-500/30">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link href="/" className="inline-flex items-center gap-3 text-white/40 hover:text-white transition-all group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return Home</span>
        </Link>
        <div className="space-y-6">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-3xl flex items-center justify-center border border-indigo-500/20">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-none uppercase">Terms of <br /><span className="text-white/20">Service</span></h1>
          <p className="text-white/40 text-sm font-medium tracking-tight">Last Updated: April 2026</p>
        </div>
        <div className="space-y-10 text-white/60 leading-relaxed text-sm font-medium">
          <section className="space-y-4">
            <h2 className="text-white font-black uppercase tracking-widest text-xs">1. Platform Nature</h2>
            <p>Grab Me is a lead-generation directory and WhatsApp bridge for independent professionals in Sri Lanka. We facilitate connections but do not act as an employer, agency, or contractor. All agreements made between Customers and Partners are direct and independent of this platform.</p>
          </section>
          <section className="space-y-4">
            <h2 className="text-white font-black uppercase tracking-widest text-xs">2. No Financial Liability</h2>
            <p>Grab Me does not handle payments, escrow, or financial transactions. We are not liable for payment disputes, unfinished work, or property damage. Users are responsible for verifying references and negotiating prices directly on WhatsApp.</p>
          </section>
          <section className="space-y-4">
            <h2 className="text-white font-black uppercase tracking-widest text-xs">3. Conduct Standards</h2>
            <p>Users must use the platform for lawful purposes only. Harassment, fraud, or misrepresentation will result in immediate suspension and permanent banning from the directory.</p>
          </section>
        </div>
        <div className="pt-12 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
          Grab Me | Standard Operating Procedure v1.0
        </div>
      </div>
    </div>
  )
}
