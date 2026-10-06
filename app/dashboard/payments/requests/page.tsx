'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../../lib/supabase'
import { logActivity } from '../../../../lib/permissions'
import { useDashboard } from '../../../components/DashboardShell'

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
  const { context, tierLimits } = useDashboard()

  const ownerId = context.ownerId
  const actorName = context.employeeName || 'Owner'
  const noPermission = !context.permissions.payments
  const hasAccess = !!tierLimits?.paymentsModule
  const tierName = tierLimits?.name || 'Free'

  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)

  const [customerName, setCustomerName] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    if (noPermission || !hasAccess) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('payment_requests')
      .select('id, customer_name, amount, currency, description, due_date, status, public_token, created_at')
      .eq('owner_id', ownerId)
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
      <div style={{ padding: '24px 0' }}>
        <p style={mutedStyle}>Loading...</p>
      </div>
    )
  }

  if (noPermission) {
    return (
      <div style={{ padding: '24px 0' }}>
        <p style={mutedStyle}>You don&rsquo;t have permission to create payment requests.</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={wrapStyle}>
        <Link href="/dashboard/payments" style={backStyle}>Back to payments</Link>
        <div style={{ padding: '36px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>💰</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            Payment requests are not included in your plan
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
            You&rsquo;re currently on the {tierName} plan. Upgrade to send payment requests to your customers.
          </p>
          <Link href="/dashboard/billing" style={upgradeButtonStyle}>View Plans</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <Link href="/dashboard/payments" style={backStyle}>Back to payments</Link>
      <h1 style={titleStyle}>Payment requests</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          width: '100%',
          background: '#0F172A',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '12px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 700,
          fontFamily: 'inherit',
          marginBottom: '16px',
          minHeight: '44px',
        }}
      >
        {showForm ? 'Cancel' : '+ Create payment request'}
      </button>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <input placeholder="Customer name" value={customerName} onChange={e => setCustomerName(e.target.value)} style={inputStyle} />
          <input placeholder="Amount (NGN)" type="number" value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle} />
          <input placeholder="Description (e.g. Office chairs x2)" value={description} onChange={e => setDescription(e.target.value)} style={inputStyle} />
          <label style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Due date (optional)</label>
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
              width: '100%',
              background: '#0F172A',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: 'inherit',
              opacity: saving ? 0.7 : 1,
              minHeight: '44px',
            }}
          >
            {saving ? 'Creating...' : 'Create request'}
          </button>
        </div>
      )}

      {requests.length === 0 ? (
        <p style={{ color: '#64748B', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No payment requests yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {requests.map(r => (
            <div key={r.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>{r.customer_name}</div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>{r.currency} {Number(r.amount).toLocaleString()}</div>
              </div>
              {r.description && <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '6px' }}>{r.description}</div>}
              {r.due_date && <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '6px' }}>Due {new Date(r.due_date).toLocaleDateString()}</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '11px',
                  padding: '2px 10px',
                  borderRadius: '999px',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  background: r.status === 'paid' ? '#F0FDF4' : '#FFF7ED',
                  color: r.status === 'paid' ? '#166534' : '#9A3412',
                }}>{r.status}</span>
                <button
                  onClick={() => copyLink(r.public_token)}
                  style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    minHeight: '32px',
                    borderRadius: '6px',
                    background: '#fff',
                    color: '#0F172A',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Copy link
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const wrapStyle: React.CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  fontFamily: 'Segoe UI, system-ui, sans-serif',
}

const backStyle: React.CSSProperties = {
  display: 'inline-block',
  color: '#475569',
  fontSize: '13px',
  textDecoration: 'none',
  marginBottom: '12px',
  padding: '6px 0',
}

const titleStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 800,
  color: '#0F172A',
  margin: '0 0 14px',
  letterSpacing: '-0.01em',
}

const mutedStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '14px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  padding: '10px 12px',
  color: '#0F172A',
  fontSize: '14px',
  marginBottom: '10px',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const upgradeButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  background: '#0F172A',
  color: '#fff',
  borderRadius: '8px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: 700,
  textDecoration: 'none',
}
