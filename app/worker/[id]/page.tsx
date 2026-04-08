import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { supabaseAdmin } from '../../lib/supabaseServer'
import { MapPin, Briefcase, Star, ShieldCheck, CheckCircle2, ChevronLeft, Globe, Music, Share2, Award, Calendar } from 'lucide-react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import WhatsAppButton from './components/WhatsAppButton'
import PortfolioGallery from './components/PortfolioGallery'

interface WorkerPageProps {
    params: Promise<{ id: string }>;
}

/**
 * 1. SEO: Progressive Metadata Generation
 */
export async function generateMetadata({ params }: WorkerPageProps): Promise<Metadata> {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const isAdmin = !!cookieStore.get('grabme_admin_token')?.value;

        let query = supabaseAdmin
            .from('workers')
            .select('full_name, trade_category, home_district, profile_photo_url, account_status')
            .eq('id', id);
        
        if (!isAdmin) {
            query = query.eq('account_status', 'active');
        }

        const { data: worker } = await query.single();

        if (!worker) return { title: 'Worker Profile | Grab Me' };

        const title = `${worker.full_name} - ${worker.trade_category} in ${worker.home_district} | Grab Me`;
        const description = `Looking for a professional ${worker.trade_category}? View ${worker.full_name}'s verified profile and hire them directly on Grab Me.`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'profile',
                url: `https://www.grabme.page/worker/${id}`,
                images: worker.profile_photo_url ? [
                    {
                        url: worker.profile_photo_url,
                        width: 1200,
                        height: 630,
                        alt: worker.full_name,
                    }
                ] : [
                    {
                        url: '/grabme.png',
                        width: 1200,
                        height: 630,
                        alt: 'Grab Me Sri Lanka'
                    }
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
            }
        };
    } catch {
        return { title: 'Worker Profile | Grab Me' };
    }
}

/**
 * 2. Public Profile Page Content (Server Component)
 */
export default async function WorkerProfilePage({ params }: WorkerPageProps) {
    const { id } = await params;
    const cookieStore = await cookies();
    const isAdmin = !!cookieStore.get('grabme_admin_token')?.value;

    // SECURITY: Use admin client to bypass RLS (needed to fetch by ID + status filter),
    // but apply the approved public whitelist — NEVER include phone, nic_number, password,
    // email, nic_front_url, nic_back_url, selfie_url, reference_phone, emergency_contact, address.
    let query = supabaseAdmin
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
            is_experience_verified,
            is_featured,
            account_status,
            facebook_url,
            instagram_url,
            tiktok_url,
            created_at
        `)
        .eq('id', id);

    // If not admin, restrict to active profiles only
    if (!isAdmin) {
        query = query.eq('account_status', 'active');
    }

    const { data: worker, error } = await query.single();

    if (error || !worker) {
        notFound();
    }

    // Structured Data (JSON-LD) for Person and ProfessionalService
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": worker.full_name,
        "jobTitle": worker.trade_category,
        "address": {
            "@type": "PostalAddress",
            "addressLocality": worker.home_district,
            "addressRegion": worker.home_district,
            "addressCountry": "LK"
        },
        "description": worker.short_bio || `Professional ${worker.trade_category} in ${worker.home_district}`,
        "image": worker.profile_photo_url || "https://www.grabme.page/grabme.png",
        "hasCredential": [
          {
            "@type": "EducationalOccupationalCredential",
            "credentialCategory": "Professional Verification"
          }
        ],
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://www.grabme.page/worker/${id}`
        }
    };

    return (
        <div className="min-h-[100dvh] bg-[#f8fafc] text-[#0f172a] font-outfit pb-28 relative">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

            <header className="sticky top-0 z-50 bg-white border-b border-[#e2e8f0] px-5 py-4 flex items-center justify-between shadow-sm">
                <Link href="/browse" className="w-10 h-10 flex items-center">
                    <ChevronLeft className="w-5 h-5 text-[#0f172a]" />
                </Link>
                <span className="text-sm font-black uppercase tracking-widest text-[#0f172a]">Profile</span>
                {worker.account_status !== 'active' ? (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                ) : (
                    <div className="w-10" />
                )}
            </header>

            <main className="relative z-10 w-full">
                {/* ══════════════════════════════════════════
                            MOBILE LAYOUT  (< md)
                    ══════════════════════════════════════════ */}
                <div className="md:hidden bg-white min-h-screen pb-28">
                    {/* Header Section (Centered) */}
                    <div className="px-5 pt-8 pb-6 flex flex-col items-center text-center">
                        {/* Profile Image */}
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#e2e8f0] ring-4 ring-[#eff6ff] shadow-sm relative mx-auto">
                                {worker.profile_photo_url ? (
                                    <Image src={worker.profile_photo_url} alt={worker.full_name} fill sizes="96px" className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-[#f8fafc] flex items-center justify-center text-3xl font-black text-[#cbd5e1]">
                                        {worker.full_name[0]}
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-[#16a34a] text-white p-1 rounded-lg border-2 border-white shadow-lg">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                        </div>

                        <h1 className="text-2xl font-black text-[#0f172a] tracking-tight mt-3">{worker.full_name}</h1>
                        
                        <div className="flex flex-col items-center gap-2 mt-3">
                            <p className="flex items-center gap-2 text-[#1d4ed8] text-[10px] font-black uppercase tracking-[0.15em] leading-none bg-[#eff6ff] px-3 py-1.5 rounded-full border border-[#dbeafe]">
                                <Briefcase className="w-3 h-3" /> {worker.trade_category}
                            </p>
                            <p className="flex items-center gap-2 text-[#64748b] text-[10px] font-black uppercase tracking-[0.15em] leading-none">
                                <MapPin className="w-3 h-3 text-[#3b82f6]" /> {worker.home_district}
                            </p>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Calendar className="w-3 h-3" /> Since {new Date(worker.created_at).getFullYear()}
                        </div>
                    </div>

                    {/* TRUST SCORE SUMMARY (2x2 Grid) */}
                    <div className="grid grid-cols-2 gap-3 px-5 py-6">
                        {[
                            { label: 'Identity', val: worker.is_identity_verified, icon: ShieldCheck, colors: 'bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]' },
                            { label: 'Reference', val: worker.is_reference_checked, icon: Star, colors: 'bg-[#dbeafe] text-[#1e3a8a] border-[#93c5fd]' },
                            { label: 'Documents', val: worker.is_certificate_verified, icon: Award, colors: 'bg-[#fef9c3] text-[#854d0e] border-[#fde68a]' },
                            { label: 'Experience', val: !!worker.is_experience_verified, icon: Briefcase, colors: 'bg-[#f8fafc] text-[#1d4ed8] border-[#e2e8f0]' },
                        ].map((badge, i) => (
                            <div key={i} className={`p-4 rounded-2xl border ${badge.val ? badge.colors : 'bg-[#f8fafc] border-[#e2e8f0] text-[#94a3b8]'} flex flex-col items-center gap-1.5 text-center transition-all`}>
                                <badge.icon className={`w-4 h-4 ${badge.val ? 'animate-pulse' : ''}`} />
                                <span className="text-[9px] font-black uppercase tracking-wider">{badge.label}</span>
                                <span className="text-[8px] font-bold uppercase opacity-60 tracking-wider">{badge.val ? 'Verified' : 'Pending'}</span>
                            </div>
                        ))}
                    </div>

                    {/* Bio Section */}
                    <div className="px-5 py-6 space-y-4">
                        <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1d4ed8] mb-3">About Me</h3>
                            <p className="text-[#334155] leading-relaxed text-sm font-medium">
                                {worker.short_bio || "No professional bio provided."}
                            </p>
                        </div>
                    </div>

                    {/* Skills Selection */}
                    <div className="px-5 py-6 space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1d4ed8]">Expertise</h3>
                        <div className="flex flex-wrap gap-2">
                            {worker.sub_skills && worker.sub_skills.length > 0 ? (
                                worker.sub_skills.map((skill: string) => (
                                    <div key={skill} className="px-4 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[10px] font-bold text-[#0f172a] uppercase tracking-widest flex items-center gap-2 shadow-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8]" /> {skill}
                                    </div>
                                ))
                            ) : (
                                <p className="text-[#94a3b8] text-[10px] font-bold uppercase italic">General Services</p>
                            )}
                        </div>
                    </div>

                    {/* Portfolio */}
                    <div className="px-5 py-6">
                        <PortfolioGallery 
                            photos={worker.past_work_photos || []}
                            certificateUrl={worker.certificate_url}
                            isVerified={worker.is_certificate_verified}
                        />
                    </div>

                </div>

                {/* ══════════════════════════════════════════
                            DESKTOP LAYOUT  (md+)
                    ══════════════════════════════════════════ */}
                <div className="hidden md:block max-w-4xl mx-auto py-12 px-6">
                    <div className="relative bg-white border border-[#e2e8f0] border-t-8 border-t-[#1d4ed8] rounded-[3rem] p-12 shadow-2xl overflow-hidden">
                        {/* Desktop Hero Section */}
                        <div className="flex items-start gap-12">
                            <div className="relative flex-shrink-0">
                                <div className="w-48 h-48 rounded-[2.5rem] overflow-hidden border-2 border-[#e2e8f0] ring-8 ring-[#eff6ff] shadow-xl relative">
                                    {worker.profile_photo_url ? (
                                        <Image src={worker.profile_photo_url} alt={worker.full_name} fill sizes="192px" className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-[#f8fafc] flex items-center justify-center text-6xl font-black text-[#cbd5e1]">
                                            {worker.full_name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-[#16a34a] text-white p-2 rounded-2xl border-4 border-white shadow-2xl">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="flex-1 space-y-6 pt-2">
                                <div className="space-y-2">
                                    <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">{worker.full_name}</h1>
                                    <div className="flex items-center gap-6">
                                        <p className="flex items-center gap-2 text-[#1d4ed8] text-xs font-black uppercase tracking-widest leading-none bg-[#eff6ff] px-4 py-2 rounded-full border border-[#dbeafe]">
                                            <Briefcase className="w-4 h-4" /> {worker.trade_category}
                                        </p>
                                        <p className="flex items-center gap-2 text-[#64748b] text-xs font-black uppercase tracking-widest leading-none">
                                            <MapPin className="w-4 h-4 text-[#3b82f6]" /> {worker.home_district}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 pt-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <Calendar className="w-4 h-4" /> Since {new Date(worker.created_at).getFullYear()}
                                    </div>
                                    {(worker.facebook_url || worker.instagram_url || worker.tiktok_url) && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mr-2">Profiles:</span>
                                            {worker.instagram_url && (
                                                <a href={worker.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#1d4ed8] hover:bg-[#1d4ed8] hover:text-white transition-all">
                                                    <Globe className="w-4 h-4" />
                                                </a>
                                            )}
                                            {worker.facebook_url && (
                                                <a href={worker.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#1d4ed8] hover:bg-[#1d4ed8] hover:text-white transition-all">
                                                    <Share2 className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* TRUST SCORE SUMMARY (4 Columns) */}
                        <div className="grid grid-cols-4 gap-4 mt-12 mb-12">
                            {[
                                { label: 'Identity', val: worker.is_identity_verified, icon: ShieldCheck, colors: 'bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]' },
                                { label: 'Reference', val: worker.is_reference_checked, icon: Star, colors: 'bg-[#dbeafe] text-[#1e3a8a] border-[#93c5fd]' },
                                { label: 'Documents', val: worker.is_certificate_verified, icon: Award, colors: 'bg-[#fef9c3] text-[#854d0e] border-[#fde68a]' },
                                { label: 'Experience', val: !!worker.is_experience_verified, icon: Briefcase, colors: 'bg-[#f8fafc] text-[#1d4ed8] border-[#e2e8f0]' },
                            ].map((badge, i) => (
                                <div key={i} className={`p-6 rounded-[2rem] border ${badge.val ? badge.colors : 'bg-[#f8fafc] border-[#e2e8f0] text-[#94a3b8]'} flex flex-col items-center gap-2 text-center transition-all`}>
                                    <badge.icon className={`w-6 h-6 ${badge.val ? 'animate-pulse' : ''}`} />
                                    <span className="text-[10px] font-black uppercase tracking-wider">{badge.label}</span>
                                    <span className="text-[9px] font-bold uppercase opacity-60 tracking-wider">{badge.val ? 'Verified' : 'Pending'}</span>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                            <div className="space-y-12">
                                {/* Bio Section */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#1d4ed8]">Professional Bio</h3>
                                    <p className="text-[#334155] leading-relaxed text-base font-medium">
                                        {worker.short_bio || "No professional bio provided."}
                                    </p>
                                </div>

                                {/* Skills Section */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#1d4ed8]">Expertise & Services</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {worker.sub_skills && worker.sub_skills.length > 0 ? (
                                            worker.sub_skills.map((skill: string) => (
                                                <div key={skill} className="px-5 py-3 bg-white border border-[#e2e8f0] rounded-2xl text-xs font-bold text-[#0f172a] uppercase tracking-widest flex items-center gap-3 hover:border-[#1d4ed8]/30 transition-all shadow-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-[#1d4ed8]" /> {skill}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-[#94a3b8] text-xs font-bold uppercase italic">General Services</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-12">
                                {/* PORTFOLIO */}
                                <PortfolioGallery 
                                    photos={worker.past_work_photos || []}
                                    certificateUrl={worker.certificate_url}
                                    isVerified={worker.is_certificate_verified}
                                />

                                {/* Main CTA */}
                                <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] space-y-6">
                                    <div className="space-y-2 text-center">
                                        <h4 className="text-xl font-black text-[#1e3a8a] tracking-tight">Ready to collaborate?</h4>
                                        <p className="text-sm text-[#64748b] font-medium italic">Click below to start a direct WhatsApp chat.</p>
                                    </div>
                                    <WhatsAppButton workerId={worker.id} workerTrade={worker.trade_category} />
                                    <p className="text-center text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">Verified Partner • High Trust • Direct Contact</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* MOBILE FIXED BOTTOM ACTION BAR */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e2e8f0] p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
                <div className="space-y-3">
                    <WhatsAppButton 
                        workerId={worker.id} 
                        workerTrade={worker.trade_category}
                    />
                    <p className="text-center text-[9px] font-bold uppercase tracking-widest text-slate-400 px-8 leading-relaxed">
                        By contacting this worker, you agree to our 
                        <Link href="/terms" className="text-[#1d4ed8] underline mx-1">Terms of Service</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
