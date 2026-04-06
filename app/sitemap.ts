import { MetadataRoute } from 'next'
import { supabaseAdmin } from './lib/supabaseServer'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.grabme.page'

  // Fetch active workers for dynamic profile indexing
  const { data: workers } = await supabaseAdmin
    .from('workers')
    .select('id')
    .eq('account_status', 'active')

  const workerUrls = (workers || []).map((w) => ({
    url: `${baseUrl}/worker/${w.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/conduct`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    }
  ]

  return [...staticUrls, ...workerUrls]
}
