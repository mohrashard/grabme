'use client'
import { m } from 'framer-motion'
import { Camera, Upload, Check, UserCheck, FileText, Image as ImageIcon } from 'lucide-react'

interface StepPhotosProps {
    formData: any;
    handleFileUpload: (file: File, type: string) => void;
    uploading: string | null;
    previews?: Record<string, string>;
}

export default function StepPhotos({ formData, handleFileUpload, uploading, previews = {} }: StepPhotosProps) {
    const categories = [
        { id: 'profilePhotoUrl', label: 'Profile Photo', icon: Camera },
        { id: 'selfieUrl', label: 'Selfie with NIC', icon: UserCheck },
        { id: 'nicFrontUrl', label: 'NIC Front', icon: Upload },
        { id: 'nicBackUrl', label: 'NIC Back', icon: Upload },
        { id: 'certificateUrl', label: 'Certifications', icon: FileText },
    ];

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
                        <div className={`relative border border-dashed rounded-2xl p-4 text-center transition-all ${formData[cat.id] ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'}`}>
                            {formData[cat.id] ? (
                                <div className="flex flex-col items-center justify-center gap-2">
                                    {previews[cat.id] ? (
                                        <div className="w-16 h-10 rounded-lg overflow-hidden border border-white/10">
                                            <img src={previews[cat.id]} className="w-full h-full object-cover" alt="Preview" />
                                        </div>
                                    ) : (
                                        <Check className="w-5 h-5 text-indigo-400" />
                                    )}
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase">Uploaded</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <cat.icon className="w-5 h-5 text-white/20" />
                                    <span className="text-[10px] font-bold text-white/20 uppercase">{uploading === cat.id ? 'Uploading...' : 'Upload'}</span>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], cat.id)} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Past Work (Max 5 photos)</label>
                <div className="grid grid-cols-5 gap-3">
                    {formData.pastWorkPhotos.map((url: string, idx: number) => {
                        // Use the path as a key to look up the local preview
                        const preview = previews[`pastWorkPhotos_${url}`] || url;
                        return (
                            <div key={idx} className="aspect-square rounded-xl border border-white/10 overflow-hidden bg-white/5 shadow-xl relative group">
                                <img src={preview} alt={`Work ${idx}`} className="w-full h-full object-cover" />
                            </div>
                        );
                    })}
                    {formData.pastWorkPhotos.length < 5 && (
                        <div className="aspect-square rounded-xl border border-dashed border-white/10 flex items-center justify-center relative cursor-pointer bg-white/[0.02] hover:bg-white/[0.05] transition-all">
                            {uploading === 'pastWorkPhotos' ? (
                                <div className="w-4 h-4 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <ImageIcon className="w-5 h-5 text-white/20" />
                            )}
                            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'pastWorkPhotos')} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    )}
                </div>
            </div>
        </m.div>
    );
}
