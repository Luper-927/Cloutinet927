// lib/sitemap-helpers.ts
import { supabase } from './supabase'

// Google's hard cap per sitemap file.
export const SITEMAP_CHUNK_SIZE = 50000
// Supabase's default cap per query response.
const SUPABASE_PAGE_SIZE = 1000
const SUBPAGES_PER_CHUNK = SITEMAP_CHUNK_SIZE / SUPABASE_PAGE_SIZE // 50

export type StoreRow = { business_slug: string; created_at: string | null }
export type ProductRow = { slug: string; updated_at: string | null; profiles: { business_slug: string } | null }

export async function getProfileCount(): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('business_slug', { count: 'exact', head: true })
    .not('business_slug', 'is', null)

  if (error) {
    console.error('[sitemap] profile count failed:', error.message)
    return 0
  }
  return count ?? 0
}

export async function getProductCount(): Promise<number> {
  const { count, error } = await supabase
    .from('products')
    .select('slug', { count: 'exact', head: true })
    .eq('is_published', true)

  if (error) {
    console.error('[sitemap] product count failed:', error.message)
    return 0
  }
  return count ?? 0
}

// Fetches one 50,000-URL chunk by firing SUBPAGES_PER_CHUNK requests in
// parallel (Supabase won't return more than ~1,000 rows per request).
export async function fetchProfilesChunk(chunkId: number): Promise<StoreRow[]> {
  const chunkStart = chunkId * SITEMAP_CHUNK_SIZE

  const requests = Array.from({ length: SUBPAGES_PER_CHUNK }, (_, i) => {
    const from = chunkStart + i * SUPABASE_PAGE_SIZE
    const to = from + SUPABASE_PAGE_SIZE - 1
    return supabase
      .from('profiles')
      .select('business_slug, created_at')
      .not('business_slug', 'is', null)
      .range(from, to)
  })

  const results = await Promise.all(requests)
  const rows: StoreRow[] = []
  for (const { data, error } of results) {
    if (error) { console.error('[sitemap] profiles chunk failed:', error.message); continue }
    if (data) rows.push(...(data as unknown as StoreRow[]))
  }
  return rows
}

export async function fetchProductsChunk(chunkId: number): Promise<ProductRow[]> {
  const chunkStart = chunkId * SITEMAP_CHUNK_SIZE

  const requests = Array.from({ length: SUBPAGES_PER_CHUNK }, (_, i) => {
    const from = chunkStart + i * SUPABASE_PAGE_SIZE
    const to = from + SUPABASE_PAGE_SIZE - 1
    return supabase
      .from('products')
      .select('slug, updated_at, profiles(business_slug)')
      .eq('is_published', true)
      .range(from, to)
  })

  const results = await Promise.all(requests)
  const rows: ProductRow[] = []
  for (const { data, error } of results) {
    if (error) { console.error('[sitemap] products chunk failed:', error.message); continue }
    if (data) rows.push(...(data as unknown as ProductRow[]))
  }
  return rows
}
