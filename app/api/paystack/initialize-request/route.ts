import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  try {
    const paystackKey = process.env.PAYSTACK_SECRET_KEY
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cloutinet.online'

    if (!paystackKey) {
      return NextResponse.json({ error: 'Payments are not available right now.' }, { status: 500 })
    }

    const body = await req.json().catch(() => ({}))
    const token = typeof body?.token === 'string' ? body.token : ''
    if (!UUID.test(token)) {
      return NextResponse.json({ error: 'Invalid payment link.' }, { status: 400 })
    }

    // The amount always comes from our database, never from the browser.
    const { data: request } = await supabaseAdmin
      .from('payment_requests')
      .select('id, amount, currency, status')
      .eq('public_token', token)
      .maybeSingle()

    if (!request) {
      return NextResponse.json({ error: 'Payment request not found.' }, { status: 404 })
    }
    if (request.status !== 'pending') {
      return NextResponse.json({ error: 'This payment request is no longer open.' }, { status: 400 })
    }

    const amountKobo = Math.round(Number(request.amount) * 100)
    if (!Number.isFinite(amountKobo) || amountKobo <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount.' }, { status: 400 })
    }

    const reference = `plr_${crypto.randomBytes(10).toString('hex')}`

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Paystack needs an email. Each request gets its own placeholder, so
        // payers never get mixed up with subscription customers.
        email: `pay-${request.id}@pay.cloutinet.online`,
        amount: amountKobo,
        currency: request.currency,
        reference,
        callback_url: `${siteUrl}/pay/${token}`,
        metadata: { payment_request_id: request.id },
      }),
    })

    const json = await res.json()
    if (!res.ok || !json?.status || !json?.data?.authorization_url) {
      return NextResponse.json({ error: 'Could not start payment. Please try again.' }, { status: 502 })
    }

    return NextResponse.json({
      authorization_url: json.data.authorization_url,
      reference: json.data.reference,
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
