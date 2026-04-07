'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { m } from 'framer-motion'
import { AlertTriangle, ArrowLeft, Search, RefreshCcw } from 'lucide-react'
import Image from 'next/image'

export default function WorkerProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Worker Profile Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#0f172a] flex flex-col items-center justify-center p-6 text-center">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full" />
      </div>

      <m.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-md w-full space-y-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-12">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10">
                <Image src="/grabme.png" alt="Grab Me" fill className="object-cover" />
            </div>
            <span className="text-lg font-black tracking-tight text-[#0f172a] uppercase tracking-[0.2em]">Grab Me</span>
        </div>

        {/* Error Icon */}
        <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Profile Not Found</h1>
          <p className="text-[#0f172a]/60 text-sm font-medium leading-relaxed">
            The profile you are looking for may have been deactivated, suspended, or simply doesn't exist anymore. 
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-6">
          <Link 
            href="/browse"
            className="w-full py-4 bg-[#1d4ed8] text-white rounded-full font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-[#1e3a8a] transition-all shadow-xl active:scale-95"
          >
            <Search className="w-4 h-4" /> Browse Professionals
          </Link>
          
          <button
            onClick={() => reset()}
            className="w-full py-4 bg-[#1d4ed8] text-white rounded-full font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-[#1e3a8a] transition-all shadow-xl active:scale-95"
          >
            <RefreshCcw className="w-4 h-4" /> Try Again
          </button>
        </div>

        <div className="pt-12">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0f172a]/40 hover:text-[#0f172a] transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to Home
          </Link>
        </div>
      </m.div>

      <div className="mt-20 text-[9px] font-black uppercase tracking-[0.3em] text-[#0f172a]/20">
        Security Infrastructure by Mr² Labs
      </div>
    </div>
  )
}
