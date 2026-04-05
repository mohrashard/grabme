'use client'

import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, Loader2, MessageSquare, ShieldCheck } from 'lucide-react';
import { DISTRICTS } from '@/app/register/constants';
import { registerCustomerAction } from '@/app/customer/register/actions';
import { toast } from 'sonner';

interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (customer: { id: string; full_name: string; phone: string; district: string }) => void;
}

export default function LeadCaptureModal({ isOpen, onClose, onSuccess }: LeadCaptureModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        district: 'Colombo'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation (Matching Server Zod)
            if (formData.full_name.length < 2) throw new Error('Name is too short');
            if (!/^0\d{9}$/.test(formData.phone)) throw new Error('Invalid SL phone (e.g. 0771234567)');

            const result = await registerCustomerAction(formData);

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
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Overlay */}
                    <m.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <m.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-[#18181B] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                    >
                        {/* Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[80px] rounded-full" />

                        <div className="relative z-10 space-y-8">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">Quick Check-in</h2>
                                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed">
                                        We track connections to ensure quality. Please enter your details once.
                                    </p>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                        <input 
                                            required
                                            type="text" 
                                            autoComplete="name"
                                            placeholder="John Doe"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white placeholder:text-white/10 focus:border-indigo-500/50 outline-none transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                        <input 
                                            required
                                            type="tel" 
                                            inputMode="numeric"
                                            autoComplete="tel"
                                            placeholder="0771234567"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white placeholder:text-white/10 focus:border-indigo-500/50 outline-none transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-2">Your District</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                        <select 
                                            required
                                            value={formData.district}
                                            onChange={(e) => setFormData({...formData, district: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all font-bold appearance-none [color-scheme:dark]"
                                        >
                                            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <button 
                                    disabled={loading}
                                    type="submit"
                                    className="w-full py-5 bg-[#4F46E5] text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 mt-4"
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
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/10">
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
