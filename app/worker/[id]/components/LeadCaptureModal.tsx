'use client'

import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, Loader2, MessageSquare, ShieldCheck } from 'lucide-react';
import { DISTRICTS } from '@/app/register/constants';
import { registerCustomerAction } from '@/app/customer/register/actions';
import { toast } from 'sonner';

interface LeadCaptureModalProps {
    isOpen: boolean;
    workerTrade: string;
    onClose: () => void;
    onSuccess: (customer: { id: string; full_name: string; phone: string; district: string }) => void;
}

export default function LeadCaptureModal({ isOpen, workerTrade, onClose, onSuccess }: LeadCaptureModalProps) {
    const [loading, setLoading] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        district: 'Colombo',
        lat: undefined as number | undefined,
        lng: undefined as number | undefined,
        area_name: '',
        service_needed: workerTrade
    });

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
        e.preventDefault();
        setLoading(true);

        try {
            // Validation (Matching Server Zod)
            if (formData.full_name.length < 2) throw new Error('Name is too short');
            if (!/^0\d{9}$/.test(formData.phone)) throw new Error('Invalid SL phone (e.g. 0771234567)');

            const result = await registerCustomerAction({ ...formData, source: 'whatsapp_click' });

            if (result.success && result.id) {
                const customer = { ...formData, id: result.id };
                // Persistent storage
                localStorage.setItem('grabme_customer_profile', JSON.stringify(customer));
                toast.success('Details saved! Opening WhatsApp...');
                onSuccess(customer);
            } else {
                toast.error(result.error || 'Something went wrong');
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col justify-end">
                    {/* Overlay */}
                    <m.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content (Bottom Sheet) */}
                    <m.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-md mx-auto bg-white rounded-t-[2rem] rounded-b-none p-6 shadow-2xl overflow-hidden pb-safe"
                    >
                        {/* Drag Handle Indicator */}
                        <div className="w-12 h-1.5 bg-[#e2e8f0] rounded-full mx-auto mb-6" />

                        {/* Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#1d4ed8]/5 blur-[80px] rounded-full" />

                        <div className="relative z-10 space-y-6">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-[#0f172a] tracking-tight uppercase">Quick Check-in</h2>
                                    <p className="text-[#64748b] text-xs font-bold uppercase tracking-widest leading-relaxed">
                                        We track connections to ensure quality. Please enter your details once.
                                    </p>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="p-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8] ml-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1d4ed8]" />
                                        <input 
                                            required
                                            type="text" 
                                            autoComplete="name"
                                            placeholder="John Doe"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                            className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 pl-12 pr-6 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#1d4ed8]/30 outline-none transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8] ml-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1d4ed8]" />
                                        <input 
                                            required
                                            type="tel" 
                                            inputMode="numeric"
                                            autoComplete="tel"
                                            placeholder="0771234567"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 pl-12 pr-6 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#1d4ed8]/30 outline-none transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8] ml-2">Your District</label>
                                    <div className="flex gap-3 items-center">
                                        <div className="relative flex-1">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1d4ed8]" />
                                            <select 
                                                required
                                                value={formData.district}
                                                onChange={(e) => setFormData({...formData, district: e.target.value})}
                                                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 pl-12 pr-6 text-sm text-[#0f172a] focus:border-[#1d4ed8]/30 outline-none transition-all font-bold appearance-none"
                                            >
                                                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={detectDistrict}
                                            disabled={detecting}
                                            title="Auto-detect my district"
                                            className="flex-shrink-0 w-14 h-14 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl flex items-center justify-center text-[#64748b] hover:text-[#1d4ed8] hover:border-[#1d4ed8]/30 transition-all disabled:opacity-30 group"
                                        >
                                            {detecting ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button 
                                    disabled={loading}
                                    type="submit"
                                    className="w-full py-5 bg-[#1d4ed8] text-white rounded-[1.5rem] font-bold uppercase tracking-[0.2em] text-[10px] shadow-lg hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 mt-4"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-4 h-4" />
                                            Verify & Contact on WhatsApp
                                        </>
                                    )}
                                </button>

                                <div className="pt-2 text-center">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8]">
                                        You only need to do this once.
                                    </p>
                                </div>
                            </form>
                        </div>
                    </m.div>
                </div>
            )}
        </AnimatePresence>
    );
}
