// Single source of truth for the visibility score, used by both the
// dashboard UI and the trust-score API — so a change to the formula
// only has to happen in one place.

export interface VisibilityScoreInput {
  business_name?: string | null
  location?: string | null
  phone?: string | null
  business_category?: string | null
  tagline?: string | null
  business_hours?: string | null
  services?: string | null
  facebook_url?: string | null
  instagram_url?: string | null
}

export function calculateVisibilityScore(profile: VisibilityScoreInput, productCount: number): number {
  let score = 0
  if (profile.business_name) score += 20
  if (profile.location) score += 15
  if (profile.phone) score += 15
  if (profile.business_category) score += 10
  if (profile.tagline) score += 10
  if (profile.business_hours) score += 5
  if (profile.services) score += 5
  if (productCount > 0) score += 10
  if (productCount >= 5) score += 5
  if (profile.facebook_url || profile.instagram_url) score += 5
  return Math.min(100, score)
}
