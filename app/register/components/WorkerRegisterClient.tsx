'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { m, AnimatePresence } from 'framer-motion'
import { ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Hooks & Components
import { useRegistrationForm } from '../hooks/useRegistrationForm'
import RegisterHeader from '../components/RegisterHeader'
import RegisterFooter from '../components/RegisterFooter'
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
            <div className="min-h-screen flex items-center justify-center px-6 font-sans bg-[#090A0F]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
                <m.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 w-full max-w-md text-center bg-[#18181B] border border-white/5 rounded-[2.5rem] p-12 shadow-2xl space-y-8"
                >
                    <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-[2rem] flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-12 h-12 text-green-400" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Application Received</h1>
                        <p className="text-white/40 text-sm font-medium leading-relaxed">
                            Your profile is under review. To speed up the process, please activate your account via WhatsApp.
                        </p>
                    </div>
                    <button
                        onClick={triggerWhatsAppActivation}
                        className="w-full px-8 py-5 bg-green-600 text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-green-500 transition-all shadow-xl shadow-green-500/20"
                    >
                        Activate via WhatsApp
                    </button>
                    <Link href="/browse" className="inline-flex items-center justify-center gap-3 w-full px-8 py-5 bg-white/5 text-white/40 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">
                        <ArrowLeft className="w-4 h-4" /> Back to Directory
                    </Link>
                </m.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen font-sans" style={{ background: '#090A0F', color: '#FFFFFF' }}>
            <RegisterHeader 
                scrolled={scrolled} 
                mobileOpen={mobileOpen} 
                setMobileOpen={setMobileOpen} 
            />

            <main className="max-w-2xl mx-auto px-6 pt-32 pb-24">
                <div className="space-y-8">
                    {/* Header Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Worker Registration</h1>
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">{getStepTitle()}</h2>
                            <p className="text-white/40 text-sm font-medium">{getStepDescription()}</p>
                        </div>
                    </div>

                    {/* Step Progress */}
                    <StepIndicator step={step} setStep={setStep} />

                    {/* Form Content */}
                    <div className="relative mt-12 bg-[#18181B] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden min-h-[460px]">
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
                        
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

            <RegisterFooter />
        </div>
    )
}
