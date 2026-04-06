'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { m } from 'framer-motion'
import { User, Wrench } from 'lucide-react'

interface LanguageTabsProps {
    currentLang: string
    currentRole: string
}

const languages = [
    { code: 'en', label: 'English' },
    { code: 'si', label: 'සිංහල' },
    { code: 'ta', label: 'தமிழ்' },
]

const roles = [
    { id: 'customer', label: "I'm a Customer", icon: User, emoji: '🏠' },
    { id: 'worker', label: "I'm a Worker", icon: Wrench, emoji: '🔧' },
]

export default function LanguageTabs({ currentLang, currentRole }: LanguageTabsProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const updateParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(key, value)
        router.push(`?${params.toString()}`, { scroll: false })
    }

    return (
        <div className="flex flex-col gap-8 items-center justify-center py-8">
            {/* Role Toggle */}
            <div className="inline-flex p-1.5 bg-white/5 border border-white/10 rounded-[2rem] relative">
                {roles.map((role) => (
                    <button
                        key={role.id}
                        onClick={() => updateParams('role', role.id)}
                        className={`relative z-10 px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 min-h-[44px] ${
                            currentRole === role.id ? 'text-white' : 'text-white/40 hover:text-white/60'
                        }`}
                    >
                        {currentRole === role.id && (
                            <m.div
                                layoutId="role-pill"
                                className="absolute inset-0 bg-[#4F46E5] rounded-full -z-10 shadow-lg shadow-indigo-500/20"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span>{role.emoji}</span>
                        {role.label}
                    </button>
                ))}
            </div>

            {/* Language Selection */}
            <div className="flex flex-wrap items-center justify-center gap-3">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => updateParams('lang', lang.code)}
                        className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all min-h-[44px] ${
                            currentLang === lang.code
                                ? 'bg-[#4F46E5] text-white shadow-xl shadow-indigo-500/10'
                                : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
