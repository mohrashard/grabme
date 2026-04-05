'use client'

import Link from 'next/link'
import { getAdminContactAction } from './actions/getAdminContactAction'
import Image from 'next/image'
import { m, useScroll, useTransform, type Variants } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
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

// ─── Color Palette ───────────────────────────────────────────
// Deep Obsidian:    #090A0F
// Matte Zinc:       #18181B
// Pure White:       #FFFFFF
// Sleek Pearl:      #F8FAFC
// Electric Indigo:  #4F46E5
// Midnight Navy:    #1E293B

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
      className="absolute inset-0 m-auto rounded-full border border-white/10"
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
            className="absolute w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl"
            style={{ left: x, top: y }}
            animate={{ rotate: reverse ? 360 : -360 }}
            transition={{ duration, repeat: Infinity, ease: 'linear' }}
            whileHover={{ scale: 1.2, backgroundColor: 'rgba(79,70,229,0.3)' }}
          >
            <Icon className="w-5 h-5 text-white/80" />
            <span className="sr-only">{svc.label}</span>
          </m.div>
        )
      })}
    </m.div>
  )
}

// ─── Main Component ───────────────────────────────────────────
export default function Home() {
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
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: '#090A0F', color: '#FFFFFF' }}>
      {/* ── GOOGLE FONT ── */}
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                * { font-family: 'Inter', system-ui, sans-serif; }
                ::selection { background: #4F46E5; color: #fff; }
                h1,h2,h3 { letter-spacing: -0.04em; line-height: 1; }
                @keyframes float {
                    0%,100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes pulse-ring {
                    0% { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(1.6); opacity: 0; }
                }
                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .ticker-track { animation: ticker 22s linear infinite; }
                .float-slow { animation: float 6s ease-in-out infinite; }
                .float-medium { animation: float 4.5s ease-in-out infinite 1s; }
                .float-fast { animation: float 3.5s ease-in-out infinite 0.5s; }
                .pulse-ring::after {
                    content: '';
                    position: absolute;
                    inset: -6px;
                    border-radius: 50%;
                    border: 2px solid #4F46E5;
                    animation: pulse-ring 2s ease-out infinite;
                }
                .gradient-text {
                    background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .indigo-gradient-text {
                    background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
            `}</style>

      {/* ════════════════════════════════════════
                NAV
            ════════════════════════════════════════ */}
      <nav
        className="fixed top-0 w-full z-50 transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(9,10,15,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-white/10 shadow-lg transition-transform duration-500 group-hover:scale-110">
              <Image src="/grabme.png" alt="Grab Me" fill className="object-cover" />
            </div>
            <span className="text-white text-lg font-bold tracking-tight">Grab Me</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10 text-sm font-medium text-white/60">
            <a href="#services" className="hover:text-white transition-colors duration-300">Services</a>
            <a href="#how-it-works" className="hover:text-white transition-colors duration-300">How It Works</a>
            <a href="#about" className="hover:text-white transition-colors duration-300">About Us</a>
            <Link href="/login" className="hover:text-white transition-colors duration-300">Login</Link>
            <Link href="/register" className="hover:text-white transition-colors duration-300">Join as Worker</Link>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/browse"
              className="text-sm font-bold text-white px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
              style={{ background: '#4F46E5' }}
            >
              Find a Worker
            </Link>
          </div>

          {/* Mobile burger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-white p-2 text-right">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden px-6 pb-6 flex flex-col gap-4 text-sm font-medium text-white/70"
            style={{ background: '#090A0F' }}
          >
            <a href="#services" onClick={() => setMobileOpen(false)} className="hover:text-white transition-colors py-2 border-b border-white/5">Services</a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="hover:text-white transition-colors py-2 border-b border-white/5">How It Works</a>
            <a href="#about" onClick={() => setMobileOpen(false)} className="hover:text-white transition-colors py-2 border-b border-white/5">About Us</a>
            <Link href="/login" onClick={() => setMobileOpen(false)} className="hover:text-white transition-colors py-2 border-b border-white/5">Login</Link>
            <Link href="/register" onClick={() => setMobileOpen(false)} className="hover:text-white transition-colors py-2 border-b border-white/5">Join as Worker</Link>
            <Link href="/browse" onClick={() => setMobileOpen(false)} className="mt-2 text-center text-white font-bold py-3 rounded-xl" style={{ background: '#4F46E5' }}>Find a Worker</Link>
          </m.div>
        )}
      </nav>

      {/* ════════════════════════════════════════
                HERO SECTION
            ════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #090A0F 0%, #0f0f1a 40%, #1a1025 70%, #090A0F 100%)' }}
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
              <m.div variants={fadeUp} className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mx-auto lg:mx-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-widest">Sri Lanka's Trusted Network</span>
              </m.div>

              {/* Headline */}
              <m.h1
                variants={fadeUp}
                className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-white"
              >
                Find Verified
                <br />
                <span className="indigo-gradient-text">Home Workers</span>
                <br />
                Instantly.
              </m.h1>

              {/* Sub */}
              <m.p variants={fadeUp} className="text-lg text-white/50 font-medium max-w-xl leading-relaxed mx-auto lg:mx-0">
                Book plumbers, electricians, and AC technicians in your area. NIC checked for your safety. Chat directly on WhatsApp. No middlemen.
              </m.p>

              {/* CTA buttons */}
              <m.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/browse"
                  className="group flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(79,70,229,0.5)]"
                  style={{ background: '#4F46E5' }}
                >
                  Find a Worker Now
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm font-bold text-white/70 border border-white/10 hover:border-white/30 hover:text-white transition-all duration-300"
                >
                  Register as a Worker
                </Link>
              </m.div>

              {/* Social proof strip */}
              <m.div variants={fadeUp} className="flex items-center gap-4 justify-center lg:justify-start pt-2">
                <div className="flex -space-x-3">
                  {proAvatarColors.slice(0, 4).map((c, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-[#090A0F] flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: c }}>
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                  ))}
                </div>
                <div className="text-white/50 text-sm">
                  <span className="text-white font-semibold">100%</span> Identity Verified
                </div>
              </m.div>
            </m.div>

            {/* ── Right: Orbit Visual ── */}
            <m.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 relative flex items-center justify-center"
              style={{ minHeight: 480 }}
            >
              {/* Outer orbit ring */}
              <OrbitRing radius={200} duration={28} services={orbitServices.slice(0, 3)} />
              {/* Inner orbit ring */}
              <OrbitRing radius={130} duration={18} services={orbitServices.slice(3)} reverse />

              {/* Center hub */}
              <div className="relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center text-center
                                border border-white/10 shadow-[0_0_60px_rgba(79,70,229,0.3)] backdrop-blur-xl"
                style={{ background: 'rgba(30,41,59,0.6)' }}
              >
                <ShieldCheck className="w-10 h-10 text-white mb-2" />
                <div className="text-[11px] text-white/50 font-medium uppercase tracking-widest mt-1">Verified<br />Network</div>
              </div>

              {/* Floating label chips */}
              <m.div
                className="absolute bottom-8 left-4 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                ✓ NIC Checked
              </m.div>
              <m.div
                className="absolute top-12 right-0 text-sm font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2"
                style={{ background: '#1E293B', color: '#fff' }}
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
      <div className="py-6 overflow-hidden border-y" style={{ background: '#090A0F', borderColor: '#18181B' }}>
        <div className="flex whitespace-nowrap ticker-track">
          {[...Array(2)].map((_, r) =>
            ['NIC VERIFIED', 'DIRECT WHATSAPP', 'ZERO COMMISSION', 'NO MIDDLEMEN', 'PAY WORKER DIRECTLY', 'LOCAL PROS'].map((item, i) => (
              <div key={`${r}-${i}`} className="flex items-center gap-4 px-8 flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span className="text-xs font-bold text-white/30 uppercase tracking-[0.35em]">{item}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════
                STATS ROW (Replaced with Real MVP Facts)
            ════════════════════════════════════════ */}
      <section style={{ background: '#090A0F' }} className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <m.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-center space-y-2"
            >
              <div className="text-4xl lg:text-5xl font-black text-white">{s.value}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-white/40">{s.label}</div>
            </m.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
                SERVICES — BENTO GRID
            ════════════════════════════════════════ */}
      <section id="services" className="py-28 lg:py-40 px-6 lg:px-12" style={{ background: '#090A0F' }}>
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <m.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-20">
            <m.span variants={fadeUp} className="text-xs font-bold uppercase tracking-widest block mb-5" style={{ color: '#4F46E5' }}>
              Our Services
            </m.span>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <m.h2 variants={fadeUp} className="text-4xl lg:text-7xl font-black text-white">
                Find the right<br /><span style={{ color: '#FFFFFF', opacity: 0.35 }}>Baas for the job.</span>
              </m.h2>
              <m.p variants={fadeUp} className="text-base text-white/50 max-w-sm font-medium leading-relaxed lg:text-right">
                We cover the most common home maintenance problems. Click to find someone in your city today.
              </m.p>
            </div>
          </m.div>

          {/* Bento Grid */}
          <m.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-4 gap-5">

            {/* Hero Card — Electrical */}
            <m.div variants={fadeUp}
              className="md:col-span-2 group relative overflow-hidden rounded-[2rem] p-10 flex flex-col justify-between"
              style={{ background: '#18181B', minHeight: 420 }}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.4 }}
            >
              <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at top right, #4F46E5 0%, transparent 60%)' }} />
              <div className="relative z-10 space-y-5">
                <div className="w-14 h-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center transition-all duration-300 group-hover:bg-indigo-600/20 group-hover:border-indigo-500/40">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-4xl font-black text-white">Electrician</h3>
                <p className="text-white/40 font-medium max-w-sm">House wiring, DB board repairs, light fittings, and finding electrical faults safely.</p>
              </div>
              <div className="relative z-10 flex items-center justify-between mt-8">
                <Link href="/browse?service=Electrician" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400 group-hover:text-indigo-300 transition-colors">
                  Browse Electricians <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </m.div>

            {/* AC Repair Card */}
            <m.div variants={fadeUp}
              className="group relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-between"
              style={{ background: '#18181B', minHeight: 420 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 opacity-10 blur-2xl rounded-full"
                style={{ background: '#4F46E5' }} />
              <div className="space-y-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-indigo-600/20 transition-all">
                  <Wind className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white">AC Repair<br />& Service</h3>
                <p className="text-white/40 text-sm font-medium">Standard AC cleaning, fixing water leaks, and gas refilling.</p>
              </div>
              <Link href="/browse?service=AC Repair" className="relative z-10 mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30 group-hover:text-indigo-400 transition-colors">
                Browse <ChevronRight className="w-4 h-4" />
              </Link>
            </m.div>

            {/* Plumbing */}
            <m.div variants={fadeUp}
              className="group relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-between border"
              style={{ background: '#18181B', borderColor: 'rgba(255,255,255,0.1)', minHeight: 420 }}
              whileHover={{ boxShadow: '0 30px 80px -10px rgba(79,70,229,0.15)', translateY: -4 }}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center transition-all group-hover:bg-indigo-600 group-hover:border-indigo-600" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Droplet className="w-5 h-5 text-white group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-black text-white">Plumber</h3>
                <p className="text-sm font-medium text-white/40">Fixing leaking pipes, tap replacements, and water motor repairs.</p>
              </div>
              <Link href="/browse?service=Plumber" className="text-xs font-bold uppercase tracking-widest mt-4 flex items-center gap-1" style={{ color: '#4F46E5' }}>Find Plumbers <ChevronRight className="w-3 h-3" /></Link>
            </m.div>

            {/* Carpenter */}
            <m.div variants={fadeUp}
              className="group relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-between border"
              style={{ background: '#18181B', borderColor: 'rgba(255,255,255,0.1)', minHeight: 300 }}
              whileHover={{ boxShadow: '0 30px 80px -10px rgba(79,70,229,0.15)', translateY: -4 }}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center transition-all group-hover:bg-indigo-600 group-hover:border-indigo-600" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Hammer className="w-5 h-5 text-white group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-black text-white">Carpenter</h3>
                <p className="text-sm font-medium text-white/40">Door lock fixing, furniture repair, and general house woodwork.</p>
              </div>
              <Link href="/browse?service=Carpenter" className="text-xs font-bold uppercase tracking-widest mt-4 flex items-center gap-1" style={{ color: '#4F46E5' }}>Find Carpenters <ChevronRight className="w-3 h-3" /></Link>
            </m.div>

            {/* Painter */}
            <m.div variants={fadeUp}
              className="group relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-between border"
              style={{ background: '#18181B', borderColor: 'rgba(255,255,255,0.1)', minHeight: 300 }}
              whileHover={{ boxShadow: '0 30px 80px -10px rgba(79,70,229,0.15)', translateY: -4 }}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center transition-all group-hover:bg-indigo-600 group-hover:border-indigo-600" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Paintbrush className="w-5 h-5 text-white group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-black text-white">Painter</h3>
                <p className="text-sm font-medium text-white/40">Interior wall painting, decorative finishes, and outside wall coats.</p>
              </div>
              <Link href="/browse?service=Painter" className="text-xs font-bold uppercase tracking-widest mt-4 flex items-center gap-1" style={{ color: '#4F46E5' }}>Find Painters <ChevronRight className="w-3 h-3" /></Link>
            </m.div>

            {/* Mason */}
            <m.div variants={fadeUp}
              className="group relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-between border"
              style={{ background: '#18181B', borderColor: 'rgba(255,255,255,0.1)', minHeight: 300 }}
              whileHover={{ boxShadow: '0 30px 80px -10px rgba(79,70,229,0.15)', translateY: -4 }}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center transition-all group-hover:bg-indigo-600 group-hover:border-indigo-600" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Hammer className="w-5 h-5 text-white group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-black text-white">Mason</h3>
                <p className="text-sm font-medium text-white/40">Concrete work, bricklaying, wall repairs, and bathroom leveling.</p>
              </div>
              <Link href="/browse?service=Mason" className="text-xs font-bold uppercase tracking-widest mt-4 flex items-center gap-1" style={{ color: '#4F46E5' }}>Find Masons <ChevronRight className="w-3 h-3" /></Link>
            </m.div>

            {/* CCTV */}
            <m.div variants={fadeUp}
              className="group relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-between border"
              style={{ background: '#18181B', borderColor: 'rgba(255,255,255,0.1)', minHeight: 300 }}
              whileHover={{ boxShadow: '0 30px 80px -10px rgba(79,70,229,0.15)', translateY: -4 }}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center transition-all group-hover:bg-indigo-600 group-hover:border-indigo-600" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Camera className="w-5 h-5 text-white group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-black text-white">CCTV & Security</h3>
                <p className="text-sm font-medium text-white/40">Security camera installation, DVR setup, and door intercoms.</p>
              </div>
              <Link href="/browse?service=CCTV %26 Security" className="text-xs font-bold uppercase tracking-widest mt-4 flex items-center gap-1" style={{ color: '#4F46E5' }}>Find Techs <ChevronRight className="w-3 h-3" /></Link>
            </m.div>

            {/* Cleaning */}
            <m.div variants={fadeUp}
              className="group relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-between border"
              style={{ background: '#18181B', borderColor: 'rgba(255,255,255,0.1)', minHeight: 300 }}
              whileHover={{ boxShadow: '0 30px 80px -10px rgba(79,70,229,0.15)', translateY: -4 }}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center transition-all group-hover:bg-indigo-600 group-hover:border-indigo-600" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Sparkles className="w-5 h-5 text-white group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-black text-white">Cleaning</h3>
                <p className="text-sm font-medium text-white/40">Full house cleaning, sofa shampooing, and water tank washing.</p>
              </div>
              <Link href="/browse?service=Cleaning" className="text-xs font-bold uppercase tracking-widest mt-4 flex items-center gap-1" style={{ color: '#4F46E5' }}>Find Cleaners <ChevronRight className="w-3 h-3" /></Link>
            </m.div>

            {/* CTA / Stats Dark Card */}
            <m.div variants={fadeUp}
              className="md:col-span-3 group relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-center items-center text-center py-12"
              style={{ background: '#4F46E5', minHeight: 300 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="absolute inset-0 opacity-20"
                style={{ background: 'radial-gradient(circle at 30% 70%, #7C3AED, transparent 60%)' }} />
              <div className="relative z-10 space-y-4 max-w-lg">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 shadow-xl">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-black text-white">Direct WhatsApp</div>
                <p className="text-white/80 text-base font-medium px-4">No middle-men or hidden commissions. Tap the button on any worker's profile to chat and agree on a price directly.</p>
              </div>
            </m.div>

          </m.div>

          {/* More Services Pill Row */}
          <div className="mt-16 pt-12 border-t border-white/5">
            <m.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex flex-col items-center gap-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">More Services We Offer</span>
              <div className="flex flex-wrap justify-center gap-3">
                {['Tiling', 'Welding', 'Aluminium & Glass', 'Gardening', 'Roofing', 'Pest Control'].map((item, i) => (
                  <div key={i} className="px-5 py-2 rounded-full border border-white/10 text-xs font-semibold text-white/40 transition-colors hover:border-white/30 hover:text-white cursor-default">
                    {item}
                  </div>
                ))}
              </div>
              <button
                onClick={async () => {
                  const { url } = await getAdminContactAction("Hi Grab Me, I don't see my service listed. Can you help?");
                  window.open(url, '_blank');
                }}
                className="mt-4 flex items-center gap-2 text-sm font-bold text-white transition-all hover:text-indigo-400 group"
              >
                Don't see your problem? Chat with us on WhatsApp
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </m.div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════
                HOW IT WORKS
            ════════════════════════════════════════ */}
      <section id="how-it-works" className="py-28 lg:py-40 px-6 lg:px-12" style={{ background: '#090A0F' }}>
        <div className="max-w-7xl mx-auto">
          <m.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-20 text-center">
            <m.span variants={fadeUp} className="text-xs font-bold uppercase tracking-widest block mb-5" style={{ color: '#4F46E5' }}>Simple Process</m.span>
            <m.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-black text-white">
              Three Steps.<br />Job Done.
            </m.h2>
          </m.div>

          <m.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6 lg:gap-10">
            {[
              { step: '01', icon: Search, title: 'Find a Worker', desc: 'Select the service you need (like Plumber) and choose your city.' },
              { step: '02', icon: MessageCircle, title: 'Chat on WhatsApp', desc: 'Click the button to open WhatsApp. Send them a message or photo of the problem.' },
              { step: '03', icon: CheckCircle2, title: 'Get it Fixed', desc: 'Agree on the price with the worker, get your home fixed, and pay them directly in cash.' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <m.div key={i} variants={fadeUp}
                  className="group relative rounded-[2rem] p-8 border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                  style={{ background: '#18181B', borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all duration-300" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <Icon className="w-5 h-5 text-white group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-7xl font-black" style={{ color: '#FFFFFF', opacity: 0.05 }}>{item.step}</span>
                  </div>
                  <h3 className="text-2xl font-black mb-3 text-white">{item.title}</h3>
                  <p className="text-white/40 font-medium leading-relaxed">{item.desc}</p>
                </m.div>
              )
            })}
          </m.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
                FEATURE PILLS ROW
            ════════════════════════════════════════ */}
      <section className="py-20 px-6 lg:px-12" style={{ background: '#090A0F' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <m.div key={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="group rounded-2xl p-6 border transition-all duration-400 hover:-translate-y-1 hover:shadow-xl"
                style={{ background: '#18181B', borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-white/10 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Icon className="w-5 h-5 text-white group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-black text-base mb-1 text-white">{f.title}</h4>
                <p className="text-xs text-white/40 font-medium leading-relaxed">{f.desc}</p>
              </m.div>
            )
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════
                PHILOSOPHY / ABOUT
            ════════════════════════════════════════ */}
      <section id="about" className="py-28 lg:py-40 px-6 lg:px-12" style={{ background: '#18181B' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Text */}
            <m.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-8">
              <m.span variants={fadeUp} className="text-xs font-bold uppercase tracking-widest block" style={{ color: '#4F46E5' }}>Our Mission</m.span>
              <m.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-black leading-tight text-white">
                A Simpler Way to<br />Find Good Workers.
              </m.h2>
              <m.div variants={fadeUp} className="space-y-5 text-base text-white/50 font-medium leading-relaxed">
                <p>Finding a reliable baas shouldn't be hard. We built Grab Me to connect you directly with verified professionals in your area.</p>
                <p>We are not an agency. We don't take a cut of the worker's pay. We are simply a directory that makes sure everyone listed has provided their National Identity Card (NIC) so you can feel safe letting them into your home.</p>
                <p>Just click, chat, and get your home fixed.</p>
              </m.div>
              <m.div variants={fadeUp}>
                <Link href="/register"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(79,70,229,0.4)]"
                  style={{ background: '#4F46E5' }}
                >
                  Register as a Worker <ArrowRight className="w-4 h-4" />
                </Link>
              </m.div>
            </m.div>

            {/* Stats visual - Replaced with Promises */}
            <m.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-2 gap-5"
            >
              {[
                { label: 'Verified Identity', value: 'NIC', bg: '#090A0F', text: '#fff', subColor: 'rgba(255,255,255,0.35)' },
                { label: 'App Downloads', value: 'Zero', bg: '#4F46E5', text: '#fff', subColor: 'rgba(255,255,255,0.6)' },
                { label: 'Hidden Fees', value: 'None', bg: '#1E293B', text: '#090A0F', subColor: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' },
                { label: 'Platform Use', value: 'Free', bg: '#090A0F', text: '#fff', subColor: 'rgba(255,255,255,0.35)' },
              ].map((s, i) => (
                <div key={i} className="rounded-[1.5rem] p-8 flex flex-col justify-end" style={{ background: s.bg, border: s.border, minHeight: 180 }}>
                  <div className="text-4xl font-black" style={{ color: s.label === 'Hidden Fees' ? '#FFFFFF' : s.text }}>{s.value}</div>
                  <div className="text-xs font-bold uppercase tracking-widest mt-2" style={{ color: s.subColor }}>{s.label}</div>
                </div>
              ))}
            </m.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
                WHY PEOPLE CHOOSE US (Replacing Fake Reviews)
            ════════════════════════════════════════ */}
      <section className="py-20 px-6 lg:px-12" style={{ background: '#090A0F' }}>
        <div className="max-w-7xl mx-auto">
          <m.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-14 text-center">
            <m.span variants={fadeUp} className="text-xs font-bold uppercase tracking-widest block mb-4" style={{ color: '#4F46E5' }}>The Grab Me Standard</m.span>
            <m.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-black text-white">Why Homeowners Trust Us</m.h2>
          </m.div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { title: 'Safe for Your Family', review: 'Unlike random Facebook groups, every worker on our platform is identity-verified before they can list their services.', color: '#4F46E5' },
              { title: 'No Hidden Charges', review: 'Because we don\'t take a commission, workers don\'t have to overcharge you to cover platform fees. You get a fair market price.', color: '#090A0F' },
              { title: 'Faster Communication', review: 'Direct WhatsApp chatting means you can instantly send a photo or video of your broken AC or pipe so the worker knows exactly what to bring.', color: '#18181B' },
            ].map((t, i) => (
              <m.div key={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="rounded-[1.5rem] p-8 flex flex-col justify-between"
                style={{ background: t.color, minHeight: 220 }}
              >
                <div>
                  <div className="text-white font-bold text-lg mb-2">{t.title}</div>
                  <p className="text-white/80 font-medium leading-relaxed text-sm">{t.review}</p>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-white/50" />
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
                CTA BANNER
            ════════════════════════════════════════ */}
      <section className="py-28 lg:py-40 px-6 lg:px-12 overflow-hidden relative" style={{ background: '#090A0F' }}>
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(79,70,229,0.15) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <m.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto text-center space-y-10"
        >
          <m.h2 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-black text-white">
            Ready to fix<br /><span className="indigo-gradient-text">Your Home?</span>
          </m.h2>
          <m.p variants={fadeUp} className="text-lg text-white/40 font-medium max-w-lg mx-auto">
            Search our directory and find a verified professional near you today.
          </m.p>
          <m.div variants={fadeUp} className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/browse"
              className="group flex items-center justify-center gap-3 px-10 py-5 rounded-full text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(79,70,229,0.5)]"
              style={{ background: '#4F46E5' }}
            >
              Find a Worker Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/register"
              className="flex items-center justify-center gap-3 px-10 py-5 rounded-full text-sm font-bold text-white/60 border border-white/10 hover:border-white/30 hover:text-white transition-all duration-300"
            >
              Register as a Worker
            </Link>
          </m.div>
        </m.div>
      </section>

      {/* ════════════════════════════════════════
                FOOTER
            ════════════════════════════════════════ */}
      <footer className="px-6 lg:px-12 pt-16 pb-10" style={{ background: '#090A0F', borderTop: '1px solid #18181B' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between gap-14 mb-14">
            {/* Brand */}
            <div className="space-y-5 max-w-xs">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-white/10">
                  <Image src="/grabme.png" alt="Grab Me" fill className="object-cover" />
                </div>
                <span className="text-white text-lg font-bold">Grab Me</span>
              </div>
              <p className="text-sm text-white/30 font-medium leading-relaxed">
                The safer way to find home services across Sri Lanka. Verified. Direct. Trusted.
              </p>
              <div className="flex gap-4">
                <Link href="/browse" className="text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all hover:opacity-90" style={{ background: '#4F46E5' }}>
                  Find a Worker
                </Link>
              </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10 text-xs font-semibold uppercase tracking-widest">
              <div className="space-y-5">
                <div className="text-white/70">Platform</div>
                <div className="flex flex-col gap-3 text-white/30">
                  <a href="#services" className="hover:text-white transition-colors">Services</a>
                  <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
                  <Link href="/register" className="hover:text-white transition-colors">Join as Worker</Link>
                </div>
              </div>
              <div className="space-y-5">
                <div className="text-white/70">Company</div>
                <div className="flex flex-col gap-3 text-white/30">
                  <a href="#about" className="hover:text-white transition-colors">About Us</a>
                </div>
              </div>
              <div className="space-y-5">
                <div className="text-white/70">Contact</div>
                <div className="flex flex-col gap-3 text-white/30">
                  <button
                    onClick={async () => {
                      const { url } = await getAdminContactAction('Hi, I need support with Grab Me.');
                      window.open(url, '_blank');
                    }}
                    className="hover:text-white transition-colors text-left"
                  >
                    WhatsApp Support
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20" style={{ borderColor: '#18181B' }}>
            <span>© 2026 Grab Me Logic (Pvt) Ltd.</span>
            <span>Colombo · Gampaha</span>
          </div>
        </div>
      </footer>
    </div>
  )
}