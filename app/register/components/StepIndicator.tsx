import { Check } from 'lucide-react'
import { m } from 'framer-motion'

interface StepIndicatorProps {
    step: number;
    setStep: (step: number) => void;
    canMoveToNext: () => boolean;
}

const STEPS = [
    { id: 1, label: 'Identify', detail: 'NIC & Basic Duo' },
    { id: 2, label: 'Visual', detail: 'ID & Photo Proof' },
    { id: 3, label: 'Skills', detail: 'Major Trade & Exp' },
    { id: 4, label: 'Home', detail: 'Work Areas' },
    { id: 5, label: 'Trust', detail: 'Reference Check' },
    { id: 6, label: 'Review', detail: 'Final Declaration' }
]

export default function StepIndicator({ step, setStep, canMoveToNext }: StepIndicatorProps) {
    const handleStepClick = (targetId: number) => {
        // Always allow jumping back to fix "wrong went section"
        if (targetId < step) {
            setStep(targetId);
            return;
        }
        
        // Allow jumping forward ONLY if the current step is valid (prevent skipping required data)
        if (targetId === step + 1 && canMoveToNext()) {
            setStep(targetId);
        }
    };

    return (
        <div className="w-full px-6 pt-2 pb-6">
            <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1d4ed8]">Navigation Progress</span>
                    <span className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest leading-none">
                        {STEPS[step - 1]?.label} <span className="mx-1 text-slate-200">|</span> {STEPS[step - 1]?.detail}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xl font-black text-[#0f172a] tabular-nums tracking-tighter">
                        {step}<span className="text-slate-200 mx-1 font-light">/</span>{STEPS.length}
                    </span>
                </div>
            </div>

            {/* Progress Bar Container - Now Interactive */}
            <div className="relative h-2.5 w-full bg-slate-100/50 rounded-full flex gap-1.5 p-1 ring-1 ring-slate-100">
                {STEPS.map((it) => {
                    const isPassed = it.id < step;
                    const isCurrent = it.id === step;
                    const isClickable = it.id < step || (it.id === step + 1 && canMoveToNext());

                    return (
                        <button 
                            key={it.id}
                            onClick={() => handleStepClick(it.id)}
                            disabled={!isClickable && !isCurrent}
                            className={`flex-1 h-full rounded-full transition-all duration-300 relative group
                                ${isPassed ? 'bg-blue-600' : isCurrent ? 'bg-blue-600' : 'bg-slate-200'}
                                ${isClickable ? 'cursor-pointer hover:scale-y-125 hover:bg-blue-400' : 'cursor-not-allowed'}
                            `}
                            title={it.label}
                        >
                            {isCurrent && (
                                <m.div 
                                    layoutId="active-nav"
                                    className="absolute inset-0 bg-blue-600 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
