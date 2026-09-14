import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference');

  if (!reference) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    if (!data.status || data.data.status !== 'success') {
      return NextResponse.json({ verified: false, message: data.data?.gateway_response || 'Payment not successful' });
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

    // Guard against amount/currency tampering: only trust what Paystack actually
    // confirms was paid, checked against what this specific request expects.
    const expectedAmountKobo = Math.round(Number(paymentRequest.amount) * 100);
    if (Math.round(paidAmount * 100) !== expectedAmountKobo || paidCurrency !== paymentRequest.currency) {
      return NextResponse.json({ verified: false, message: 'Paid amount does not match this request. Contact the business.' });
    }

    // Idempotent: only flips pending -> paid once. If this reference was already
    // processed (e.g. the payer refreshed the completion page), this matches
    // zero rows, which is fine -- we don't treat that as an error.
    await supabaseAdmin
      .from('payment_requests')
      .update({ status: 'paid' })
      .eq('id', paymentRequest.id)
      .eq('status', 'pending');

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

    // A unique-constraint violation on `reference` just means this transaction
    // was already recorded (e.g. a duplicate verify call) -- not a real failure.
    if (insertError && insertError.code !== '23505') {
      return NextResponse.json({ error: 'Payment succeeded but could not be recorded. Contact support.' }, { status: 500 });
    }

    return NextResponse.json({
      verified: true,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
