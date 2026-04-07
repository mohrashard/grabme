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
            // 1. Log engagement (Await for returning users to verify their ID is still valid)
            const logResult = await logWhatsAppClickAction(workerId, customerId).catch(() => ({ success: false, error: 'TIMEOUT' }));

            if (logResult.error === 'STALE_CUSTOMER_ID') {
                // Orphaned ID found! Reset and show form
                localStorage.removeItem('grabme_customer_profile');
                setIsModalOpen(true);
                setIsRedirecting(false);
                return;
            }

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
            <div className="space-y-3">
                <button 
                    onClick={handleContact}
                    disabled={isRedirecting}
                    className="w-full min-h-[64px] bg-[#16a34a] text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-[#15803d] hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                >
                    {isRedirecting ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Connecting...
                        </>
                    ) : (
                        <>
                            <span className="text-2xl">💬</span>
                            Chat on WhatsApp
                        </>
                    )}
                </button>

                <button 
                    className="w-full min-h-[56px] bg-white border-2 border-[#e2e8f0] text-[#334155] rounded-2xl font-bold text-sm hover:border-[#1d4ed8] hover:text-[#1d4ed8] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    Share Profile
                </button>
            </div>

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

