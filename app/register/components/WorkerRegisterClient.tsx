'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { m, AnimatePresence } from 'framer-motion'
import { ShieldCheck, CheckCircle2, ArrowLeft, ChevronLeft, User } from 'lucide-react'
import Link from 'next/link'

// Hooks & Components
import { useRegistrationForm } from '../hooks/useRegistrationForm'
import StepIndicator from '../components/StepIndicator'
import StepNavigation from '../components/StepNavigation'

// Dynamic Loading for steps (Code Splitting & Speed)
const StepIdentity = dynamic(() => import('../components/steps/StepIdentity'), { ssr: false })
const StepPhotos = dynamic(() => import('../components/steps/StepPhotos'), { ssr: false })
const StepExperience = dynamic(() => import('../components/steps/StepExperience'), { ssr: false })
const StepLocation = dynamic(() => import('../components/steps/StepLocation'), { ssr: false })
const StepReference = dynamic(() => import('../components/steps/StepReference'), { ssr: false })
const StepConfirmation = dynamic(() => import('../components/steps/StepConfirmation'), { ssr: false })

export default function WorkerRegisterClient() {
    const {
        step, setStep, loading, uploading, mobileOpen, setMobileOpen, scrolled,
        formData, setFormData, handleInputChange, toggleSubSkill, toggleDistrictCovered,
        setSubSkills, setDistrictsCovered,
        handleFileUpload, handleFileRemove,
        canMoveToNext, handleNextStep, submitForm,
        registrationSuccess, triggerWhatsAppActivation,
        previews, fieldErrors
    } = useRegistrationForm()

    const getStepTitle = () => {
        switch (step) {
            case 1: return "Identity Basics";
            case 2: return "Visual Proof";
            case 3: return "Experience & Skills";
            case 4: return "Service Locations";
            case 5: return "Trust & Verification";
            case 6: return "Final Review";
            default: return "";
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case 1: return "Tell us who you are. Matches NIC exactly.";
            case 2: return "Clear photos help you get 5x more jobs.";
            case 3: return "Showcase your professional background.";
            case 4: return "Where do you provide your services?";
            case 5: return "References help build customer trust.";
            case 6: return "Confirm your details before submission.";
            default: return "";
        }
    };

    if (registrationSuccess) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center px-6 font-outfit bg-white relative overflow-hidden">
                <m.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 w-full max-w-sm text-center bg-white border border-[#e2e8f0] rounded-[2.5rem] p-8 shadow-2xl space-y-8"
                >
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-xl shadow-green-500/10">
                        <CheckCircle2 className="w-12 h-12 text-[#16a34a]" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-2xl font-bold text-[#0f172a] uppercase tracking-tight">Application Received</h1>
                        <p className="text-[#64748b] text-sm font-medium leading-relaxed">
                            Your profile is under review. To speed up the process, please activate your account via WhatsApp.
                        </p>
                    </div>
                    <button
                        onClick={triggerWhatsAppActivation}
                        className="w-full px-8 py-5 bg-[#16a34a] text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-[#15803d] transition-all shadow-xl shadow-green-500/20"
                    >
                        Activate via WhatsApp
                    </button>
                    <Link href="/browse" className="inline-flex items-center justify-center gap-3 w-full px-8 py-5 bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0] rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-[#f1f5f9] transition-all">
                        <ArrowLeft className="w-4 h-4 text-[#1d4ed8]" /> Back to Directory
                    </Link>
                </m.div>
            </div>
        )
    }

    return (
        <div className="min-h-[100dvh] font-outfit flex flex-col bg-[#f8fafc] text-[#0f172a] relative overflow-hidden">
            {/* Native App Header */}
            <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md px-5 py-4 flex items-center justify-end border-b border-[#e2e8f0] shadow-sm">
                <Link href="/login" className="flex items-center gap-2 rounded-full bg-slate-50 pl-3 pr-1.5 py-1.5 border border-slate-100 active:scale-95 transition-all shadow-sm">
                    <div className="flex flex-col text-right">
                        <span className="text-[8px] font-bold text-[#64748b] uppercase tracking-wider leading-none mb-0.5">Partner</span>
                        <span className="text-[11px] font-black text-[#0f172a] leading-none">Login</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                        <User className="w-3.5 h-3.5 text-[#1d4ed8]" />
                    </div>
                </Link>
            </header>

            {/* Floating Back Button */}
            <div className="fixed top-4 left-5 z-[60]">
                <Link href="/" className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-xl shadow-slate-200/60 hover:border-blue-200 hover:bg-blue-50 active:scale-90 transition-all group">
                    <ChevronLeft className="w-5 h-5 text-slate-600 transition-transform group-hover:-translate-x-0.5" />
                </Link>
            </div>

            <main className="flex-1 w-full max-w-xl mx-auto flex flex-col pt-24 pb-12 px-5 md:px-0">
                {/* Step Progress Component */}
                <StepIndicator step={step} setStep={setStep} canMoveToNext={canMoveToNext} />

                {/* Main Content Area - Premium Card Pattern inspired by Login Page */}
                <div className="flex-1 bg-white rounded-[2rem] border-t-4 border-[#1d4ed8] shadow-2xl shadow-blue-500/5 px-6 md:px-12 py-10 md:py-12 relative z-10 min-h-[580px] transition-all duration-500">
                    <div className="mb-10 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-lg shadow-blue-500/5">
                                <ShieldCheck className="w-6 h-6 text-[#1d4ed8]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1d4ed8]">Phase {step} of 6</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5 italic lowercase">Worker Onboarding Portal</span>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <h2 className="text-3xl font-black text-[#0f172a] tracking-tight uppercase">{getStepTitle()}</h2>
                            <p className="text-[#64748b] text-xs font-semibold uppercase tracking-widest leading-relaxed opacity-80">{getStepDescription()}</p>
                        </div>
                    </div>

                    <div className="relative min-h-[380px]">
                        <AnimatePresence mode="wait">
                            <m.div
                                key={step}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {step === 1 && <StepIdentity formData={formData} handleInputChange={handleInputChange} fieldErrors={fieldErrors} />}
                                {step === 2 && <StepPhotos formData={formData} handleFileUpload={handleFileUpload} handleFileRemove={handleFileRemove} uploading={uploading} previews={previews} />}
                                {step === 3 && <StepExperience formData={formData} handleInputChange={handleInputChange} toggleSubSkill={toggleSubSkill} setSubSkills={setSubSkills} fieldErrors={fieldErrors} />}
                                {step === 4 && <StepLocation formData={formData} handleInputChange={handleInputChange} toggleDistrictCovered={toggleDistrictCovered} setDistrictsCovered={setDistrictsCovered} />}
                                {step === 5 && <StepReference formData={formData} handleInputChange={handleInputChange} fieldErrors={fieldErrors} />}
                                {step === 6 && <StepConfirmation formData={formData} setFormData={setFormData} />}
                            </m.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Spacing for sticky navigation */}
                <div className="h-32" />
            </main>

            {/* Navigation (Fixed Bottom) */}
            <StepNavigation 
                step={step} 
                setStep={setStep} 
                canMoveToNext={canMoveToNext} 
                handleNextStep={handleNextStep}
                submitForm={submitForm}
                loading={loading || !!uploading} 
                formData={formData}
            />
        </div>
    )
}
