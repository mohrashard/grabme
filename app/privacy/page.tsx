import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Privacy Policy | Grab Me Sri Lanka",
  description: "Learn how we protect your data and identity on Grab Me.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-white p-8 lg:p-24 font-sans selection:bg-indigo-500/30">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link href="/" className="inline-flex items-center gap-3 text-white/40 hover:text-white transition-all group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return Home</span>
        </Link>
        <div className="space-y-6">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-3xl flex items-center justify-center border border-indigo-500/20">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-none uppercase">Privacy <br /><span className="text-white/20">Policy</span></h1>
          <p className="text-white/40 text-sm font-medium tracking-tight">Last Updated: April 2026</p>
        </div>
        <div className="space-y-10 text-white/60 leading-relaxed text-sm font-medium">
          <section className="space-y-4">
            <h2 className="text-white font-black uppercase tracking-widest text-xs">1. Data Collection</h2>
            <p>We collect and store your full name, phone number, and professional qualifications. We also store identity documents (NIC fronts, backs, and selfies) for verification purposes. All NIC data is securely stored in a private bucket on Supabase and only accessible by authorized admins.</p>
          </section>
          <section className="space-y-4">
            <h2 className="text-white font-black uppercase tracking-widest text-xs">2. Profile Visibility</h2>
            <p>Your profile photo, bio, and service category are public and visible to customers on our directory. Your phone number is only shared via a WhatsApp bridge when a customer clicks "Connect Now."</p>
          </section>
          <section className="space-y-4">
            <h2 className="text-white font-black uppercase tracking-widest text-xs">3. Data Retention</h2>
            <p>We retain your information while your account is active. If you wish to delete your profile and all associated data, you must contact our founder directly via the WhatsApp channel.</p>
          </section>
        </div>
        <div className="pt-12 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
          Grab Me | Standard Operating Procedure v1.0
        </div>
      </div>
    </div>
  )
}
