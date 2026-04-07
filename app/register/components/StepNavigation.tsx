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
        <div className="mt-8 md:mt-16 pt-8 md:pt-12 border-t border-slate-100 flex flex-col-reverse md:flex-row items-center justify-between gap-4 md:gap-0">
            {step > 1 ? (
                <button onClick={() => setStep(s => s - 1)} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-blue-700 transition-all flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-xl hover:border-blue-600">
                    <ArrowLeft className="w-4 h-4" /> Previous
                </button>
            ) : <div />}

            {step < 6 ? (
                <button 
                    onClick={() => setStep(s => s + 1)} 
                    disabled={!canMoveToNext()} 
                    className="w-full md:w-auto justify-center flex items-center gap-4 bg-blue-600 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-100 disabled:opacity-30 hover:bg-blue-700 transition-all"
                >
                    Next Phase <ArrowRight className="w-4 h-4" />
                </button>
            ) : (
                <button 
                    onClick={submitForm} 
                    disabled={!formData.agreedConduct || !formData.agreedTruth || loading} 
                    className="w-full md:w-auto justify-center flex items-center gap-4 bg-blue-600 text-white px-12 py-5 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-100 disabled:opacity-30 hover:bg-blue-700 transition-all"
                >
                    {loading ? 'Finalizing...' : 'Submit Profile'} <Check className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
