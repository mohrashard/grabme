'use client'

import React, { useState, useCallback } from 'react'
import { MessageSquare, Loader2 } from 'lucide-react'
import { logWhatsAppClickAction } from '../actions'
import { getWorkerContactAction } from '../actions/getWorkerContactAction'
import LeadCaptureModal from './LeadCaptureModal'
import { toast } from 'sonner'

interface WhatsAppButtonProps {
    workerId: string;
    workerTrade: string;
}

export default function WhatsAppButton({ workerId, workerTrade }: WhatsAppButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    const triggerWhatsApp = useCallback(async (customerId?: string) => {
        setIsRedirecting(true);
        try {
            // 1. Log in background (don't await to keep UI fast)
            logWhatsAppClickAction(workerId, customerId).catch(() => null);

            // 2. Securely fetch URL from server
            const { url, error } = await getWorkerContactAction(workerId);

            if (error || !url) {
                toast.error(error || 'Could not connect. Please try again.');
                return;
            }

            // 3. Open WhatsApp
            window.open(url, '_blank');
        } catch (e) {
            toast.error('Could not connect. Please try again.');
        } finally {
            setTimeout(() => setIsRedirecting(false), 1000);
        }
    }, [workerId]);

    const handleContact = () => {
        // Check local storage for persistent profile
        const savedProfile = localStorage.getItem('grabme_customer_profile');
        
        if (savedProfile) {
            try {
                const customer = JSON.parse(savedProfile);
                triggerWhatsApp(customer.id);
            } catch (e) {
                // If corrupted, show modal
                setIsModalOpen(true);
            }
        } else {
            // First time user
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <button 
                onClick={handleContact}
                disabled={isRedirecting}
                className="w-full py-6 bg-[#4F46E5] text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm shadow-[0_20px_50px_rgba(79,70,229,0.4)] hover:bg-indigo-400 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
            >
                {isRedirecting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Connecting...
                    </>
                ) : (
                    <>
                        <MessageSquare className="w-5 h-5 fill-white" />
                        Contact on WhatsApp
                    </>
                )}
            </button>

            <LeadCaptureModal 
                isOpen={isModalOpen}
                workerTrade={workerTrade}
                onClose={() => setIsModalOpen(false)}
                onSuccess={(customer) => {
                    setIsModalOpen(false);
                    triggerWhatsApp(customer.id);
                }}
            />
        </>
    );
}

