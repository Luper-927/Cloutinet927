'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function PaymentCompletePage({ params }: { params: { token: string } }) {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
  const [message, setMessage] = useState('')
  const [amount, setAmount] = useState<number | null>(null)
  const [currency, setCurrency] = useState('')

  useEffect(() => {
    verify()
  }, [])

  async function verify() {
    const reference = searchParams.get('reference') || searchParams.get('trxref')

    if (!reference) {
      setStatus('failed')
      setMessage('No payment reference found. If you completed payment, contact the business directly.')
      return
    }

    try {
      const res = await fetch('/api/paystack/verify?reference=' + encodeURIComponent(reference))
      const data = await res.json()

      if (data.verified) {
        setStatus('success')
        setAmount(data.amount)
        setCurrency(data.currency)
      } else {
        setStatus('failed')
        setMessage(data.message || data.error || 'Payment could not be verified.')
      }
    } catch {
      setStatus('failed')
      setMessage('Something went wrong verifying your payment. If money was deducted, contact the business.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Segoe UI, system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '380px', width: '100%', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '32px 24px', textAlign: 'center' as const }}>

        {status === 'verifying' && (
          <>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
            <div style={{ fontSize: '15px', color: '#64748B' }}>Confirming your payment...</div>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#166534', marginBottom: '8px' }}>Payment Successful</h2>
            {amount !== null && (
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>
                {currency} {Number(amount).toLocaleString()}
              </div>
            )}
            <p style={{ fontSize: '13px', color: '#64748B' }}>Thank you — your payment has been received and recorded.</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#B91C1C', marginBottom: '8px' }}>Payment Not Confirmed</h2>
            <p style={{ fontSize: '13px', color: '#64748B' }}>{message}</p>
          </>
        )}

      </div>
    </div>
  )
}
