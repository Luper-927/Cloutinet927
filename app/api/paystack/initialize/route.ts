// app/api/paystack/initialize/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const baseUrl = 'https://cloutinet.online'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: 'Missing payment request.' }, { status: 400 })
    }

    const { data: request, error } = await supabaseAdmin
      .from('payment_requests')
      .select('id, amount, currency, status, customer_name')
      .eq('public_token', token)
      .single()

    if (error || !request) {
      return NextResponse.json({ error: 'Payment request not found.' }, { status: 404 })
    }

    if (request.status !== 'pending') {
      return NextResponse.json({ error: 'This payment request is no longer awaiting payment.' }, { status: 409 })
    }

    // Paystack requires an email to start a transaction, but the payer isn't
    // asked for one -- we generate a placeholder tied to this specific request.
    // No receipt email will be sent by Paystack as a result; that's an accepted
    // trade-off for a faster checkout on links mostly shared via WhatsApp.
    const placeholderEmail = `payer+${token}@cloutinet.online`

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: placeholderEmail,
        amount: Math.round(Number(request.amount) * 100),
        currency: request.currency,
        callback_url: `${baseUrl}/pay/${token}/complete`,
        metadata: { payment_request_id: request.id, public_token: token },
      }),
    })

    const paystackData = await paystackRes.json()

    if (!paystackRes.ok || !paystackData.status) {
      return NextResponse.json({ error: 'Could not start payment. Please try again.' }, { status: 502 })
    }

    return NextResponse.json({ authorization_url: paystackData.data.authorization_url })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong starting payment.' }, { status: 500 })
  }
}
