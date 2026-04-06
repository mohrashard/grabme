'use client'

import React, { useEffect, useState, useCallback, Suspense } from 'react'
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
    Bell,
    Navigation,
    Loader2
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { DISTRICTS } from '../register/constants'
import { fetchTaxonomyAction, type TaxonomyData } from '@/app/lib/taxonomyActions'

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
};

function BrowsePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTrade, setSelectedTrade] = useState(searchParams.get('service') || 'All Services');
    const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get('district') || 'All Districts');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
    const [detecting, setDetecting] = useState(false);
    const [taxonomy, setTaxonomy] = useState<TaxonomyData | null>(null);

    useEffect(() => {
        fetchTaxonomyAction().then(data => setTaxonomy(data));
    }, []);

    const TRADES = taxonomy?.services?.map(s => s.name) ?? [];

    const fetchWorkers = useCallback(async () => {
        setLoading(true);
        // SECURITY: Explicitly select only the approved public whitelist.
        // NEVER add: phone, nic_number, password, email, nic_front_url, nic_back_url,
        //            selfie_url, reference_phone, emergency_contact, address
        let query = supabase
            .from('workers')
            .select(`
                id,
                full_name,
                trade_category,
                sub_skills,
                years_experience,
                short_bio,
                home_district,
                districts_covered,
                specific_areas,
                profile_photo_url,
                past_work_photos,
                certificate_url,
                is_identity_verified,
                is_reference_checked,
                is_certificate_verified,
                is_featured,
                account_status
            `)
            .eq('account_status', 'active')
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false });

        if (selectedTrade !== 'All Services') {
            query = query.eq('trade_category', selectedTrade);
        }
        if (selectedDistrict !== 'All Districts') {
            query = query.eq('home_district', selectedDistrict);
        }

        const { data, error } = await query;
        if (error) {
            toast.error("Failed to load platform data. Please refresh.");
        } else if (data) {
            setWorkers(data as Worker[]);
        }
        setLoading(false);
    }, [selectedTrade, selectedDistrict]);

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

    useEffect(() => {
        fetchWorkers();
    }, [fetchWorkers]);

    const filteredWorkers = workers.filter(w => {
        const s = searchQuery.toLowerCase().trim();
        if (!s) return true;

        // 1. Direct field matches (Name, Trade, Skills, Area)
        const directMatch = (
            w.full_name.toLowerCase().includes(s) ||
            w.trade_category.toLowerCase().includes(s) ||
            (w.specific_areas && w.specific_areas.some(a => a.toLowerCase().includes(s))) ||
            ((w as any).sub_skills && (w as any).sub_skills.some((sk: string) => sk.toLowerCase().includes(s)))
        );
        if (directMatch) return true;

        // 2. DB-powered Smart Keyword Expansion
        // e.g. "my bike is broken" -> tokens: [my, bike, is, broken] -> bike -> Vehicle Mechanic
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
        <div className="min-h-screen bg-[#090A0F] text-white font-sans">
            {/* Header / Nav */}
            <nav className="fixed top-0 w-full z-50 bg-[#090A0F]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-white/10">
                            <Image src="/grabme.png" alt="Grab Me" fill sizes="32px" className="object-cover" />
                        </div>
                        <span className="text-white text-lg font-bold tracking-tight">Grab Me</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/register" className="text-xs font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest hidden sm:block">Join as Partner</Link>
                    </div>
                </div>
            </nav>

            <main className="pt-24 lg:pt-32 pb-24 px-4 lg:px-6 max-w-7xl mx-auto">
                {/* Hero / Filter Section */}
                <div className="space-y-10 mb-16">
                    <div className="space-y-4">
                        <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-none">Find Your <br /><span className="text-indigo-500">Service Hero.</span></h1>
                        <p className="text-white/40 text-sm font-medium max-w-md">Browse verified home workers across Sri Lanka. High trust, zero commission.</p>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-center bg-[#18181B] p-3 md:p-4 rounded-3xl md:rounded-[2rem] border border-white/5 shadow-2xl">
                        <div className="flex-1 w-full relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input 
                                type="text"
                                placeholder="Search by name or skill..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:border-indigo-500 transition-all font-medium"
                            />
                        </div>
                        <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
                            <select 
                                value={selectedTrade}
                                onChange={(e) => {
                                    const newTrade = e.target.value;
                                    setSelectedTrade(newTrade);
                                    router.replace(`/browse?service=${newTrade}&district=${selectedDistrict}`, { scroll: false });
                                }}
                                className="w-full md:w-48 bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm outline-none [color-scheme:dark] hover:border-white/20 transition-all font-bold"
                            >
                                <option>All Services</option>
                                {TRADES.map(t => <option key={t}>{t}</option>)}
                            </select>
                            <div className="flex gap-3 w-full md:w-auto">
                                <select 
                                    value={selectedDistrict}
                                    onChange={(e) => {
                                        const newDistrict = e.target.value;
                                        setSelectedDistrict(newDistrict);
                                        router.replace(`/browse?service=${selectedTrade}&district=${newDistrict}`, { scroll: false });
                                    }}
                                    className="flex-1 md:w-48 bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm outline-none [color-scheme:dark] hover:border-white/20 transition-all font-bold"
                                >
                                    <option>All Districts</option>
                                    {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                                </select>
                                <button 
                                    onClick={detectLocation}
                                    disabled={detecting}
                                    className="w-16 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-center text-white/40 hover:text-indigo-400 hover:border-indigo-500/50 transition-all disabled:opacity-30 group flex-shrink-0"
                                    title="Auto-detect my district"
                                >
                                    {detecting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
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
                    <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Showing {filteredWorkers.length} Verified Partners</p>
                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#4F46E5] text-white shadow-lg shadow-indigo-500/20' : 'text-white/20 hover:text-white'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#4F46E5] text-white shadow-lg shadow-indigo-500/20' : 'text-white/20 hover:text-white'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Grid / List */}
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="bg-[#18181B] h-80 rounded-[2rem] border border-white/5 animate-pulse" />
                            ))
                        ) : filteredWorkers.length === 0 ? (
                            <m.div 
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }}
                                className="col-span-full py-32 flex flex-col items-center text-center space-y-8 bg-[#18181B]/50 border border-white/5 rounded-[3rem] shadow-2xl backdrop-blur-sm px-6"
                            >
                                <div className="w-24 h-24 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                                    <SearchX className="w-12 h-12 text-indigo-400" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">No Service Pro's in this area yet</h3>
                                    <p className="text-white/30 text-sm max-w-xs mx-auto font-bold uppercase tracking-widest leading-relaxed">
                                        We are growing fast. Leave your number and we'll contact you when a verified partner is available near you.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                                    <Link 
                                        href={`/customer/register?service=${selectedTrade === 'All Services' ? 'General' : encodeURIComponent(selectedTrade)}&district=${selectedDistrict === 'All Districts' ? 'Colombo' : encodeURIComponent(selectedDistrict)}`}
                                        className="w-full sm:w-auto px-10 py-5 bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/20 text-center"
                                    >
                                        Notify me when available
                                    </Link>
                                    <button 
                                        onClick={() => { setSelectedTrade('All Services'); setSelectedDistrict('All Districts'); setSearchQuery(''); }}
                                        className="w-full sm:w-auto group flex items-center justify-center gap-3 px-10 py-5 bg-white/5 text-white/40 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-white/10 hover:text-white"
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
                                className={`group bg-[#18181B] border transition-all duration-500 hover:shadow-2xl relative overflow-hidden ${
                                    viewMode === 'grid' 
                                    ? "rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-between" 
                                    : "rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-6"
                                } ${w.is_featured ? 'border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.05)]' : 'border-white/5'}`}
                            >
                                {w.is_featured && (
                                    <div className="absolute top-6 right-6 z-10">
                                        <div className="bg-amber-500 p-1.5 rounded-lg shadow-lg rotate-12">
                                            <Star className="w-4 h-4 text-black fill-black" />
                                        </div>
                                    </div>
                                )}

                                <div className={viewMode === 'grid' ? "space-y-6" : "flex items-center gap-4 md:gap-6 w-full md:flex-1 min-w-0"}>
                                    {/* Photo & Badge Grid Section */}
                                    <div className={viewMode === 'grid' ? "relative" : "flex-shrink-0"}>
                                        <div className={`${viewMode === 'grid' ? "w-20 h-20" : "w-16 h-16"} rounded-2xl overflow-hidden border border-white/10 bg-white/5 relative`}>
                                            {w.profile_photo_url && !imageErrors[w.profile_photo_url] ? (
                                                <img 
                                                    src={w.profile_photo_url} 
                                                    alt={w.full_name} 
                                                    width="80"
                                                    height="80"
                                                    loading="lazy"
                                                    onError={() => setImageErrors(prev => ({ ...prev, [w.profile_photo_url]: true }))}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/20 font-black text-xl bg-gradient-to-br from-white/5 to-white/[0.02]">
                                                    {w.full_name[0]}
                                                </div>
                                            )}
                                        </div>
                                        {w.is_identity_verified && (
                                            <div className="absolute -bottom-2 -right-2 bg-indigo-500 p-1.5 rounded-lg border-2 border-[#18181B] shadow-xl">
                                                <ShieldCheck className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Section */}
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-bold truncate">{w.full_name}</h3>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#4F46E5]">
                                            <span>{w.trade_category}</span>
                                            <span className="text-white/10">•</span>
                                            <span className="text-white/40">{w.years_experience} Years Exp</span>
                                        </div>
                                        {viewMode === 'list' && (
                                            <p className="text-sm text-white/30 truncate mt-2">{w.short_bio || 'No description provided.'}</p>
                                        )}
                                    </div>
                                </div>

                                {viewMode === 'grid' && (
                                    <p className="text-sm text-white/40 leading-relaxed line-clamp-2 my-6">
                                        {w.short_bio || 'Home service specialist available for high-quality repairs and maintenance work in your area.'}
                                    </p>
                                )}

                                {/* Location & Action */}
                                <div className={viewMode === 'grid' ? "space-y-6" : "flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto mt-4 md:mt-0"}>
                                    <div className="flex items-center gap-4 text-xs font-bold text-white/20">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                                            <MapPin className="w-3 h-3" />
                                            {w.home_district}
                                        </div>
                                        {w.is_reference_checked && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400">
                                                <UserCheck className="w-3 h-3" />
                                                Verified
                                            </div>
                                        )}
                                    </div>

                                    <Link 
                                        href={`/worker/${w.id}`}
                                        className="w-full group/btn flex items-center justify-between px-6 py-4 bg-white text-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                            <MessageCircle className="w-4 h-4" /> View Profile & Connect
                                        </span>
                                        <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                    </Link>
                                </div>
                            </m.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Bottom Trust Badge */}
                <div className="mt-24 py-12 border-t border-white/5 flex flex-col items-center gap-8 text-center">
                    <div className="flex -space-x-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-12 h-12 rounded-full border-4 border-[#090A0F] bg-[#18181B] flex items-center justify-center text-white/20">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold">Safe. Verified. Locally Managed.</h3>
                        <p className="text-sm text-white/40 max-w-sm">Unlike marketplace giants, we verify every single partner manually. High trust, zero commission.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function BrowsePage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
            <BrowsePageContent />
        </Suspense>
    );
}
