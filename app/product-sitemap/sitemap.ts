// app/product-sitemap/sitemap.ts — new file. Same pattern for products.
import { MetadataRoute } from 'next'
import { fetchProductsChunk, getProductCount, SITEMAP_CHUNK_SIZE } from '../../lib/sitemap-helpers'

const baseUrl = 'https://cloutinet.online'
const staticLastModified = new Date('2026-08-01')

export const revalidate = 3600

export async function generateSitemaps() {
  const total = await getProductCount()
  const chunks = Math.max(1, Math.ceil(total / SITEMAP_CHUNK_SIZE))
  return Array.from({ length: chunks }, (_, i) => ({ id: i }))
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const products = await fetchProductsChunk(id)

  return products
    .filter((p) => p.profiles?.business_slug)
    .map((p) => ({
      url: baseUrl + '/store/' + p.profiles!.business_slug + '/' + p.slug,
      lastModified: p.updated_at ? new Date(p.updated_at) : staticLastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
}
