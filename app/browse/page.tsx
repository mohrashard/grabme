import { Metadata } from 'next'
import { Suspense } from 'react'
import BrowsePageClient from './components/BrowsePageClient'
import { supabaseAdmin } from '../lib/supabaseServer'
import { fetchTaxonomyAction } from '../lib/taxonomyActions'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Dynamic Metadata for SEO
 */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const service = (params.service as string) || 'All';
  const district = (params.district as string) || 'Sri Lanka';
  const skill = (params.skill as string) || '';

  const displayService = service === 'All Services' ? 'Home Workers' : service;
  const displayDistrict = district === 'All Districts' ? 'Sri Lanka' : district;
  
  const title = `${displayService}${skill ? ` (${skill})` : ''} in ${displayDistrict} — Verified Baas | Grab Me`;
  const description = `Find NIC-verified ${displayService.toLowerCase()} professionals in ${displayDistrict}. Connect directly on WhatsApp. No commission. 100% verified identities for your safety.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.grabme.page/browse${service !== 'All' ? `?service=${encodeURIComponent(service)}` : ''}`,
    },
    openGraph: {
      title,
      description,
      url: 'https://www.grabme.page/browse',
      images: [
        {
          url: '/grabme.png',
          width: 1200,
          height: 630,
          alt: `Find ${displayService} in ${displayDistrict}`
        }
      ]
    }
  }
}

export default async function BrowsePage({ searchParams }: PageProps) {
  // 1. Fetch Workers (Server Side for SEO)
  // We fetch all active workers and let the client handle filtering for instant UI response,
  // but the initial HTML response will contain all worker data for search engines.
  const { data: workers, error } = await supabaseAdmin
    .from('workers')
    .select('id, full_name, trade_category, home_district, specific_areas, profile_photo_url, short_bio, is_featured, is_identity_verified, is_reference_checked, years_experience, sub_skills')
    .eq('account_status', 'active')
    .order('is_featured', { ascending: false });

  // 2. Fetch Taxonomy Data
  const taxonomy = await fetchTaxonomyAction();

  if (error) {
    console.error('Error fetching workers:', error);
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#090A0F] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10" />
          <div className="h-4 w-32 bg-white/5 rounded-full" />
        </div>
      </div>
    }>
      <BrowsePageClient 
        initialWorkers={workers || []} 
        taxonomy={taxonomy} 
      />
    </Suspense>
  )
}
