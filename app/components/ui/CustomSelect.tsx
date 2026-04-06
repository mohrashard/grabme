'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search } from 'lucide-react'
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
}

export function CustomSelect({
    value,
    onChange,
    options,
    placeholder = 'Select an option',
    searchPlaceholder = 'Search...',
    className = '',
    isMulti = false
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const dropdownRef = useRef<HTMLDivElement>(null)

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
                className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-left font-bold focus:outline-none hover:border-white/20 transition-all text-white shadow-sm"
            >
                <span className="truncate pr-4">{displayLabel}</span>
                <div className="flex items-center gap-2">
                    {isMulti && Array.isArray(value) && value.length > 0 && (
                        <div className="bg-indigo-500 text-[10px] px-1.5 py-0.5 rounded-full font-black">
                            {value.length}
                        </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <m.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-[#18181B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                    >
                        {/* Search Input */}
                        <div className="p-2 border-b border-white/5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                <input
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    // Prevent closing when typing
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                    className="w-full bg-black/20 text-white text-sm rounded-xl py-2.5 pl-10 pr-4 outline-none border border-transparent focus:border-indigo-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Options List */}
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                            {filteredOptions.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-white/30 text-center font-medium">
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
                                                ? 'bg-indigo-500/20 text-indigo-400' 
                                                : 'text-white/70 hover:bg-white/5 hover:text-white'
                                            }
                                        `}
                                    >
                                        <span className="truncate">{option.label}</span>
                                        {isSelected(option.value) && (
                                            <div className="flex items-center justify-center w-5 h-5 bg-indigo-500 rounded-lg">
                                                <Check className="w-3.5 h-3.5 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    )
}
