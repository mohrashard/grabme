'use client'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

interface StepNavigationProps {
    step: number;
    setStep: (step: number | ((s: number) => number)) => void;
    canMoveToNext: () => boolean;
    submitForm: () => void;
    loading: boolean;
    formData: any;
}

export default function StepNavigation({ step, setStep, canMoveToNext, submitForm, loading, formData }: StepNavigationProps) {
    const isLastStep = step === 6;
    const canProgress = canMoveToNext();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-t border-slate-100 p-4 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
            <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
                {step > 1 ? (
                    <button 
                        onClick={() => setStep(s => s - 1)} 
                        className="h-14 w-14 shrink-0 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 active:scale-90 transition-all shadow-xl shadow-slate-200/50 hover:bg-blue-50 hover:border-blue-100 group"
                        aria-label="Previous Step"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600 transition-transform group-hover:-translate-x-0.5" />
                    </button>
                ) : (
                    <div className="w-14" /> /* Spacer */
                )}

                {!isLastStep ? (
                    <button 
                        onClick={() => setStep(s => s + 1)} 
                        disabled={!canProgress} 
                        className={`flex-1 h-14 flex items-center justify-center gap-3 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all active:scale-[0.98] shadow-lg shadow-blue-500/10
                            ${canProgress 
                                ? 'bg-[#1d4ed8] text-white' 
                                : 'bg-slate-100 text-slate-400 pointer-events-none opacity-50'
                            }
                        `}
                    >
                        Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button 
                        onClick={submitForm} 
                        disabled={!formData.agreedConduct || !formData.agreedTruth || loading} 
                        className={`flex-1 h-14 flex items-center justify-center gap-3 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all active:scale-[0.98] shadow-lg shadow-green-500/10
                            ${!loading && formData.agreedConduct && formData.agreedTruth
                                ? 'bg-[#16a34a] text-white' 
                                : 'bg-slate-100 text-slate-400 pointer-events-none opacity-50'
                            }
                        `}
                    >
                        {loading ? 'Submitting...' : 'Complete Profile'} <Check className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
