import React from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, workerName, isDeleting }: any) => (
    <AnimatePresence>
        {isOpen && (
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <m.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-wider">Permenant Deletion</h3>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Are you absolutely sure you want to delete <span className="text-white font-bold">{workerName}</span>?
                            This will instantly remove their profile, verification logs, click history, and all stored media files. **This cannot be undone.**
                        </p>
                        <div className="flex flex-col w-full gap-3 mt-4">
                            <button
                                onClick={onConfirm}
                                disabled={isDeleting}
                                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
                            >
                                {isDeleting ? 'Nuking Data...' : 'Yes, Delete Everything'}
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
