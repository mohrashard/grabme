'use client'

import React, { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { 
    Search, 
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
    ChevronLeft,
    Home,
    BookOpen,
    Wrench,
    User
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CustomSelect } from '../../components/ui/CustomSelect'
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
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTrade, setSelectedTrade] = useState(searchParams.get('service') || 'All Services');
    const [selectedSkill, setSelectedSkill] = useState(searchParams.get('skill') || 'All Skills');
    const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get('district') || 'All Districts');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
    const [detecting, setDetecting] = useState(false);

    const tradesOptions: import('../../components/ui/CustomSelect').SelectOption[] = [
        "All Services",
        ...(taxonomy?.services?.map(s => {
            const serviceKeywords = taxonomy.keywordMap 
                ? Object.keys(taxonomy.keywordMap).filter(kw => taxonomy.keywordMap[kw].includes(s.name))
                : [];
            return { label: s.name, value: s.name, keywords: serviceKeywords };
        }) ?? [])
    ];

    const availableSkills = selectedTrade !== 'All Services' && taxonomy?.skillsByService?.[selectedTrade]
        ? taxonomy.skillsByService[selectedTrade].map(sk => sk.name)
        : [];

    const detectLocation = () => {
        if (!navigator.geolocation) { toast.error("Geolocation is not supported by your browser"); return; }
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
                            router.replace(`/browse?service=${selectedTrade}&skill=${selectedSkill}&district=${matchedDistrict}`, { scroll: false });
                        } else {
                            toast.error("Located, but district not in our service range.", { id: toastId });
                        }
                    }
                } catch {
                    toast.error("Could not resolve location. Please select manually.", { id: toastId });
                } finally {
                    setDetecting(false);
                }
            },
            () => { setDetecting(false); toast.error("Location access denied. Please select manually.", { id: toastId }); },
            { timeout: 10000 }
        );
    };

    const filteredWorkers = initialWorkers.filter(w => {
        if (selectedTrade !== 'All Services' && w.trade_category !== selectedTrade) return false;
        if (selectedSkill !== 'All Skills' && !(w.sub_skills && w.sub_skills.includes(selectedSkill))) return false;
        if (selectedDistrict !== 'All Districts' && w.home_district !== selectedDistrict) return false;
        const s = searchQuery.toLowerCase().trim();
        if (!s) return true;
        const directMatch = (
            w.full_name.toLowerCase().includes(s) ||
            w.trade_category.toLowerCase().includes(s) ||
            (w.specific_areas && w.specific_areas.some(a => a.toLowerCase().includes(s))) ||
            (w.sub_skills && w.sub_skills.some((sk: string) => sk.toLowerCase().includes(s)))
        );
        if (directMatch) return true;
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

    // ── Shared photo renderer ──────────────────────────
    const WorkerPhoto = ({ w, size }: { w: Worker; size: 'sm' | 'lg' }) => (
        <div className="relative flex-shrink-0">
            <div className={`${size === 'sm' ? 'w-14 h-14' : 'w-20 h-20'} rounded-2xl overflow-hidden border border-[#e2e8f0] bg-[#f8fafc] relative shadow-sm`}>
                {w.profile_photo_url && !imageErrors[w.profile_photo_url] ? (
                    <img src={w.profile_photo_url} alt={w.full_name} width={size === 'sm' ? 56 : 80} height={size === 'sm' ? 56 : 80}
                        loading="lazy"
                        onError={() => setImageErrors(prev => ({ ...prev, [w.profile_photo_url]: true }))}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#cbd5e1] font-black text-xl bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">{w.full_name[0]}</div>
                )}
            </div>
            {w.is_identity_verified && (
                <div className="absolute -bottom-1.5 -right-1.5 bg-[#1d4ed8] p-1.5 rounded-lg border-2 border-white shadow-lg">
                    <ShieldCheck className="w-2.5 h-2.5 text-white" />
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans pb-28 relative">

            {/* ══════════════════════════════════════════
                        COMPACT APP HEADER (both)
                ══════════════════════════════════════════ */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="w-10 h-10 rounded-full bg-[#f8fafc] flex items-center justify-center border border-[#e2e8f0] hover:bg-[#e2e8f0] active:scale-95 transition-all shadow-sm flex-shrink-0">
                        <ChevronLeft className="w-5 h-5 text-[#0f172a]" />
                    </Link>
                    <span className="text-sm font-black uppercase tracking-widest text-[#0f172a]">Browse Partners</span>
                </div>

                <Link href="/login" className="flex items-center gap-2 rounded-full bg-[#f8fafc] pl-3 pr-1.5 py-1.5 border border-[#e2e8f0] hover:bg-[#e2e8f0] transition-colors shadow-sm scale-90 sm:scale-100">
                    <div className="flex flex-col text-right">
                        <span className="text-[8px] font-bold text-[#64748b] uppercase tracking-wider leading-none mb-0.5">Partner</span>
                        <span className="text-[11px] font-black text-[#0f172a] leading-none">Login</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center border border-[#e2e8f0] shadow-sm">
                        <User className="w-3.5 h-3.5 text-[#1d4ed8]" />
                    </div>
                </Link>
            </header>

            <main className="max-w-7xl mx-auto">

                {/* ══════════════════════════════════════════
                            MOBILE LAYOUT  (< md)
                    ══════════════════════════════════════════ */}
                <div className="md:hidden">
                    {/* Compact Sticky Filter Block */}
                    <div className="bg-white p-4 border-b border-[#e2e8f0] space-y-3 sticky top-[68px] z-40 shadow-sm">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                            <input type="text" placeholder="Search by name, skill or area..."
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl py-3 pl-11 pr-4 text-sm text-[#0f172a] placeholder:text-[#94a3b8] outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe] transition-all font-medium"
                            />
                        </div>
                        <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
                            <CustomSelect value={selectedTrade} placeholder="All Services" searchPlaceholder="Search services..."
                                onChange={(val) => { setSelectedTrade(val); setSelectedSkill('All Skills'); router.replace(`/browse?service=${val}&skill=All Skills&district=${selectedDistrict}`, { scroll: false }); }}
                                options={tradesOptions} className="flex-shrink-0 w-40 z-50" />
                            {availableSkills.length > 0 && selectedTrade !== 'All Services' && (
                                <CustomSelect value={selectedSkill} placeholder="All Skills" searchPlaceholder="Search skills..."
                                    onChange={(val) => { const v = val || 'All Skills'; setSelectedSkill(v); router.replace(`/browse?service=${selectedTrade}&skill=${v}&district=${selectedDistrict}`, { scroll: false }); }}
                                    options={["All Skills", ...availableSkills]} className="flex-shrink-0 w-36 z-40" />
                            )}
                            <CustomSelect value={selectedDistrict} placeholder="All Districts" searchPlaceholder="Search districts..."
                                onChange={(val) => { setSelectedDistrict(val); router.replace(`/browse?service=${selectedTrade}&district=${val}`, { scroll: false }); }}
                                options={["All Districts", ...DISTRICTS]} className="flex-shrink-0 w-36 z-30" />
                            <button onClick={detectLocation} disabled={detecting}
                                className="flex-shrink-0 w-10 h-10 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex items-center justify-center text-[#64748b] hover:text-[#1d4ed8] transition-all disabled:opacity-30"
                                title="Auto-detect my district" aria-label="Detect my location">
                                {detecting ? <Loader2 className="w-4 h-4 animate-spin text-[#1d4ed8]" /> : <Navigation className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="px-4 py-6 space-y-3 max-w-2xl mx-auto">
                        <AnimatePresence mode="popLayout">
                            {filteredWorkers.length === 0 ? (
                                <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    className="py-16 px-4 flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-16 h-16 bg-[#eff6ff] rounded-[1.5rem] flex items-center justify-center border border-[#dbeafe]">
                                        <SearchX className="w-8 h-8 text-[#1d4ed8]" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-black text-[#0f172a] uppercase tracking-tight">No workers found</h3>
                                        <p className="text-[#64748b] text-xs max-w-xs mx-auto leading-relaxed">Try a different service or district, or get notified when one joins.</p>
                                    </div>
                                    <div className="flex flex-col gap-3 w-full max-w-xs">
                                        <Link href={`/customer/register?service=${selectedTrade === 'All Services' ? 'General' : encodeURIComponent(selectedTrade)}&district=${selectedDistrict === 'All Districts' ? 'Colombo' : encodeURIComponent(selectedDistrict)}`}
                                            className="w-full py-4 bg-[#1d4ed8] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-center shadow-md shadow-[#1d4ed8]/20">
                                            Notify me when available
                                        </Link>
                                        <button onClick={() => { setSelectedTrade('All Services'); setSelectedDistrict('All Districts'); setSearchQuery(''); }}
                                            className="w-full flex items-center justify-center gap-2 py-4 bg-white text-[#64748b] border border-[#e2e8f0] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                                            <RotateCcw className="w-4 h-4" /> Reset Filters
                                        </button>
                                    </div>
                                </m.div>
                            ) : filteredWorkers.map((w, i) => (
                                <m.div key={w.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                    <Link 
                                        href={`/worker/${w.id}`}
                                        className="bg-white border border-[#e2e8f0] rounded-[1.5rem] p-4 flex items-center gap-4 active:scale-[0.98] transition-all shadow-sm group"
                                    >
                                        {/* Left Side: Worker Image */}
                                        <div className="relative flex-shrink-0">
                                            <div className="w-14 h-14 rounded-full overflow-hidden border border-[#e2e8f0] bg-[#f8fafc] relative shadow-sm">
                                                {w.profile_photo_url && !imageErrors[w.profile_photo_url] ? (
                                                    <img src={w.profile_photo_url} alt={w.full_name} width="56" height="56" loading="lazy"
                                                        onError={() => setImageErrors(prev => ({ ...prev, [w.profile_photo_url]: true }))}
                                                        className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[#cbd5e1] font-black text-xl">{w.full_name[0]}</div>
                                                )}
                                            </div>
                                            {w.is_identity_verified && (
                                                <div className="absolute -bottom-0.5 -right-0.5 bg-[#1d4ed8] p-1 rounded-full border-2 border-white shadow">
                                                    <ShieldCheck className="w-2.5 h-2.5 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Middle: Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-bold text-[#0f172a] truncate">{w.full_name}</h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-[#1d4ed8]">
                                                    {w.trade_category}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-bold text-[#64748b] uppercase tracking-tight">
                                                <span>{w.home_district}</span>
                                                <span className="text-[#e2e8f0]">•</span>
                                                <span>{w.years_experience}y exp</span>
                                            </div>
                                        </div>

                                        {/* Right Side: Chevron */}
                                        <ChevronRight className="w-5 h-5 text-[#94a3b8] group-hover:text-[#1d4ed8] transition-colors flex-shrink-0" />
                                    </Link>
                                </m.div>
                            ))}
                        </AnimatePresence>

                        {filteredWorkers.length > 0 && (
                            <div className="py-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                End of Results
                            </div>
                        )}
                    </div>
                </div>

                {/* ══════════════════════════════════════════
                            DESKTOP LAYOUT  (md+)
                    ══════════════════════════════════════════ */}
                <div className="hidden md:block pt-12 pb-12 px-6">
                    {/* Hero */}
                    <div className="space-y-4 mb-10">
                        <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-none text-[#0f172a]">Find Your <br /><span className="text-[#1d4ed8]">Service Hero.</span></h1>
                        <p className="text-[#64748b] text-sm font-medium max-w-md">Browse verified electricians, plumbers, and home workers across Sri Lanka. High trust, zero commission.</p>
                    </div>

                    {/* Full Filter Bar */}
                    <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-center bg-white p-3 md:p-4 rounded-3xl md:rounded-[2rem] border border-[#e2e8f0] shadow-sm mb-10">
                        <div className="flex-1 w-full relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1d4ed8]" />
                            <input type="text" placeholder="Search by name, skill or area..."
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 pl-12 pr-6 text-sm text-[#0f172a] placeholder:text-[#94a3b8] outline-none focus:border-[#1d4ed8] transition-all font-medium"
                            />
                        </div>
                        <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
                            <CustomSelect value={selectedTrade} placeholder="All Services" searchPlaceholder="Search services or keywords..."
                                onChange={(val) => { setSelectedTrade(val); setSelectedSkill('All Skills'); router.replace(`/browse?service=${val}&skill=All Skills&district=${selectedDistrict}`, { scroll: false }); }}
                                options={tradesOptions} className="w-full md:w-64 z-50" />
                            {availableSkills.length > 0 && selectedTrade !== 'All Services' && (
                                <CustomSelect value={selectedSkill} placeholder="All Skills" searchPlaceholder="Search skills..."
                                    onChange={(val) => { const v = val || 'All Skills'; setSelectedSkill(v); router.replace(`/browse?service=${selectedTrade}&skill=${v}&district=${selectedDistrict}`, { scroll: false }); }}
                                    options={["All Skills", ...availableSkills]} className="w-full md:w-56 z-40" />
                            )}
                            <div className="flex gap-3 w-full md:w-auto">
                                <CustomSelect value={selectedDistrict} placeholder="All Districts" searchPlaceholder="Search districts..."
                                    onChange={(val) => { setSelectedDistrict(val); router.replace(`/browse?service=${selectedTrade}&district=${val}`, { scroll: false }); }}
                                    options={["All Districts", ...DISTRICTS]} className="flex-1 md:w-48 z-30" />
                                <button onClick={detectLocation} disabled={detecting}
                                    className="w-16 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 flex items-center justify-center text-[#64748b] hover:text-[#1d4ed8] hover:border-[#1d4ed8]/50 transition-all disabled:opacity-30 group flex-shrink-0 shadow-sm"
                                    title="Auto-detect my district" aria-label="Detect my location">
                                    {detecting ? <Loader2 className="w-5 h-5 animate-spin text-[#1d4ed8]" /> : <Navigation className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Count & View Toggle */}
                    <div className="flex items-center justify-between mb-8 px-2">
                        <p className="text-xs font-bold text-[#64748b] uppercase tracking-[0.2em]">Showing {filteredWorkers.length} Verified Partners in Sri Lanka</p>
                        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[#e2e8f0] shadow-sm">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#1d4ed8] text-white shadow-lg shadow-[#1d4ed8]/20' : 'text-[#64748b] hover:text-[#1d4ed8] hover:bg-[#eff6ff]'}`}>
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#1d4ed8] text-white shadow-lg shadow-[#1d4ed8]/20' : 'text-[#64748b] hover:text-[#1d4ed8] hover:bg-[#eff6ff]'}`}>
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Desktop Grid / List */}
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                        <AnimatePresence mode="popLayout">
                            {filteredWorkers.length === 0 ? (
                                <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    className="col-span-full py-24 px-6 flex flex-col items-center justify-center text-center space-y-8">
                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-[#eff6ff] rounded-[2rem] flex items-center justify-center border border-[#dbeafe] shadow-sm">
                                        <SearchX className="w-10 h-10 md:w-12 md:h-12 text-[#1d4ed8]" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xl md:text-2xl font-black text-[#0f172a] uppercase tracking-tight">No Baas discovered in this city yet</h3>
                                        <p className="text-[#64748b] text-sm max-w-xs mx-auto font-bold uppercase tracking-widest leading-relaxed">
                                            We are growing fast. Leave your number and we&apos;ll alert you when a verified partner is available near you.
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md">
                                        <Link href={`/customer/register?service=${selectedTrade === 'All Services' ? 'General' : encodeURIComponent(selectedTrade)}&district=${selectedDistrict === 'All Districts' ? 'Colombo' : encodeURIComponent(selectedDistrict)}`}
                                            className="w-full sm:w-auto px-10 py-5 bg-[#1d4ed8] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#1d4ed8]/20 text-center">
                                            Notify me when available
                                        </Link>
                                        <button onClick={() => { setSelectedTrade('All Services'); setSelectedDistrict('All Districts'); setSearchQuery(''); }}
                                            className="w-full sm:w-auto group flex items-center justify-center gap-3 px-10 py-5 bg-white text-[#64748b] border border-[#e2e8f0] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-[#f8fafc] hover:text-[#1d4ed8] hover:border-[#1d4ed8]/50">
                                            <RotateCcw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" /> Reset Filters
                                        </button>
                                    </div>
                                </m.div>
                            ) : filteredWorkers.map((w, i) => (
                                <m.div key={w.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    className={`group bg-gradient-to-br from-white to-blue-50 border transition-all duration-500 hover:shadow-xl hover:border-[#3b82f6]/50 border-l-0 relative overflow-hidden
                                        ${viewMode === 'grid' ? "rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-between" : "rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-6"}
                                        ${w.is_featured ? 'border-amber-500/30' : 'border-[#e2e8f0]'}`}>
                                    <div className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-500 group-hover:h-3 ${w.is_featured ? 'bg-gradient-to-r from-amber-400 to-[#1d4ed8]' : 'bg-[#1d4ed8]'}`} />
                                    {w.is_featured && (
                                        <div className="absolute top-6 right-6 z-10">
                                            <div className="bg-amber-400 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-400/20 flex items-center gap-1.5">
                                                <Star className="w-3 h-3 fill-black" /> Premium Partner
                                            </div>
                                        </div>
                                    )}
                                    <div className={viewMode === 'grid' ? "space-y-6" : "flex items-center gap-4 md:gap-6 w-full md:flex-1 min-w-0"}>
                                        <WorkerPhoto w={w} size="lg" />
                                        <div className="space-y-1 min-w-0 font-sans">
                                            <h3 className="text-xl font-bold truncate text-[#0f172a]">{w.full_name}</h3>
                                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1d4ed8]">
                                                <span className="bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100/50">{w.trade_category}</span>
                                                <span className="text-[#cbd5e1]">•</span>
                                                <span className="text-[#64748b] bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100/50">{w.years_experience} Years Exp</span>
                                            </div>
                                            {viewMode === 'list' && <p className="text-sm text-[#64748b] truncate mt-2">{w.short_bio || 'Verified service professional in Sri Lanka.'}</p>}
                                        </div>
                                    </div>
                                    {viewMode === 'grid' && (
                                        <p className="text-sm text-[#64748b] leading-relaxed line-clamp-2 my-6 font-medium">
                                            {w.short_bio || `Professional ${w.trade_category} available for high-quality repairs and maintenance work in ${w.home_district} and nearby areas.`}
                                        </p>
                                    )}
                                    <div className={viewMode === 'grid' ? "space-y-6" : "flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto mt-4 md:mt-0"}>
                                        <div className="flex items-center gap-4 text-xs font-bold text-[#64748b]">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eff6ff] rounded-full border border-[#dbeafe] text-[#1d4ed8]">
                                                <MapPin className="w-3 h-3" />{w.home_district}
                                            </div>
                                            {w.is_reference_checked && (
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#dcfce7] rounded-full border border-[#bbf7d0] text-[#16a34a]">
                                                    <UserCheck className="w-3 h-3" /> Verified
                                                </div>
                                            )}
                                        </div>
                                        <Link href={`/worker/${w.id}`}
                                            className="w-full group/btn flex items-center justify-between px-6 py-4 bg-white border-2 border-[#e2e8f0] text-[#334155] rounded-2xl transition-all hover:border-[#1d4ed8] hover:bg-[#1d4ed8] hover:text-white hover:shadow-xl hover:shadow-[#1d4ed8]/20">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">View Profile</span>
                                            <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                        </Link>
                                    </div>
                                </m.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Bottom Marker */}
                    {filteredWorkers.length > 0 && (
                        <div className="py-12 mt-12 border-t border-[#e2e8f0] text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            End of Results
                        </div>
                    )}
                </div>

            </main>

            {/* FIXED BOTTOM NAVIGATION / DESKTOP DOCK */}
            <div className="fixed bottom-0 md:bottom-10 w-full md:w-auto md:left-1/2 md:-translate-x-1/2 z-[60] bg-white/80 backdrop-blur-xl border-t md:border border-[#e2e8f0] pb-6 pt-3 px-6 md:px-12 md:py-4 flex justify-around items-center shadow-[0_-4px_25px_rgba(0,0,0,0.05)] md:shadow-2xl md:rounded-[2rem] transition-all duration-500">
                <Link href="/" className="flex flex-col items-center gap-1.5 min-w-[64px] text-[#64748b] hover:text-[#1d4ed8] transition-colors group">
                    <Home className="w-6 h-6 transition-transform group-hover:scale-110" />
                    <span className="text-[11px] font-medium">Home</span>
                </Link>
                <Link href="/browse" className="flex flex-col items-center gap-1.5 min-w-[64px] text-[#1d4ed8] group">
                    <Search className="w-6 h-6 transition-transform group-hover:scale-110" />
                    <span className="text-[11px] font-bold">Browse</span>
                </Link>
                <Link href="/how-it-works" className="flex flex-col items-center gap-1.5 min-w-[64px] text-[#64748b] hover:text-[#1d4ed8] transition-colors group">
                    <BookOpen className="w-6 h-6 transition-transform group-hover:scale-110" />
                    <span className="text-[11px] font-medium">Guide</span>
                </Link>
                <Link href="/register" className="flex flex-col items-center gap-1.5 min-w-[64px] text-[#64748b] hover:text-[#1d4ed8] transition-colors group">
                    <Wrench className="w-6 h-6 transition-transform group-hover:scale-110" />
                    <span className="text-[11px] font-medium">Join Pro</span>
                </Link>
            </div>
        </div>
    );
}
