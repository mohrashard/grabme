'use client'
import React, { useState, useRef } from 'react'
import { m } from 'framer-motion'
import { Camera, Upload, Check, UserCheck, FileText, Image as ImageIcon, Smartphone } from 'lucide-react'

interface StepPhotosProps {
    formData: any;
    handleFileUpload: (files: File | File[], type: string) => void;
    uploading: string | null;
    previews?: Record<string, string>;
}

const ImagePreview = ({ src, alt }: { src: string, alt: string }) => {
    const [error, setError] = useState(false);
    React.useEffect(() => {
        setError(false);
    }, [src]);
    return error ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-white/30 p-2">
            <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-center truncate w-full">Uploaded</span>
        </div>
    ) : (
        <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setError(true)} />
    );
};

export default function StepPhotos({ formData, handleFileUpload, uploading, previews = {} }: StepPhotosProps) {
    const categories = [
        { id: 'profilePhotoUrl', label: 'Profile Photo', icon: Camera, capture: 'user' },
        { id: 'selfieUrl', label: 'Selfie with NIC', icon: UserCheck, capture: 'user' },
        { id: 'nicFrontUrl', label: 'NIC Front', icon: Smartphone, capture: 'environment' },
        { id: 'nicBackUrl', label: 'NIC Back', icon: Smartphone, capture: 'environment' },
        { id: 'certificateUrl', label: 'Certifications', icon: FileText, capture: 'environment' },
    ];

    const captureInputs = useRef<Record<string, HTMLInputElement | null>>({});
    const uploadInputs = useRef<Record<string, HTMLInputElement | null>>({});

    return (
        <m.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">Visual Proof</h2>
                <p className="text-sm text-white/30">Clear photos help you get 5x more jobs.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                    <div key={cat.id} className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">{cat.label}</label>
                        <div className={`relative border border-dashed rounded-2xl transition-all h-[120px] flex flex-col items-center justify-center gap-3 ${formData[cat.id] ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'}`}>
                            {formData[cat.id] ? (
                                <div className="flex flex-col items-center justify-center gap-2">
                                    {previews[cat.id] ? (
                                        <div className="w-20 h-14 rounded-lg overflow-hidden border border-white/10 shadow-lg">
                                            <ImagePreview src={previews[cat.id]} alt="Preview" />
                                        </div>
                                    ) : (
                                        <Check className="w-6 h-6 text-indigo-400" />
                                    )}
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Uploaded Successfuly</span>
                                </div>
                            ) : (
                                <>
                                    {uploading === cat.id ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Processing...</span>
                                        </div>
                                    ) : (
                                        <div className="flex w-full h-full p-2 gap-2">
                                            {/* Camera Option */}
                                            <button 
                                                onClick={() => captureInputs.current[cat.id]?.click()}
                                                className="flex-1 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] flex flex-col items-center justify-center gap-2 transition-all group"
                                            >
                                                <Camera className="w-5 h-5 text-white/40 group-hover:text-indigo-400 transition-colors" />
                                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter group-hover:text-white">Capture</span>
                                            </button>
                                            
                                            <div className="w-[1px] h-full bg-white/5 my-2" />

                                            {/* Gallery Option */}
                                            <button 
                                                onClick={() => uploadInputs.current[cat.id]?.click()}
                                                className="flex-1 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] flex flex-col items-center justify-center gap-2 transition-all group"
                                            >
                                                <ImageIcon className="w-5 h-5 text-white/40 group-hover:text-indigo-400 transition-colors" />
                                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter group-hover:text-white">Upload</span>
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {/* Hidden Inputs */}
                            <input 
                                type="file" 
                                accept="image/*" 
                                capture={cat.capture as any}
                                ref={el => { captureInputs.current[cat.id] = el }}
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], cat.id)} 
                                className="hidden" 
                            />
                            <input 
                                type="file" 
                                accept="image/jpeg,image/png,image/webp" 
                                ref={el => { uploadInputs.current[cat.id] = el }}
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], cat.id)} 
                                className="hidden" 
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Past Work (Max 5 photos)</label>
                    <span className="text-[10px] font-bold text-indigo-400/50 uppercase">{formData.pastWorkPhotos.length}/5</span>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {formData.pastWorkPhotos.map((url: string, idx: number) => {
                        const preview = previews[`pastWorkPhotos_${url}`];
                        return (
                            <div key={idx} className="aspect-square rounded-xl border border-white/10 overflow-hidden bg-white/5 shadow-xl relative group">
                                {preview ? (
                                    <ImagePreview src={preview} alt={`Work ${idx}`} />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-white/30">
                                        <Check className="w-6 h-6 mb-1 text-indigo-400" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {formData.pastWorkPhotos.length < 5 && (
                        <div className="aspect-square rounded-xl border border-dashed border-white/10 overflow-hidden bg-white/[0.02] hover:bg-white/[0.05] transition-all flex flex-col divide-y divide-white/5">
                            {uploading === 'pastWorkPhotos' ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => captureInputs.current['pastWorkPhotos']?.click()}
                                        className="flex-1 w-full flex items-center justify-center hover:bg-white/[0.05] transition-colors group"
                                    >
                                        <Camera className="w-5 h-5 text-white/20 group-hover:text-indigo-400" />
                                    </button>
                                    <button 
                                        onClick={() => uploadInputs.current['pastWorkPhotos']?.click()}
                                        className="flex-1 w-full flex items-center justify-center hover:bg-white/[0.05] transition-colors group"
                                    >
                                        <ImageIcon className="w-5 h-5 text-white/20 group-hover:text-indigo-400" />
                                    </button>
                                </>
                            )}
                            
                            {/* Hidden Inputs for Past Work */}
                            <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment"
                                ref={el => { captureInputs.current['pastWorkPhotos'] = el }}
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        handleFileUpload(Array.from(e.target.files), 'pastWorkPhotos');
                                    }
                                }} 
                                className="hidden" 
                            />
                            <input 
                                type="file" 
                                accept="image/jpeg,image/png,image/webp" 
                                multiple
                                ref={el => { uploadInputs.current['pastWorkPhotos'] = el }}
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        handleFileUpload(Array.from(e.target.files), 'pastWorkPhotos');
                                    }
                                }} 
                                className="hidden" 
                            />
                        </div>
                    )}
                </div>
            </div>
        </m.div>
    );
}

