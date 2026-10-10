import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin'
import { emitEvent } from '@/lib/automation/engine'

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference');

  if (!reference) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!data.status || !data.data || data.data.status !== 'success') {
      return NextResponse.json({ verified: false, message: data.data?.gateway_response || 'Payment not successful' });
    }

    if (data.data.reference !== reference) {
      return NextResponse.json({ verified: false, message: 'Payment reference mismatch.' });
    }

    const paidAmount = data.data.amount / 100;
    const paidCurrency = data.data.currency;
    const requestId = data.data.metadata?.payment_request_id;

    if (!requestId) {
      return NextResponse.json({ verified: false, message: 'Payment reference is not linked to a request.' });
    }

    const { data: paymentRequest, error: fetchError } = await supabaseAdmin
      .from('payment_requests')
      .select('id, owner_id, amount, currency, customer_name, status')
      .eq('id', requestId)
      .single();

    if (fetchError || !paymentRequest) {
      return NextResponse.json({ verified: false, message: 'Payment request no longer exists.' });
    }

    // Only trust what Paystack confirms was paid, checked against what this request expects.
    const expectedAmountKobo = Math.round(Number(paymentRequest.amount) * 100);
    if (Math.round(paidAmount * 100) !== expectedAmountKobo || paidCurrency !== paymentRequest.currency) {
      return NextResponse.json({ verified: false, message: 'Paid amount does not match this request. Contact the business.' });
    }

    // Step 1: save the payment record first (skip if this reference was already saved).
    const { data: existingRecord } = await supabaseAdmin
      .from('payment_records')
      .select('id')
      .eq('reference', reference)
      .maybeSingle();

    if (!existingRecord) {
      const { error: insertError } = await supabaseAdmin
        .from('payment_records')
        .insert({
          owner_id: paymentRequest.owner_id,
          customer_name: paymentRequest.customer_name,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          status: 'paid',
          method: 'paystack',
          reference,
          payment_request_id: paymentRequest.id,
        });

      // 23505 = duplicate reference, meaning it was already recorded. Not a real failure.
      if (insertError && insertError.code !== '23505') {
        return NextResponse.json({ error: 'Payment succeeded but could not be recorded. Contact support.' }, { status: 500 });
      }
    }

    // Step 2: only after the record is safe, mark the request as paid (pending -> paid once).
    await supabaseAdmin
      .from('payment_requests')
      .update({ status: 'paid' })
      .eq('id', paymentRequest.id)
      .eq('status', 'pending');

    // Step 3: tell the automation engine a payment was confirmed.
    // The reference is used as the duplicate key, so refreshing this page
    // can never trigger the same automation twice. This call never throws.
    await emitEvent(
      paymentRequest.owner_id,
      'payment.confirmed',
      {
        payment: {
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          customer_name: paymentRequest.customer_name,
          reference,
          request_id: paymentRequest.id,
        },
      },
      `payment.confirmed:${reference}`
    );

    return NextResponse.json({
      verified: true,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
