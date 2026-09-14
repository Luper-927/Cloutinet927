'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function PublicPaymentRequestPage({ params }: { params: { token: string } }) {
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<any>(null)
  const [email, setEmail] = useState('')
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

    if (!email.includes('@')) {
      setPayError('Please enter a valid email address.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: params.token, email }),
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Loading...</p>
      </div>
    )
  }

  if (!details?.found) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
        <p style={{ color: '#64748B', fontSize: '14px' }}>This payment request could not be found.</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Segoe UI, system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '380px', width: '100%', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '32px 24px', textAlign: 'center' as const }}>
        <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '4px' }}>{details.business_name}</div>
        <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
          {details.currency} {Number(details.amount).toLocaleString()}
        </div>
        {details.description && <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>{details.description}</div>}
        {details.due_date && <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '20px' }}>Due: {new Date(details.due_date).toLocaleDateString()}</div>}

        {details.status === 'paid' ? (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '14px', color: '#166534', fontWeight: 700, fontSize: '14px' }}>
            ✅ This payment has been marked as paid
          </div>
        ) : (
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              disabled={submitting}
              style={{ width: '100%', boxSizing: 'border-box' as const, padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px', marginBottom: '10px', fontFamily: 'inherit' }}
            />
            {payError && <div style={{ color: '#B91C1C', fontSize: '12px', marginBottom: '10px' }}>{payError}</div>}
            <button
              onClick={handlePay}
              disabled={submitting}
              style={{ width: '100%', background: submitting ? '#93C5FD' : '#2563EB', color: '#fff', border: 'none', borderRadius: '8px', padding: '13px', fontSize: '14px', fontWeight: 700, cursor: submitting ? 'default' : 'pointer' }}
            >
              {submitting ? 'Starting payment...' : 'Pay Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
