'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function PublicPaymentRequestPage({ params }: { params: { token: string } }) {
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [payError, setPayError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.rpc('get_payment_request', { token: params.token })
    setDetails(data)
    setLoading(false)
  }

  async function handlePay() {
    setPayError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: params.token }),
      })
      const data = await res.json()

      if (!res.ok || !data.authorization_url) {
        setPayError(data.error || 'Could not start payment. Please try again.')
        setSubmitting(false)
        return
      }

      window.location.href = data.authorization_url
    } catch (err) {
      setPayError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const shell = (children: React.ReactNode) => (
    <div style={pageStyle}>
      <div style={cardStyle}>{children}</div>
      <div style={{ marginTop: '20px', fontSize: '13px', color: '#64748B' }}>Powered by Cloutinet</div>
    </div>
  )

  if (loading) {
    return shell(<p style={{ color: '#94A3B8', fontSize: '14px', margin: 0, textAlign: 'center' }}>Loading...</p>)
  }

  if (!details?.found) {
    return shell(<p style={{ color: '#94A3B8', fontSize: '14px', margin: 0, textAlign: 'center' }}>This payment request could not be found.</p>)
  }

  return shell(
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '6px' }}>{details.business_name}</div>
      <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', marginBottom: '10px' }}>
        {details.currency} {Number(details.amount).toLocaleString()}
      </div>
      {details.description && <div style={{ fontSize: '14px', color: '#CBD5E1', marginBottom: '14px', lineHeight: 1.5 }}>{details.description}</div>}
      {details.due_date && <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '22px' }}>Due {new Date(details.due_date).toLocaleDateString()}</div>}

      {details.status === 'paid' ? (
        <div style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.30)', borderRadius: '10px', padding: '14px', color: '#34D399', fontWeight: 700, fontSize: '14px' }}>
          This payment has been marked as paid
        </div>
      ) : (
        <div>
          {payError && <div style={{ color: '#FCA5A5', fontSize: '13px', marginBottom: '12px' }}>{payError}</div>}
          <button
            onClick={handlePay}
            disabled={submitting}
            style={{ width: '100%', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', minHeight: '48px', fontSize: '15px', fontWeight: 600, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1, fontFamily: 'inherit' }}
          >
            {submitting ? 'Starting payment...' : 'Pay now'}
          </button>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '12px 0 0' }}>Payments are processed by Paystack.</p>
        </div>
      )}
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  fontFamily: 'inherit',
  backgroundColor: '#0A0E27',
  backgroundImage:
    'radial-gradient(ellipse 700px 500px at 10% -10%, rgba(29,78,216,0.35), transparent 70%), radial-gradient(ellipse 600px 600px at 100% 0%, rgba(37,99,235,0.28), transparent 70%)',
  backgroundRepeat: 'no-repeat',
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '16px',
  padding: '32px 24px',
  width: '100%',
  maxWidth: '400px',
  boxSizing: 'border-box',
}
