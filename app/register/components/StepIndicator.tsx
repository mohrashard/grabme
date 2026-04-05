'use client'
import { Check } from 'lucide-react'

interface StepIndicatorProps {
    step: number;
    setStep: (step: number) => void;
}

const STEPS = [
    { id: 1, label: 'Identify', detail: 'NIC & Basic Duo' },
    { id: 2, label: 'Visual', detail: 'ID & Photo Proof' },
    { id: 3, label: 'Skills', detail: 'Major Trade & Exp' },
    { id: 4, label: 'Home', detail: 'Work Areas' },
    { id: 5, label: 'Trust', detail: 'Reference Check' },
    { id: 6, label: 'Review', detail: 'Final Declaration' }
]

export default function StepIndicator({ step, setStep }: StepIndicatorProps) {
    return (
        <div className="flex justify-between items-start mb-12 px-2 max-w-2xl mx-auto gap-4 lg:gap-8 pb-4">
            {STEPS.map((it) => (
                <button 
                    key={it.id} 
                    onClick={() => setStep(it.id)}
                    className="flex flex-col items-center gap-3 relative flex-1 group transition-all"
                >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-500 ${step === it.id
                        ? 'bg-[#4F46E5] text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] scale-110 ring-4 ring-indigo-500/10'
                        : step > it.id
                            ? 'bg-white/10 text-white/40 group-hover:bg-white/20'
                            : 'bg-white/5 text-white/20 border border-white/5 group-hover:bg-white/10'
                        }`}>
                        {step > it.id ? <Check className="w-5 h-5 opacity-40" /> : it.id}
                    </div>
                    
                    <div className="hidden lg:block space-y-0.5 text-center transition-all">
                        <p className={`text-[9px] font-black uppercase tracking-[0.15em] ${step === it.id ? 'text-indigo-400' : 'text-white/30'}`}>{it.label}</p>
                        <p className={`text-[7px] font-bold lowercase tracking-widest text-white/10 whitespace-nowrap overflow-hidden max-w-[80px] truncate ${step === it.id ? 'text-white/20' : ''}`}>{it.detail}</p>
                    </div>

                    {/* Progress Bar Connector */}
                    {it.id < 6 && (
                        <div className="hidden lg:block absolute left-full top-5 w-[calc(100%-80%)] h-[1px] bg-white/5 mx-auto" />
                    )}
                </button>
            ))}
        </div>
    );
}
