'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search, X } from 'lucide-react'
import { m, AnimatePresence } from 'framer-motion'

export type SelectOption = string | { label: string; value: string; keywords?: string[] }

interface CustomSelectProps {
    value: string | string[]
    onChange: (value: any) => void
    options: SelectOption[]
    placeholder?: string
    searchPlaceholder?: string
    className?: string
    isMulti?: boolean
    variant?: 'default' | 'pill'
}

export function CustomSelect({
    value,
    onChange,
    options,
    placeholder = 'Select an option',
    searchPlaceholder = 'Search...',
    className = '',
    isMulti = false,
    variant = 'default'
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isMobile, setIsMobile] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Handle Mobile Detection
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Handle clicks outside the dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Normalize options for consistent rendering and filtering
    const normalizedOptions = options.map(opt => 
        typeof opt === 'string' ? { label: opt, value: opt, keywords: [] } : opt
    )

    const filteredOptions = normalizedOptions.filter(opt => {
        const q = searchQuery.toLowerCase()
        return (
            opt.label.toLowerCase().includes(q) ||
            opt.value.toLowerCase().includes(q) ||
            (opt.keywords && opt.keywords.some(k => k.toLowerCase().includes(q)))
        )
    })

    // Handle selection logic
    const handleSelect = (optionValue: string) => {
        if (isMulti) {
            const currentValues = Array.isArray(value) ? value : []
            if (currentValues.includes(optionValue)) {
                onChange(currentValues.filter(v => v !== optionValue))
            } else {
                onChange([...currentValues, optionValue])
            }
            // Don't close for multi-select
        } else {
            onChange(optionValue)
            setIsOpen(false)
            setSearchQuery('')
        }
    }

    const isSelected = (optionValue: string) => {
        if (isMulti) {
            return Array.isArray(value) && value.includes(optionValue)
        }
        return value === optionValue
    }

    // Determine display label
    let displayLabel = placeholder
    if (isMulti) {
        if (Array.isArray(value) && value.length > 0) {
            if (value.length === 1) {
                const opt = normalizedOptions.find(o => o.value === value[0])
                displayLabel = opt ? opt.label : value[0]
            } else {
                displayLabel = `${value.length} items selected`
            }
        }
    } else if (value && typeof value === 'string') {
        const opt = normalizedOptions.find(o => o.value === value)
        displayLabel = opt ? opt.label : value
    }

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between transition-all outline-none
                    ${variant === 'pill' 
                        ? 'bg-slate-50 border border-slate-200 rounded-full py-2.5 px-4 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:border-blue-300' 
                        : 'bg-white border border-[#e2e8f0] rounded-2xl py-4 px-5 text-sm font-bold text-[#0f172a] shadow-sm hover:border-[#1d4ed8]/30'
                    }
                    ${isOpen && variant === 'pill' ? 'border-blue-400 bg-blue-50/50 text-blue-600' : ''}
                    ${!isOpen && (value && value !== 'All Services' && value !== 'All Skills' && value !== 'All Districts') && variant === 'pill' ? 'border-blue-100 bg-blue-50 text-blue-600' : ''}
                `}
            >
                <span className="truncate pr-2">{displayLabel}</span>
                <div className="flex items-center gap-1.5">
                    {isMulti && Array.isArray(value) && value.length > 0 && (
                        <div className="bg-[#1d4ed8] text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
                            {value.length}
                        </div>
                    )}
                    <ChevronDown className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${variant === 'pill' ? 'w-3 h-3' : 'w-4 h-4 text-[#64748b]'}`} />
                </div>
            </button>

            {/* SELECTION PANEL */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* MOBILE BOTTOM SHEET */}
                        {isMobile ? (
                            <div className="fixed inset-0 z-[100] flex flex-col justify-end">
                                {/* Backdrop */}
                                <m.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsOpen(false)}
                                    className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                                />
                                
                                {/* Sheet */}
                                <m.div
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "100%" }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="relative bg-white rounded-t-[2.5rem] p-6 shadow-2xl pb-safe outline-none"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Drag Handle */}
                                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
                                    
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-black text-[#0f172a] uppercase tracking-tight">{placeholder}</h3>
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Select from verified options</p>
                                        </div>
                                        <button 
                                            onClick={() => setIsOpen(false)}
                                            className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Search Input (Mobile) */}
                                    <div className="mb-4">
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1d4ed8]" />
                                            <input
                                                type="text"
                                                placeholder={searchPlaceholder}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                autoFocus
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[#0f172a] outline-none focus:bg-white focus:border-blue-200"
                                            />
                                        </div>
                                    </div>

                                    {/* Options (Mobile Layout) */}
                                    <div className="max-h-[65dvh] overflow-y-auto no-scrollbar pb-32">
                                        {filteredOptions.length === 0 ? (
                                            <div className="py-12 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">No results found</div>
                                        ) : (
                                            <div className="space-y-2">
                                                {filteredOptions.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => handleSelect(option.value)}
                                                        className={`w-full flex items-center justify-between p-5 rounded-2xl text-sm font-bold transition-all
                                                            ${isSelected(option.value)
                                                                ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                                                : 'bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100'
                                                            }
                                                        `}
                                                    >
                                                        <span>{option.label}</span>
                                                        {isSelected(option.value) && (
                                                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                                <Check className="w-4 h-4 text-white" />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </m.div>
                            </div>
                        ) : (
                            /* DESKTOP DROPDOWN */
                            <m.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="absolute z-50 w-full mt-2 bg-white border border-[#e2e8f0] rounded-2xl shadow-xl overflow-hidden"
                            >
                                {/* Search Input */}
                                <div className="p-2 border-b border-[#f1f5f9]">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1d4ed8]" />
                                        <input
                                            type="text"
                                            placeholder={searchPlaceholder}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            autoFocus
                                            className="w-full bg-[#f8fafc] text-[#0f172a] text-sm rounded-xl py-2.5 pl-10 pr-4 outline-none border border-transparent focus:border-[#1d4ed8]/30 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Options List */}
                                <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                                    {filteredOptions.length === 0 ? (
                                        <div className="px-4 py-3 text-sm text-[#94a3b8] text-center font-medium">
                                            No results found
                                        </div>
                                    ) : (
                                        filteredOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => handleSelect(option.value)}
                                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all mb-1 last:mb-0
                                                    ${isSelected(option.value)
                                                        ? 'bg-[#eff6ff] text-[#1d4ed8]' 
                                                        : 'text-[#334155] hover:bg-[#f1f5f9] hover:text-[#1d4ed8]'
                                                    }
                                                `}
                                            >
                                                <span className="truncate">{option.label}</span>
                                                {isSelected(option.value) && (
                                                    <div className="flex items-center justify-center w-5 h-5 bg-[#1d4ed8] rounded-lg">
                                                        <Check className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </m.div>
                        )}
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
