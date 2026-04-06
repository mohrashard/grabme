'use client'
// Force Turbopack Cache Invalidation


import React from 'react'
import dynamic from 'next/dynamic'
import { m, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ChevronRight } from 'lucide-react'

// Hooks & Components
import { useRegistrationForm } from './hooks/useRegistrationForm'
import RegisterHeader from './components/RegisterHeader'
import RegisterFooter from './components/RegisterFooter'
import StepIndicator from './components/StepIndicator'
import StepNavigation from './components/StepNavigation'

// Dynamic Loading for steps (Code Splitting & Speed)
const StepIdentity = dynamic(() => import('./components/steps/StepIdentity'), { ssr: false })
const StepPhotos = dynamic(() => import('./components/steps/StepPhotos'), { ssr: false })
const StepExperience = dynamic(() => import('./components/steps/StepExperience'), { ssr: false })
const StepLocation = dynamic(() => import('./components/steps/StepLocation'), { ssr: false })
const StepReference = dynamic(() => import('./components/steps/StepReference'), { ssr: false })
const StepConfirmation = dynamic(() => import('./components/steps/StepConfirmation'), { ssr: false })

export default function WorkerRegistration() {
    const {
        step, setStep, loading, uploading, mobileOpen, setMobileOpen, scrolled,
        formData, setFormData, handleInputChange, toggleSubSkill, toggleDistrictCovered, handleFileUpload,
        canMoveToNext, submitForm, registrationSuccess, triggerWhatsAppActivation, previews, fieldErrors
    } = useRegistrationForm();

    // AUTO-REDIRECT to WhatsApp on success
    React.useEffect(() => {
        if (registrationSuccess) {
            const timer = setTimeout(() => {
                triggerWhatsAppActivation();
            }, 1500); // Small delay for user to see the success message
            return () => clearTimeout(timer);
        }
    }, [registrationSuccess, triggerWhatsAppActivation]);

    if (registrationSuccess) {
        return (
            <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: '#090A0F', color: '#FFFFFF' }}>
                <RegisterHeader scrolled={scrolled} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
                <div className="flex-1 pt-28 md:pt-40 pb-24 px-4 md:px-6 flex justify-center relative">
                    <div className="max-w-2xl w-full bg-[#18181B] rounded-3xl md:rounded-[3rem] border border-white/5 shadow-2xl p-8 md:p-12 text-center space-y-6 md:space-y-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] rounded-full -z-10" />
                        
                        <m.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-green-500/10 rounded-2xl md:rounded-3xl border border-green-500/20 flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-2xl shadow-green-500/10">
                                <ShieldCheck className="w-10 h-10 md:w-12 md:h-12 text-green-400" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Application Received!</h1>
                            <p className="text-white/40 text-sm md:text-base leading-relaxed max-w-sm mx-auto">Your profile has been saved to our high-trust directory. To go live, we need to verify your phone via WhatsApp.</p>
                        </m.div>

                        <m.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="pt-4 space-y-4">
                            <button 
                                onClick={triggerWhatsAppActivation}
                                className="w-full py-5 bg-[#4F46E5] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-500/40 hover:bg-indigo-400 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                Send Activation Ping <ChevronRight className="w-4 h-4" />
                            </button>
                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 italic">Redirecting to WhatsApp automatically...</p>
                                <button 
                                    onClick={triggerWhatsAppActivation}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-all"
                                >
                                    Click here if redirect fails
                                </button>
                            </div>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-6">Expected review time: ~2 hours</p>
                        </m.div>
                    </div>
                </div>
                <RegisterFooter />
            </div>
        )
    }

    return (
        <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: '#090A0F', color: '#FFFFFF' }}>
            <RegisterHeader scrolled={scrolled} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            <div className="flex-1 pt-28 md:pt-40 pb-24 px-4 md:px-6 flex justify-center relative">
                {/* Background Glows */}
                <div className="absolute top-1/4 left-1/4 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-indigo-600/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-purple-600/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-3xl w-full bg-[#18181B] rounded-3xl md:rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative z-10">
                    {/* Header Section */}
                    <div className="pt-10 md:pt-14 pb-8 md:pb-12 px-6 md:px-10 text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{ background: 'radial-gradient(circle at center, #4F46E5 0%, transparent 70%)' }} />
                        <div className="relative z-10">
                            <m.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="w-14 h-14 md:w-16 md:h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-xl">
                                    <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-[#4F46E5]" />
                                </div>
                                <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-2 md:mb-3">Partner Portal</h1>
                                <p className="text-white/40 text-xs md:text-sm font-bold uppercase tracking-[0.3em] mb-8 md:mb-10">Phase {step} of 6</p>
                            </m.div>
                            <StepIndicator step={step} setStep={setStep} />
                            
                            {/* Linear Progress Bar */}
                            <div className="max-w-md mx-auto h-[2px] bg-white/5 rounded-full overflow-hidden">
                                <m.div 
                                    className="h-full bg-[#4F46E5]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(step / 6) * 100}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="px-6 lg:px-16 pb-12 md:pb-16">
                        <AnimatePresence mode="wait">
                            {step === 1 && <StepIdentity formData={formData} handleInputChange={handleInputChange} fieldErrors={fieldErrors} />}
                            {step === 2 && <StepPhotos formData={formData} handleFileUpload={handleFileUpload} uploading={uploading} previews={previews} />}
                            {step === 3 && <StepExperience formData={formData} handleInputChange={handleInputChange} toggleSubSkill={toggleSubSkill} fieldErrors={fieldErrors} />}
                            {step === 4 && <StepLocation formData={formData} handleInputChange={handleInputChange} toggleDistrictCovered={toggleDistrictCovered} />}
                            {step === 5 && <StepReference formData={formData} handleInputChange={handleInputChange} fieldErrors={fieldErrors} />}
                            {step === 6 && <StepConfirmation formData={formData} setFormData={setFormData} />}
                        </AnimatePresence>

                        <StepNavigation 
                            step={step} 
                            setStep={setStep} 
                            canMoveToNext={canMoveToNext} 
                            submitForm={submitForm} 
                            loading={loading} 
                            formData={formData} 
                        />
                    </div>
                </div>
            </div>

            <RegisterFooter />
        </div>
    );
}