import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { supabaseAdmin } from '../../lib/supabaseServer'
import { fetchTaxonomyAction } from '../../lib/taxonomyActions'
import { MapPin, Briefcase, Star, ShieldCheck, CheckCircle2, ChevronLeft, Globe, Music, Share2, Award, Calendar, Eye } from 'lucide-react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import WhatsAppButton from './components/WhatsAppButton'
import WorkerProfileClientWrapper from './components/WorkerProfileClientWrapper'
import ThemeToggle from './components/ThemeToggle'
import ProfileInteractions from './components/ProfileInteractions'
import ReviewsSection from './components/ReviewsSection'
import { getWorkerReviewsAction } from './actions/reviewActions'

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
            tiktok_url, created_at, base_visiting_fee, price_estimates,
            languages_spoken, service_warranty, education_history,
            certificate_url, certificate_name, likes_count, visits_count, slug
        `);

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
        query = query.eq('id', id);
    } else {
        query = query.eq('slug', id);
    }

    if (!isAdmin) query = query.eq('account_status', 'active');

    const { data: worker, error } = await query.single();
    if (error || !worker) notFound();

    // Fetch reviews server-side for SEO and initial render
    const { reviews, avgRating, totalReviews } = await getWorkerReviewsAction(worker.id);

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
        "aggregateRating": totalReviews > 0 ? {
            "@type": "AggregateRating",
            "ratingValue": avgRating,
            "reviewCount": totalReviews,
            "bestRating": 5,
            "worstRating": 1
        } : undefined,
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

            {/* ── Global ambient glow (Hidden on mobile for performance) ── */}
            <div className="pointer-events-none fixed inset-0 z-0 opacity-40 dark:opacity-100 transition-opacity hidden md:block">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-600/10 dark:bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-indigo-600/8 dark:bg-indigo-600/8 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[300px] bg-emerald-600/6 dark:bg-emerald-600/6 rounded-full blur-[120px]" />
            </div>

            {/* ── HEADER ── */}
            <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#050b18] md:bg-white/90 md:dark:bg-[#050b18]/90 md:backdrop-blur-sm px-5 py-4 flex items-center justify-between">
                <Link href="/browse" className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                    <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-white/70" />
                </Link>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50/50 dark:bg-transparent border border-blue-100 dark:border-transparent">
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
                    {/* Subtle grid texture (z-[-1] fixes Android ghosting bugs) */}
                    <div className="pointer-events-none absolute inset-0 z-[-1] opacity-[0.03] dark:opacity-[0.03]"
                        style={{ backgroundImage: 'linear-gradient(currentColor 1px,transparent 1px),linear-gradient(90deg,currentColor 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

                    <div className="relative flex flex-col md:flex-row md:items-center gap-8 md:gap-12">

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
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl border-2 border-[#f8fafc] dark:border-[#050b18] shadow-lg shadow-emerald-500/40">
                                <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            {worker.is_featured && (
                                <div className="absolute -top-2 -left-2 bg-amber-500 text-white px-2 py-1 rounded-lg border-2 border-[#f8fafc] dark:border-[#050b18] shadow-lg">
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

                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#0f172a] dark:text-white tracking-tight leading-[1.05]">
                                {worker.full_name}
                            </h1>

                            {worker.languages_spoken?.length > 0 && (
                                <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1 pb-1">
                                    {worker.languages_spoken.map((lang: string) => (
                                        <span key={lang} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-300 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                            )}



                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                                    <MapPin className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                                    {worker.home_district}
                                </span>
                                <div className="w-px h-4 bg-slate-200 dark:bg-white/10 hidden md:block" />
                                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                                    <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                                    On platform since {new Date(worker.created_at).getFullYear()}
                                </span>
                                {worker.years_experience && (
                                    <>
                                        <div className="w-px h-4 bg-slate-200 dark:bg-white/10 hidden md:block" />
                                        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                                            <Star className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                                            {worker.years_experience} yrs experience
                                        </span>
                                    </>
                                )}
                            </div>

                            <ProfileInteractions 
                                workerId={worker.id} 
                                initialLikes={worker.likes_count || 0} 
                                initialVisits={worker.visits_count || 0} 
                            />
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════
                        TRUST BADGES — Full Width Strip
                    ══════════════════════════════════ */}
                <section className="px-5 pb-8 max-w-5xl mx-auto w-full">
                    {/*
                      Using flex-wrap instead of CSS Grid here.
                      Android WebView has a known bug where `grid-cols-2` can render
                      all 4 items in a single overflowing row if grid items don't
                      have explicit min-width:0. Flex with calc() widths is 100%
                      predictable — always 2 columns on mobile, 4 on desktop.
                    */}
                    <div className="flex flex-wrap gap-3">
                        {trustBadges.map((badge, i) => (
                            <div key={i} className={`relative group overflow-hidden w-[calc(50%-6px)] md:w-[calc(25%-9px)] flex-shrink-0 ${!badge.val ? 'opacity-40' : ''}`}>
                                {badge.val && (
                                    <div className="absolute inset-0 rounded-2xl opacity-0 md:group-hover:opacity-100 transition-opacity duration-500"
                                        style={{ background: badge.glow }} />
                                )}
                                <div className={`relative flex flex-col items-center gap-2.5 py-5 px-4 rounded-2xl border h-full ${badge.val
                                    ? `bg-gradient-to-b ${badge.bg} ${badge.border} shadow-lg`
                                    : 'bg-slate-100/50 dark:bg-[#0a1628] border-slate-200 dark:border-white/5'
                                    }`}>
                                    <badge.icon
                                        className="w-5 h-5"
                                        style={{ color: badge.val ? badge.accent : '#94a3b8' }}
                                    />
                                    <div className="text-center">
                                        <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${badge.val ? 'text-blue-900 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}`}>
                                            {badge.label}
                                        </div>
                                        {badge.val && (
                                            <div className="text-[8px] font-bold uppercase tracking-wider mt-0.5"
                                                style={{ color: badge.accent }}>
                                                ✓ Verified
                                            </div>
                                        )}
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

                            {/* 1. Video Introduction — strongest trust asset, up first */}
                            {worker.video_pitch_url && (
                                <div className="relative rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0a1628] overflow-hidden p-6 md:p-8">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400 mb-5">Video Introduction</h3>
                                    <VideoPlayer url={worker.video_pitch_url} />
                                </div>
                            )}

                            {/* 2. Trust Certification — competence signal before bio */}
                            {worker.certificate_url && (
                                <div className="relative rounded-2xl border border-amber-200/50 dark:border-amber-500/20 bg-amber-50/30 dark:bg-amber-900/10 overflow-hidden p-6 md:p-8">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400 mb-5 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> Trust Certification
                                    </h3>
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-amber-200/50 dark:border-white/10">
                                        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-400 shadow-sm">
                                            <Award className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{worker.certificate_name || 'Verified Certificate'}</p>
                                            <a href={worker.certificate_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                                <Eye className="w-3.5 h-3.5" /> View Credential
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3. About */}
                            <div className="relative rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0a1628] overflow-hidden p-6 md:p-8">
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400 mb-4">About</h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-[1.8] text-[15px] font-medium">
                                    {worker.short_bio || "No professional bio provided yet."}
                                </p>
                            </div>

                            {/* 4. Expertise & Services */}
                            {worker.sub_skills && worker.sub_skills.length > 0 && (
                                <div className="relative rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0a1628] overflow-hidden p-6 md:p-8">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400 mb-5">Expertise &amp; Services</h3>
                                    <div className="flex flex-wrap gap-2.5">
                                        {worker.sub_skills.map((skill: string) => (
                                            <div key={skill} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider hover:border-blue-500/40 hover:bg-blue-500/10 transition-all duration-200">
                                                <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                                {skill}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 5. Pricing & Rates — transparency defuses "will they inflate it" fear */}
                            {(worker.base_visiting_fee != null || (Array.isArray(worker.price_estimates) && worker.price_estimates.length > 0)) && (
                                <div className="relative rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0a1628] overflow-hidden p-6 md:p-8">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400 mb-5">Pricing &amp; Rates</h3>
                                    {worker.base_visiting_fee != null && (
                                        <div className="flex items-center gap-3 mb-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30">
                                            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center flex-shrink-0">
                                                <span className="text-amber-600 dark:text-amber-400 text-xs font-black">₨</span>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Base Visiting / Inspection Fee</p>
                                                <p className="text-base font-black text-slate-800 dark:text-white">LKR {Number(worker.base_visiting_fee).toLocaleString()}</p>
                                            </div>
                                            <div className="ml-auto text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right leading-relaxed">
                                                Charged on<br />arrival
                                            </div>
                                        </div>
                                    )}
                                    {Array.isArray(worker.price_estimates) && worker.price_estimates.length > 0 && (
                                        <div className="space-y-2">
                                            {worker.price_estimates.map((est: { label: string; min: number; max: number }, i: number) => (
                                                <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-white/5 last:border-0">
                                                    <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300">{est.label}</span>
                                                    <span className="text-[12px] font-black text-slate-800 dark:text-white tabular-nums">
                                                        LKR {Number(est.min).toLocaleString()}
                                                        {est.max > est.min ? ` – ${Number(est.max).toLocaleString()}` : ''}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 6. Service Guarantees — risk-reversal right after pricing */}
                            {worker.service_warranty && (
                                <div className="relative rounded-2xl border border-emerald-200/50 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10 overflow-hidden p-6 md:p-8">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> Service Guarantees
                                    </h3>
                                    <p className="text-[12px] font-black uppercase tracking-widest text-emerald-900 dark:text-emerald-100 mt-1.5">
                                        {worker.service_warranty}
                                    </p>
                                </div>
                            )}

                            {/* 7. Customer Reviews */}
                            <ReviewsSection
                                workerId={worker.id}
                                workerName={worker.full_name}
                                reviews={reviews}
                                avgRating={avgRating}
                                totalReviews={totalReviews}
                            />

                            {/* 8. Educational Background */}
                            {worker.education_history && worker.education_history.length > 0 && (
                                <div className="relative rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0a1628] overflow-hidden p-6 md:p-8">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400 mb-5 flex items-center gap-2">
                                        <Award className="w-4 h-4" /> Educational Background
                                    </h3>
                                    <div className="space-y-3">
                                        {worker.education_history.map((edu: string, i: number) => (
                                            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
                                                    <Award className="w-4 h-4" />
                                                </div>
                                                <p className="text-[12px] font-black text-slate-700 dark:text-slate-200 mt-1.5 uppercase tracking-widest">{edu}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 9. Service Coverage */}
                            {(worker.districts_covered?.length > 0 || worker.specific_areas) && (
                                <div className="relative rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0a1628] overflow-hidden p-6 md:p-8">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 mb-5">Service Coverage</h3>
                                    {worker.districts_covered?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {worker.districts_covered.map((d: string) => (
                                                <div key={d} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">
                                                    <MapPin className="w-2.5 h-2.5" />
                                                    {d}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {worker.specific_areas && (
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{worker.specific_areas}</p>
                                    )}
                                </div>
                            )}

                            {/* 10. Social Profiles — lowest priority */}
                            {hasSocials && (
                                <div className="relative rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0a1628] overflow-hidden p-6 md:p-8">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-pink-600 dark:text-pink-400 mb-5">Social Profiles</h3>
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
                                {/* Multi-layer glow (Removed heavy blur for Android perf) */}
                                <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/10 via-blue-600/10 to-indigo-600/10 rounded-2xl" />
                                <div className="relative bg-white dark:bg-gradient-to-b dark:from-[#0a1628] dark:to-[#060e1c] border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl shadow-blue-900/5 dark:shadow-none">
                                    {/* Top shimmer */}
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 dark:via-white/30 to-transparent" />

                                    <div className="text-center space-y-2">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 dark:border-emerald-500/30 mb-3">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Available for Hire</span>
                                        </div>
                                        <h4 className="text-xl md:text-2xl font-black text-[#0f172a] dark:text-white tracking-tight">Ready to collaborate?</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
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
                            <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0a1628] p-5">
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div>
                                        <div className="text-lg font-black text-[#0f172a] dark:text-white">
                                            {trustBadges.filter(b => b.val).length}<span className="text-blue-600 dark:text-blue-400">/4</span>
                                        </div>
                                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">Verified</div>
                                    </div>
                                    <div className="border-x border-slate-100 dark:border-white/5">
                                        <div className="text-lg font-black text-[#0f172a] dark:text-white">
                                            {new Date().getFullYear() - new Date(worker.created_at).getFullYear() === 0 ? (
                                                <span className="text-emerald-500 dark:text-emerald-400">New</span>
                                            ) : (
                                                <>{new Date().getFullYear() - new Date(worker.created_at).getFullYear()}<span className="text-blue-600 dark:text-blue-400">y</span></>
                                            )}
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
                {/*
                  Solid bg instead of gradient-to-transparent: transparent gradients force
                  the browser to composite every scroll frame on Android, causing jank.
                  A solid/near-solid bg is hardware-accelerated and fast on all devices.
                */}
                <div className="absolute inset-0 bg-[#f8fafc] dark:bg-[#050b18]" />
                <div className="relative px-4 pt-3 pb-6 space-y-3">
                    {/* Ambient glow behind button (Removed heavy blur for Android perf) */}
                    <div className="absolute inset-x-8 bottom-4 h-12 bg-emerald-500/10 rounded-full" />

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

                    <p className="text-center text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 px-6 leading-relaxed">
                        By contacting, you agree to our{' '}
                        <Link href="/terms" className="text-blue-600 dark:text-blue-500 underline">Terms of Service</Link>
                    </p>
                </div>
            </div>
        </WorkerProfileClientWrapper>
    );
}

