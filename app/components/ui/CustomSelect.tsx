'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search } from 'lucide-react'
import { m, AnimatePresence } from 'framer-motion'

export type SelectOption = string | { label: string; value: string; keywords?: string[] }

interface CustomSelectProps {
    value: string
    onChange: (value: string) => void
    options: SelectOption[]
    placeholder?: string
    searchPlaceholder?: string
    className?: string
}

export function CustomSelect({
    value,
    onChange,
    options,
    placeholder = 'Select an option',
    searchPlaceholder = 'Search...',
    className = ''
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

    // Find the current label to display
    const currentOption = normalizedOptions.find(o => o.value === value)
    const displayLabel = currentOption ? currentOption.label : (value || placeholder)

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-left font-bold focus:outline-none hover:border-white/20 transition-all text-white shadow-sm"
            >
                <span className="truncate pr-4">{displayLabel}</span>
                <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
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
                                        onClick={() => {
                                            onChange(option.value)
                                            setIsOpen(false)
                                            setSearchQuery('')
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all mb-1 last:mb-0
                                            ${value === option.value 
                                                ? 'bg-indigo-500/20 text-indigo-400' 
                                                : 'text-white/70 hover:bg-white/5 hover:text-white'
                                            }
                                        `}
                                    >
                                        <span className="truncate">{option.label}</span>
                                        {value === option.value && <Check className="w-4 h-4" />}
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
