import { MetadataRoute } from 'next'
import { supabase } from '../lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cloutinet927.vercel.app'

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: baseUrl + '/auth',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  const { data: profiles } = await supabase
    .from('profiles')
    .select('business_slug')
    .not('business_slug', 'is', null)

  if (profiles) {
    for (const profile of profiles) {
      entries.push({
        url: baseUrl + '/store/' + profile.business_slug,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  }

  const { data: products } = await supabase
    .from('products')
    .select('slug, user_id, profiles(business_slug)')
    .eq('is_published', true)

  if (products) {
    for (const product of products as any[]) {
      const businessSlug = product.profiles && product.profiles.business_slug
      if (businessSlug) {
        entries.push({
          url: baseUrl + '/store/' + businessSlug + '/' + product.slug,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }
    }
  }

  return entries
}
