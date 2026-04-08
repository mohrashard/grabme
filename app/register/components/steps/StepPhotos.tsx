'use client'
import React, { useState, useRef, useEffect } from 'react'
import { m } from 'framer-motion'
import { Camera, Upload, Check, UserCheck, FileText, Image as ImageIcon, Smartphone, X, Loader2 } from 'lucide-react'
import CameraModal from '../CameraModal'

interface StepPhotosProps {
    formData: any;
    handleFileUpload: (files: File | File[], type: string) => void;
    handleFileRemove: (type: string, path?: string) => void;
    uploading: string | null;
    previews?: Record<string, string>;
}

const ImagePreview = ({ src, alt }: { src: string, alt: string }) => {
    const [error, setError] = useState(false);
    React.useEffect(() => {
        setError(false);
    }, [src]);
    return error ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-2">
            <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-center truncate w-full">Uploaded</span>
        </div>
    ) : (
        <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setError(true)} />
    );
};

export default function StepPhotos({ formData, handleFileUpload, handleFileRemove, uploading, previews = {} }: StepPhotosProps) {
    const categories = [
        { id: 'profilePhotoUrl', label: 'Profile Photo', icon: Camera, capture: 'user' },
        { id: 'selfieUrl', label: 'Selfie with NIC', icon: UserCheck, capture: 'user' },
        { id: 'nicFrontUrl', label: 'NIC Front', icon: Smartphone, capture: 'environment' },
        { id: 'nicBackUrl', label: 'NIC Back', icon: Smartphone, capture: 'environment' },
        { id: 'certificateUrl', label: 'Certifications', icon: FileText, capture: 'environment' },
    ];

    const captureInputs = useRef<Record<string, HTMLInputElement | null>>({});
    const uploadInputs = useRef<Record<string, HTMLInputElement | null>>({});
    const [cameraModal, setCameraModal] = useState<{ isOpen: boolean; field: string; title: string }>({
        isOpen: false,
        field: '',
        title: ''
    });

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
    }, []);

    const handleCaptureTrigger = (catId: string) => {
        if (isMobile) {
            captureInputs.current[catId]?.click();
        } else {
            const cat = categories.find(c => c.id === catId);
            setCameraModal({
                isOpen: true,
                field: catId,
                title: cat?.label || 'Capture'
            });
        }
    };

    return (
        <m.div key="2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((cat) => (
                    <div key={cat.id} className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{cat.label}</label>
                        <div className={`relative rounded-3xl transition-all h-[140px] flex flex-col items-center justify-center gap-3 overflow-hidden ${formData[cat.id] ? 'bg-blue-50/30 border-2 border-blue-100 shadow-lg shadow-blue-500/5' : 'bg-slate-50 border-2 border-slate-100 hover:border-blue-100 active:scale-[0.98]'}`}>
                            {formData[cat.id] ? (
                                <div className="relative w-full h-full group">
                                    <div className="absolute inset-0">
                                        {previews[cat.id] ? (
                                            <ImagePreview src={previews[cat.id]} alt="Preview" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                <Check className="w-8 h-8 text-blue-600" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Uploaded</span>
                                                <span className="text-[8px] font-bold text-white/70 uppercase tracking-tighter truncate w-32">{formData[cat.id]}</span>
                                            </div>
                                            <button 
                                                onClick={() => handleFileRemove(cat.id)}
                                                className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-red-500 hover:border-red-500 transition-all active:scale-95"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {uploading === cat.id ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Processing...</span>
                                        </div>
                                    ) : (
                                        <div className="flex w-full h-full p-3 gap-3">
                                            <button 
                                                onClick={() => handleCaptureTrigger(cat.id)}
                                                className="flex-1 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 transition-all active:bg-blue-50 active:scale-95 group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-active:bg-blue-100 group-active:text-blue-700 transition-colors">
                                                    <Camera className="w-5 h-5 text-slate-400 group-active:text-blue-700" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter group-active:text-blue-700">Capture</span>
                                            </button>
                                            
                                            <button 
                                                onClick={() => uploadInputs.current[cat.id]?.click()}
                                                className="flex-1 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 transition-all active:bg-blue-50 active:scale-95 group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-active:bg-blue-100 group-active:text-blue-700 transition-colors">
                                                    <Upload className="w-5 h-5 text-slate-400 group-active:text-blue-700" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter group-active:text-blue-700">Storage</span>
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                            
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

            <div className="space-y-4 pt-8 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Past Work (Gallery)</label>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[9px] font-black text-slate-500 uppercase">{formData.pastWorkPhotos.length}/5</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {formData.pastWorkPhotos.map((path: string, idx: number) => {
                        const preview = previews[`pastWorkPhotos_${path}`];
                        return (
                            <div key={path} className="aspect-square rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm relative group">
                                {preview ? (
                                    <ImagePreview src={preview} alt={`Work ${idx}`} />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                                        <Check className="w-6 h-6 text-blue-600" />
                                    </div>
                                )}
                                <button 
                                    onClick={() => handleFileRemove('pastWorkPhotos', path)}
                                    className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center active:bg-red-600 transition-all shadow-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                    {formData.pastWorkPhotos.length < 5 && (
                        <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50 flex flex-col overflow-hidden">
                            {uploading === 'pastWorkPhotos' ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                </div>
                            ) : (
                                <div className="flex flex-col h-full divide-y divide-slate-100">
                                    <button 
                                        onClick={() => handleCaptureTrigger('pastWorkPhotos')}
                                        className="flex-1 w-full flex items-center justify-center active:bg-blue-50 transition-colors group"
                                    >
                                        <Camera className="w-5 h-5 text-slate-300 group-active:text-blue-600" />
                                    </button>
                                    <button 
                                        onClick={() => uploadInputs.current['pastWorkPhotos']?.click()}
                                        className="flex-1 w-full flex items-center justify-center active:bg-blue-50 transition-colors group"
                                    >
                                        <Upload className="w-5 h-5 text-slate-300 group-active:text-blue-600" />
                                    </button>
                                </div>
                            )}
                            
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

            <CameraModal 
                isOpen={cameraModal.isOpen}
                title={cameraModal.title}
                onClose={() => setCameraModal(prev => ({ ...prev, isOpen: false }))}
                onCapture={(file) => handleFileUpload(file, cameraModal.field)}
            />
        </m.div>
    );
}



