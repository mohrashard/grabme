'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { m } from 'framer-motion'
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
import Footer from '@/app/components/Footer'

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
            if (urlService && !names.includes(urlService) && urlService !== 'General') {
                setFormData(p => ({ ...p, service_needed: 'General' }));
            }
        });
    }, [urlService]);

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
                            toast.error('Located, but district not in our service range.', { id: toastId })
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
                toast.error('Location access denied.', { id: toastId })
            },
            { timeout: 10000 }
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setFieldErrors({})

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

    if (success) {
        return (
            <div className="min-h-screen flex flex-col font-outfit bg-slate-50 relative overflow-x-hidden">
                {/* Premium Background Mesh */}
                <div className="absolute top-0 left-0 right-0 h-full w-full pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#dbeafe]/40 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-[#dbeafe]/40 blur-[120px] rounded-full" />
                    <div className="absolute top-[40%] left-[25%] w-[40%] h-[40%] bg-white blur-[100px] rounded-full opacity-60" />
                </div>

                <div className="flex-1 flex items-center justify-center px-6 py-24">
                    <m.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 w-full max-w-md text-center bg-white rounded-[2.5rem] p-12 shadow-2xl border-t-8 border-t-[#1d4ed8] space-y-8"
                    >
                        <m.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                            className="w-24 h-24 bg-green-50 border border-green-100 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm"
                        >
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        </m.div>

                        <div className="space-y-3">
                             <div className="flex items-center justify-center gap-2 mb-4">
                                <span className="text-[#1d4ed8] text-xl font-bold tracking-tight uppercase">Grab Me</span>
                            </div>
                            <h1 className="text-2xl font-bold text-[#0f172a] uppercase tracking-tight">
                                You&apos;re on the list!
                            </h1>
                            <p className="text-[#64748b] text-sm font-medium leading-relaxed">
                                We&apos;ll notify you when new workers join your area.
                                Keep an eye on WhatsApp!
                            </p>
                        </div>

                        <Link
                            href="/browse"
                            className="inline-flex items-center justify-center gap-3 w-full px-8 py-5 bg-[#1d4ed8] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#1e3a8a] transition-all shadow-lg shadow-blue-500/10"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Directory
                        </Link>
                    </m.div>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen font-outfit flex flex-col bg-slate-50 relative overflow-x-hidden">
            {/* Premium Background Mesh */}
            <div className="absolute top-0 left-0 right-0 h-full w-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#dbeafe]/40 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-[#dbeafe]/40 blur-[120px] rounded-full" />
                <div className="absolute top-[40%] left-[25%] w-[40%] h-[40%] bg-white blur-[100px] rounded-full opacity-60" />
            </div>

            {/* Fixed Nav */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-[#e2e8f0]">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-sm border border-[#e2e8f0]">
                            <Image src="/grabme.png" alt="Grab Me Sri Lanka" fill sizes="32px" className="object-cover" />
                        </div>
                        <span className="text-[#1d4ed8] text-lg font-bold tracking-tight">Grab Me</span>
                    </Link>
                    <Link
                        href="/browse"
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#64748b] hover:text-[#1d4ed8] transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Back to Browse
                    </Link>
                </div>
            </nav>

            <div className="flex-1 pt-40 pb-24 px-6 flex justify-center items-center relative">
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="bg-white rounded-[2.5rem] shadow-2xl border-t-8 border-t-[#1d4ed8] overflow-hidden">
                        {/* Card header */}
                        <div className="pt-14 pb-8 px-10 text-center relative">
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <Bell className="w-8 h-8 text-[#1d4ed8]" />
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] mb-2 uppercase">
                                    Get Notified
                                </h1>
                                <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-[0.3em]">
                                    We&apos;ll alert you when a pro is available near you
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="px-10 pb-14 space-y-6">
                            {/* Full Name */}
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#0f172a]">
                                    Full Name
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#64748b] group-focus-within:text-[#1d4ed8] transition-all">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        required
                                        type="text"
                                        autoComplete="name"
                                        placeholder="e.g. Kasun Perera"
                                        value={formData.full_name}
                                        onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))}
                                        className={`w-full pl-14 pr-5 py-4 bg-[#f8fafc] border rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#dbeafe] text-sm transition-all placeholder:text-[#94a3b8] text-[#0f172a] font-medium ${
                                            fieldErrors.full_name
                                                ? 'border-red-300'
                                                : 'border-[#e2e8f0] focus:border-[#1d4ed8]'
                                        }`}
                                    />
                                </div>
                                {fieldErrors.full_name && (
                                    <p className="text-[10px] text-red-500 font-bold ml-2">{fieldErrors.full_name}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#0f172a]">
                                    Phone Number
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#64748b] group-focus-within:text-[#1d4ed8] transition-all">
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
                                        className={`w-full pl-14 pr-5 py-4 bg-[#f8fafc] border rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#dbeafe] text-sm transition-all placeholder:text-[#94a3b8] text-[#0f172a] font-bold ${
                                            fieldErrors.phone
                                                ? 'border-red-300'
                                                : 'border-[#e2e8f0] focus:border-[#1d4ed8]'
                                        }`}
                                    />
                                </div>
                                {fieldErrors.phone && (
                                    <p className="text-[10px] text-red-500 font-bold ml-2">{fieldErrors.phone}</p>
                                )}
                            </div>

                            {/* Service Needed */}
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#0f172a]">
                                    Service Needed
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        value={formData.service_needed}
                                        onChange={e => setFormData(p => ({ ...p, service_needed: e.target.value }))}
                                        className="w-full pl-5 pr-5 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:border-[#1d4ed8] focus:bg-white focus:ring-2 focus:ring-[#dbeafe] focus:outline-none text-sm transition-all text-[#0f172a] font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="General">General Handyman</option>
                                        {services.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* District + GPS */}
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#0f172a]">
                                    Your District
                                </label>
                                <div className="flex gap-3 items-center">
                                    <div className="relative flex-1 group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#64748b] group-focus-within:text-[#1d4ed8] transition-all pointer-events-none">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <select
                                            required
                                            value={formData.district}
                                            onChange={e => setFormData(p => ({ ...p, district: e.target.value }))}
                                            className="w-full pl-14 pr-5 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:border-[#1d4ed8] focus:bg-white focus:ring-2 focus:ring-[#dbeafe] focus:outline-none text-sm transition-all text-[#0f172a] font-bold appearance-none cursor-pointer"
                                        >
                                            {DISTRICTS.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* GPS Button */}
                                    <button
                                        type="button"
                                        onClick={detectDistrict}
                                        disabled={detecting}
                                        title="Auto-detect my district"
                                        className="flex-shrink-0 w-14 h-14 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-[#1d4ed8] hover:bg-blue-100 transition-all disabled:opacity-30 group/gps shadow-sm"
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
                                className="w-full mt-2 flex items-center justify-center gap-3 bg-[#1d4ed8] text-white py-5 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/10 hover:bg-[#1e3a8a] transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
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
                            <div className="relative flex items-center gap-4 py-2">
                                <div className="flex-1 h-[1px] bg-[#e2e8f0]" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-[#94a3b8] italic">or</span>
                                <div className="flex-1 h-[1px] bg-[#e2e8f0]" />
                            </div>

                            <p className="text-center text-[10px] text-[#64748b] font-medium leading-relaxed">
                                Already see workers available?{' '}
                                <Link href="/browse" className="text-[#1d4ed8] hover:text-[#1e3a8a] transition-colors font-bold uppercase tracking-wider">
                                    Browse the Directory
                                </Link>
                            </p>
                        </form>
                    </div>

                    <p className="text-center text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest mt-8">
                        Powered by Mr2 Labs
                    </p>
                </m.div>
            </div>
            <Footer />
        </div>
    )
}
