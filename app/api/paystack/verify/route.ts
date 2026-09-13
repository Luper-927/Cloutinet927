import { NextRequest, NextResponse } from 'next/server';

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

    return NextResponse.json({
      verified: true,
      tradeId: data.data.metadata?.tradeId,
      amount: data.data.amount / 100,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
