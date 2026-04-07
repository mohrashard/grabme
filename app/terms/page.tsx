import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Metadata } from 'next'
import Footer from '../components/Footer'

export const metadata: Metadata = {
  title: "Terms of Service | Grab Me Sri Lanka",
  description: "Read our terms of service for using the Grab Me platform as a customer or worker in Sri Lanka.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-outfit relative overflow-x-hidden selection:bg-blue-500/10 text-[#334155]">
      {/* Premium Background Mesh */}
      <div className="absolute top-0 left-0 right-0 h-[100vh] w-full pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#dbeafe]/40 blur-[120px] rounded-full" />
          <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-[#dbeafe]/40 blur-[120px] rounded-full" />
          <div className="absolute top-[40%] left-[25%] w-[40%] h-[40%] bg-white blur-[100px] rounded-full opacity-60" />
      </div>

      <div className="flex-1 p-8 lg:px-24 lg:py-32 relative z-10 w-full max-w-4xl mx-auto">
        <div className="space-y-12 bg-white rounded-3xl p-8 md:p-16 shadow-sm border border-[#e2e8f0]">
          <Link href="/" className="inline-flex items-center gap-3 text-[#64748b] hover:text-[#1d4ed8] transition-all group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Return Home</span>
          </Link>
          
          <div className="space-y-6">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-[#1d4ed8]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#0f172a] uppercase">
              Terms of <br /><span className="text-[#1d4ed8]">Service</span>
            </h1>
            <p className="text-[#64748b] text-sm font-medium tracking-tight">Last Updated: April 2026</p>
          </div>
          
          <div className="space-y-10 text-[#334155] leading-relaxed text-sm font-medium">
            <section className="space-y-4">
              <h2 className="text-[#1d4ed8] font-bold uppercase tracking-widest text-xs">1. Platform Nature</h2>
              <p>Grab Me is a lead-generation directory and WhatsApp bridge for independent professionals in Sri Lanka. We facilitate connections but do not act as an employer, agency, or contractor. All agreements made between Customers and Partners are direct and independent of this platform.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-[#1d4ed8] font-bold uppercase tracking-widest text-xs">2. No Financial Liability</h2>
              <p>Grab Me does not handle payments, escrow, or financial transactions. We are not liable for payment disputes, unfinished work, or property damage. Users are responsible for verifying references and negotiating prices directly on WhatsApp.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-[#1d4ed8] font-bold uppercase tracking-widest text-xs">3. Conduct Standards</h2>
              <p>Users must use the platform for lawful purposes only. Harassment, fraud, or misrepresentation will result in immediate suspension and permanent banning from the directory.</p>
            </section>
          </div>
          
          <div className="pt-12 border-t border-[#e2e8f0] text-[10px] font-bold uppercase tracking-[0.3em] text-[#94a3b8]">
            Grab Me | Standard Operating Procedure v1.0
          </div>
        </div>
      </div>
      
      <div className="relative z-10 border-t border-[#e2e8f0] bg-white">
          <Footer />
      </div>
    </div>
  )
}
