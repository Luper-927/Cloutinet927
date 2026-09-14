import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()

    const signature = req.headers.get('x-paystack-signature')
    const expectedSignature = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(rawBody)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody)

    if (event.event === 'charge.success') {
      const { reference, metadata, amount, status } = event.data

      const { data: transaction } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('paystack_reference', reference)
        .single()

      if (!transaction) {
        return NextResponse.json({ received: true })
      }

      if (transaction.status === 'success') {
        return NextResponse.json({ received: true })
      }

      const expectedAmountKobo = transaction.amount_ngn * 100
      if (amount !== expectedAmountKobo) {
        await supabaseAdmin
          .from('transactions')
          .update({ status: 'amount_mismatch' })
          .eq('paystack_reference', reference)

        return NextResponse.json({ received: true })
      }

      await supabaseAdmin
        .from('transactions')
        .update({ status: 'success' })
        .eq('paystack_reference', reference)

      const periodEnd = new Date()
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      const { data: existingSub } = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .eq('user_id', transaction.user_id)
        .single()

      if (existingSub) {
        await supabaseAdmin
          .from('subscriptions')
          .update({
            plan_id: transaction.plan_id,
            status: 'active',
            current_period_end: periodEnd.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', transaction.user_id)
      } else {
        await supabaseAdmin.from('subscriptions').insert({
          user_id: transaction.user_id,
          plan_id: transaction.plan_id,
          status: 'active',
          current_period_end: periodEnd.toISOString(),
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
