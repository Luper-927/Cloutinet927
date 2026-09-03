'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { getBusinessTier } from '../../../lib/tiers'
import { getActingContext, logActivity } from '../../../lib/permissions'
import Link from 'next/link'

type PaymentRecord = {
  id: string
  customer_name: string
  amount: number
  currency: string
  status: string
  method: string | null
  reference: string | null
  note: string | null
  created_at: string
}

export default function PaymentsPage() {
  const [records, setRecords] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(true)
  const [noPermission, setNoPermission] = useState(false)
  const [tierName, setTierName] = useState('Free')
  const [ownerId, setOwnerId] = useState('')
  const [actorName, setActorName] = useState('')

  const [customerName, setCustomerName] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<'paid' | 'pending' | 'partial' | 'failed' | 'refunded' | 'cancelled'>('paid')
  const [method, setMethod] = useState('')
  const [reference, setReference] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

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

    const { limits } = await getBusinessTier(context.ownerId)
    setTierName(limits.name)

    if (!limits.paymentsModule) {
      setHasAccess(false)
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('payment_records')
      .select('id, customer_name, amount, currency, status, method, reference, note, created_at')
      .eq('owner_id', context.ownerId)
      .order('created_at', { ascending: false })

    setRecords(data || [])
    setLoading(false)
  }

  async function handleAdd() {
    if (!customerName.trim() || !amount.trim()) {
      setError('Customer name and amount are required')
      return
    }
    setSaving(true)
    setError('')

    const { error: saveError } = await supabase.from('payment_records').insert({
      owner_id: ownerId,
      customer_name: customerName,
      amount: parseFloat(amount),
      status,
      method: method || null,
      reference: reference || null,
      note: note || null,
    })

    setSaving(false)
    if (saveError) { setError(saveError.message); return }

    await logActivity(ownerId, actorName, 'recorded', 'payment', customerName + ' - ' + amount)

    setCustomerName(''); setAmount(''); setMethod(''); setReference(''); setNote(''); setStatus('paid')
    setShowForm(false)
    load()
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
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif', textAlign: 'center' as const }}>You don&rsquo;t have permission to view payments.</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
        <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Payments</div>
          <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</Link>
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>💰</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            Payment tracking needs Business or higher
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
            You&rsquo;re currently on the {tierName} plan. Upgrade to track money coming into your business.
          </p>
          <Link href="/dashboard/billing" style={{
            display: 'inline-block', background: '#0F172A', color: '#fff',
            borderRadius: '8px', padding: '12px 24px', fontSize: '14px',
            fontWeight: 700, textDecoration: 'none'
          }}>
            View Plans
          </Link>
        </div>
      </div>
    )
  }

  const moneyReceived = records.filter(r => r.status === 'paid').reduce((sum, r) => sum + Number(r.amount), 0)
  const pending = records.filter(r => r.status === 'pending' || r.status === 'partial').reduce((sum, r) => sum + Number(r.amount), 0)
  const thisMonth = records.filter(r => {
    const d = new Date(r.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && r.status === 'paid'
  }).reduce((sum, r) => sum + Number(r.amount), 0)

  const statusColors: Record<string, { bg: string; color: string }> = {
    paid: { bg: '#F0FDF4', color: '#166534' },
    pending: { bg: '#FFF7ED', color: '#9A3412' },
    partial: { bg: '#FFF7ED', color: '#9A3412' },
    failed: { bg: '#FEF2F2', color: '#dc2626' },
    refunded: { bg: '#F8FAFC', color: '#64748B' },
    cancelled: { bg: '#F8FAFC', color: '#64748B' },
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Payments</div>
        <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</Link>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700, textTransform: 'uppercase' as const }}>Money Received</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#166534', marginTop: '4px' }}>₦{moneyReceived.toLocaleString()}</div>
          </div>
          <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '11px', color: '#9A3412', fontWeight: 700, textTransform: 'uppercase' as const }}>Pending</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#9A3412', marginTop: '4px' }}>₦{pending.toLocaleString()}</div>
          </div>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, textTransform: 'uppercase' as const }}>Transactions</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{records.length}</div>
          </div>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, textTransform: 'uppercase' as const }}>This Month</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>₦{thisMonth.toLocaleString()}</div>
          </div>
        </div>

        <Link href="/dashboard/payments/requests" style={{
          display: 'block', width: '100%', textAlign: 'center', background: '#fff', color: '#0F172A',
          border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 700,
          textDecoration: 'none', marginBottom: '10px', boxSizing: 'border-box' as const
        }}>
          🔗 Payment Requests
        </Link>

        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            width: '100%', background: '#0F172A', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '12px', cursor: 'pointer',
            fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', marginBottom: '16px'
          }}
        >
          {showForm ? 'Cancel' : '+ Record a Payment'}
        </button>

        {showForm && (
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <input placeholder="Customer name" value={customerName} onChange={e => setCustomerName(e.target.value)} style={inputStyle} />
            <input placeholder="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle} />

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: '12px' }}>
              {(['paid', 'pending', 'partial', 'failed', 'refunded', 'cancelled'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  style={{
                    padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                    border: '1px solid ' + (status === s ? '#0F172A' : '#E2E8F0'),
                    background: status === s ? '#0F172A' : '#fff',
                    color: status === s ? '#fff' : '#0F172A', cursor: 'pointer', fontFamily: 'inherit',
                    textTransform: 'capitalize' as const
                  }}
                >{s}</button>
              ))}
            </div>

            <input placeholder="Method (cash, transfer, POS...)" value={method} onChange={e => setMethod(e.target.value)} style={inputStyle} />
            <input placeholder="Reference (optional)" value={reference} onChange={e => setReference(e.target.value)} style={inputStyle} />
            <input placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} style={{ ...inputStyle, marginBottom: '12px' }} />

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
                <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>{error}</p>
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={saving}
              style={{
                width: '100%', background: '#0F172A', color: '#fff', border: 'none',
                borderRadius: '8px', padding: '12px', cursor: 'pointer',
                fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        )}

        <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' as const, marginBottom: '10px' }}>
          Recent Transactions
        </div>

        {records.length === 0 ? (
          <p style={{ color: '#64748B', fontSize: '13px', textAlign: 'center' as const, padding: '20px' }}>No payment records yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {records.map(r => (
              <div key={r.id} style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>{r.customer_name}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>{new Date(r.created_at).toLocaleDateString()} {r.method ? '· ' + r.method : ''}</div>
                  {r.reference && <div style={{ fontSize: '11px', color: '#94A3B8' }}>Ref: {r.reference}</div>}
                  {r.note && <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{r.note}</div>}
                </div>
                <div style={{ textAlign: 'right' as const }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>{r.currency} {Number(r.amount).toLocaleString()}</div>
                  <span style={{
                    fontSize: '9px', padding: '2px 8px', borderRadius: '999px', fontWeight: 700, textTransform: 'capitalize' as const,
                    background: statusColors[r.status]?.bg, color: statusColors[r.status]?.color,
                  }}>{r.status}</span>
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
