'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { m } from 'framer-motion'
import {
  Search,
  MessageCircle,
  ShieldCheck,
  Zap,
  Droplet,
  Wind,
  Hammer,
  ChevronRight,
  ArrowRight,
  Paintbrush,
  Camera,
  Sparkles,
  MapPin,
  User,
  Home,
  BookOpen,
  Wrench
} from 'lucide-react'
import { getAdminContactAction } from '../actions/getAdminContactAction'
import { TRADES as STATIC_TRADES, SEARCH_ALIASES as STATIC_ALIASES, TRADE_SUB_SKILLS as STATIC_SUB_SKILLS } from '../register/constants'
import { type TaxonomyData } from '../lib/taxonomyActions'

// ─── Service Categories (Dashboard Grid) ──────────────────────
// Labels are for display, query matches canonical TRADE_SUB_SKILLS in app/register/constants.ts
const services = [
  { label: 'Electrical', sinhala: 'විදුලි', query: 'Electrician (වයරින් බාස්)', icon: Zap },
  { label: 'Plumbing', sinhala: 'ජලනල', query: 'Plumber (බට බාස් / ප්ලම්බර්)', icon: Droplet },
  { label: 'AC & Fridge', sinhala: 'ඒසී / ෆ්රිජ්', query: 'AC & Fridge Repair (ඒසී / ෆ්‍රිජ් වැඩ)', icon: Wind },
  { label: 'Carpenter', sinhala: 'වඩු වැඩ', query: 'Carpenter (වඩු බාස්)', icon: Hammer },
  { label: 'Mason', sinhala: 'මේසන්', query: 'Mason (මේසන් බාස්)', icon: Hammer },
  { label: 'Cleaning', sinhala: 'පිරිසිදු කිරීම', query: 'Cleaner / Helper (ක්ලීනර් / අත් උදව්කරුවන්)', icon: Sparkles },
  { label: 'Painter', sinhala: 'පේන්ට්', query: 'Painter (පේන්ට් බාස්)', icon: Paintbrush },
  { label: 'Welding', sinhala: 'යකඩ වැඩ', query: 'Welder (වැල්ඩින් / යකඩ වැඩ)', icon: Wrench },
]

const proAvatarColors = [
  '#4F46E5', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0284C7'
]

// ─── Main Component ───────────────────────────────────────────
interface HomeClientProps {
  taxonomy: TaxonomyData | null;
}

export default function HomeClient({ taxonomy }: HomeClientProps) {
  const router = useRouter()
  const [userLocation, setUserLocation] = useState('Locating...')
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Build a flat list of suggestion candidates from taxonomy + statics
  const allTrades = (taxonomy?.services?.map(s => s.name)) || STATIC_TRADES
  const allAliases = taxonomy?.keywordMap || STATIC_ALIASES
  const allSubSkills = (taxonomy?.skillsByService)
    ? Object.entries(taxonomy.skillsByService).flatMap(([trade, skills]) => skills.map(s => ({ label: s.name, trade })))
    : Object.entries(STATIC_SUB_SKILLS).flatMap(([trade, skills]) => skills.map(s => ({ label: s, trade })))

  // Compute live suggestions whenever query changes
  const suggestions = useCallback(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []

    const results: { label: string; canonical: string; type: 'service' | 'skill' | 'alias' }[] = []
    const seen = new Set<string>()

    // 1. Direct trade matches
    allTrades.forEach(trade => {
      // Extract the human-friendly part before the parenthesis for display
      const displayLabel = trade.split('(')[0].trim()
      if (trade.toLowerCase().includes(q) && !seen.has(trade)) {
        results.push({ label: displayLabel, canonical: trade, type: 'service' })
        seen.add(trade)
      }
    })

    // 2. Alias matches (show the trade they map to)
    Object.entries(allAliases).forEach(([alias, trades]) => {
      if (alias.toLowerCase().includes(q)) {
        const canonical = trades[0]
        if (!seen.has(canonical)) {
          const displayLabel = canonical.split('(')[0].trim()
          results.push({ label: displayLabel, canonical, type: 'alias' })
          seen.add(canonical)
        }
      }
    })

    // 3. Sub-skill matches
    allSubSkills.forEach(({ label, trade }) => {
      if (label.toLowerCase().includes(q) && !seen.has(trade + label)) {
        const tradeDisplay = trade.split('(')[0].trim()
        results.push({ label: label.split('(')[0].trim(), canonical: trade, type: 'skill' })
        seen.add(trade + label)
      }
    })

    return results.slice(0, 7) // max 7 suggestions
  }, [searchQuery, allTrades, allAliases, allSubSkills])

  const liveSuggestions = suggestions()

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSuggestionClick = (canonical: string) => {
    setSearchQuery('')
    setShowSuggestions(false)
    router.push(`/browse?service=${encodeURIComponent(canonical)}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const rawQuery = searchQuery.trim()
    if (!rawQuery) return

    const lowerQuery = rawQuery.toLowerCase()

    // 1. SMART MATCH: Case-insensitive match against canonical trades
    // Use dynamic taxonomy first, fallback to static
    const trades = (taxonomy?.services?.map(s => s.name)) || STATIC_TRADES
    const tradeMatch = trades.find(t => t.toLowerCase().includes(lowerQuery))
    if (tradeMatch) {
      router.push(`/browse?service=${encodeURIComponent(tradeMatch)}`)
      return
    }

    // 2. ALIAS MATCH: Check common terms (e.g., 'leak', 'water')
    // Use dynamic keywordMap first
    const aliases = taxonomy?.keywordMap || STATIC_ALIASES
    const aliasKey = Object.keys(aliases).find(key => lowerQuery.includes(key.toLowerCase()))
    if (aliasKey) {
      const canonicalTrade = aliases[aliasKey][0]
      router.push(`/browse?service=${encodeURIComponent(canonicalTrade)}`)
      return
    }

    // 3. SUB-SKILL MATCH: Search inside skill arrays
    const subSkillsMap = (taxonomy?.skillsByService)
      ? Object.fromEntries(Object.entries(taxonomy.skillsByService).map(([k, v]) => [k, v.map(s => s.name)]))
      : STATIC_SUB_SKILLS

    for (const [trade, skills] of Object.entries(subSkillsMap)) {
      if (skills.some(s => s.toLowerCase().includes(lowerQuery))) {
        router.push(`/browse?service=${encodeURIComponent(trade)}`)
        return
      }
    }

    // 4. FALLBACK: Normal search
    router.push(`/browse?service=${encodeURIComponent(rawQuery)}`)
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation('Colombo')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          const data = await res.json()
          if (data.address) {
            const district = data.address.state_district || data.address.county || data.address.city || "Colombo"
            setUserLocation(district.replace(" District", "").trim())
          } else {
            setUserLocation('Colombo')
          }
        } catch (err) {
          setUserLocation('Colombo')
        }
      },
      () => {
        setUserLocation('Colombo') // fallback if denied or failed
      },
      { timeout: 5000 }
    )
  }, [])

  return (
    <div className="min-h-screen font-sans overflow-x-hidden selection:bg-[#1d4ed8] selection:text-white pb-32" style={{ background: '#f8fafc', color: '#0f172a' }}>

      {/* ════════════════════════════════════════
                MOBILE TOP HEADER
            ════════════════════════════════════════ */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] shadow-sm px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#eff6ff] flex items-center justify-center border border-[#bfdbfe]">
            <MapPin className="w-5 h-5 text-[#1d4ed8]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Current Location</span>
            <span className="text-sm font-black text-[#0f172a] leading-tight">{userLocation}</span>
          </div>
        </div>



        <Link href="/login" className="flex items-center gap-2 rounded-full bg-[#f8fafc] pl-3 pr-1.5 py-1.5 border border-[#e2e8f0] hover:bg-[#e2e8f0] transition-colors shadow-sm">
          <div className="flex flex-col text-right">
            <span className="text-[8px] font-bold text-[#64748b] uppercase tracking-wider leading-none mb-0.5">Partner</span>
            <span className="text-[11px] font-black text-[#0f172a] leading-none">Login</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center border border-[#e2e8f0] shadow-sm">
            <User className="w-3.5 h-3.5 text-[#1d4ed8]" />
          </div>
        </Link>
      </header>

      {/* ════════════════════════════════════════
                DASHBOARD HEADER
            ════════════════════════════════════════ */}
      <section className="bg-white pt-28 pb-12 px-6 border-b border-[#e2e8f0] relative overflow-visible">
        <div className="max-w-4xl mx-auto space-y-8">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-2"
          >
            <p className="text-[#64748b] text-[11px] font-bold uppercase tracking-widest leading-none">
              Welcome to Grab Me
            </p>
            <h1 className="text-3xl md:text-5xl font-black text-[#0f172a] leading-tight">
              What do you need <br />
              help with today?
            </h1>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative group w-full"
          >
            <div className={`absolute -inset-0.5 bg-[#1d4ed8]/10 rounded-[2rem] blur opacity-0 transition-opacity duration-300 ${searchFocused ? 'opacity-100' : ''}`} />
            <div ref={searchContainerRef} className="relative">
              <form onSubmit={handleSearch} className="relative flex items-center bg-white border border-[#e2e8f0] rounded-2xl md:rounded-[2.5rem] py-4 md:py-5 px-6 shadow-sm hover:shadow-md transition-all">
                <Search className="w-5 h-5 text-[#1d4ed8] flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true) }}
                  placeholder="Search for Plumber, Electrician, etc..."
                  className="flex-1 bg-transparent border-none outline-none pl-4 text-sm md:text-base font-medium text-[#0f172a] placeholder:text-[#94a3b8]"
                  onFocus={() => { setSearchFocused(true); setShowSuggestions(true) }}
                  onBlur={() => setSearchFocused(false)}
                  onKeyDown={(e) => e.key === 'Escape' && setShowSuggestions(false)}
                />
                <button
                  type="submit"
                  className="hidden md:flex items-center gap-2 bg-[#1d4ed8] text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-[#1e40af] transition-colors ml-4 shadow-sm"
                >
                  Search
                </button>
              </form>

              {/* LIVE SUGGESTIONS DROPDOWN */}
              {showSuggestions && liveSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e2e8f0] rounded-2xl shadow-xl z-[100] overflow-hidden">
                  {liveSuggestions.map((s, i) => (
                    <button
                      key={i}
                      onMouseDown={() => handleSuggestionClick(s.canonical)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#eff6ff] transition-colors text-left group border-b border-[#f1f5f9] last:border-0"
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${s.type === 'service' ? 'bg-[#dbeafe]' :
                          s.type === 'skill' ? 'bg-[#dcfce7]' : 'bg-[#fef9c3]'
                        }`}>
                        <Search className={`w-3.5 h-3.5 ${s.type === 'service' ? 'text-[#1d4ed8]' :
                            s.type === 'skill' ? 'text-[#16a34a]' : 'text-[#ca8a04]'
                          }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-[#0f172a] truncate block">{s.label}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${s.type === 'service' ? 'text-[#1d4ed8]' :
                            s.type === 'skill' ? 'text-[#16a34a]' : 'text-[#ca8a04]'
                          }`}>
                          {s.type === 'service' ? 'Service' : s.type === 'skill' ? 'Sub-skill' : 'Related'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </m.div>
        </div>
      </section>



      {/* ════════════════════════════════════════
                COMPACT SERVICE GRID
            ════════════════════════════════════════ */}
      <section id="services" className="bg-white py-10 px-6 border-b border-[#f1f5f9]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-4 gap-y-8 gap-x-4">
            {services.map((svc, i) => {
              const Icon = svc.icon
              return (
                <Link
                  key={i}
                  href={`/browse?service=${encodeURIComponent(svc.query)}`}
                  className="flex flex-col items-center gap-3 transition-transform active:scale-95"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center shadow-sm">
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-[#1d4ed8]" />
                  </div>
                  <span className="text-[10px] md:text-xs font-black text-[#0f172a] text-center leading-tight">
                    {svc.label === 'CCTV' ? 'CCTV' : svc.label}
                  </span>
                  <span className="text-[8px] md:text-[9px] font-medium text-[#64748b] mt-0.5 text-center leading-none">
                    {svc.sinhala}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
                TICKER / TRUST BAR
            ════════════════════════════════════════ */}
      <div className="py-6 overflow-hidden border-y bg-[#1e3a8a] border-[#1e3a8a]">
        <div className="flex whitespace-nowrap animate-[ticker_22s_linear_infinite]">
          {[...Array(2)].map((_, r) =>
            ['NIC VERIFIED', 'DIRECT WHATSAPP', 'ZERO COMMISSION', 'NO MIDDLEMEN', 'PAY WORKER DIRECTLY', 'LOCAL PROS', 'COLOMBO', 'GAMPAHA', 'KANDY', 'GALLE'].map((item, i) => (
              <div key={`${r}-${i}`} className="flex items-center gap-4 px-8 flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#93c5fd]" />
                <span className="text-xs font-bold text-[#bfdbfe] uppercase tracking-[0.35em]">{item}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* ════════════════════════════════════════
                PROMO CARDS SLIDER (MOBILE OPTIMIZED)
            ════════════════════════════════════════ */}
      <section className="py-8">
        <div className="flex overflow-x-auto gap-5 px-6 no-scrollbar snap-x snap-mandatory scroll-smooth pb-4">
          {/* Card 1: Safety */}
          <div className="min-w-[88%] md:min-w-[450px] flex-shrink-0 p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white snap-center relative overflow-hidden shadow-xl shadow-blue-500/10 border border-white/10 group active:scale-[0.98] transition-transform">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-8 -translate-y-8 blur-2xl group-hover:bg-white/20 transition-colors" />
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20">
              <ShieldCheck className="w-8 h-8 text-blue-100" />
            </div>
            <h3 className="text-2xl font-black mb-3">Safety First</h3>
            <p className="text-sm text-blue-100/90 font-medium leading-relaxed max-w-[280px]">Every worker provides their NIC and a photo before joining. Your safety is our #1 priority.</p>
          </div>

          {/* Card 2: WhatsApp */}
          <div className="min-w-[88%] md:min-w-[450px] flex-shrink-0 p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 text-white snap-center relative overflow-hidden shadow-xl shadow-green-500/10 border border-white/10 group active:scale-[0.98] transition-transform">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-8 -translate-y-8 blur-2xl group-hover:bg-white/20 transition-colors" />
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20">
              <MessageCircle className="w-8 h-8 text-green-100" />
            </div>
            <h3 className="text-2xl font-black mb-3">Direct WhatsApp</h3>
            <p className="text-sm text-green-100/90 font-medium leading-relaxed max-w-[280px]">No apps to download. Click a button and chat with workers directly on WhatsApp instantly.</p>
          </div>

          {/* Card 3: Zero Commission */}
          <div className="min-w-[88%] md:min-w-[450px] flex-shrink-0 p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-700 text-white snap-center relative overflow-hidden shadow-xl shadow-indigo-500/10 border border-white/10 group active:scale-[0.98] transition-transform">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-8 -translate-y-8 blur-2xl group-hover:bg-white/20 transition-colors" />
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20">
              <ArrowRight className="w-8 h-8 text-indigo-100" />
            </div>
            <h3 className="text-2xl font-black mb-3">Zero Fees</h3>
            <p className="text-sm text-indigo-100/90 font-medium leading-relaxed max-w-[280px]">We don&apos;t take a cut. Negotiate prices directly and pay in cash. Transparent, fair, and fast.</p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
                WHATSAPP SUPPORT CTA
            ════════════════════════════════════════ */}
      <section className="px-6 pb-12">
        <button
          onClick={async () => {
            const { url } = await getAdminContactAction("Hi Grab Me, I need help finding a service.");
            window.open(url, '_blank');
          }}
          className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-white border border-[#e2e8f0] shadow-sm active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#f0fdf4] flex items-center justify-center border border-[#dcfce7]">
              <MessageCircle className="w-6 h-6 text-[#22c55e]" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-sm text-[#0f172a]">Need Help?</h4>
              <p className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider">Chat with Support on WhatsApp</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#94a3b8]" />
        </button>
      </section>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* ════════════════════════════════════════
                MINIMAL APP FOOTER
            ════════════════════════════════════════ */}
      <footer className="py-12 flex flex-col items-center justify-center">
        <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest opacity-60">
          © 2026 Grab Me • v1.0.0
        </p>
      </footer>

      {/* ════════════════════════════════════════
                FIXED BOTTOM NAVIGATION / DESKTOP DOCK
            ════════════════════════════════════════ */}
      <div className="fixed bottom-0 md:bottom-10 w-full md:w-auto md:left-1/2 md:-translate-x-1/2 z-[60] bg-white/80 backdrop-blur-xl border-t md:border border-[#e2e8f0] pb-6 pt-3 px-6 md:px-12 md:py-4 flex justify-around items-center shadow-[0_-4px_25px_rgba(0,0,0,0.05)] md:shadow-2xl md:rounded-[2rem] transition-all duration-500">
        <Link href="/" className="flex flex-col items-center gap-1.5 min-w-[64px] text-[#1d4ed8] group">
          <Home className="w-6 h-6 transition-transform group-hover:scale-110" />
          <span className="text-[11px] font-bold">Home</span>
        </Link>
        <Link href="/browse" className="flex flex-col items-center gap-1.5 min-w-[64px] text-[#64748b] hover:text-[#1d4ed8] transition-colors group">
          <Search className="w-6 h-6 transition-transform group-hover:scale-110" />
          <span className="text-[11px] font-medium">Browse</span>
        </Link>
        <Link href="/how-it-works" className="flex flex-col items-center gap-1.5 min-w-[64px] text-[#64748b] hover:text-[#1d4ed8] transition-colors group">
          <BookOpen className="w-6 h-6 transition-transform group-hover:scale-110" />
          <span className="text-[11px] font-medium">Guide</span>
        </Link>
        <Link href="/register" className="flex flex-col items-center gap-1.5 min-w-[64px] text-[#64748b] hover:text-[#1d4ed8] transition-colors group">
          <Wrench className="w-6 h-6 transition-transform group-hover:scale-110" />
          <span className="text-[11px] font-medium">Join Pro</span>
        </Link>
      </div>
    </div>
  )
}
