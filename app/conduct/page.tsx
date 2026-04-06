import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, HeartPulse } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Code of Conduct | Our Professional Standards | Grab Me",
  description: "Learn about the professional and ethical standards we expect from every worker and customer on the Grab Me platform.",
}

export default function ConductPage() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-white p-8 lg:p-24 font-sans selection:bg-indigo-500/30">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link href="/" className="inline-flex items-center gap-3 text-white/40 hover:text-white transition-all group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return Home</span>
        </Link>
        <div className="space-y-6">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-3xl flex items-center justify-center border border-indigo-500/20">
            <HeartPulse className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-none uppercase">Code of <br /><span className="text-white/20">Conduct</span></h1>
          <p className="text-white/40 text-sm font-medium tracking-tight">Last Updated: April 2026</p>
        </div>
        <div className="space-y-10 text-white/60 leading-relaxed text-sm font-medium">
          <section className="space-y-4">
            <h2 className="text-white font-black uppercase tracking-widest text-xs">1. Professional Accountability</h2>
            <p>Every Partner on Grab Me must represent their skills honestly. Misrepresentation of experience or qualifications will lead to permanent removal. Be on time, and if you're going to be late, inform the customer immediately.</p>
          </section>
          <section className="space-y-4">
            <h2 className="text-white font-black uppercase tracking-widest text-xs">2. Ethical Pricing</h2>
            <p>All pricing must be transparent and fair. While we do not control your rates, we encourage honest estimates. Taking advantage of customers or charging hidden fees is strictly prohibited.</p>
          </section>
          <section className="space-y-4">
            <h2 className="text-white font-black uppercase tracking-widest text-xs">3. Safety and Respect</h2>
            <p>Safety is our top priority. Partners must conduct themselves professionally and respectfully at all times. Any reports of harassment or unsafe behavior will be reported to the appropriate authorities.</p>
          </section>
        </div>
        <div className="pt-12 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
          Grab Me | Standard Operating Procedure v1.0
        </div>
      </div>
    </div>
  )
}
