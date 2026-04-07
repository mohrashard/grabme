'use client'
import React, { useState, useRef, useEffect } from 'react'
import { m } from 'framer-motion'
import { Camera, Upload, Check, UserCheck, FileText, Image as ImageIcon, Smartphone, X } from 'lucide-react'
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
        <m.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900">Visual Proof</h2>
                <p className="text-sm text-slate-500">Clear photos help you get 5x more jobs.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                    <div key={cat.id} className="space-y-2 text-center md:text-left">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{cat.label}</label>
                        <div className={`relative border border-dashed rounded-2xl transition-all h-[120px] flex flex-col items-center justify-center gap-3 ${formData[cat.id] ? 'border-blue-600/30 bg-blue-50/50 shadow-sm' : 'border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200/50'}`}>
                            {formData[cat.id] ? (
                                <div className="flex flex-col items-center justify-center gap-3 px-4 w-full">
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 shadow-sm shrink-0">
                                            {previews[cat.id] ? (
                                                <ImagePreview src={previews[cat.id]} alt="Preview" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-blue-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-start overflow-hidden">
                                            <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest truncate w-full">Successful</span>
                                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter truncate w-full">{formData[cat.id]}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleFileRemove(cat.id)}
                                            className="ml-auto p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 transition-all active:scale-95 group"
                                            title="Remove Photo"
                                        >
                                            <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        </button>
                                    </div>
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
                                            <button 
                                                onClick={() => handleCaptureTrigger(cat.id)}
                                                className="flex-1 rounded-xl bg-white border border-slate-200 hover:border-blue-600 hover:bg-blue-50 flex flex-col items-center justify-center gap-2 transition-all group"
                                            >
                                                <Camera className="w-5 h-5 text-slate-500 group-hover:text-blue-700 transition-colors" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter group-hover:text-slate-900">Capture</span>
                                            </button>
                                            
                                            <div className="w-[1px] h-full bg-slate-100 my-2" />

                                            <button 
                                                onClick={() => uploadInputs.current[cat.id]?.click()}
                                                className="flex-1 rounded-xl bg-white border border-slate-200 hover:border-blue-600 hover:bg-blue-50 flex flex-col items-center justify-center gap-2 transition-all group"
                                            >
                                                <ImageIcon className="w-5 h-5 text-slate-500 group-hover:text-blue-700 transition-colors" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter group-hover:text-slate-900">Upload</span>
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

            <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Past Work (Max 5 photos)</label>
                    <span className="text-[10px] font-bold text-blue-600/60 uppercase">{formData.pastWorkPhotos.length}/5</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {formData.pastWorkPhotos.map((path: string, idx: number) => {
                        const preview = previews[`pastWorkPhotos_${path}`];
                        return (
                            <div key={path} className="aspect-square rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm relative group">
                                {preview ? (
                                    <ImagePreview src={preview} alt={`Work ${idx}`} />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                                        <Check className="w-6 h-6 mb-1 text-blue-600" />
                                    </div>
                                )}
                                <m.button 
                                    initial={{ opacity: 0 }}
                                    whileHover={{ opacity: 1 }}
                                    onClick={() => handleFileRemove('pastWorkPhotos', path)}
                                    className="absolute inset-0 bg-red-500/60 backdrop-blur-sm flex flex-col items-center justify-center gap-1 transition-all opacity-0 md:opacity-0 group-hover:opacity-100"
                                >
                                    <X className="w-6 h-6 text-white" />
                                    <span className="text-[8px] font-black uppercase text-white tracking-widest">Remove</span>
                                </m.button>
                                {/* Mobile Remove Trigger */}
                                <button 
                                    onClick={() => handleFileRemove('pastWorkPhotos', path)}
                                    className="absolute top-1 right-1 w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center md:hidden shadow-lg border border-white/20"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        );
                    })}
                    {formData.pastWorkPhotos.length < 5 && (
                        <div className="aspect-square rounded-xl border border-dashed border-blue-200 overflow-hidden bg-slate-50 hover:bg-blue-50/50 transition-all flex flex-col divide-y divide-slate-100">
                            {uploading === 'pastWorkPhotos' ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-[#1d4ed8] border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => handleCaptureTrigger('pastWorkPhotos')}
                                        className="flex-1 w-full flex items-center justify-center hover:bg-blue-50/50 transition-colors group"
                                    >
                                        <Camera className="w-5 h-5 text-slate-400 group-hover:text-blue-700" />
                                    </button>
                                    <button 
                                        onClick={() => uploadInputs.current['pastWorkPhotos']?.click()}
                                        className="flex-1 w-full flex items-center justify-center hover:bg-blue-50/50 transition-colors group"
                                    >
                                        <ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-700" />
                                    </button>
                                </>
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



