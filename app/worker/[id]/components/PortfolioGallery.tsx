'use client'

import React, { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Eye, X, Image as ImageIcon, FileText, CheckCircle } from 'lucide-react'

interface PortfolioGalleryProps {
    photos: any; // Allow anything for robust parsing (handles stringified Postgres arrays)
    certificateUrl?: string;
    isVerified?: boolean;
}

export default function PortfolioGallery({ photos, certificateUrl, isVerified }: PortfolioGalleryProps) {
    const [selectedImg, setSelectedImg] = useState<{ url: string; label: string } | null>(null);

    // Robust handling for Postgres arrays or weird return types
    const getValidPhotos = (input: any): string[] => {
        if (!input) return [];
        if (Array.isArray(input)) return input.filter(p => !!p && typeof p === 'string');
        if (typeof input === 'string') {
            // Check if it's a Postgres array string like {url1,url2}
            if (input.startsWith('{') && input.endsWith('}')) {
                return input.slice(1, -1).split(',').map(s => s.trim().replace(/^"(.*)"$/, '$1')).filter(p => !!p);
            }
            // Simple comma-separated or just one URL
            return input.split(',').map(s => s.trim()).filter(p => !!p);
        }
        return [];
    };

    const validPhotos = getValidPhotos(photos);

    if (validPhotos.length === 0 && !certificateUrl) return null;

    return (
        <div className="mt-8 space-y-8">
            {/* NATIVE LIGHTBOX (IMAGE ZOOM) */}
            <AnimatePresence>
                {selectedImg && (
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImg(null)}
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
                    >
                        {/* Status Bar Background / Top Margin */}
                        <div className="absolute top-0 inset-x-0 h-16 bg-black/40 z-10" />
                        
                        <button
                            onClick={() => setSelectedImg(null)}
                            className="absolute top-12 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full z-20 backdrop-blur-md transition-all active:scale-90"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <m.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full h-full flex items-center justify-center p-4"
                        >
                            <img
                                src={selectedImg.url}
                                alt={selectedImg.label}
                                className="max-w-full max-h-[90vh] object-contain"
                            />
                        </m.div>

                        {/* Title Caption Bottom */}
                        <div className="absolute bottom-8 inset-x-0 flex justify-center z-10">
                            <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">{selectedImg.label}</span>
                            </div>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>

            {/* PORTFOLIO ROW (SWIPEABLE) */}
            {validPhotos.length > 0 && (
                <div className="px-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1d4ed8]">Work Showcase</h4>
                        <div className="h-px flex-1 bg-blue-50" />
                    </div>
                    
                    <div className="flex overflow-x-auto gap-3 no-scrollbar snap-x pb-2">
                        {validPhotos.map((photo, i) => (
                            <m.div
                                key={`${photo}-${i}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => setSelectedImg({ url: photo, label: `Showcase Item ${i + 1}` })}
                                className="relative flex-shrink-0 w-32 h-32 snap-center rounded-2xl overflow-hidden border border-[#e2e8f0] cursor-pointer bg-slate-50 shadow-sm active:scale-[0.98] transition-all"
                            >
                                <img
                                    src={photo}
                                    alt={`Work ${i + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-2 right-2 p-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white">
                                    <Eye className="w-3.5 h-3.5" />
                                </div>
                            </m.div>
                        ))}
                    </div>
                </div>
            )}

            {/* CERTIFICATE SECTION (FLATTENED) */}
            {certificateUrl && (
                <div className="px-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748b]">Credentials</h4>
                        <div className="h-px flex-1 bg-slate-100" />
                    </div>

                    <div 
                        onClick={() => setSelectedImg({ url: certificateUrl, label: 'Professional Certificate' })}
                        className="relative group bg-slate-50 border border-slate-100 rounded-3xl p-6 flex items-center gap-5 cursor-pointer active:scale-[0.99] transition-all overflow-hidden"
                    >
                        <div className="relative z-10 w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm shrink-0">
                            <FileText className="w-7 h-7 text-[#1d4ed8]" />
                        </div>
                        
                        <div className="relative z-10 flex-1">
                            <h4 className="text-sm font-bold text-[#0f172a]">Verified Certificate</h4>
                            <p className="text-[9px] font-bold text-[#64748b] uppercase tracking-widest mt-1">Tap to view proof</p>
                        </div>

                        {isVerified && (
                           <div className="relative z-10 flex items-center gap-1.5 bg-[#dcfce7] px-3 py-1.5 rounded-lg border border-[#bbf7d0] shadow-sm">
                                <CheckCircle className="w-3.5 h-3.5 text-[#16a34a]" />
                                <span className="text-[8px] font-black text-[#16a34a] uppercase tracking-widest">Verified</span>
                           </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
