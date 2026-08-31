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

    const { reference } = await req.json()
    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
    }

    // Confirm this transaction actually belongs to the logged-in user —
    // never let someone check the status of a payment reference that
    // isn't theirs.
    const { data: transaction } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('paystack_reference', reference)
      .eq('user_id', user.id)
      .single()

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Double-check directly with Paystack too, not just our own database —
    // the webhook should have already updated this, but this route gives
    // an immediate, independent confirmation for the UI.
    const paystackResponse = await fetch(
      'https://api.paystack.co/transaction/verify/' + reference,
      {
        headers: {
          'Authorization': 'Bearer ' + process.env.PAYSTACK_SECRET_KEY,
        },
      }
    )

    const paystackData = await paystackResponse.json()

    return NextResponse.json({
      status: transaction.status,
      paystack_status: paystackData.data?.status,
      plan_id: transaction.plan_id,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
