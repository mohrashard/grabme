import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { supabaseAdmin } from '../../lib/supabaseServer'
import { MapPin, Briefcase, Star, ShieldCheck, CheckCircle2, ChevronLeft, Globe, Music, Share2, Award, Calendar } from 'lucide-react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import WhatsAppButton from './components/WhatsAppButton'
import PortfolioGallery from './components/PortfolioGallery'
import Footer from '../../components/Footer'

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
        <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-outfit selection:bg-[#1d4ed8]/10 overflow-x-hidden relative">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

            {/* BRAND HERO HEADER */}
            <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb]" />
            <div className="absolute top-[300px] left-0 right-0 h-[200px] bg-gradient-to-b from-[#2563eb]/20 to-transparent" />

            {/* Back Button and Staff Preview */}
            <div className="max-w-2xl mx-auto px-6 pt-12 pb-6 flex items-center justify-between relative z-20">
                <Link href="/browse" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-all group font-bold">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs uppercase tracking-widest">Back to Directory</span>
                </Link>

                {worker.account_status !== 'active' && (
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                        <div className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Staff Preview</span>
                    </div>
                )}
            </div>

            <main className="max-w-2xl mx-auto px-6 pb-24 relative z-10">
                <div className="relative bg-white border border-[#e2e8f0] border-t-8 border-t-[#1d4ed8] rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#1d4ed8]/5 blur-[80px] rounded-full" />
                    
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                        {/* Profile Image */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-br from-[#1d4ed8] to-[#1e40af] rounded-3xl blur opacity-10 group-hover:opacity-20 transition-all duration-500" />
                            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border border-[#e2e8f0] ring-4 ring-[#dbeafe]">
                                {worker.profile_photo_url ? (
                                    <Image src={worker.profile_photo_url} alt={worker.full_name} fill sizes="(max-width: 768px) 128px, 160px" className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-[#f8fafc] flex items-center justify-center text-4xl font-black text-[#e2e8f0]">
                                        {worker.full_name[0]}
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-[#16a34a] text-white p-1.5 rounded-xl border-4 border-white shadow-xl">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="space-y-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] tracking-tight">{worker.full_name}</h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-6">
                                    <p className="flex items-center gap-2 text-[#1e3a8a] text-[11px] font-bold uppercase tracking-widest leading-none bg-[#dbeafe] px-3 py-1.5 rounded-full">
                                        <Briefcase className="w-3.5 h-3.5" /> {worker.trade_category}
                                    </p>
                                    <p className="flex items-center gap-2 text-[#64748b] text-[11px] font-bold uppercase tracking-widest leading-none">
                                        <MapPin className="w-3.5 h-3.5 text-[#3b82f6]" /> {worker.home_district}
                                    </p>
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-4 pt-1">
                                    <p className="flex items-center gap-2 text-[#64748b] text-[10px] font-black uppercase tracking-[0.2em] leading-none">
                                        <Calendar className="w-3.5 h-3.5" /> Member Since {new Date(worker.created_at).getFullYear()}
                                    </p>
                                </div>

                                {/* SOCIAL LINKS (MINI LINKEDIN) */}
                                {(worker.facebook_url || worker.instagram_url || worker.tiktok_url) && (
                                    <div className="flex items-center justify-center md:justify-start gap-3 pt-3">
                                        {worker.instagram_url && (
                                            <a href={worker.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#64748b] hover:text-[#1d4ed8] hover:border-[#1d4ed8]/30 transition-all" title="Instagram Profile">
                                                <Globe className="w-4 h-4" />
                                            </a>
                                        )}
                                        {worker.tiktok_url && (
                                            <a href={worker.tiktok_url} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#64748b] hover:text-[#1d4ed8] hover:border-[#1d4ed8]/30 transition-all" title="TikTok Profile">
                                                <Music className="w-4 h-4" />
                                            </a>
                                        )}
                                        {worker.facebook_url && (
                                            <a href={worker.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#64748b] hover:text-[#1d4ed8] hover:border-[#1d4ed8]/30 transition-all" title="Facebook Profile">
                                                <Share2 className="w-4 h-4" />
                                            </a>
                                        )}
                                        <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest ml-1">Social Proof</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* TRUST SCORE SUMMARY */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 mb-12">
                        {[
                            { label: 'Identity', val: worker.is_identity_verified, icon: ShieldCheck, colors: 'bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]' },
                            { label: 'Reference', val: worker.is_reference_checked, icon: Star, colors: 'bg-[#dbeafe] text-[#1e3a8a] border-[#93c5fd]' },
                            { label: 'Documents', val: worker.is_certificate_verified, icon: Award, colors: 'bg-[#fef9c3] text-[#854d0e] border-[#fde68a]' },
                            { label: 'Experience', val: !!worker.is_experience_verified, icon: Briefcase, colors: 'bg-[#f1f5f9] text-[#1d4ed8] border-[#e2e8f0]' },
                        ].map((badge, i) => (
                            <div key={i} className={`p-4 rounded-[2rem] border ${badge.val ? badge.colors : 'bg-[#f8fafc] border-[#e2e8f0] text-[#94a3b8]'} flex flex-col items-center gap-2 text-center transition-all`}>
                                <badge.icon className={`w-5 h-5 ${badge.val ? 'animate-pulse' : ''}`} />
                                <span className="text-[10px] font-black uppercase tracking-[0.1em]">{badge.label}</span>
                                <span className="text-[9px] font-bold uppercase opacity-60 tracking-wider font-mono">{badge.val ? 'Verified' : 'Pending'}</span>
                            </div>
                        ))}
                    </div>

                    {/* Bio Section */}
                    <div className="mt-12 p-8 bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-3xl space-y-4 shadow-sm">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1d4ed8]">About Me</h3>
                        <p className="text-[#334155] leading-relaxed text-sm md:text-base font-medium">
                            {worker.short_bio || "No professional bio provided."}
                        </p>
                    </div>

                    {/* Skills Section */}
                    <div className="mt-10 space-y-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1d4ed8]">Skills & Expertise</h3>
                            <div className="h-px flex-1 bg-blue-100" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {worker.sub_skills && worker.sub_skills.length > 0 ? (
                                worker.sub_skills.map((skill: string) => (
                                    <div key={skill} className="px-4 py-2 bg-white border border-blue-100 shadow-sm rounded-xl text-[10px] font-bold text-[#0f172a] uppercase tracking-widest flex items-center gap-2 hover:border-[#1d4ed8]/30 transition-colors">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1d4ed8]" /> {skill}
                                    </div>
                                ))
                            ) : (
                                <p className="text-[#94a3b8] text-[10px] font-bold uppercase italic">General Services</p>
                            )}
                        </div>
                    </div>

                    {/* PORTFOLIO & CERTIFICATES */}
                    <PortfolioGallery 
                        photos={worker.past_work_photos || []}
                        certificateUrl={worker.certificate_url}
                        isVerified={worker.is_certificate_verified}
                    />

                    {/* Verification Badges Bottom */}
                    <div className="mt-12 flex flex-wrap gap-4 pt-8 border-t border-[#e2e8f0]">
                        <div className={`flex items-center gap-2 ${worker.is_identity_verified ? 'text-[#16a34a]' : 'text-[#94a3b8]'}`}>
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">ID Verified</span>
                        </div>
                        <div className={`flex items-center gap-2 ${worker.is_reference_checked ? 'text-[#1d4ed8]' : 'text-[#94a3b8]'}`}>
                            <Star className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Reference Checked</span>
                        </div>
                    </div>
                </div>

                {/* Sticky Mobile Button Container / Main CTA */}
                <div className="mt-8 space-y-4">
                    <WhatsAppButton 
                        workerId={worker.id} 
                        workerTrade={worker.trade_category}
                    />
                    <p className="text-center mt-6 text-[10px] font-black uppercase tracking-widest text-[#94a3b8] px-12 leading-relaxed">
                        By contacting this worker, you agree to our 
                        <Link href="/terms" className="text-[#1d4ed8] hover:underline mx-1 underline-offset-4 transition-colors">Terms of Service</Link>
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
