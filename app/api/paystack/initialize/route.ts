import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPriceQuote } from '@/lib/discount'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const paystackKey = process.env.PAYSTACK_SECRET_KEY
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cloutinet.online'

    if (!url || !anon || !paystackKey) {
      return NextResponse.json({ error: 'Server is missing configuration' }, { status: 500 })
    }

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user || !userData.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = userData.user

    const body = await req.json().catch(() => ({}))
    const tier = typeof body?.tier === 'string' ? body.tier : ''

    // Price is calculated on the server. The browser never sets the amount.
    const quote = await getPriceQuote(supabase, user.id, tier)
    if (!quote) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const reference = `clt_${user.id.slice(0, 8)}_${Date.now()}`

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: quote.finalPriceKobo,
        currency: 'NGN',
        reference,
        callback_url: `${siteUrl}/dashboard?payment=done`,
        metadata: {
          user_id: user.id,
          tier: quote.tier,
          original_price: quote.originalPrice,
          discount_percent: quote.discountPercent,
          first_purchase_discount: quote.eligible,
        },
      }),
    })

    const json = await res.json()
    if (!res.ok || !json?.status) {
      return NextResponse.json({ error: 'Could not start payment' }, { status: 502 })
    }

    return NextResponse.json({
      ok: true,
      authorization_url: json.data.authorization_url,
      reference: json.data.reference,
      amount: quote.finalPrice,
      discounted: quote.eligible,
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
