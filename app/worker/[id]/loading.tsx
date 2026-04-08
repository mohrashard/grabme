'use client'

import React from 'react'
import { m } from 'framer-motion'
import Image from 'next/image'

export default function WorkerProfileLoading() {
  return (
    <div className="min-h-[100dvh] bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Micro-Decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#1d4ed8]/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo Container */}
        <m.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative w-24 h-24 mb-10"
        >
          <div className="absolute inset-0 bg-white rounded-[2rem] shadow-xl border border-white/20" />
          <div className="relative w-full h-full p-5 flex items-center justify-center">
            <Image 
              src="/grabme.png" 
              alt="Grab Me" 
              width={80} 
              height={80} 
              className="object-contain"
              priority
            />
          </div>
          
          {/* Outer Ripple Effect */}
          <m.div
            animate={{ 
              scale: [1, 1.5],
              opacity: [0.3, 0],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeOut"
            }}
            className="absolute inset-0 bg-[#1d4ed8]/10 rounded-[2rem] z-[-1]"
          />
        </m.div>

        {/* Loading Text */}
        <div className="space-y-3 text-center">
          <m.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[11px] font-black uppercase tracking-[0.4em] text-[#0f172a] ml-1"
          >
            Securing Profile
          </m.h2>
          <m.div 
            initial={{ width: 0 }}
            animate={{ width: 40 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
            className="h-0.5 bg-[#1d4ed8] mx-auto rounded-full"
          />
        </div>
      </div>

      {/* Footer Branded Note */}
      <div className="absolute bottom-12 flex flex-col items-center gap-2">
         <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#94a3b8]">Verified Service Directory</span>
      </div>
    </div>
  )
}
