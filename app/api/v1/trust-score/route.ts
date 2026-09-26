import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateApiKey, checkAndIncrementRateLimit } from '@/lib/api-auth'
import { calculateVisibilityScore } from '@/lib/visibility-score'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const auth = await validateApiKey(req)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const rateLimit = await checkAndIncrementRateLimit(auth.keyId!)
  if (!rateLimit.ok) {
    return NextResponse.json({ error: 'Daily rate limit exceeded' }, { status: 429 })
  }

  const businessId = req.nextUrl.searchParams.get('business_id')
  if (!businessId) {
    return NextResponse.json({ error: 'business_id query parameter is required' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, business_id, business_name, business_category, location, phone, tagline, business_hours, services, facebook_url, instagram_url')
    .eq('business_id', businessId)
    .maybeSingle()

  if (!profile) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)

  const score = calculateVisibilityScore(profile, productCount || 0)

  return NextResponse.json({
    business_id: profile.business_id,
    business_name: profile.business_name,
    trust_score: score,
    max_score: 100,
  }, {
    headers: { 'X-RateLimit-Remaining': String(rateLimit.remaining) }
  })
}
