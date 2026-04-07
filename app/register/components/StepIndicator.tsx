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
        <div className="flex justify-between items-start mb-8 md:mb-12 px-1 lg:px-2 max-w-2xl mx-auto gap-1 sm:gap-2 lg:gap-8 pb-4">
            {STEPS.map((it) => (
                <button 
                    key={it.id} 
                    onClick={() => setStep(it.id)}
                    className="flex flex-col items-center gap-2 md:gap-3 relative flex-1 group transition-all"
                >
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-[0.8rem] md:rounded-2xl flex items-center justify-center text-xs md:text-sm font-black transition-all duration-500 ${step === it.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-110 ring-4 ring-blue-50'
                        : step > it.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                        {step > it.id ? <Check className="w-5 h-5" /> : it.id}
                    </div>
                    
                    <div className="hidden lg:block space-y-0.5 text-center transition-all">
                        <p className={`text-[9px] font-black uppercase tracking-[0.15em] ${step === it.id ? 'text-blue-700' : 'text-slate-600'}`}>{it.label}</p>
                        <p className={`text-[7px] font-bold lowercase tracking-widest text-slate-500 whitespace-nowrap overflow-hidden max-w-[80px] truncate ${step === it.id ? 'opacity-100' : 'opacity-40'}`}>{it.detail}</p>
                    </div>

                    {/* Progress Bar Connector */}
                    {it.id < 6 && (
                        <div className={`hidden lg:block absolute left-full top-5 w-[calc(100%-80%)] h-[2px] transition-colors duration-500 ${step > it.id ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    )}
                </button>
            ))}
        </div>
    );
}
