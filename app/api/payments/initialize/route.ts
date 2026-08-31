import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }
    const user = userData.user

    const { plan_id } = await req.json()
    if (!plan_id) {
      return NextResponse.json({ error: 'Missing plan_id' }, { status: 400 })
    }

    const { data: plan, error: planError } = await supabaseAdmin
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .eq('is_active', true)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    if (plan.price_ngn === 0) {
      return NextResponse.json({ error: 'Free plan does not require payment' }, { status: 400 })
    }

    const reference = 'cloutinet_' + user.id.slice(0, 8) + '_' + Date.now()

    await supabaseAdmin.from('transactions').insert({
      user_id: user.id,
      plan_id: plan.id,
      paystack_reference: reference,
      amount_ngn: plan.price_ngn,
      status: 'pending',
    })

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.PAYSTACK_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: plan.price_ngn * 100,
        reference,
        callback_url: 'https://cloutinet.online/dashboard?payment=processing',
        metadata: {
          user_id: user.id,
          plan_id: plan.id,
        },
      }),
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      await supabaseAdmin
        .from('transactions')
        .update({ status: 'failed' })
        .eq('paystack_reference', reference)

      return NextResponse.json({ error: 'Could not initialize payment' }, { status: 500 })
    }

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      reference,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
