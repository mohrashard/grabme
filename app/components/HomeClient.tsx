'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { m, useScroll, useTransform, type Variants } from 'framer-motion'
import {
  Search,
  MessageCircle,
  ShieldCheck,
  Zap,
  Droplet,
  Wind,
  Wrench,
  Hammer,
  ChevronRight,
  ArrowRight,
  Star,
  CheckCircle2,
  Menu,
  X,
  Smartphone,
  Paintbrush,
  Camera,
  Sparkles
} from 'lucide-react'
import { getAdminContactAction } from '../actions/getAdminContactAction'
import Footer from './Footer'

// ─── Services on the orbit ───────────────────────────────────
const orbitServices = [
  { label: 'Electrical', icon: Zap, angle: 0 },
  { label: 'Plumbing', icon: Droplet, angle: 60 },
  { label: 'AC Repair', icon: Wind, angle: 120 },
  { label: 'Carpentry', icon: Hammer, angle: 180 },
  { label: 'Masonry', icon: Wrench, angle: 240 },
  { label: 'Cleaning', icon: ShieldCheck, angle: 300 },
]

const proAvatarColors = [
  '#4F46E5', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0284C7'
]

// ─── Stat counters (Replaced fake numbers with MVP Facts) ────
const stats = [
  { value: '100%', label: 'NIC Verified' },
  { value: 'Rs. 0', label: 'Platform Fees' },
  { value: 'Direct', label: 'WhatsApp Chat' },
  { value: 'Colombo', label: 'Starting District' },
]

// ─── Feature bento cards ─────────────────────────────────────
const features = [
  {
    icon: ShieldCheck,
    title: 'Safety First',
    desc: 'Every worker must provide their NIC and photo before joining the platform.',
    span: 'md:col-span-1',
  },
  {
    icon: Search,
    title: 'Find Them Fast',
    desc: 'Search by your city and find the right baas (worker) in seconds.',
    span: 'md:col-span-1',
  },
  {
    icon: MessageCircle,
    title: 'Direct WhatsApp',
    desc: 'No apps to download. Click a button and chat with them on WhatsApp directly.',
    span: 'md:col-span-1',
  },
  {
    icon: Star,
    title: 'Pay Them Directly',
    desc: 'We don\'t take commissions. Agree on a price and pay the worker directly in cash.',
    span: 'md:col-span-1',
  },
]

// ─── Animation variants ───────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as any } },
}
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

// ─── Orbit Component ──────────────────────────────────────────
function OrbitRing({
  radius,
  duration,
  services,
  reverse = false,
}: {
  radius: number
  duration: number
  services: typeof orbitServices
  reverse?: boolean
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <m.div
      className="absolute inset-0 m-auto rounded-full border border-white/20"
      style={{ width: radius * 2, height: radius * 2, top: '50%', left: '50%', marginLeft: -radius, marginTop: -radius }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    >
      {services.map((svc, i) => {
        const angleRad = (svc.angle * Math.PI) / 180
        const x = radius + radius * Math.cos(angleRad) - 28
        const y = radius + radius * Math.sin(angleRad) - 28
        const Icon = svc.icon
        return (
          <m.div
            key={i}
            className="absolute w-14 h-14 rounded-2xl bg-white border border-[#e2e8f0] flex items-center justify-center shadow-xl"
            style={{ left: x, top: y }}
            animate={{ rotate: reverse ? 360 : -360 }}
            transition={{ duration, repeat: Infinity, ease: 'linear' }}
            whileHover={{ scale: 1.2, backgroundColor: 'rgba(79,70,229,0.3)' }}
          >
            <Icon className="w-5 h-5 text-[#1d4ed8]" />
            <span className="sr-only">{svc.label}</span>
          </m.div>
        )
      })}
    </m.div>
  )
}

// ─── Main Component ───────────────────────────────────────────
export default function HomeClient() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen font-sans overflow-x-hidden selection:bg-[#1d4ed8] selection:text-white" style={{ background: '#f1f5f9', color: '#0f172a' }}>
      
      {/* ════════════════════════════════════════
                NAV
            ════════════════════════════════════════ */}
      <nav
        className="fixed top-0 w-full z-50 transition-all duration-500 bg-white/95 backdrop-blur-sm border-b border-[#e2e8f0] shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-[#e2e8f0] shadow-md transition-transform duration-500 group-hover:scale-110">
              <Image src="/grabme.png" alt="Grab Me Sri Lanka Logo" fill priority className="object-cover" />
            </div>
            <span className="text-[#1d4ed8] text-lg font-bold tracking-tight transition-colors">Grab Me</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10 text-sm text-[#334155] font-medium transition-colors">
            <a href="#services" className="hover:text-[#1d4ed8] transition-colors duration-300">Services</a>
            <a href="#how-it-works" className="hover:text-[#1d4ed8] transition-colors duration-300">How It Works</a>
            <a href="#about" className="hover:text-[#1d4ed8] transition-colors duration-300">About Us</a>
            <Link href="/login" className="hover:text-[#1d4ed8] transition-colors duration-300">Partner Login</Link>
            <Link href="/register" className="hover:text-[#1d4ed8] transition-colors duration-300">Join as Worker</Link>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/browse"
              className="px-6 py-2.5 bg-[#1d4ed8] text-white hover:bg-[#1e3a8a] rounded-lg font-semibold shadow-sm hover:shadow-md transition-all text-sm"
            >
              Find a Worker
            </Link>
          </div>

          {/* Mobile burger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[#0f172a] lg:hidden p-2 text-right" aria-label="Toggle Menu">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden px-6 pb-6 pt-4 flex flex-col gap-2 bg-white border-t border-[#e2e8f0] shadow-lg"
          >
            <a href="#services" onClick={() => setMobileOpen(false)} className="text-[#0f172a] hover:text-[#1d4ed8] hover:bg-[#f1f5f9] rounded-lg px-4 py-3 transition-colors">Services</a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-[#0f172a] hover:text-[#1d4ed8] hover:bg-[#f1f5f9] rounded-lg px-4 py-3 transition-colors">How It Works</a>
            <a href="#about" onClick={() => setMobileOpen(false)} className="text-[#0f172a] hover:text-[#1d4ed8] hover:bg-[#f1f5f9] rounded-lg px-4 py-3 transition-colors">About Us</a>
            <Link href="/login" onClick={() => setMobileOpen(false)} className="text-[#0f172a] hover:text-[#1d4ed8] hover:bg-[#f1f5f9] rounded-lg px-4 py-3 transition-colors">Partner Login</Link>
            <Link href="/register" onClick={() => setMobileOpen(false)} className="text-[#0f172a] hover:text-[#1d4ed8] hover:bg-[#f1f5f9] rounded-lg px-4 py-3 transition-colors">Join as Worker</Link>
            <Link href="/browse" onClick={() => setMobileOpen(false)} className="mt-4 text-center bg-[#1d4ed8] text-white w-full rounded-xl font-semibold py-3 hover:bg-[#1e3a8a] transition-colors">Find a Worker</Link>
          </m.div>
        )}
      </nav>

      {/* ════════════════════════════════════════
                HERO SECTION
            ════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[90svh] flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)' }}
      >
        {/* Background glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
            style={{ background: 'radial-gradient(circle, #4F46E5 0%, transparent 70%)' }} />
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]"
            style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[300px] opacity-10 blur-[80px]"
            style={{ background: 'radial-gradient(ellipse, #4F46E5 0%, transparent 70%)' }} />
          {/* Grid dots */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />
        </div>

        <m.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-24 pb-16 w-full"
        >
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

            {/* ── Left: Text ── */}
            <m.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="flex-1 space-y-8 text-center lg:text-left"
            >
              {/* Badge */}
              <m.div variants={fadeUp} className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur text-white mx-auto lg:mx-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#93c5fd]"></span>
                </span>
                <span className="text-[11px] font-bold uppercase tracking-widest">Sri Lanka&apos;s Trusted Network</span>
              </m.div>

              {/* Headline */}
              <m.h1
                variants={fadeUp}
                className="text-[2.75rem] leading-[1.1] md:text-7xl lg:text-[5.5rem] font-black text-white"
              >
                Find Verified
                <br />
                <span className="text-[#93c5fd] drop-shadow-sm">Home Workers</span>
                <br />
                Instantly.
              </m.h1>

              {/* Sub */}
              <m.p variants={fadeUp} className="text-lg text-[#bfdbfe] font-medium max-w-xl leading-relaxed mx-auto lg:mx-0">
                Hire verified plumbers, electricians, and AC technicians in Colombo and across Sri Lanka. NIC checked for your safety. Chat directly on WhatsApp. No middlemen.
              </m.p>

              {/* CTA buttons */}
              <m.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/browse"
                  className="group flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm font-bold text-[#1d4ed8] bg-white transition-all duration-300 hover:scale-105 hover:bg-[#dbeafe] hover:text-[#1e3a8a] shadow-lg shadow-black/10"
                >
                  Find a Worker Now
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm font-bold text-white border-2 border-white hover:bg-white hover:text-[#1d4ed8] transition-all duration-300"
                >
                  Register as a Worker
                </Link>
              </m.div>
              <p className="text-[#93c5fd] text-sm text-center mt-4 font-medium tracking-wide">
                🇱🇰 Built for Sri Lanka
              </p>

              {/* Social proof strip */}
              <m.div variants={fadeUp} className="flex items-center gap-4 justify-center lg:justify-start pt-2">
                <div className="flex -space-x-3">
                  {proAvatarColors.slice(0, 4).map((c, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-[#1e3a8a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: c }}>
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                  ))}
                </div>
                <div className="text-[#bfdbfe] text-sm font-medium">
                  <span className="text-white font-bold tracking-wide">100% Identity Verified</span>
                </div>
              </m.div>
            </m.div>

            {/* ── Right: Orbit Visual ── */}
              <m.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 relative flex items-center justify-center scale-[0.65] sm:scale-75 md:scale-90 lg:scale-100"
                style={{ minHeight: 380 }}
              >
              {/* Outer orbit ring */}
              <OrbitRing radius={200} duration={28} services={orbitServices.slice(0, 3)} />
              {/* Inner orbit ring */}
              <OrbitRing radius={130} duration={18} services={orbitServices.slice(3)} reverse />

              {/* Center hub */}
              <div className="relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center text-center border border-[#e2e8f0] shadow-xl backdrop-blur-xl"
                style={{ background: 'rgba(255,255,255,0.8)' }}
              >
                <ShieldCheck className="w-10 h-10 text-[#1d4ed8] mb-2" />
                <div className="text-[11px] text-[#475569] font-bold uppercase tracking-widest mt-1">Verified<br />Network</div>
              </div>

              {/* Floating label chips */}
              <m.div
                className="absolute bottom-4 left-0 md:bottom-8 md:left-4 bg-indigo-600 text-white text-[10px] md:text-sm font-semibold px-4 py-2 rounded-full shadow-xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                ✓ NIC Checked
              </m.div>
              <m.div
                className="absolute top-4 right-0 md:top-12 md:right-0 text-[10px] md:text-sm font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2"
                style={{ background: '#ffffff', color: '#1d4ed8', border: '1px solid #e2e8f0' }}
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <MessageCircle className="w-4 h-4 text-green-400" /> WhatsApp Ready
              </m.div>
            </m.div>
          </div>
        </m.div>
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
                STATS ROW
            ════════════════════════════════════════ */}
      <section style={{ background: '#ffffff' }} className="py-24 px-6 lg:px-12 border-b border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <m.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-center space-y-4 p-8 rounded-2xl border border-[#e2e8f0] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#1d4ed8]" />
              <div className="text-4xl lg:text-5xl font-black text-[#1d4ed8]">{s.value}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#334155]">{s.label}</div>
            </m.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
                SERVICES — BENTO GRID
            ════════════════════════════════════════ */}
      <section id="services" className="py-28 lg:py-40 px-6 lg:px-12" style={{ background: '#f1f5f9' }}>
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <m.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-20">
            <m.span variants={fadeUp} className="text-xs font-bold uppercase tracking-widest block mb-5" style={{ color: '#1d4ed8' }}>
              Our Services
            </m.span>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <m.h2 variants={fadeUp} className="text-4xl lg:text-7xl font-black text-[#0f172a]">
                Find the <br /><span className="text-[#334155]">Right Professional.</span>
              </m.h2>
              <m.p variants={fadeUp} className="text-base text-[#334155] max-w-sm font-medium leading-relaxed lg:text-right">
                We connect you with verified professionals for home repairs. Hire an electrician, plumber, or AC technician in Sri Lanka today.
              </m.p>
            </div>
          </m.div>

          {/* Bento Grid */}
          <m.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-4 gap-5">

            {/* Hero Card — Electrical */}
            <m.div variants={fadeUp}
              className="md:col-span-2 group relative overflow-hidden rounded-[2rem] p-10 flex flex-col justify-between bg-white border border-[#e2e8f0] hover:bg-[#eff6ff] hover:border-[#1d4ed8]"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.4 }}
            >
              <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at top right, #4F46E5 0%, transparent 60%)' }} />
              <div className="relative z-10 space-y-5">
                <div className="w-14 h-14 rounded-2xl border border-[#e2e8f0] bg-[#dbeafe] flex items-center justify-center transition-all duration-300">
                  <Zap className="w-6 h-6 text-[#1d4ed8]" />
                </div>
                <h3 className="text-4xl font-black text-[#0f172a]">Electrician</h3>
                <p className="text-[#64748b] font-medium max-w-sm">House wiring, DB board repairs, light fittings, and finding electrical faults safely. Top-rated electricians in Colombo.</p>
              </div>
              <div className="relative z-10 flex items-center justify-between mt-8">
                <Link href="/browse?service=Electrician" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1d4ed8] hover:text-[#1e40af] transition-colors">
                  Browse Electricians <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </m.div>

            {/* AC Repair Card */}
            <m.div variants={fadeUp}
              className="group relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-between bg-white border border-[#e2e8f0] shadow-sm hover:shadow-md hover:border-[#3b82f6] hover:-translate-y-0.5 transition-all duration-400"
              whileHover={{ scale: 1.01 }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 opacity-5 blur-2xl rounded-full"
                style={{ background: '#1d4ed8' }} />
              <div className="space-y-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl border border-[#e2e8f0] bg-[#dbeafe] flex items-center justify-center transition-all">
                  <Wind className="w-6 h-6 text-[#1d4ed8]" />
                </div>
                <h3 className="text-2xl font-black text-[#0f172a]">AC Repair<br />& Service</h3>
                <p className="text-[#64748b] text-sm font-medium">Standard AC cleaning, fixing water leaks, and gas refilling in Sri Lanka.</p>
              </div>
              <Link href="/browse?service=AC Repair" className="relative z-10 mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#475569] group-hover:text-[#1d4ed8] transition-colors">
                Browse <ChevronRight className="w-4 h-4" />
              </Link>
            </m.div>

            {/* Plumbing */}
            <m.div variants={fadeUp}
              className="group relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-between bg-white border border-[#e2e8f0] shadow-sm hover:shadow-md hover:border-[#3b82f6] hover:-translate-y-0.5 transition-all duration-400"
              whileHover={{ scale: 1.01 }}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl border border-[#e2e8f0] bg-[#dbeafe] flex items-center justify-center transition-all">
                  <Droplet className="w-5 h-5 text-[#1d4ed8]" />
                </div>
                <h3 className="text-xl font-black text-[#0f172a]">Plumber</h3>
                <p className="text-sm font-medium text-[#64748b]">Fixing leaking pipes, tap replacements, and water motor repairs. Find a plumber near you.</p>
              </div>
              <Link href="/browse?service=Plumber" className="text-xs font-bold uppercase tracking-widest mt-4 flex items-center gap-1 text-[#1d4ed8]">Find Plumbers <ChevronRight className="w-3 h-3" /></Link>
            </m.div>

            {/* Carpenter */}
            <m.div variants={fadeUp}
              className="group relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-between bg-white border border-[#e2e8f0] shadow-sm hover:shadow-md hover:border-[#3b82f6] hover:-translate-y-1 transition-all duration-400"
              whileHover={{ scale: 1.01 }}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl border border-[#e2e8f0] bg-[#dbeafe] flex items-center justify-center transition-all">
                  <Hammer className="w-5 h-5 text-[#1d4ed8]" />
                </div>
                <h3 className="text-xl font-black text-[#0f172a]">Carpenter</h3>
                <p className="text-sm font-medium text-[#64748b]">Door lock fixing, furniture repair, and general house woodwork across Sri Lanka.</p>
              </div>
              <Link href="/browse?service=Carpenter" className="text-xs font-bold uppercase tracking-widest mt-4 flex items-center gap-1 text-[#1d4ed8]">Find Carpenters <ChevronRight className="w-3 h-3" /></Link>
            </m.div>

            {/* Painter */}
            <m.div variants={fadeUp}
              className="group relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-between bg-white border border-[#e2e8f0] shadow-sm hover:shadow-md hover:border-[#3b82f6] hover:-translate-y-1 transition-all duration-400"
              whileHover={{ scale: 1.01 }}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl border border-[#e2e8f0] bg-[#dbeafe] flex items-center justify-center transition-all">
                  <Paintbrush className="w-5 h-5 text-[#1d4ed8]" />
                </div>
                <h3 className="text-xl font-black text-[#0f172a]">Painter</h3>
                <p className="text-sm font-medium text-[#64748b]">Interior wall painting, decorative finishes, and professional house painting services.</p>
              </div>
              <Link href="/browse?service=Painter" className="text-xs font-bold uppercase tracking-widest mt-4 flex items-center gap-1 text-[#1d4ed8]">Find Painters <ChevronRight className="w-3 h-3" /></Link>
            </m.div>

            {/* Mason */}
            <m.div variants={fadeUp}
              className="group relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-between bg-white border border-[#e2e8f0] shadow-sm hover:shadow-md hover:border-[#3b82f6] hover:-translate-y-1 transition-all duration-400"
              whileHover={{ scale: 1.01 }}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl border border-[#e2e8f0] bg-[#dbeafe] flex items-center justify-center transition-all">
                  <Hammer className="w-5 h-5 text-[#1d4ed8]" />
                </div>
                <h3 className="text-xl font-black text-[#0f172a]">Mason</h3>
                <p className="text-sm font-medium text-[#64748b]">Concrete work, bricklaying, wall repairs, and bathroom renovations in Sri Lanka.</p>
              </div>
              <Link href="/browse?service=Mason" className="text-xs font-bold uppercase tracking-widest mt-4 flex items-center gap-1 text-[#1d4ed8]">Find Masons <ChevronRight className="w-3 h-3" /></Link>
            </m.div>

            {/* CCTV */}
            <m.div variants={fadeUp}
              className="group relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-between bg-white border border-[#e2e8f0] shadow-sm hover:shadow-md hover:border-[#3b82f6] hover:-translate-y-1 transition-all duration-400"
              whileHover={{ scale: 1.01 }}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl border border-[#e2e8f0] bg-[#dbeafe] flex items-center justify-center transition-all">
                  <Camera className="w-5 h-5 text-[#1d4ed8]" />
                </div>
                <h3 className="text-xl font-black text-[#0f172a]">CCTV & Security</h3>
                <p className="text-sm font-medium text-[#64748b]">Security camera installation, DVR setup, and door intercoms. Verified security techs.</p>
              </div>
              <Link href="/browse?service=CCTV %26 Security" className="text-xs font-bold uppercase tracking-widest mt-4 flex items-center gap-1 text-[#1d4ed8]">Find Techs <ChevronRight className="w-3 h-3" /></Link>
            </m.div>

            {/* Cleaning */}
            <m.div variants={fadeUp}
              className="group relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-between bg-white border border-[#e2e8f0] shadow-sm hover:shadow-md hover:border-[#3b82f6] hover:-translate-y-1 transition-all duration-400"
              whileHover={{ scale: 1.01 }}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl border border-[#e2e8f0] bg-[#dbeafe] flex items-center justify-center transition-all">
                  <Sparkles className="w-5 h-5 text-[#1d4ed8]" />
                </div>
                <h3 className="text-xl font-black text-[#0f172a]">Cleaning</h3>
                <p className="text-sm font-medium text-[#64748b]">Full house cleaning, sofa shampooing, and water tank washing in Sri Lanka.</p>
              </div>
              <Link href="/browse?service=Cleaning" className="text-xs font-bold uppercase tracking-widest mt-4 flex items-center gap-1 text-[#1d4ed8]">Find Cleaners <ChevronRight className="w-3 h-3" /></Link>
            </m.div>

            {/* CTA / Stats Dark Card */}
            <m.div variants={fadeUp}
              className="md:col-span-3 group relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-center items-center text-center py-12"
              style={{ background: '#1d4ed8', minHeight: 300 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 30% 70%, #ffffff, transparent 60%)' }} />
              <div className="relative z-10 space-y-4 max-w-lg">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 shadow-xl">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-black text-white">Direct WhatsApp</div>
                <p className="text-white/80 text-base font-medium px-4">No middle-men or hidden commissions. Tap the button on any worker&apos;s profile to chat and agree on a price directly.</p>
              </div>
            </m.div>

          </m.div>

          {/* More Services Pill Row */}
          <div className="mt-16 pt-12 border-t border-black/5">
            <m.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex flex-col items-center gap-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#475569]/30">More Services We Offer in Sri Lanka</span>
              <div className="flex flex-wrap justify-center gap-3">
                {['Tiling', 'Welding', 'Aluminium & Glass', 'Gardening', 'Roofing', 'Pest Control', 'Baas'].map((item, i) => (
                  <div key={i} className="px-5 py-2 rounded-full border border-[#e2e8f0] text-xs font-semibold text-[#475569] transition-colors hover:border-[#1d4ed8] hover:text-[#1d4ed8] cursor-default">
                    {item}
                  </div>
                ))}
              </div>
              <button
                onClick={async () => {
                  const { url } = await getAdminContactAction("Hi Grab Me, I don't see my service listed. Can you help?");
                  window.open(url, '_blank');
                }}
                className="mt-4 flex items-center gap-2 text-sm font-bold text-[#0f172a] transition-all hover:text-[#1d4ed8] group"
              >
                Don&apos;t see your problem? Chat with us on WhatsApp
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </m.div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════
                HOW IT WORKS
            ════════════════════════════════════════ */}
      <section id="how-it-works" className="py-28 lg:py-40 px-6 lg:px-12" style={{ background: '#ffffff' }}>
        <div className="max-w-7xl mx-auto">
          <m.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-20 text-center">
            <m.span variants={fadeUp} className="text-xs font-bold uppercase tracking-widest block mb-5" style={{ color: '#1d4ed8' }}>Simple Process</m.span>
            <m.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-black text-[#0f172a]">
              Three Steps.<br />Job Done.
            </m.h2>
          </m.div>

          <m.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6 lg:gap-10">
            {[
              { step: '01', icon: Search, title: 'Find a Worker', desc: 'Select the service you need (like Plumber) and choose your city in Sri Lanka.' },
              { step: '02', icon: MessageCircle, title: 'Chat on WhatsApp', desc: 'Click the button to open WhatsApp. Send them a message or photo of the problem.' },
              { step: '03', icon: CheckCircle2, title: 'Get it Fixed', desc: 'Agree on the price with the worker, get your home fixed, and pay them directly in cash.' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <m.div key={i} variants={fadeUp}
                  className="group relative rounded-[2rem] p-8 border border-[#e2e8f0] bg-white transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#1d4ed8] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#1d4ed8] text-white shadow-lg transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-7xl font-black text-[#1d4ed8] opacity-10">{item.step}</span>
                  </div>
                  <h3 className="text-2xl font-black mb-3 text-[#0f172a]">{item.title}</h3>
                  <p className="text-[#334155] font-medium leading-relaxed">{item.desc}</p>
                </m.div>
              )
            })}
          </m.div>

          <m.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-16 flex justify-center">
            <m.div variants={fadeUp}>
              <Link
                href="/how-it-works"
                className="group flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-[#1e40af]"
                style={{ background: '#1d4ed8' }}
              >
                Read Detailed Guide
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </m.div>
          </m.div>

        </div>
      </section>

      {/* ════════════════════════════════════════
                FEATURE PILLS ROW
            ════════════════════════════════════════ */}
      <section className="py-20 px-6 lg:px-12" style={{ background: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <m.div key={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="group rounded-2xl p-6 border border-[#e2e8f0] bg-white shadow-sm transition-all duration-400 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 bg-[#dbeafe] text-[#1d4ed8]">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-black text-base mb-1 text-[#0f172a]">{f.title}</h4>
                <p className="text-xs text-[#334155] font-medium leading-relaxed">{f.desc}</p>
              </m.div>
            )
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════
                PHILOSOPHY / ABOUT
            ════════════════════════════════════════ */}
      <section id="about" className="py-28 lg:py-40 px-6 lg:px-12" style={{ background: '#ffffff' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Text */}
            <m.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-8">
              <m.span variants={fadeUp} className="text-xs font-bold uppercase tracking-widest block" style={{ color: '#1d4ed8' }}>Our Mission in Sri Lanka</m.span>
              <m.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-black leading-tight text-[#0f172a]">
                A Simpler Way to<br />Find Good Workers.
              </m.h2>
              <m.div variants={fadeUp} className="space-y-5 text-base text-[#475569] font-medium leading-relaxed">
                <p>Finding a reliable baas shouldn&apos;t be hard. We built Grab Me to connect you directly with verified professionals in your area.</p>
                <p>We are not an agency. We don&apos;t take a cut of the worker&apos;s pay. We are simply a directory that makes sure everyone listed has provided their National Identity Card (NIC) so you can feel safe letting them into your home.</p>
                <p>Just click, chat, and get your home fixed reliably across Colombo, Gampaha, and beyond.</p>
              </m.div>
              <m.div variants={fadeUp}>
                <Link href="/register"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-[#1e40af]"
                  style={{ background: '#1d4ed8' }}
                >
                  Register as a Worker <ArrowRight className="w-4 h-4" />
                </Link>
              </m.div>
            </m.div>

            {/* Stats visual */}
            <m.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-2 gap-5"
            >
              {[
                { label: 'Verified Identity', value: 'NIC', bg: '#ffffff', text: '#1d4ed8', subColor: '#475569', border: '1px solid #e2e8f0' },
                { label: 'App Downloads', value: 'Zero', bg: '#1d4ed8', text: '#fff', subColor: 'rgba(255,255,255,0.6)' },
                { label: 'Hidden Fees', value: 'None', bg: '#f8fafc', text: '#0f172a', subColor: '#475569', border: '1px solid #e2e8f0' },
                { label: 'Platform Use', value: 'Free', bg: '#ffffff', text: '#1d4ed8', subColor: '#475569', border: '1px solid #e2e8f0' },
              ].map((s, i) => (
                <div key={i} className="rounded-[1.5rem] p-8 flex flex-col justify-end" style={{ background: s.bg, border: s.border, minHeight: 180 }}>
                  <div className="text-4xl font-black" style={{ color: s.text }}>{s.value}</div>
                  <div className="text-xs font-bold uppercase tracking-widest mt-2" style={{ color: s.subColor }}>{s.label}</div>
                </div>
              ))}
            </m.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
                THE GRAB ME STANDARD
            ════════════════════════════════════════ */}
      <section className="py-20 px-6 lg:px-12" style={{ background: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto">
          <m.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-14 text-center">
            <m.span variants={fadeUp} className="text-xs font-bold uppercase tracking-widest block mb-4" style={{ color: '#1d4ed8' }}>The Grab Me Standard</m.span>
            <m.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-black text-[#0f172a]">Why Homeowners Trust Us</m.h2>
          </m.div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { title: 'Safe for Your Family', review: 'Unlike random Facebook groups, every worker on our platform is identity-verified before they can list their services.', color: '#ffffff', border: '#e2e8f0', textColor: '#0f172a', pColor: '#334155' },
              { title: 'No Hidden Charges', review: 'Because we don\'t take a commission, workers don\'t have to overcharge you to cover platform fees. You get a fair market price.', color: '#1d4ed8', border: '#1d4ed8', textColor: '#ffffff', pColor: '#dbeafe' },
              { title: 'Faster Communication', review: 'Direct WhatsApp chatting means you can instantly send a photo or video of your broken AC or pipe so the worker knows exactly what to bring.', color: '#ffffff', border: '#e2e8f0', textColor: '#0f172a', pColor: '#334155' },
            ].map((t, i) => (
              <m.div key={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="rounded-[1.5rem] p-8 flex flex-col justify-between border shadow-sm"
                style={{ background: t.color, borderColor: t.border, minHeight: 220 }}
              >
                <div>
                  <div className="font-bold text-lg mb-2" style={{ color: t.textColor }}>{t.title}</div>
                  <p className="font-medium leading-relaxed text-sm" style={{ color: t.pColor }}>{t.review}</p>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <ShieldCheck className={`w-5 h-5 ${t.color === '#1d4ed8' ? 'text-white/40' : 'text-[#1d4ed8]'}`} />
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
                CTA BANNER
            ════════════════════════════════════════ */}
      <section className="py-28 lg:py-40 px-6 lg:px-12 overflow-hidden relative" style={{ background: '#ffffff' }}>
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(29,78,216,0.05) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <m.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto text-center space-y-10"
        >
          <m.h2 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-black text-[#0f172a]">
            Ready to fix<br /><span className="text-[#1d4ed8]">Your Home?</span>
          </m.h2>
          <m.p variants={fadeUp} className="text-lg text-[#475569] font-medium max-w-lg mx-auto">
            Search our directory and find a verified professional in Sri Lanka near you today.
          </m.p>
          <m.div variants={fadeUp} className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/browse"
              className="group flex items-center justify-center gap-3 px-10 py-5 rounded-full text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-[#1e40af]"
              style={{ background: '#1d4ed8' }}
            >
              Find a Worker Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/register"
              className="flex items-center justify-center gap-3 px-10 py-5 rounded-full text-sm font-bold text-[#1d4ed8] border border-[#d8d8d8] hover:border-[#1d4ed8] transition-all duration-300"
            >
              Register as a Worker
            </Link>
          </m.div>
        </m.div>
      </section>

    <Footer />
    </div>
  )
}
