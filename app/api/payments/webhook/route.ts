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
      const { reference, metadata, amount, customer } = event.data
      const customerCode = customer?.customer_code

      const { data: transaction } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('paystack_reference', reference)
        .single()

      if (transaction) {
        // This matches a reference WE created -- the first charge that
        // starts a subscription.
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
              paystack_customer_code: customerCode || null,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', transaction.user_id)
        } else {
          await supabaseAdmin.from('subscriptions').insert({
            user_id: transaction.user_id,
            plan_id: transaction.plan_id,
            status: 'active',
            current_period_end: periodEnd.toISOString(),
            paystack_customer_code: customerCode || null,
          })
        }
        return NextResponse.json({ received: true })
      }

      // No matching reference -- this is either a recurring renewal charge
      // (initiated by Paystack itself, not us) or an unrelated charge from
      // the separate one-time payment_requests flow. Match renewals by the
      // customer's stable customer_code instead.
      if (customerCode) {
        const { data: sub } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('paystack_customer_code', customerCode)
          .single()

        if (sub) {
          const periodEnd = new Date()
          periodEnd.setMonth(periodEnd.getMonth() + 1)

          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'active',
              current_period_end: periodEnd.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', sub.user_id)

          // Record the renewal for history, tied to the same plan.
          await supabaseAdmin.from('transactions').insert({
            user_id: sub.user_id,
            plan_id: sub.plan_id,
            paystack_reference: reference,
            amount_ngn: Math.round(amount / 100),
            status: 'success',
          })
        }
      }

      return NextResponse.json({ received: true })
    }

    if (event.event === 'subscription.create') {
      // Backfills the subscription_code for reference/support purposes.
      // Not required for renewal matching (that uses customer_code), so
      // it's safe to skip quietly if we can't match a user yet.
      const customerCode = event.data.customer?.customer_code
      const subscriptionCode = event.data.subscription_code

      if (customerCode && subscriptionCode) {
        await supabaseAdmin
          .from('subscriptions')
          .update({ paystack_subscription_code: subscriptionCode })
          .eq('paystack_customer_code', customerCode)
      }

      return NextResponse.json({ received: true })
    }

    if (event.event === 'invoice.payment_failed') {
      // A renewal charge failed. Mark the subscription so the billing page
      // could show a "payment failed, update your card" state. We don't
      // touch current_period_end here -- it'll lapse naturally and
      // getBusinessTier() already demotes to Free once it does.
      const customerCode = event.data.customer?.customer_code
      if (customerCode) {
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('paystack_customer_code', customerCode)
      }
      return NextResponse.json({ received: true })
    }

    return NextResponse.json({ received: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
