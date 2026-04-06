'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import {
    User, Phone, MapPin, Navigation, Loader2,
    CheckCircle2, ArrowLeft, Bell
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { DISTRICTS } from '@/app/register/constants'
import { registerCustomerAction } from '../actions'
import { toast } from 'sonner'
import { fetchTaxonomyAction } from '@/app/lib/taxonomyActions'

export default function CustomerRegisterClient() {
    const searchParams = useSearchParams()
    const urlService = searchParams.get('service') || 'General'
    const urlDistrict = searchParams.get('district') || 'Colombo'

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        district: urlDistrict,
        lat: undefined as number | undefined,
        lng: undefined as number | undefined,
        area_name: '',
        service_needed: urlService,
    })
    const [detecting, setDetecting] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [services, setServices] = useState<string[]>([])

    useEffect(() => {
        fetchTaxonomyAction().then(data => {
            const names = data.services.map(s => s.name);
            setServices(names);
            // Validate the URL service against actual services
            if (urlService && !names.includes(urlService) && urlService !== 'General') {
                setFormData(p => ({ ...p, service_needed: 'General' }));
            }
        });
    }, [urlService]);

    // GPS auto-detect district
    const detectDistrict = () => {
        if (!navigator.geolocation) {
            toast.error('Location not supported by your browser')
            return
        }
        setDetecting(true)
        const toastId = toast.loading('Detecting your location...')

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    )
                    const data = await res.json()
                    if (data.address) {
                        const raw = data.address.state_district || data.address.county || ''
                        const cleaned = raw.replace(' District', '').trim()
                        const matched = DISTRICTS.find(d =>
                            cleaned.toLowerCase().includes(d.toLowerCase())
                        )
                        if (matched) {
                            setFormData(prev => ({ 
                                ...prev, 
                                district: matched,
                                lat: latitude,
                                lng: longitude,
                                area_name: cleaned 
                            }))
                            toast.success(`Location set tracking ${cleaned}`, { id: toastId })
                        } else {
                            toast.error('Located, but district not in our service range. Please select manually.', { id: toastId })
                        }
                    } else {
                        toast.error('Could not resolve location. Please select manually.', { id: toastId })
                    }
                } catch {
                    toast.error('Location lookup failed. Please select manually.', { id: toastId })
                } finally {
                    setDetecting(false)
                }
            },
            () => {
                setDetecting(false)
                toast.error('Location access denied. Please select your district manually.', { id: toastId })
            },
            { timeout: 10000 }
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setFieldErrors({})

        // Client-side pre-validation to match server Zod schema
        if (formData.full_name.trim().length < 2) {
            setFieldErrors({ full_name: 'Name is too short' })
            setLoading(false)
            return
        }
        if (!/^0\d{9}$/.test(formData.phone)) {
            setFieldErrors({ phone: 'Enter a valid Sri Lankan number (e.g. 0771234567)' })
            setLoading(false)
            return
        }

        try {
            const result = await registerCustomerAction({
                full_name: formData.full_name.trim(),
                phone: formData.phone.trim(),
                district: formData.district,
                lat: formData.lat,
                lng: formData.lng,
                area_name: formData.area_name,
                service_needed: formData.service_needed,
            })

            if (result.success) {
                setSuccess(true)
            } else if (result.errors) {
                setFieldErrors(result.errors as Record<string, string>)
                toast.error('Please check the highlighted fields.')
            } else {
                toast.error(result.error || 'Something went wrong. Please try again.')
            }
        } catch {
            toast.error('Could not connect. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // ── Success State ──────────────────────────────────────────────────────────
    if (success) {
        return (
            <div
                className="min-h-screen flex items-center justify-center px-6 font-sans"
                style={{ background: '#090A0F' }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

                <m.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 w-full max-w-md text-center bg-[#18181B] border border-white/5 rounded-[2.5rem] p-12 shadow-2xl space-y-8"
                >
                    <m.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                        className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-green-500/10"
                    >
                        <CheckCircle2 className="w-12 h-12 text-green-400" />
                    </m.div>

                    <div className="space-y-3">
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                            You&apos;re on the list!
                        </h1>
                        <p className="text-white/40 text-sm font-medium leading-relaxed">
                            We&apos;ll notify you when new workers join your area.
                            Keep an eye on WhatsApp!
                        </p>
                    </div>

                    <Link
                        href="/browse"
                        className="inline-flex items-center justify-center gap-3 w-full px-8 py-5 bg-[#4F46E5] text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-indigo-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-500/20"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Directory
                    </Link>
                </m.div>
            </div>
        )
    }

    // ── Registration Form ──────────────────────────────────────────────────────
    return (
        <div
            className="min-h-screen font-sans flex flex-col"
            style={{ background: '#090A0F', color: '#FFFFFF' }}
        >
            {/* Minimal Nav */}
            <nav className="fixed top-0 w-full z-50 bg-[#090A0F]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-white/10">
                            <Image src="/grabme.png" alt="Grab Me Sri Lanka" fill sizes="32px" className="object-cover" />
                        </div>
                        <span className="text-white text-lg font-bold tracking-tight">Grab Me</span>
                    </Link>
                    <Link
                        href="/browse"
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Back to Browse
                    </Link>
                </div>
            </nav>

            <div className="flex-1 pt-40 pb-24 px-6 flex justify-center items-center relative">
                {/* Background glows */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="bg-[#18181B] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
                        {/* Card header */}
                        <div className="pt-14 pb-8 px-10 text-center relative overflow-hidden">
                            <div
                                className="absolute inset-0 opacity-10 pointer-events-none"
                                style={{ background: 'radial-gradient(circle at center, #4F46E5 0%, transparent 70%)' }}
                            />
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-xl">
                                    <Bell className="w-8 h-8 text-[#4F46E5]" />
                                </div>
                                <h1 className="text-2xl font-black tracking-tight text-white mb-2 uppercase">
                                    Get Notified
                                </h1>
                                <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">
                                    We&apos;ll alert you when a pro is available near you
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="px-10 pb-14 space-y-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">
                                    Full Name
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#4F46E5] transition-all">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        required
                                        type="text"
                                        autoComplete="name"
                                        placeholder="e.g. Kasun Perera"
                                        value={formData.full_name}
                                        onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))}
                                        className={`w-full pl-14 pr-5 py-4 bg-white/5 border rounded-2xl focus:outline-none text-sm transition-all placeholder:text-white/10 text-white font-medium ${
                                            fieldErrors.full_name
                                                ? 'border-red-500/50 focus:border-red-500'
                                                : 'border-white/10 focus:border-[#4F46E5]'
                                        }`}
                                    />
                                </div>
                                {fieldErrors.full_name && (
                                    <p className="text-[10px] text-red-400 font-bold ml-2">{fieldErrors.full_name}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">
                                    Phone Number
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#4F46E5] transition-all">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <input
                                        required
                                        type="tel"
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        placeholder="0771234567"
                                        value={formData.phone}
                                        onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                                        className={`w-full pl-14 pr-5 py-4 bg-white/5 border rounded-2xl focus:outline-none text-sm transition-all placeholder:text-white/10 text-white font-medium ${
                                            fieldErrors.phone
                                                ? 'border-red-500/50 focus:border-red-500'
                                                : 'border-white/10 focus:border-[#4F46E5]'
                                        }`}
                                    />
                                </div>
                                {fieldErrors.phone && (
                                    <p className="text-[10px] text-red-400 font-bold ml-2">{fieldErrors.phone}</p>
                                )}
                            </div>

                            {/* Service Needed */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">
                                    Service Needed
                                </label>
                                <div className="relative group">
                                    <select
                                        required
                                        value={formData.service_needed}
                                        onChange={e => setFormData(p => ({ ...p, service_needed: e.target.value }))}
                                        className="w-full pl-5 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#4F46E5] focus:outline-none text-sm transition-all text-white font-medium [color-scheme:dark] appearance-none"
                                    >
                                        <option value="General" className="bg-[#18181B]">General Handyman</option>
                                        {services.map(t => (
                                            <option key={t} value={t} className="bg-[#18181B]">{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* District + GPS */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">
                                    Your District
                                </label>
                                <div className="flex gap-3 items-center">
                                    <div className="relative flex-1 group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#4F46E5] transition-all pointer-events-none">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <select
                                            required
                                            value={formData.district}
                                            onChange={e => setFormData(p => ({ ...p, district: e.target.value }))}
                                            className="w-full pl-14 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#4F46E5] focus:outline-none text-sm transition-all text-white font-medium [color-scheme:dark] appearance-none"
                                        >
                                            {DISTRICTS.map(d => (
                                                <option key={d} value={d} className="bg-[#18181B]">{d}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* GPS Button */}
                                    <button
                                        type="button"
                                        onClick={detectDistrict}
                                        disabled={detecting}
                                        title="Auto-detect my district"
                                        className="flex-shrink-0 w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/30 hover:text-indigo-400 hover:border-indigo-500/40 transition-all disabled:opacity-30 group/gps"
                                    >
                                        {detecting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Navigation className="w-5 h-5 group-hover/gps:scale-110 transition-transform" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading || !formData.full_name.trim() || !formData.phone.trim()}
                                className="w-full mt-2 flex items-center justify-center gap-3 bg-[#4F46E5] text-white py-5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-500/20 hover:bg-indigo-400 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Bell className="w-4 h-4" />
                                        Notify Me When Available
                                    </>
                                )}
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-[1px] bg-white/5" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/10">or</span>
                                <div className="flex-1 h-[1px] bg-white/5" />
                            </div>

                            <p className="text-center text-[10px] text-white/20 font-medium leading-relaxed">
                                Already see workers available?{' '}
                                <Link href="/browse" className="text-indigo-400 hover:text-indigo-300 transition-colors font-black">
                                    Browse the Directory
                                </Link>
                            </p>
                        </form>
                    </div>

                    <p className="text-center text-[10px] text-white/10 font-bold uppercase tracking-widest mt-8">
                        Powered by Mr2 Labs
                    </p>
                </m.div>
            </div>
        </div>
    )
}
