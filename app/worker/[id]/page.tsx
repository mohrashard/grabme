import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { supabaseAdmin } from '../../lib/supabaseServer'
import { MapPin, Briefcase, Star, ShieldCheck, CheckCircle2, ChevronLeft, Globe, Music, Share2, Award, Calendar } from 'lucide-react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import WhatsAppButton from './components/WhatsAppButton'
import WorkerProfileClientWrapper from './components/WorkerProfileClientWrapper'
import ThemeToggle from './components/ThemeToggle'

interface WorkerPageProps {
    params: Promise<{ id: string }>;
}

// ─────────────────────────────────────────────
// FACADE VIDEO PLAYER — Premium Cinema Overlay
// ─────────────────────────────────────────────
async function VideoPlayer({ url }: { url: string }) {
    if (!url) return null;

    let embedUrl = url;
    let type = 'unknown';
    let thumbnailUrl = '';

    try {
        const urlObj = new URL(url);

        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
            let videoId = '';
            if (urlObj.hostname.includes('youtu.be')) {
                videoId = urlObj.pathname.slice(1);
                type = 'youtube';
            } else if (urlObj.pathname.startsWith('/shorts/')) {
                videoId = urlObj.pathname.split('/')[2];
                type = 'shorts';
            } else {
                videoId = urlObj.searchParams.get('v') || '';
                type = 'youtube';
            }
            if (videoId) {
                embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
                thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            }
        } else if (urlObj.hostname.includes('tiktok.com')) {
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            if (pathParts.length >= 3 && pathParts[1] === 'video') {
                const videoId = pathParts[2];
                if (videoId) {
                    embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
                    type = 'tiktok';
                }
            }
        } else if (urlObj.hostname.includes('instagram.com')) {
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            if (pathParts.length >= 2 && (pathParts[0] === 'p' || pathParts[0] === 'reel')) {
                const shortcode = pathParts[1];
                if (shortcode) {
                    embedUrl = `https://www.instagram.com/p/${shortcode}/embed/?hidecaption=true`;
                    type = pathParts[0] === 'reel' ? 'reel' : 'instagram';
                }
            }
        } else if (urlObj.hostname.includes('facebook.com') || urlObj.hostname.includes('fb.watch')) {
            let finalUrl = url;
            // Facebook video.php plugin strictly requires canonical URLs. It fails on /share/v/ shortlinks.
            // We resolve the redirect server-side to get the true canonical URL (e.g. /reel/12345)
            if (urlObj.pathname.includes('/share/v/') || urlObj.hostname.includes('fb.watch')) {
                try {
                    const response = await fetch(url, { redirect: 'follow', next: { revalidate: 3600 } });
                    finalUrl = response.url;
                } catch (e) { /* ignore and fallback */ }
            }

            type = finalUrl.includes('/reel/') ? 'facebook-reel' : 'facebook';
            // Always convert web.facebook to www.facebook for the plugin to be safe
            finalUrl = finalUrl.replace('web.facebook.com', 'www.facebook.com');
            embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(finalUrl)}&show_text=0&autoplay=1`;
        }
    } catch (e) { /* ignore invalid URL */ }

    const isVertical = type === 'shorts' || type === 'tiktok' || type === 'reel' || type === 'facebook-reel';
    const isInstagram = type === 'instagram';

    // We adjust paddingTop to perfectly fit the native UI without letterboxing or scrollbars
    // TikTok/Shorts are pure 9:16 (177.77%)
    // Instagram Reels have a forced header/footer, making their total aspect ratio much taller (~235%)
    // Standard Instagram posts are often 1:1 video + header/footer (~170%)
    let paddingTop = '56.25%';
    if (type === 'shorts' || type === 'tiktok' || type === 'facebook-reel') paddingTop = '177.77%';
    else if (type === 'reel') paddingTop = '143.4%';
    else if (type === 'instagram') paddingTop = '170%';

    const maxWidth = isVertical ? 'max-w-[300px]' : isInstagram ? 'max-w-[420px]' : 'max-w-full';

    const iframeStyle = "display:none;position:absolute;top:0;left:0;width:100%;height:100%;border:none;";

    // Facade overlay — hides ugly embeds until click (especially Instagram)
    // Uses a client-side onclick to swap the overlay with the real iframe
    const facadeId = `vf-${Math.random().toString(36).slice(2, 8)}`;

    const facadeHtml = `
      <div id="${facadeId}-wrap" class="absolute inset-0 cursor-pointer group" onclick="
        var w=document.getElementById('${facadeId}-wrap');
        var f=document.getElementById('${facadeId}-frame');
        w.style.display='none';
        f.style.display='block';
      ">
        ${thumbnailUrl ? `<img src="${thumbnailUrl}" alt="Video thumbnail" class="absolute inset-0 w-full h-full object-cover" onerror="this.style.display='none'" />` : ''}
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="relative">
            <div class="absolute inset-0 bg-white/20 rounded-full blur-2xl scale-150 opacity-60"></div>
            <div class="relative w-16 h-16 md:w-20 md:h-20 bg-white/95 rounded-full flex items-center justify-center shadow-2xl shadow-black/40 transition-transform duration-200 group-hover:scale-110">
              <svg class="w-6 h-6 md:w-7 md:h-7 text-[#1d4ed8] ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        </div>
        <div class="absolute bottom-4 left-4 right-4 flex items-center gap-2">
          <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span class="text-white/80 text-xs font-bold uppercase tracking-widest">Video Pitch</span>
        </div>
      </div>
      <iframe
        id="${facadeId}-frame"
        src="${embedUrl}"
        title="Worker Video Pitch"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        style="${iframeStyle}"
        scrolling="no"
      ></iframe>
    `;

    // Only use the facade for YouTube/Shorts because:
    // 1. We can fetch their HD thumbnails.
    // 2. They support autoplay=1 (so clicking the facade plays it immediately).
    // TikTok, Instagram, and Facebook do NOT support this natively, so using a facade
    // causes blank thumbnails and forces a double-click. We bypass the facade for them.
    const useFacade = type === 'youtube' || type === 'shorts';

    if (!useFacade) {
        return (
            <div className={`${maxWidth} mx-auto mb-8`}>
                <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-blue-500/40 via-indigo-500/20 to-transparent shadow-[0_0_40px_rgba(29,78,216,0.25)]">
                    <div
                        className="relative rounded-2xl overflow-hidden bg-black"
                        style={{ paddingTop }}
                    >
                        <iframe
                            src={embedUrl}
                            title="Worker Video Pitch"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full border-none"
                            scrolling="no"
                        />
                    </div>
                </div>
                <div className="mt-2 flex items-center justify-center gap-2 opacity-50">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-400/60" />
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Professional Introduction</span>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-400/60" />
                </div>
            </div>
        );
    }

    return (
        <div className={`${maxWidth} mx-auto mb-8`}>
            {/* Outer glow frame */}
            <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-blue-500/40 via-indigo-500/20 to-transparent shadow-[0_0_40px_rgba(29,78,216,0.25)]">
                <div
                    className="relative rounded-2xl overflow-hidden bg-black"
                    style={{ paddingTop }}
                    dangerouslySetInnerHTML={{ __html: facadeHtml }}
                />
            </div>
            <div className="mt-2 flex items-center justify-center gap-2 opacity-50">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-400/60" />
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Professional Introduction</span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-400/60" />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// METADATA (unchanged)
// ─────────────────────────────────────────────
export async function generateMetadata({ params }: WorkerPageProps): Promise<Metadata> {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const isAdmin = !!cookieStore.get('grabme_admin_token')?.value;

        let query = supabaseAdmin
            .from('workers')
            .select('full_name, trade_category, home_district, profile_photo_url, account_status')
            .eq('id', id);

        if (!isAdmin) query = query.eq('account_status', 'active');

        const { data: worker } = await query.single();
        if (!worker) return { title: 'Worker Profile | Grab Me' };

        const title = `${worker.full_name} - ${worker.trade_category} in ${worker.home_district} | Grab Me`;
        const description = `Looking for a professional ${worker.trade_category}? View ${worker.full_name}'s verified profile and hire them directly on Grab Me.`;

        return {
            title,
            description,
            openGraph: {
                title, description, type: 'profile',
                url: `https://www.grabme.page/worker/${id}`,
                images: worker.profile_photo_url
                    ? [{ url: worker.profile_photo_url, width: 1200, height: 630, alt: worker.full_name }]
                    : [{ url: '/grabme.png', width: 1200, height: 630, alt: 'Grab Me Sri Lanka' }],
            },
            twitter: { card: 'summary_large_image', title, description }
        };
    } catch {
        return { title: 'Worker Profile | Grab Me' };
    }
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default async function WorkerProfilePage({ params }: WorkerPageProps) {
    const { id } = await params;
    const cookieStore = await cookies();
    const isAdmin = !!cookieStore.get('grabme_admin_token')?.value;

    let query = supabaseAdmin
        .from('workers')
        .select(`
            id, full_name, trade_category, sub_skills, years_experience, short_bio,
            home_district, districts_covered, specific_areas, profile_photo_url,
            certificate_url, is_identity_verified, is_reference_checked,
            is_certificate_verified, is_experience_verified, is_featured,
            account_status, video_pitch_url, facebook_url, instagram_url,
            tiktok_url, created_at
        `)
        .eq('id', id);

    if (!isAdmin) query = query.eq('account_status', 'active');

    const { data: worker, error } = await query.single();
    if (error || !worker) notFound();

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
        "hasCredential": [{ "@type": "EducationalOccupationalCredential", "credentialCategory": "Professional Verification" }],
        "mainEntityOfPage": { "@type": "WebPage", "@id": `https://www.grabme.page/worker/${id}` }
    };

    const trustBadges = [
        { label: 'Identity', val: worker.is_identity_verified, icon: ShieldCheck, accent: '#16a34a', glow: 'rgba(22,163,74,0.3)', bg: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/80 dark:to-emerald-900/60', border: 'border-emerald-200 dark:border-emerald-700/40' },
        { label: 'Reference', val: worker.is_reference_checked, icon: Star, accent: '#3b82f6', glow: 'rgba(59,130,246,0.3)', bg: 'from-blue-50 to-blue-100/50 dark:from-blue-950/80 dark:to-blue-900/60', border: 'border-blue-200 dark:border-blue-700/40' },
        { label: 'Documents', val: worker.is_certificate_verified, icon: Award, accent: '#f59e0b', glow: 'rgba(245,158,11,0.3)', bg: 'from-amber-50 to-amber-100/50 dark:from-amber-950/80 dark:to-amber-900/60', border: 'border-amber-200 dark:border-amber-700/40' },
        { label: 'Experience', val: !!worker.is_experience_verified, icon: Briefcase, accent: '#8b5cf6', glow: 'rgba(139,92,246,0.3)', bg: 'from-violet-50 to-violet-100/50 dark:from-violet-950/80 dark:to-violet-900/60', border: 'border-violet-200 dark:border-violet-700/40' },
    ];

    const hasSocials = worker.facebook_url || worker.instagram_url || worker.tiktok_url;

    return (
        <WorkerProfileClientWrapper>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* ── Global ambient glow ── */}
            <div className="pointer-events-none fixed inset-0 z-0 opacity-40 dark:opacity-100 transition-opacity">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-600/10 dark:bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-indigo-600/8 dark:bg-indigo-600/8 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[300px] bg-emerald-600/6 dark:bg-emerald-600/6 rounded-full blur-[120px]" />
            </div>

            {/* ── HEADER ── */}
            <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#050b18]/80 backdrop-blur-xl px-5 py-4 flex items-center justify-between transition-colors">
                <Link href="/browse" className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                    <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-white/70" />
                </Link>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50/50 dark:bg-transparent border border-blue-100 dark:border-transparent transition-colors">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#1D4ED8] dark:text-white/50">Verified Profile</span>
                    </div>
                    <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1" />
                    <ThemeToggle />
                </div>
                {worker.account_status !== 'active' ? (
                    <div className="px-2 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
                        <span className="text-[9px] font-black text-blue-400 dark:text-blue-400 uppercase tracking-wider">Preview</span>
                    </div>
                ) : (
                    <div className="w-9" />
                )}
            </header>

            <main className="relative z-10">

                {/* ══════════════════════════════════
                        HERO SECTION
                    ══════════════════════════════════ */}
                <section className="relative px-5 pt-10 pb-8 md:pt-16 md:pb-12 max-w-5xl mx-auto">
                    {/* Subtle grid texture */}
                    <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.03]"
                        style={{ backgroundImage: 'linear-gradient(currentColor 1px,transparent 1px),linear-gradient(90deg,currentColor 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

                    <div className="relative flex flex-col md:flex-row md:items-end gap-8 md:gap-12">

                        {/* Profile Photo */}
                        <div className="relative mx-auto md:mx-0 flex-shrink-0">
                            {/* Glow ring */}
                            <div className="absolute inset-0 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-transparent blur-xl scale-110" />
                            <div className="relative w-28 h-28 md:w-44 md:h-44 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl shadow-blue-900/10 dark:shadow-blue-900/30">
                                {worker.profile_photo_url ? (
                                    <Image src={worker.profile_photo_url} alt={worker.full_name} fill sizes="(max-width:768px) 112px, 176px" className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center text-5xl font-black text-slate-400 dark:text-white/30">
                                        {worker.full_name[0]}
                                    </div>
                                )}
                            </div>
                            {/* Verified badge */}
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl border-2 border-[#f8fafc] dark:border-[#050b18] shadow-lg shadow-emerald-500/40 transition-colors">
                                <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            {worker.is_featured && (
                                <div className="absolute -top-2 -left-2 bg-amber-500 text-white px-2 py-1 rounded-lg border-2 border-[#f8fafc] dark:border-[#050b18] shadow-lg transition-colors">
                                    <span className="text-[8px] font-black uppercase tracking-wider">Featured</span>
                                </div>
                            )}
                        </div>

                        {/* Hero Text */}
                        <div className="flex-1 text-center md:text-left space-y-4 md:pb-2">
                            {/* Trade pill */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 text-[10px] font-black uppercase tracking-[0.2em]">
                                <Briefcase className="w-3 h-3" />
                                {worker.trade_category}
                            </div>

                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#0f172a] dark:text-white tracking-tight leading-[1.05] transition-colors">
                                {worker.full_name}
                            </h1>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium transition-colors">
                                    <MapPin className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                                    {worker.home_district}
                                </span>
                                <div className="w-px h-4 bg-slate-200 dark:bg-white/10 hidden md:block" />
                                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium transition-colors">
                                    <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                                    On platform since {new Date(worker.created_at).getFullYear()}
                                </span>
                                {worker.years_experience && (
                                    <>
                                        <div className="w-px h-4 bg-slate-200 dark:bg-white/10 hidden md:block" />
                                        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium transition-colors">
                                            <Star className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                                            {worker.years_experience} yrs experience
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════
                        TRUST BADGES — Full Width Strip
                    ══════════════════════════════════ */}
                <section className="px-5 pb-8 max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {trustBadges.map((badge, i) => (
                            <div key={i} className="relative group overflow-hidden">
                                {badge.val && (
                                    <div className="absolute inset-0 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{ background: badge.glow }} />
                                )}
                                <div className={`relative flex flex-col items-center gap-2.5 py-5 px-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${badge.val
                                    ? `bg-gradient-to-b ${badge.bg} ${badge.border} shadow-lg`
                                    : 'bg-slate-100/50 dark:bg-white/[0.03] border-slate-200 dark:border-white/5'
                                    }`}>
                                    <badge.icon
                                        className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                                        style={{ color: badge.val ? badge.accent : '#475569' }}
                                    />
                                    <div className="text-center">
                                        <div className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${badge.val ? 'text-blue-900 dark:text-slate-200' : 'text-slate-500 dark:text-slate-600'}`}>
                                            {badge.label}
                                        </div>
                                        <div className="text-[8px] font-bold uppercase tracking-wider mt-0.5"
                                            style={{ color: badge.val ? badge.accent : '#94a3b8' }}>
                                            {badge.val ? '✓ Verified' : 'Pending'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════
                        MAIN CONTENT — 2 Column (Desktop)
                    ══════════════════════════════════ */}
                <section className="px-5 pb-12 max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

                        {/* ── LEFT COLUMN ── */}
                        <div className="space-y-5">

                             {/* About */}
                            <div className="relative rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden p-6 md:p-8 transition-colors">
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400 mb-4 transition-colors">About</h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-[1.8] text-[15px] font-medium transition-colors">
                                    {worker.short_bio || "No professional bio provided yet."}
                                </p>
                            </div>

                             {/* Expertise */}
                            {worker.sub_skills && worker.sub_skills.length > 0 && (
                                <div className="relative rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden p-6 md:p-8 transition-colors">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400 mb-5 transition-colors">Expertise & Services</h3>
                                    <div className="flex flex-wrap gap-2.5">
                                        {worker.sub_skills.map((skill: string) => (
                                            <div key={skill}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider hover:border-blue-500/40 hover:bg-blue-500/10 transition-all duration-200">
                                                <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                                {skill}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {/* Service Coverage */}
                            {(worker.districts_covered?.length > 0 || worker.specific_areas) && (
                                <div className="relative rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden p-6 md:p-8 transition-colors">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 mb-5 transition-colors">Service Coverage</h3>
                                    {worker.districts_covered?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {worker.districts_covered.map((d: string) => (
                                                <div key={d}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-300 uppercase tracking-wider transition-colors">
                                                    <MapPin className="w-2.5 h-2.5" />
                                                    {d}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {worker.specific_areas && (
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors">{worker.specific_areas}</p>
                                    )}
                                </div>
                            )}

                             {/* Video Player */}
                            {worker.video_pitch_url && (
                                <div className="relative rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden p-6 md:p-8 transition-colors">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400 mb-5 transition-colors">Video Introduction</h3>
                                    <VideoPlayer url={worker.video_pitch_url} />
                                </div>
                            )}

                             {/* Social Links */}
                            {hasSocials && (
                                <div className="relative rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden p-6 md:p-8 transition-colors">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-pink-600 dark:text-pink-400 mb-5 transition-colors">Social Profiles</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {worker.facebook_url && (
                                            <a href={worker.facebook_url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#1877f2]/10 dark:bg-[#1877f2]/15 border border-[#1877f2]/20 dark:border-[#1877f2]/30 text-[#1877f2] dark:text-[#60a5fa] font-bold text-sm hover:bg-[#1877f2]/20 transition-all">
                                                <Share2 className="w-4 h-4" />
                                                Facebook
                                            </a>
                                        )}
                                        {worker.instagram_url && (
                                            <a href={worker.instagram_url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#e1306c]/10 dark:bg-[#e1306c]/15 border border-[#e1306c]/20 dark:border-[#e1306c]/30 text-[#e1306c] dark:text-[#f472b6] font-bold text-sm hover:bg-[#e1306c]/20 transition-all">
                                                <Globe className="w-4 h-4" />
                                                Instagram
                                            </a>
                                        )}
                                        {worker.tiktok_url && (
                                            <a href={worker.tiktok_url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                                                <Music className="w-4 h-4" />
                                                TikTok
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── RIGHT COLUMN — Sticky CTA ── */}
                        <div className="lg:sticky lg:top-20 space-y-4">

                            {/* Premium CTA Card */}
                            <div className="relative rounded-2xl overflow-hidden">
                                {/* Multi-layer glow */}
                                <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/40 via-blue-600/20 to-indigo-600/30 rounded-2xl blur-md" />
                                <div className="relative bg-white dark:bg-gradient-to-b dark:from-[#0a1628] dark:to-[#060e1c] border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 space-y-6 transition-colors shadow-xl shadow-blue-900/5 dark:shadow-none">
                                    {/* Top shimmer */}
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 dark:via-white/30 to-transparent" />

                                    <div className="text-center space-y-2">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 dark:border-emerald-500/30 mb-3">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Available for Hire</span>
                                        </div>
                                        <h4 className="text-xl md:text-2xl font-black text-[#0f172a] dark:text-white tracking-tight transition-colors">Ready to collaborate?</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed transition-colors">
                                            Start a direct conversation on WhatsApp — no middlemen, no delays.
                                        </p>
                                    </div>

                                    {/* Catalog tip */}
                                    <div className="relative rounded-xl overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-900/80 dark:to-emerald-800/60" />
                                        <div className="absolute inset-0 border border-emerald-500/30 dark:border-emerald-600/30 rounded-xl" />
                                        <div className="relative px-4 py-4">
                                            <p className="text-white dark:text-emerald-100/90 text-sm leading-relaxed font-medium">
                                                💡 <strong className="text-white">See their past work</strong> — tap 'Contact on WhatsApp' to access their full business catalog.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <WhatsAppButton workerId={worker.id} workerTrade={worker.trade_category} />
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats Card */}
                            <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] backdrop-blur-sm p-5 transition-colors">
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div>
                                        <div className="text-lg font-black text-[#0f172a] dark:text-white">
                                            {trustBadges.filter(b => b.val).length}<span className="text-blue-600 dark:text-blue-400">/4</span>
                                        </div>
                                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">Verified</div>
                                    </div>
                                    <div className="border-x border-slate-100 dark:border-white/5">
                                        <div className="text-lg font-black text-[#0f172a] dark:text-white">
                                            {new Date().getFullYear() - new Date(worker.created_at).getFullYear() || '1'}<span className="text-blue-600 dark:text-blue-400">y</span>
                                        </div>
                                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">On Platform</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-black text-[#0f172a] dark:text-white">
                                            {worker.districts_covered?.length || 1}<span className="text-blue-600 dark:text-blue-400">+</span>
                                        </div>
                                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">Districts</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* ══════════════════════════════════
                        MOBILE FIXED BOTTOM ACTION BAR
                ══════════════════════════════════ */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
                <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/95 dark:from-[#050b18] dark:via-[#050b18]/95 to-transparent transition-colors" />
                <div className="relative px-4 pt-4 pb-6 space-y-3">
                    {/* Ambient glow behind button */}
                    <div className="absolute inset-x-8 bottom-4 h-12 bg-emerald-500/20 blur-xl rounded-full" />

                    <div className="relative rounded-xl overflow-hidden border border-emerald-500/20 dark:border-emerald-700/40">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-900/90 dark:to-emerald-800/80" />
                        <div className="relative px-4 py-3">
                            <p className="text-white dark:text-emerald-100/90 text-xs leading-relaxed font-medium">
                                💡 <strong className="text-white">See their past work</strong> — tap below to access their WhatsApp business catalog.
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <WhatsAppButton workerId={worker.id} workerTrade={worker.trade_category} />
                    </div>

                    <p className="text-center text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 px-6 leading-relaxed transition-colors">
                        By contacting, you agree to our{' '}
                        <Link href="/terms" className="text-blue-600 dark:text-blue-500 underline">Terms of Service</Link>
                    </p>
                </div>
            </div>
        </WorkerProfileClientWrapper>
    );
}

