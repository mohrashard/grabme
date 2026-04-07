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
        <div className="mt-12 space-y-8">
            {/* LIGHTBOX MODAL */}
            <AnimatePresence>
                {selectedImg && (
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImg(null)}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/95 backdrop-blur-xl"
                    >
                        <m.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center gap-6"
                        >
                            <button
                                onClick={() => setSelectedImg(null)}
                                className="absolute -top-12 right-0 p-2 text-[#64748b] hover:text-[#0f172a] transition-colors"
                            >
                                <X className="w-8 h-8" />
                            </button>
                            <div className="w-full bg-white rounded-3xl overflow-hidden border border-[#e2e8f0] shadow-2xl flex items-center justify-center p-2">
                                <img
                                    src={selectedImg.url}
                                    alt={selectedImg.label}
                                    className="max-w-full h-auto max-h-[75vh] object-contain rounded-2xl"
                                />
                            </div>
                            <div className="bg-[#f8fafc] px-6 py-2 rounded-full border border-[#e2e8f0]">
                                <span className="text-[10px] font-black text-[#64748b] uppercase tracking-[0.4em]">{selectedImg.label}</span>
                            </div>
                        </m.div>
                    </m.div>
                )}
            </AnimatePresence>

            {/* PORTFOLIO GRID */}
            {validPhotos.length > 0 && (
                <div className="p-8 bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-3xl space-y-6 shadow-sm">
                    <div className="flex items-center gap-2">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1d4ed8]">Portfolio & Past Work</h4>
                        <div className="h-px flex-1 bg-blue-100" />
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {validPhotos.map((photo, i) => (
                            <m.div
                                key={`${photo}-${i}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => setSelectedImg({ url: photo, label: `Job Photo ${i + 1}` })}
                                className="relative group aspect-square rounded-2xl overflow-hidden border border-blue-100 cursor-pointer bg-white shadow-sm hover:shadow-md transition-all"
                            >
                                <img
                                    src={photo}
                                    alt={`Work ${i + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-[#1d4ed8]/10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                    <div className="p-3 bg-white/60 rounded-full border border-white/20 shadow-xl backdrop-blur-md">
                                        <Eye className="w-5 h-5 text-[#1d4ed8]" />
                                    </div>
                                </div>
                            </m.div>
                        ))}
                    </div>
                </div>
            )}

            {/* CERTIFICATE SECTION */}
            {certificateUrl && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#64748b]">Professional Credentials</h4>
                        <div className="h-px flex-1 bg-[#e2e8f0]" />
                    </div>

                    <div 
                        onClick={() => setSelectedImg({ url: certificateUrl, label: 'Professional Certificate' })}
                        className="relative group bg-gradient-to-br from-white to-blue-50/50 border border-[#e2e8f0] rounded-3xl p-6 flex items-center gap-6 cursor-pointer hover:border-[#1d4ed8]/30 hover:shadow-md transition-all overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#1d4ed8]/5 blur-3xl group-hover:scale-150 transition-transform duration-500" />
                        
                        <div className="relative z-10 w-16 h-16 bg-[#dbeafe] rounded-full flex items-center justify-center border border-[#93c5fd] shadow-inner">
                            <FileText className="w-8 h-8 text-[#1d4ed8]" />
                        </div>
                        
                        <div className="relative z-10 flex-1">
                            <h4 className="text-sm font-bold text-[#0f172a] group-hover:text-[#1d4ed8] transition-colors">Verified Certification</h4>
                            <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mt-1">Tap to view credential in high resolution</p>
                        </div>

                        {isVerified && (
                           <div className="relative z-10 flex flex-col items-center gap-1 bg-[#dcfce7] px-3 py-2 rounded-xl border border-[#bbf7d0]">
                                <CheckCircle className="w-4 h-4 text-[#16a34a]" />
                                <span className="text-[7px] font-black text-[#16a34a] uppercase tracking-widest">Verified</span>
                           </div>
                        )}
                        
                        <div className="relative z-10 p-2 bg-[#f8fafc] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="w-4 h-4 text-[#1d4ed8]" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
