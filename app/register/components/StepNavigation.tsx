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
    return (
        <div className="mt-16 pt-12 border-t border-white/5 flex items-center justify-between">
            {step > 1 ? (
                <button onClick={() => setStep(s => s - 1)} className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white transition-all flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Previous
                </button>
            ) : <div />}

            {step < 6 ? (
                <button 
                    onClick={() => setStep(s => s + 1)} 
                    disabled={!canMoveToNext()} 
                    className="flex items-center gap-4 bg-[#4F46E5] text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-500/20 disabled:opacity-30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    Next Phase <ArrowRight className="w-4 h-4" />
                </button>
            ) : (
                <button 
                    onClick={submitForm} 
                    disabled={!formData.agreedConduct || !formData.agreedTruth || loading} 
                    className="flex items-center gap-4 bg-white text-black px-12 py-5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl disabled:opacity-30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    {loading ? 'Finalizing...' : 'Submit Profile'} <Check className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
