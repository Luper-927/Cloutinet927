'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { getActingContext, logActivity } from '../../../../lib/permissions'
import Link from 'next/link'

type PaymentRequest = {
  id: string
  customer_name: string
  amount: number
  currency: string
  description: string | null
  due_date: string | null
  status: string
  public_token: string
  created_at: string
}

export default function PaymentRequestsPage() {
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [ownerId, setOwnerId] = useState('')
  const [actorName, setActorName] = useState('')
  const [noPermission, setNoPermission] = useState(false)

  const [customerName, setCustomerName] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const context = await getActingContext(userData.user.id)
    if (!context) { window.location.href = '/onboarding'; return }

    if (!context.permissions.payments) {
      setNoPermission(true)
      setLoading(false)
      return
    }

    setOwnerId(context.ownerId)
    setActorName(context.employeeName || 'Owner')

    const { data } = await supabase
      .from('payment_requests')
      .select('id, customer_name, amount, currency, description, due_date, status, public_token, created_at')
      .eq('owner_id', context.ownerId)
      .order('created_at', { ascending: false })

    setRequests(data || [])
    setLoading(false)
  }

  async function handleCreate() {
    if (!customerName.trim() || !amount.trim()) {
      setError('Customer name and amount are required')
      return
    }
    setSaving(true)
    setError('')

    const { error: saveError } = await supabase.from('payment_requests').insert({
      owner_id: ownerId,
      customer_name: customerName,
      amount: parseFloat(amount),
      description: description || null,
      due_date: dueDate || null,
    })

    setSaving(false)
    if (saveError) { setError(saveError.message); return }

    await logActivity(ownerId, actorName, 'created', 'payment request', customerName + ' - ' + amount)

    setCustomerName(''); setAmount(''); setDescription(''); setDueDate('')
    setShowForm(false)
    load()
  }

  function copyLink(token: string) {
    const link = window.location.origin + '/pay/' + token
    navigator.clipboard.writeText(link)
    alert('Link copied: ' + link)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Loading...</p>
      </div>
    )
  }

  if (noPermission) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif', textAlign: 'center' as const }}>You don&rsquo;t have permission to create payment requests.</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Payment Requests</div>
        <Link href="/dashboard/payments" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</Link>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            width: '100%', background: '#0F172A', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '12px', cursor: 'pointer',
            fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', marginBottom: '16px'
          }}
        >
          {showForm ? 'Cancel' : '+ Create Payment Request'}
        </button>

        {showForm && (
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <input placeholder="Customer name" value={customerName} onChange={e => setCustomerName(e.target.value)} style={inputStyle} />
            <input placeholder="Amount (NGN)" type="number" value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle} />
            <input placeholder="Description (e.g. Office chairs x2)" value={description} onChange={e => setDescription(e.target.value)} style={inputStyle} />
            <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Due Date (optional)</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ ...inputStyle, marginTop: '6px' }} />

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
                <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>{error}</p>
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={saving}
              style={{
                width: '100%', background: '#0F172A', color: '#fff', border: 'none',
                borderRadius: '8px', padding: '12px', cursor: 'pointer',
                fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        )}

        {requests.length === 0 ? (
          <p style={{ color: '#64748B', fontSize: '13px', textAlign: 'center' as const, padding: '20px' }}>No payment requests yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {requests.map(r => (
              <div key={r.id} style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>{r.customer_name}</div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>{r.currency} {Number(r.amount).toLocaleString()}</div>
                </div>
                {r.description && <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>{r.description}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '9px', padding: '2px 8px', borderRadius: '999px', fontWeight: 700, textTransform: 'capitalize' as const,
                    background: r.status === 'paid' ? '#F0FDF4' : '#FFF7ED',
                    color: r.status === 'paid' ? '#166534' : '#9A3412',
                  }}>{r.status}</span>
                  <button
                    onClick={() => copyLink(r.public_token)}
                    style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px', background: '#fff', color: '#0F172A', border: '1px solid #E2E8F0', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#fff', border: '1px solid #E2E8F0',
  borderRadius: '8px', padding: '10px 12px', color: '#0F172A',
  fontSize: '13px', marginBottom: '10px', outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box'
}
