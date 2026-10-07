'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { logActivity } from '../../../lib/permissions'
import { useDashboard } from '../../components/DashboardShell'

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

const STATUSES = ['paid', 'pending', 'partial', 'failed', 'refunded', 'cancelled'] as const

const BADGE: Record<string, string> = {
  paid: 'ui-badge-good',
  pending: 'ui-badge-warn',
  partial: 'ui-badge-warn',
  failed: 'ui-badge-bad',
  refunded: 'ui-badge-mute',
  cancelled: 'ui-badge-mute',
}

export default function PaymentsPage() {
  const { context, tierLimits, locationName } = useDashboard()

  const ownerId = context.ownerId
  const actorName = context.employeeName || 'Owner'
  const locationId = context.locationId

  const noPermission = !context.permissions.payments
  const hasAccess = !!tierLimits?.paymentsModule
  const tierName = tierLimits?.name || 'Free'

  const [records, setRecords] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)

  const [customerName, setCustomerName] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('paid')
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
    if (noPermission || !hasAccess) {
      setLoading(false)
      return
    }

    let recordsQuery = supabase
      .from('payment_records')
      .select('id, customer_name, amount, currency, status, method, reference, note, created_at')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    if (locationId) {
      recordsQuery = recordsQuery.eq('location_id', locationId)
    }

    const { data } = await recordsQuery
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
      location_id: locationId,
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
      <div className="ui-wrap">
        <p className="ui-sub">Loading...</p>
      </div>
    )
  }

  if (noPermission) {
    return (
      <div className="ui-wrap">
        <p className="ui-sub">You don&rsquo;t have permission to view payments.</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="ui-wrap">
        <h1 className="ui-title">Payments</h1>
        <div className="ui-upgrade">
          <h2>Payment tracking is not included in your plan</h2>
          <p>You&rsquo;re currently on the {tierName} plan. Upgrade to track money coming into your business.</p>
          <Link href="/dashboard/billing" className="ui-btn">View plans</Link>
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

  return (
    <div className="ui-wrap">
      <h1 className="ui-title">Payments</h1>

      {locationName && (
        <div className="ui-banner">Showing payments for {locationName} only</div>
      )}

      <div className="ui-stats">
        <div className="ui-stat ui-stat-good">
          <div className="ui-stat-label">Money received</div>
          <div className="ui-stat-value">₦{moneyReceived.toLocaleString()}</div>
        </div>
        <div className="ui-stat ui-stat-warn">
          <div className="ui-stat-label">Pending</div>
          <div className="ui-stat-value">₦{pending.toLocaleString()}</div>
        </div>
        <div className="ui-stat">
          <div className="ui-stat-label">Transactions</div>
          <div className="ui-stat-value">{records.length}</div>
        </div>
        <div className="ui-stat">
          <div className="ui-stat-label">This month</div>
          <div className="ui-stat-value">₦{thisMonth.toLocaleString()}</div>
        </div>
      </div>

      <div className="ui-stack">
        <Link href="/dashboard/payments/requests" className="ui-btn ui-btn-ghost ui-block">
          Payment requests
        </Link>
        <button onClick={() => setShowForm(!showForm)} className="ui-btn ui-block">
          {showForm ? 'Cancel' : '+ Record a payment'}
        </button>
      </div>

      {showForm && (
        <div className="ui-card" style={{ marginBottom: '20px' }}>
          <input className="ui-input tight" placeholder="Customer name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
          <input className="ui-input tight" placeholder="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} />

          <div className="ui-pills">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={'ui-pill' + (status === s ? ' is-on' : '')}
              >{s}</button>
            ))}
          </div>

          <input className="ui-input tight" placeholder="Method (cash, transfer, POS...)" value={method} onChange={e => setMethod(e.target.value)} />
          <input className="ui-input tight" placeholder="Reference (optional)" value={reference} onChange={e => setReference(e.target.value)} />
          <input className="ui-input" placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />

          {error && (
            <div className="ui-error"><p>{error}</p></div>
          )}

          <button onClick={handleAdd} disabled={saving} className="ui-btn ui-block">
            {saving ? 'Saving...' : 'Save record'}
          </button>
        </div>
      )}

      <div className="ui-section-label">Recent transactions</div>

      {records.length === 0 ? (
        <div className="ui-empty">No payment records yet.</div>
      ) : (
        <div className="ui-list">
          {records.map(r => (
            <div key={r.id} className="ui-card">
              <div className="ui-between">
                <div style={{ minWidth: 0 }}>
                  <div className="ui-name">{r.customer_name}</div>
                  <div className="ui-meta">
                    {new Date(r.created_at).toLocaleDateString()}{r.method ? ' · ' + r.method : ''}
                  </div>
                  {r.reference && <div className="ui-meta">Ref: {r.reference}</div>}
                  {r.note && <div className="ui-meta">{r.note}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="ui-name">{r.currency} {Number(r.amount).toLocaleString()}</div>
                  <span className={'ui-badge ' + (BADGE[r.status] || 'ui-badge-mute')}>{r.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
