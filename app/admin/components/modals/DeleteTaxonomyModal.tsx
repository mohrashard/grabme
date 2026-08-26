import React from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Trash2, Loader2 } from 'lucide-react'

export const DeleteTaxonomyModal = ({ isOpen, onClose, onConfirm, itemName, itemType, isDeleting }: any) => (
    <AnimatePresence>
        {isOpen && (
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <m.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
                            <Trash2 className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-wider">Delete {itemType}</h3>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Are you sure you want to remove <span className="text-red-400 font-bold">{itemName}</span>?
                            {itemType === 'Service' && " This will also delete all skills and keywords associated with it."}
                        </p>
                        <div className="flex flex-col w-full gap-3 mt-4">
                            <button
                                onClick={onConfirm}
                                disabled={isDeleting}
                                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                {isDeleting ? 'Removing...' : `Delete ${itemType}`}
                            </button>
                            <button
                                onClick={onClose}
                                disabled={isDeleting}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl font-black uppercase tracking-widest transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </m.div>
            </m.div>
        )}
    </AnimatePresence>
);
