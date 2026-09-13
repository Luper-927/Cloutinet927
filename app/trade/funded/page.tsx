'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function TradeFunded() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      const reference = searchParams.get('reference') || searchParams.get('trxref');

      if (!reference) {
        setStatus('failed');
        setMessage('No payment reference found.');
        return;
      }

      try {
        const response = await fetch(`/api/paystack/verify?reference=${reference}`);
        const data = await response.json();

        if (data.verified && data.tradeId) {
          const { error } = await supabase
            .from('trades')
            .update({ funded: true })
            .eq('id', data.tradeId);

          if (error) {
            setStatus('failed');
            setMessage('Payment succeeded but we could not update the trade. Contact support.');
            return;
          }

          setStatus('success');
          setMessage('Escrow funded successfully.');
        } else {
          setStatus('failed');
          setMessage(data.message || 'Payment could not be verified.');
        }
      } catch (err) {
        setStatus('failed');
        setMessage('Something went wrong verifying payment.');
      }
    };

    verify();
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-16">
      <p className="text-accent text-sm tracking-widest uppercase mb-4">Canesson</p>

      {status === 'verifying' && <p className="text-body">Verifying payment...</p>}

      {status === 'success' && (
        <>
          <h1 className="text-2xl font-bold text-heading mb-2">Escrow funded</h1>
          <p className="text-body mb-6">{message}</p>
        </>
      )}

      {status === 'failed' && (
        <>
          <h1 className="text-2xl font-bold text-heading mb-2">Payment issue</h1>
          <p className="text-body mb-6">{message}</p>
        </>
      )}

      <button
        onClick={() => router.push('/dashboard')}
        className="bg-accent hover:bg-accent-hover text-white font-bold py-3 px-6 rounded"
      >
        Back to dashboard
      </button>
    </main>
  );
}
