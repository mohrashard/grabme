'use client'
import React, { useRef, useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Camera, X, RefreshCcw, AlertCircle, Check } from 'lucide-react'

interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (file: File) => void;
    title: string;
}

export default function CameraModal({ isOpen, onClose, onCapture, title }: CameraModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);

    // Device Enumeration
    useEffect(() => {
        if (isOpen) {
            enumerateDevices();
        }
    }, [isOpen]);

    // Camera Lifecycle & Stream Selection
    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isOpen, currentDeviceIndex, devices.length]);

    const enumerateDevices = async () => {
        try {
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
            setDevices(videoDevices);
        } catch (err) {
            console.error('Error enumerating devices:', err);
        }
    };

    const startCamera = async () => {
        setError(null);
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            // Using 'ideal' instead of 'exact' to prevent OverconstrainedError
            const constraints: MediaStreamConstraints = {
                video: devices.length > 0 
                    ? { deviceId: { ideal: devices[currentDeviceIndex].deviceId } } 
                    : true
            };

            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
        } catch (err: any) {
            console.error('Camera Error:', err);
            
            // Fallback for OverconstrainedError
            if (err.name === 'OverconstrainedError' || err.name === 'NotFoundError') {
                try {
                    const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    setStream(fallbackStream);
                    if (videoRef.current) videoRef.current.srcObject = fallbackStream;
                    return;
                } catch (fallbackErr) {
                    console.error('Fallback Camera Error:', fallbackErr);
                }
            }

            setError(err.name === 'NotAllowedError' 
                ? 'Camera access denied. Please check site permissions.' 
                : 'Failed to access camera.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const switchCamera = () => {
        if (devices.length > 1) {
            setCurrentDeviceIndex((prev) => (prev + 1) % devices.length);
        }
    };

    const handleCapture = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setIsCapturing(true);
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Match canvas to video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `${title.replace(/\s+/g, '_').toLowerCase()}.jpg`, { type: 'image/jpeg' });
                    onCapture(file);
                    setTimeout(() => {
                        setIsCapturing(false);
                        onClose();
                    }, 500);
                }
            }, 'image/jpeg', 0.9);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <m.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                >
                    <m.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#0F1117] rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
                            <div>
                                <h3 className="text-lg font-bold text-white">{title}</h3>
                                <p className="text-xs text-white/30 uppercase tracking-[0.2em]">Live Camera Feed</p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Camera Viewport */}
                        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                            {error ? (
                                <div className="flex flex-col items-center gap-4 p-8 text-center">
                                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                                        <AlertCircle className="w-8 h-8 text-red-500" />
                                    </div>
                                    <p className="text-white/60 font-medium">{error}</p>
                                    <button 
                                        onClick={startCamera}
                                        className="px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-sm transition-all"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <video 
                                        ref={videoRef} 
                                        autoPlay 
                                        playsInline 
                                        muted 
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Overlay for aesthetic */}
                                    <div className="absolute inset-x-8 inset-y-6 border border-white/10 rounded-2xl pointer-events-none opacity-50" />
                                    <div className="absolute top-4 left-4 flex items-center gap-2 px-2 py-1 bg-red-500 rounded-full animate-pulse">
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                        <span className="text-[10px] font-black uppercase text-white tracking-widest">Live</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer / Controls */}
                        <div className="p-8 flex items-center justify-center gap-8 bg-white/[0.02]">
                            <button 
                                onClick={switchCamera}
                                disabled={devices.length <= 1}
                                className={`p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all ${devices.length <= 1 && 'opacity-20 cursor-not-allowed'}`}
                                title="Switch Camera"
                            >
                                <RefreshCcw className="w-6 h-6" />
                            </button>

                            <button 
                                onClick={handleCapture}
                                disabled={!!error || !stream || isCapturing}
                                className="group relative w-20 h-20 rounded-full bg-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95 disabled:opacity-20 disabled:scale-100"
                            >
                                {isCapturing ? (
                                    <Check className="w-8 h-8 text-black" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full border-4 border-black/5 flex items-center justify-center">
                                        <Camera className="w-8 h-8 text-black" />
                                    </div>
                                )}
                                {/* Ping ripple animation */}
                                {!isCapturing && stream && (
                                    <div className="absolute inset-0 rounded-full animate-ping bg-white/20 -z-10" />
                                )}
                            </button>

                            <div className="w-6 h-6" /> {/* Spacer to align center camera */}
                        </div>

                        <canvas ref={canvasRef} className="hidden" />
                    </m.div>
                </m.div>
            )}
        </AnimatePresence>
    );
}
