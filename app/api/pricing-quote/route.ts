import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  TIER_PRICES,
  DISCOUNT_ENABLED,
  FIRST_PURCHASE_DISCOUNT_PERCENT,
  getPriceQuote,
} from '@/lib/discount'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    return NextResponse.json({ error: 'Server is missing configuration' }, { status: 500 })
  }

  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  const supabase = createClient(url, anon, {
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
    auth: { persistSession: false, autoRefreshToken: false },
  })

  let userId: string | null = null
  if (token) {
    const { data } = await supabase.auth.getUser(token)
    userId = data?.user?.id || null
  }

  const tiers = Object.keys(TIER_PRICES)

  // Signed-in user: real eligibility check
  if (userId) {
    const quotes = (
      await Promise.all(tiers.map((t) => getPriceQuote(supabase, userId as string, t)))
    ).filter(Boolean)
    return NextResponse.json({ signedIn: true, quotes })
  }

  // Visitor: show the new-customer offer, verified again at checkout
  const quotes = tiers.map((t) => {
    const originalPrice = TIER_PRICES[t]
    const discountPercent = DISCOUNT_ENABLED ? FIRST_PURCHASE_DISCOUNT_PERCENT : 0
    const discountAmount = Math.round((originalPrice * discountPercent) / 100)
    return {
      tier: t,
      originalPrice,
      discountPercent,
      discountAmount,
      finalPrice: originalPrice - discountAmount,
      finalPriceKobo: (originalPrice - discountAmount) * 100,
      eligible: DISCOUNT_ENABLED,
    }
  })
  return NextResponse.json({ signedIn: false, quotes })
}
