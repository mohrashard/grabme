import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { supabaseAdmin } from '../../lib/supabaseServer'
import { MapPin, Briefcase, Star, ShieldCheck, CheckCircle2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import WhatsAppButton from './components/WhatsAppButton'

interface WorkerPageProps {
    params: Promise<{ id: string }>;
}

/**
 * 1. SEO: Progressive Metadata Generation
 */
export async function generateMetadata({ params }: WorkerPageProps): Promise<Metadata> {
    try {
        const { id } = await params;
        const { data: worker } = await supabaseAdmin
            .from('workers')
            .select('full_name, trade_category, home_district, profile_photo_url')
            .eq('id', id)
            .single();

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
                url: `https://grabme.lk/worker/${id}`,
                images: worker.profile_photo_url ? [
                    {
                        url: worker.profile_photo_url,
                        width: 800,
                        height: 800,
                        alt: worker.full_name,
                    }
                ] : [],
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
    // SECURITY: Use admin client to bypass RLS (needed to fetch by ID + status filter),
    // but apply the approved public whitelist — NEVER include phone, nic_number, password,
    // email, nic_front_url, nic_back_url, selfie_url, reference_phone, emergency_contact, address.
    const { data: worker, error } = await supabaseAdmin
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
        .eq('id', id)
        .eq('account_status', 'active')
        .single();

    if (error || !worker) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#090A0F] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            {/* Global Design System Styles */}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&display=swap'); * { font-family: 'Outfit', sans-serif; }`}</style>

            {/* Back Button */}
            <div className="max-w-2xl mx-auto px-6 pt-12 pb-6">
                <Link href="/browse" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-all group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Back to Directory</span>
                </Link>
            </div>

            <main className="max-w-2xl mx-auto px-6 pb-24">
                <div className="relative bg-[#18181B] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[80px] rounded-full" />
                    
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                        {/* Profile Image */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-all duration-500" />
                            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border border-white/10">
                                {worker.profile_photo_url ? (
                                    <Image src={worker.profile_photo_url} alt={worker.full_name} fill sizes="(max-width: 768px) 128px, 160px" className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-white/5 flex items-center justify-center text-4xl font-black text-white/20">
                                        {worker.full_name[0]}
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-xl border-4 border-[#18181B] shadow-xl">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="space-y-1">
                                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{worker.full_name}</h1>
                                <p className="text-indigo-400 font-black text-sm uppercase tracking-[0.2em]">{worker.trade_category}</p>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <div className="px-5 py-2 bg-white/5 rounded-full border border-white/5 flex items-center gap-2 text-[11px] font-bold text-white/60">
                                    <MapPin className="w-3 h-3 text-indigo-400" /> {worker.home_district}
                                </div>
                                <div className="px-5 py-2 bg-white/5 rounded-full border border-white/5 flex items-center gap-2 text-[11px] font-bold text-white/60">
                                    <Briefcase className="w-3 h-3 text-indigo-400" /> {worker.years_experience}+ Years Experience
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div className="mt-12 space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">About Me</h3>
                        <p className="text-white/70 leading-relaxed text-sm md:text-base font-medium">
                            {worker.short_bio || "No professional bio provided."}
                        </p>
                    </div>

                    {/* Skills Section */}
                    <div className="mt-10 space-y-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Skills & Expertise</h3>
                            <div className="h-px flex-1 bg-white/5" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {worker.sub_skills && worker.sub_skills.length > 0 ? (
                                worker.sub_skills.map((skill: string) => (
                                    <div key={skill} className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3 text-indigo-400" /> {skill}
                                    </div>
                                ))
                            ) : (
                                <p className="text-white/20 text-[10px] font-bold uppercase italic">General Services</p>
                            )}
                        </div>
                    </div>

                    {/* Verification Badges */}
                    <div className="mt-12 flex flex-wrap gap-4 pt-8 border-t border-white/5">
                        <div className={`flex items-center gap-2 ${worker.is_identity_verified ? 'text-green-400/60' : 'text-white/20'}`}>
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">ID Verified</span>
                        </div>
                        <div className={`flex items-center gap-2 ${worker.is_reference_checked ? 'text-green-400/60' : 'text-white/20'}`}>
                            <Star className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Reference Checked</span>
                        </div>
                    </div>
                </div>

                {/* Sticky Mobile Button Container / Main CTA */}
                <div className="mt-8">
                    <WhatsAppButton 
                        workerId={worker.id} 
                        workerTrade={worker.trade_category}
                    />
                    <p className="text-center mt-6 text-[10px] font-black uppercase tracking-widest text-white/20 px-12 leading-relaxed">
                        By contacting this worker, you agree to our 
                        <Link href="/terms" className="text-indigo-400/60 hover:text-indigo-400 mx-1 underline underline-offset-4 transition-colors">Terms of Service</Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
