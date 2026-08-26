import React from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export const ImageModal = ({ isOpen, onClose, imageUrl, label }: { isOpen: boolean, onClose: () => void, imageUrl: string, label: string }) => (
    <AnimatePresence>
        {isOpen && (
            <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                onClick={onClose}
            >
                <m.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center gap-4"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="absolute top-0 right-0 -mt-12 group">
                        <button
                            onClick={onClose}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all border border-white/10 group-hover:rotate-90"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="w-full h-full rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-[#18181B] flex items-center justify-center">
                        <img
                            src={imageUrl}
                            alt={label}
                            className="max-w-full max-h-[80vh] object-contain"
                        />
                    </div>
                    <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                        <p className="text-sm font-black text-white/80 uppercase tracking-[0.3em]">{label}</p>
                    </div>
                </m.div>
            </m.div>
        )}
    </AnimatePresence>
);
