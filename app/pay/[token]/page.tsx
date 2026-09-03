'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function PublicPaymentRequestPage({ params }: { params: { token: string } }) {
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<any>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.rpc('get_payment_request', { token: params.token })
    setDetails(data)
    setLoading(false)
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
          <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '8px', padding: '14px', color: '#9A3412', fontSize: '13px', lineHeight: 1.5 }}>
            Please contact {details.business_name} directly to complete this payment. Online card payment isn&rsquo;t enabled yet — this request is for tracking purposes.
          </div>
        )}
      </div>
    </div>
  )
}
