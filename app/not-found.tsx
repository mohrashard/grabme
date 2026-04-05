'use client'

import React from 'react'
import { m } from 'framer-motion'
import { SearchX, ArrowRight, ShieldAlert, Briefcase } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090A0F] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-12">
        {/* Animated Icon Container */}
        <div className="relative mx-auto w-32 h-32">
          <m.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute inset-0 bg-indigo-500/10 rounded-[2.5rem] border border-indigo-500/20 shadow-2xl flex items-center justify-center"
          >
            <ShieldAlert className="w-12 h-12 text-indigo-400" />
          </m.div>
          <m.div 
            animate={{ 
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-4 -right-4 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-sm"
          >
            <span className="text-white/20 font-black text-xs">404</span>
          </m.div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <m.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-white uppercase tracking-tight"
          >
            Lost in the <br /><span className="text-white/20">Directory?</span>
          </m.h1>
          <m.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-sm font-medium leading-relaxed max-w-xs mx-auto"
          >
            The page you're looking for was moved or doesn't exist. Let's get you back to finding a pro.
          </m.p>
        </div>

        {/* CTAs */}
        <m.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          {/* Primary: Browse */}
          <Link 
            href="/browse"
            className="group inline-flex items-center gap-4 px-10 py-5 bg-[#4F46E5] text-white rounded-3xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-400 hover:scale-105 active:scale-95 transition-all"
          >
            Return to Directory
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          {/* Secondary: Register */}
          <Link
            href="/register"
            className="group inline-flex items-center gap-3 px-10 py-4 border border-white/10 text-white/40 rounded-3xl text-xs font-black uppercase tracking-[0.2em] hover:border-indigo-500/40 hover:text-indigo-400 hover:scale-105 active:scale-95 transition-all"
          >
            <Briefcase className="w-4 h-4" />
            Register as a Worker
          </Link>
        </m.div>

        {/* Footer Attribution */}
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10">Grab Me | Service Intelligence</p>
      </div>
    </div>
  )
}
