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
    <div className="min-h-[100dvh] bg-white flex flex-col relative overflow-hidden font-outfit">
      {/* APP HEADER */}
      <header className="px-5 py-4 flex items-center shrink-0">
          <Link href="/" className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl text-[#0f172a] active:scale-90 transition-all">
              <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="ml-4 text-sm font-black uppercase tracking-widest text-[#0f172a]">Error</span>
      </header>

      <m.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full text-center"
      >
        {/* Error Icon Block */}
        <div className="relative mb-10 group">
            <div className="absolute -inset-4 bg-red-500/5 blur-2xl rounded-full" />
            <div className="relative w-28 h-28 bg-white border border-red-100 shadow-xl shadow-red-500/5 rounded-[2.5rem] flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
        </div>

        <div className="space-y-4 mb-12">
          <h1 className="text-3xl font-black tracking-tight text-[#0f172a]">Profile Missing</h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
            We couldn't find the professional you're looking for. They may have stepped away or updated their profile link.
          </p>
        </div>

        {/* ACTIONS */}
        <div className="w-full flex flex-col gap-4 mt-auto md:mt-0">
          <Link 
            href="/browse"
            className="w-full py-5 bg-[#1d4ed8] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all"
          >
            <Search className="w-4 h-4" /> Browse Professionals
          </Link>
          
          <button
            onClick={() => reset()}
            className="w-full py-5 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-slate-50 active:scale-[0.98] transition-all"
          >
            <RefreshCcw className="w-4 h-4" /> Try Again
          </button>
        </div>

        <div className="mt-16 text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">
            Grab Me Infrastructure
        </div>
      </m.div>
    </div>
  )
}
