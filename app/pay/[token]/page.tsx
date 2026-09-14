'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function CompleteContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
  const [message, setMessage] = useState('')
  const [amount, setAmount] = useState<number | null>(null)
  const [currency, setCurrency] = useState('')

  useEffect(() => {
    const verify = async () => {
      const reference = searchParams.get('reference') || searchParams.get('trxref')

      if (!reference) {
        setStatus('failed')
        setMessage('No payment reference found.')
        return
      }

      try {
        const res = await fetch(`/api/paystack/verify?reference=${reference}`)
        const data = await res.json()

        if (data.verified) {
          setStatus('success')
          setAmount(data.amount)
          setCurrency(data.currency)
        } else {
          setStatus('failed')
          setMessage(data.message || data.error || 'Payment could not be verified.')
        }
      } catch (err) {
        setStatus('failed')
        setMessage('Something went wrong verifying payment.')
      }
    }

    verify()
  }, [searchParams])

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Segoe UI, system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '380px', width: '100%', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '32px 24px', textAlign: 'center' as const }}>
        {status === 'verifying' && <p style={{ color: '#64748B', fontSize: '14px' }}>Verifying payment...</p>}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Payment successful</div>
            {amount !== null && (
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#166534', marginBottom: '10px' }}>
                {currency} {Number(amount).toLocaleString()}
              </div>
            )}
            <p style={{ color: '#64748B', fontSize: '13px' }}>You can close this page.</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Payment issue</div>
            <p style={{ color: '#9A3412', fontSize: '13px' }}>{message}</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function PaymentCompletePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F8FAFC' }} />}>
      <CompleteContent />
    </Suspense>
  )
}
