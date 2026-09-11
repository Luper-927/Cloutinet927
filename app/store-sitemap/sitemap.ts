// app/store-sitemap/sitemap.ts
import { MetadataRoute } from 'next'
import { fetchProfilesChunk, getProfileCount, SITEMAP_CHUNK_SIZE } from '../../lib/sitemap-helpers'

const baseUrl = 'https://cloutinet.online'
const staticLastModified = new Date('2026-08-01')

export const revalidate = 3600

export async function generateSitemaps() {
  const total = await getProfileCount()
  const chunks = Math.max(1, Math.ceil(total / SITEMAP_CHUNK_SIZE))
  return Array.from({ length: chunks }, (_, i) => ({ id: i }))
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const profiles = await fetchProfilesChunk(id)

  return profiles.map((p) => ({
    url: baseUrl + '/store/' + p.business_slug,
    lastModified: p.created_at ? new Date(p.created_at) : staticLastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
}
