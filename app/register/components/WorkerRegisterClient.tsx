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
        canMoveToNext, submitForm,
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
        <div className="min-h-[100dvh] font-outfit flex flex-col bg-white relative">
            {/* Native App Top Header */}
            <header className="fixed top-0 w-full z-50 bg-white pt-4 pb-3 px-5 flex items-center justify-between border-b border-[#e2e8f0] shadow-sm">
                <Link href="/" className="w-10 h-10 rounded-full bg-[#f8fafc] flex items-center justify-center border border-[#e2e8f0] hover:bg-[#e2e8f0] active:scale-95 transition-all shadow-sm">
                    <ChevronLeft className="w-5 h-5 text-[#0f172a]" />
                </Link>

                <Link href="/login" className="flex items-center gap-2 rounded-full bg-[#f8fafc] px-4 py-2 border border-[#e2e8f0] hover:bg-[#e2e8f0] active:scale-95 transition-all shadow-sm">
                    <User className="w-4 h-4 text-[#1d4ed8]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0f172a]">Login</span>
                </Link>
            </header>

            <main className="max-w-2xl mx-auto px-6 pt-24 pb-24 relative z-10">
                <div className="space-y-8">
                    {/* Header Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                                <ShieldCheck className="w-5 h-5 text-[#1d4ed8]" />
                            </div>
                            <h1 className="text-2xl font-bold text-[#0f172a] uppercase tracking-tight">Worker Registration</h1>
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">{getStepTitle()}</h2>
                            <p className="text-[#64748b] text-sm font-medium">{getStepDescription()}</p>
                        </div>
                    </div>

                    {/* Step Progress */}
                    <StepIndicator step={step} setStep={setStep} />

                    {/* Form Content */}
                    <div className="relative mt-12 bg-white border border-slate-200/60 border-t-8 border-t-[#1d4ed8] rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 overflow-hidden min-h-[460px]">
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
                        
                        <AnimatePresence mode="wait">
                            <m.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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

                    {/* Navigation */}
                    <StepNavigation 
                        step={step} 
                        setStep={setStep} 
                        canMoveToNext={canMoveToNext} 
                        submitForm={submitForm}
                        loading={loading || !!uploading} 
                        formData={formData}
                    />
                </div>
            </main>
        </div>
    )
}
