import { supabase } from './supabase'

export interface SimilarBusiness {
  business_name: string
  business_slug: string
  business_category: string | null
  location: string | null
  resolvedLocation: string | null
  logo_url: string | null
  tagline: string | null
}

interface CurrentBusiness {
  id: string
  business_category: string | null
  location: string | null
}

// `locations` is the active multi-location system, but as of now most
// businesses haven't been migrated onto it yet — so for each owner we
// prefer their primary row in `locations` when one exists, and fall
// back to the plain `profiles.location` text otherwise. This works
// correctly whether a business has adopted `locations` or not.
async function getPrimaryLocationMap(ownerIds: string[]): Promise<Record<string, string>> {
  if (ownerIds.length === 0) return {}
  const { data } = await supabase
    .from('locations')
    .select('owner_id, address')
    .in('owner_id', ownerIds)
    .eq('is_primary', true)

  const map: Record<string, string> = {}
  for (const row of data || []) {
    if (row.address) map[row.owner_id] = row.address
  }
  return map
}

// Only recommend businesses that actually have something to show —
// otherwise a visitor can land on a dead-end page with no products.
async function getOwnerIdsWithLiveProducts(ownerIds: string[]): Promise<Set<string>> {
  if (ownerIds.length === 0) return new Set()
  const { data } = await supabase
    .from('products')
    .select('user_id')
    .in('user_id', ownerIds)
    .eq('is_published', true)

  return new Set((data || []).map((row) => row.user_id))
}

/**
 * Organic "Similar Businesses" — same category strongly preferred,
 * same resolved location strongly preferred within that. No campaign
 * spend or performance data is used anywhere in this ranking; sponsored
 * placement (if/when built) must stay a visually separate section.
 */
export async function getSimilarBusinesses(current: CurrentBusiness, limit = 6): Promise<SimilarBusiness[]> {
  if (!current.business_category) return []

  const { data: sameCategory } = await supabase
    .from('profiles')
    .select('id, business_name, business_slug, business_category, location, logo_url, tagline')
    .eq('business_category', current.business_category)
    .neq('id', current.id)
    .not('business_name', 'is', null)
    .not('business_slug', 'is', null)
    .limit(20)

  let pool: any[] = sameCategory ? [...sameCategory] : []

  // Category pool too thin — backfill with same-location businesses
  // from other categories rather than showing fewer than a handful.
  if (pool.length < 4 && current.location) {
    const { data: sameLocation } = await supabase
      .from('profiles')
      .select('id, business_name, business_slug, business_category, location, logo_url, tagline')
      .eq('location', current.location)
      .neq('id', current.id)
      .not('business_name', 'is', null)
      .not('business_slug', 'is', null)
      .limit(20)

    const existingIds = new Set(pool.map((p) => p.id))
    for (const b of sameLocation || []) {
      if (!existingIds.has(b.id)) {
        pool.push(b)
        existingIds.add(b.id)
      }
    }
  }

  if (pool.length === 0) return []

  const liveProductOwners = await getOwnerIdsWithLiveProducts(pool.map((p) => p.id))
  pool = pool.filter((p) => liveProductOwners.has(p.id))

  if (pool.length === 0) return []

  const ids = [current.id, ...pool.map((p) => p.id)]
  const primaryLocations = await getPrimaryLocationMap(ids)
  const resolvedCurrentLocation = primaryLocations[current.id] || current.location || null

  const ranked = pool
    .map((b) => ({
      ...b,
      resolvedLocation: primaryLocations[b.id] || b.location || null,
    }))
    .sort((a, b) => {
      const aCategoryMatch = a.business_category === current.business_category ? 1 : 0
      const bCategoryMatch = b.business_category === current.business_category ? 1 : 0
      if (aCategoryMatch !== bCategoryMatch) return bCategoryMatch - aCategoryMatch

      const aLocationMatch = resolvedCurrentLocation && a.resolvedLocation === resolvedCurrentLocation ? 1 : 0
      const bLocationMatch = resolvedCurrentLocation && b.resolvedLocation === resolvedCurrentLocation ? 1 : 0
      return bLocationMatch - aLocationMatch
    })
    .slice(0, limit)

  return ranked.map(({ id, ...rest }) => rest)
}
