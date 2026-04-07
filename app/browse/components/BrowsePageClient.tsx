'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { 
    Search, 
    MessageCircle, 
    ShieldCheck, 
    MapPin, 
    Star, 
    ChevronRight, 
    LayoutGrid,
    List,
    SearchX,
    RotateCcw,
    UserCheck,
    Navigation,
    Loader2,
    ArrowLeft
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CustomSelect } from '../../components/ui/CustomSelect'
import Footer from '../../components/Footer'
import { DISTRICTS } from '../../register/constants'
import { type TaxonomyData } from '@/app/lib/taxonomyActions'

type Worker = {
    id: string;
    full_name: string;
    trade_category: string;
    home_district: string;
    specific_areas: string[];
    profile_photo_url: string;
    short_bio: string;
    is_featured: boolean;
    is_identity_verified: boolean;
    is_reference_checked: boolean;
    years_experience: number;
    sub_skills?: string[];
};

interface BrowsePageClientProps {
    initialWorkers: Worker[];
    taxonomy: TaxonomyData | null;
}

export default function BrowsePageClient({ initialWorkers, taxonomy }: BrowsePageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Internal State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTrade, setSelectedTrade] = useState(searchParams.get('service') || 'All Services');
    const [selectedSkill, setSelectedSkill] = useState(searchParams.get('skill') || 'All Skills');
    const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get('district') || 'All Districts');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
    const [detecting, setDetecting] = useState(false);

    // Build options with keywords for the service dropdown
    const tradesOptions: import('../../components/ui/CustomSelect').SelectOption[] = [
        "All Services",
        ...(taxonomy?.services?.map(s => {
            const serviceKeywords = taxonomy.keywordMap 
                ? Object.keys(taxonomy.keywordMap).filter(kw => taxonomy.keywordMap[kw].includes(s.name))
                : [];
            return {
                label: s.name,
                value: s.name,
                keywords: serviceKeywords
            };
        }) ?? [])
    ];

    // Build skills based on selected trade
    const availableSkills = selectedTrade !== 'All Services' && taxonomy?.skillsByService?.[selectedTrade]
        ? taxonomy.skillsByService[selectedTrade].map(sk => sk.name)
        : [];

    const detectLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setDetecting(true);
        const toastId = toast.loading("Detecting your location...");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();

                    if (data.address) {
                        const district = data.address.state_district || data.address.county || "";
                        const cleanDistrict = district.replace(" District", "").trim();
                        const matchedDistrict = DISTRICTS.find(d => cleanDistrict.toLowerCase().includes(d.toLowerCase()));

                        if (matchedDistrict) {
                            setSelectedDistrict(matchedDistrict);
                            toast.success(`Broadcasting workers in ${matchedDistrict}`, { id: toastId });
                            // URL update
                            router.replace(`/browse?service=${selectedTrade}&skill=${selectedSkill}&district=${matchedDistrict}`, { scroll: false });
                        } else {
                            toast.error("Located, but district not in our service range.", { id: toastId });
                        }
                    }
                } catch (err) {
                    toast.error("Could not resolve location. Please select manually.", { id: toastId });
                } finally {
                    setDetecting(false);
                }
            },
            () => {
                setDetecting(false);
                toast.error("Location access denied. Please select manually.", { id: toastId });
            },
            { timeout: 10000 }
        );
    };

    const filteredWorkers = initialWorkers.filter(w => {
        // 1. Core Filters (Service, Skill, District)
        if (selectedTrade !== 'All Services' && w.trade_category !== selectedTrade) return false;
        if (selectedSkill !== 'All Skills' && !(w.sub_skills && w.sub_skills.includes(selectedSkill))) return false;
        if (selectedDistrict !== 'All Districts' && w.home_district !== selectedDistrict) return false;

        // 2. Search Query Filter
        const s = searchQuery.toLowerCase().trim();
        if (!s) return true;

        // Direct field matches
        const directMatch = (
            w.full_name.toLowerCase().includes(s) ||
            w.trade_category.toLowerCase().includes(s) ||
            (w.specific_areas && w.specific_areas.some(a => a.toLowerCase().includes(s))) ||
            (w.sub_skills && w.sub_skills.some((sk: string) => sk.toLowerCase().includes(s)))
        );
        if (directMatch) return true;

        // Taxonomy Smart Keyword Expansion
        if (taxonomy?.keywordMap) {
            const tokens = s.split(/\s+/);
            const matchedServices = new Set<string>();
            tokens.forEach(token => {
                Object.entries(taxonomy.keywordMap).forEach(([kw, serviceNames]) => {
                    if (kw.includes(token) || token.includes(kw)) {
                        serviceNames.forEach(sn => matchedServices.add(sn.toLowerCase()));
                    }
                });
            });
            if (matchedServices.size > 0 && matchedServices.has(w.trade_category.toLowerCase())) return true;
        }

        return false;
    });

    return (
        <div className="min-h-screen bg-[#f1f5f9] text-[#0f172a] font-sans">
            {/* Header / Nav */}
            <nav className="fixed top-0 w-full z-50 bg-white border-b border-[#e2e8f0] shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-[#e2e8f0] shadow-sm">
                            <Image src="/grabme.png" alt="Grab Me Sri Lanka" fill sizes="32px" className="object-cover" />
                        </div>
                        <span className="text-[#1d4ed8] text-lg font-bold tracking-tight">Grab Me</span>
                    </Link>
                    <div className="flex items-center gap-3 md:gap-6">
                        <Link href="/" className="text-[10px] font-black text-[#64748b] hover:text-[#1d4ed8] transition-colors uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                            <ArrowLeft className="w-3 h-3" />
                            <span>Home</span>
                        </Link>
                        <Link href="/register" className="text-[10px] font-black text-[#1d4ed8] border border-[#1d4ed8]/20 bg-[#eff6ff] px-4 py-2 rounded-xl hover:bg-[#dbeafe] transition-colors uppercase tracking-widest whitespace-nowrap">Join</Link>
                    </div>
                </div>
            </nav>

            <main className="pt-24 lg:pt-32 pb-24 px-4 lg:px-6 max-w-7xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-[#64748b] hover:text-[#1d4ed8] transition-all mb-8 group bg-white px-4 py-2 rounded-xl border border-[#e2e8f0] shadow-sm self-start">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Home</span>
                </Link>

                {/* Hero / Filter Section */}
                <div className="space-y-10 mb-16">
                    <div className="space-y-4">
                        <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-none text-[#0f172a]">Find Your <br /><span className="text-[#1d4ed8]">Service Hero.</span></h1>
                        <p className="text-[#64748b] text-sm font-medium max-w-md">Browse verified electricians, plumbers, and home workers across Sri Lanka. High trust, zero commission.</p>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-center bg-white p-3 md:p-4 rounded-3xl md:rounded-[2rem] border border-[#e2e8f0] shadow-sm">
                        <div className="flex-1 w-full relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1d4ed8]" />
                            <input 
                                type="text"
                                placeholder="Search by name, skill or area..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 pl-12 pr-6 text-sm text-[#0f172a] placeholder:text-[#94a3b8] outline-none focus:border-[#1d4ed8] transition-all font-medium"
                            />
                        </div>
                        <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
                            <CustomSelect 
                                value={selectedTrade !== 'All Services' ? selectedTrade : 'All Services'}
                                placeholder="All Services"
                                searchPlaceholder="Search services or keywords..."
                                onChange={(newTrade) => {
                                    const val = newTrade;
                                    setSelectedTrade(val);
                                    setSelectedSkill('All Skills'); // Reset skill when service changes
                                    router.replace(`/browse?service=${val}&skill=All Skills&district=${selectedDistrict}`, { scroll: false });
                                }}
                                options={tradesOptions}
                                className="w-full md:w-64 z-50"
                            />
                            {availableSkills.length > 0 && selectedTrade !== 'All Services' && (
                                <CustomSelect 
                                    value={selectedSkill !== 'All Skills' ? selectedSkill : 'All Skills'}
                                    placeholder="All Skills"
                                    searchPlaceholder="Search skills..."
                                    onChange={(newSkill) => {
                                        const val = newSkill || 'All Skills';
                                        setSelectedSkill(val);
                                        router.replace(`/browse?service=${selectedTrade}&skill=${val}&district=${selectedDistrict}`, { scroll: false });
                                    }}
                                    options={["All Skills", ...availableSkills]}
                                    className="w-full md:w-56 z-40"
                                />
                            )}
                            <div className="flex gap-3 w-full md:w-auto">
                                <CustomSelect 
                                    value={selectedDistrict !== 'All Districts' ? selectedDistrict : 'All Districts'}
                                    placeholder="All Districts"
                                    searchPlaceholder="Search districts..."
                                    onChange={(newDistrict) => {
                                        const val = newDistrict;
                                        setSelectedDistrict(val);
                                        router.replace(`/browse?service=${selectedTrade}&district=${val}`, { scroll: false });
                                    }}
                                    options={["All Districts", ...DISTRICTS]}
                                    className="flex-1 md:w-48 z-30"
                                />
                                <button 
                                    onClick={detectLocation}
                                    disabled={detecting}
                                    className="w-16 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 flex items-center justify-center text-[#64748b] hover:text-[#1d4ed8] hover:border-[#1d4ed8]/50 transition-all disabled:opacity-30 group flex-shrink-0 shadow-sm"
                                    title="Auto-detect my district"
                                    aria-label="Detect my location"
                                >
                                    {detecting ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-[#1d4ed8]" />
                                    ) : (
                                        <Navigation className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Count & View Mode */}
                <div className="flex items-center justify-between mb-8 px-2">
                    <p className="text-xs font-bold text-[#64748b] uppercase tracking-[0.2em]">Showing {filteredWorkers.length} Verified Partners in Sri Lanka</p>
                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[#e2e8f0] shadow-sm">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#1d4ed8] text-white shadow-lg shadow-[#1d4ed8]/20' : 'text-[#64748b] hover:text-[#1d4ed8] hover:bg-[#eff6ff]'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#1d4ed8] text-white shadow-lg shadow-[#1d4ed8]/20' : 'text-[#64748b] hover:text-[#1d4ed8] hover:bg-[#eff6ff]'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Grid / List */}
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    <AnimatePresence mode="popLayout">
                        {filteredWorkers.length === 0 ? (
                            <m.div 
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }}
                                className="col-span-full py-24 md:py-32 flex flex-col items-center text-center space-y-8 bg-white border border-[#e2e8f0] rounded-[3rem] shadow-sm px-6"
                            >
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-[#eff6ff] rounded-[2rem] flex items-center justify-center border border-[#dbeafe] shadow-sm">
                                    <SearchX className="w-10 h-10 md:w-12 md:h-12 text-[#1d4ed8]" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-xl md:text-2xl font-black text-[#0f172a] uppercase tracking-tight">No Baas available in this city yet</h3>
                                    <p className="text-[#64748b] text-[10px] md:text-sm max-w-xs mx-auto font-bold uppercase tracking-widest leading-relaxed">
                                        We are growing fast. Leave your number and we&apos;ll alert you when a verified partner is available near you.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                                    <Link 
                                        href={`/customer/register?service=${selectedTrade === 'All Services' ? 'General' : encodeURIComponent(selectedTrade)}&district=${selectedDistrict === 'All Districts' ? 'Colombo' : encodeURIComponent(selectedDistrict)}`}
                                        className="w-full sm:w-auto px-10 py-5 bg-[#1d4ed8] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#1d4ed8]/20 text-center"
                                    >
                                        Notify me when available
                                    </Link>
                                    <button 
                                        onClick={() => { setSelectedTrade('All Services'); setSelectedDistrict('All Districts'); setSearchQuery(''); }}
                                        className="w-full sm:w-auto group flex items-center justify-center gap-3 px-10 py-5 bg-white text-[#64748b] border border-[#e2e8f0] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-[#f8fafc] hover:text-[#1d4ed8] hover:border-[#1d4ed8]/50"
                                    >
                                        <RotateCcw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" /> 
                                        Reset Filters
                                    </button>
                                </div>
                            </m.div>
                        ) : filteredWorkers.map((w, i) => (
                            <m.div
                                key={w.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`group bg-gradient-to-br from-white to-blue-50 border transition-all duration-500 hover:shadow-xl hover:border-[#3b82f6]/50 border-l-0 relative overflow-hidden ${
                                    viewMode === 'grid' 
                                    ? "rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-between" 
                                    : "rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-6"
                                } ${w.is_featured ? 'border-amber-500/30' : 'border-[#e2e8f0]'}`}
                            >
                                {/* Top Branding Bar */}
                                <div className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-500 group-hover:h-3 ${w.is_featured ? 'bg-gradient-to-r from-amber-400 to-[#1d4ed8]' : 'bg-[#1d4ed8]'}`} />

                                {w.is_featured && (
                                    <div className="absolute top-6 right-6 z-10 flex flex-col items-end gap-2">
                                        <div className="bg-amber-400 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-400/20 flex items-center gap-1.5">
                                            <Star className="w-3 h-3 fill-black" />
                                            Premium Partner
                                        </div>
                                    </div>
                                )}

                                <div className={viewMode === 'grid' ? "space-y-6" : "flex items-center gap-4 md:gap-6 w-full md:flex-1 min-w-0"}>
                                    {/* Photo & Badge Grid Section */}
                                    <div className={viewMode === 'grid' ? "relative" : "flex-shrink-0"}>
                                        <div className={`${viewMode === 'grid' ? "w-20 h-20" : "w-16 h-16"} rounded-2xl overflow-hidden border border-[#e2e8f0] bg-[#f8fafc] relative shadow-sm`}>
                                            {w.profile_photo_url && !imageErrors[w.profile_photo_url] ? (
                                                <img 
                                                    src={w.profile_photo_url} 
                                                    alt={`Verified ${w.trade_category} ${w.full_name} profile photo`} 
                                                    width="80"
                                                    height="80"
                                                    loading="lazy"
                                                    onError={() => setImageErrors(prev => ({ ...prev, [w.profile_photo_url]: true }))}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[#cbd5e1] font-black text-xl bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
                                                    {w.full_name[0]}
                                                </div>
                                            )}
                                        </div>
                                        {w.is_identity_verified && (
                                            <div className="absolute -bottom-2 -right-2 bg-[#1d4ed8] p-1.5 rounded-lg border-2 border-white shadow-lg">
                                                <ShieldCheck className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Section */}
                                    <div className="space-y-1 min-w-0 font-sans">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-bold truncate text-[#0f172a]">{w.full_name}</h3>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1d4ed8]">
                                            <span className="bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100/50">{w.trade_category}</span>
                                            <span className="text-[#cbd5e1]">•</span>
                                            <span className="text-[#64748b] bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100/50">{w.years_experience} Years Exp</span>
                                        </div>
                                        {viewMode === 'list' && (
                                            <p className="text-sm text-[#64748b] truncate mt-2">{w.short_bio || 'Verified service professional in Sri Lanka.'}</p>
                                        )}
                                    </div>
                                </div>

                                {viewMode === 'grid' && (
                                    <p className="text-sm text-[#64748b] leading-relaxed line-clamp-2 my-6 font-medium">
                                        {w.short_bio || `Professional ${w.trade_category} available for high-quality repairs and maintenance work in ${w.home_district} and nearby areas.`}
                                    </p>
                                )}

                                {/* Location & Action */}
                                <div className={viewMode === 'grid' ? "space-y-6" : "flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto mt-4 md:mt-0"}>
                                    <div className="flex items-center gap-4 text-xs font-bold text-[#64748b]">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eff6ff] rounded-full border border-[#dbeafe] text-[#1d4ed8]" aria-label={`Location: ${w.home_district}`}>
                                            <MapPin className="w-3 h-3" />
                                            {w.home_district}
                                        </div>
                                        {w.is_reference_checked && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#dcfce7] rounded-full border border-[#bbf7d0] text-[#16a34a]">
                                                <UserCheck className="w-3 h-3" />
                                                Verified
                                            </div>
                                        )}
                                    </div>

                                    <Link 
                                        href={`/worker/${w.id}`}
                                        className="w-full group/btn flex items-center justify-between px-6 py-4 bg-white border-2 border-[#e2e8f0] text-[#334155] rounded-2xl transition-all hover:border-[#1d4ed8] hover:bg-[#1d4ed8] hover:text-white hover:shadow-xl hover:shadow-[#1d4ed8]/20"
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                            View Profile
                                        </span>
                                        <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                    </Link>
                                </div>
                            </m.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Bottom Trust Badge */}
                <div className="mt-24 py-12 border-t border-[#e2e8f0] flex flex-col items-center gap-8 text-center">
                    <div className="flex -space-x-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-12 h-12 rounded-full border-4 border-[#f1f5f9] bg-white flex items-center justify-center text-[#1d4ed8] shadow-sm">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-[#0f172a]">Safe. Verified. Sri Lankan Network.</h3>
                        <p className="text-sm text-[#64748b] max-w-sm font-medium">Every single partner is manually verified. High trust, zero commission, direct WhatsApp contact.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
