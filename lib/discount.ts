import type { SupabaseClient } from '@supabase/supabase-js'

// Edit these two values to change the offer
export const FIRST_PURCHASE_DISCOUNT_PERCENT = 20
export const DISCOUNT_ENABLED = true

// Monthly prices in Naira. Enterprise is custom, so it is not listed here.
export const TIER_PRICES: Record<string, number> = {
  startup: 15000,
  growth: 40000,
  scale: 75000,
}

export type PriceQuote = {
  tier: string
  originalPrice: number
  discountPercent: number
  discountAmount: number
  finalPrice: number
  finalPriceKobo: number
  eligible: boolean
}

// A customer is "new" if they have never had a paid subscription.
// Change the table/column names below if yours are different.
export async function isFirstTimeCustomer(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    // If we can't verify, do NOT give the discount
    if (error) return false
    return (count || 0) === 0
  } catch {
    return false
  }
}

export async function getPriceQuote(
  supabase: SupabaseClient,
  userId: string,
  tier: string
): Promise<PriceQuote | null> {
  const key = tier.toLowerCase()
  const originalPrice = TIER_PRICES[key]
  if (!originalPrice) return null

  const eligible = DISCOUNT_ENABLED && (await isFirstTimeCustomer(supabase, userId))
  const discountPercent = eligible ? FIRST_PURCHASE_DISCOUNT_PERCENT : 0
  const discountAmount = Math.round((originalPrice * discountPercent) / 100)
  const finalPrice = originalPrice - discountAmount

  return {
    tier: key,
    originalPrice,
    discountPercent,
    discountAmount,
    finalPrice,
    finalPriceKobo: finalPrice * 100,
    eligible,
  }
}
