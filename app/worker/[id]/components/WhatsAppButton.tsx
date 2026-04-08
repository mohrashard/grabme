'use client'

import React, { useState, useCallback } from 'react'
import { MessageSquare, Loader2, Share2 } from 'lucide-react'
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
            <div className="flex items-center gap-3 w-full">
                <button 
                    onClick={handleContact}
                    disabled={isRedirecting}
                    className="flex-1 min-h-[56px] bg-[#16a34a] text-white rounded-2xl font-bold text-base shadow-lg hover:bg-[#15803d] hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                >
                    {isRedirecting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Connecting...
                        </>
                    ) : (
                        <>
                            <span className="text-xl">💬</span>
                            Chat on WhatsApp
                        </>
                    )}
                </button>

                <button 
                    onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'Grab Me Pro Profile',
                            url: window.location.href,
                          }).catch(() => {});
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success('Link copied to clipboard!');
                        }
                    }}
                    className="w-14 h-14 shrink-0 bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] rounded-2xl flex items-center justify-center hover:bg-[#f1f5f9] active:scale-[0.95] transition-all"
                >
                    <Share2 className="w-5 h-5" />
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

