import React, { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Copy, X, Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export const BulkImportModal = ({ isOpen, onClose, onImport, isImporting }: any) => {
    const [jsonInput, setJsonInput] = useState('');

    const handleStart = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (!Array.isArray(parsed)) throw new Error('Root must be an array');
            onImport(parsed);
        } catch (e: any) {
            toast.error('Invalid JSON: ' + e.message);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <m.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#1C1C1E] border border-white/10 rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-wider">Bulk Taxonomy Import</h3>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Paste your JSON data below</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const template = `[
  {
    "nameEn": "Tree & Coconut Plucking",
    "nameSi": "ගස් කැපීම සහ පොල් කැඩීම",
    "skills": [
      { "nameEn": "Coconut Plucking", "nameSi": "පොල් කැඩීම" },
      { "nameEn": "Tree Pruning", "nameSi": "අතු කැපීම" }
    ],
    "keywords": ["pol", "coconut", "cutting", "garden"]
  }
]`;
                                        navigator.clipboard.writeText(template);
                                        toast.success('Format copied to clipboard');
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-indigo-500/20"
                                >
                                    <Copy className="w-3 h-3" />
                                    Copy Format
                                </button>
                                <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 transition-all"><X className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder='[ { "nameEn": "...", "nameSi": "...", "skills": [...], "keywords": [...] } ]'
                            className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-6 text-xs text-white outline-none focus:border-indigo-500 transition-all font-mono no-scrollbar"
                            disabled={isImporting}
                        />

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleStart}
                                disabled={isImporting || !jsonInput.trim()}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                {isImporting ? 'Processing Data...' : 'Start Bulk Import'}
                            </button>
                            <p className="text-[9px] text-white/20 text-center font-bold uppercase tracking-widest">
                                Tip: You can ask AI to generate data in this format
                            </p>
                        </div>
                    </m.div>
                </m.div>
            )}
        </AnimatePresence>
    );
};
