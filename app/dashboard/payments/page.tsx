'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { logActivity } from '../../../lib/permissions'
import Link from 'next/link'
import { useDashboard } from '../../components/DashboardShell'
import {
  loadingTextStyle,
  noPermissionTextStyle,
  upgradeContentWrapStyle,
  upgradeIconStyle,
  upgradeHeadingStyle,
  upgradeTextStyle,
  upgradeButtonStyle,
  contentWrapStyle,
  locationBannerStyle,
  statsGridStyle,
  statCardGreenStyle,
  statLabelGreenStyle,
  statValueGreenStyle,
  statCardOrangeStyle,
  statLabelOrangeStyle,
  statValueOrangeStyle,
  statCardNeutralStyle,
  statLabelNeutralStyle,
  statValueNeutralStyle,
  toggleFormButtonStyle,
  formBoxStyle,
  inputStyle,
  statusRowStyle,
  statusButtonStyle,
  errorBoxStyle,
  errorTextStyle,
  saveButtonStyle,
  sectionLabelStyle,
  emptyTextStyle,
  recordsListStyle,
  recordCardStyle,
  recordNameStyle,
  recordMetaStyle,
  recordMetaNoteStyle,
  recordAmountWrapStyle,
  recordAmountStyle,
  statusBadgeStyle,
} from './styles'

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

const pageTitleStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 800,
  color: '#0F172A',
  margin: '0 0 14px',
  letterSpacing: '-0.01em',
}

const requestsLinkStyle: React.CSSProperties = {
  display: 'block',
  textAlign: 'center',
  padding: '12px',
  marginBottom: '12px',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  background: '#fff',
  color: '#0F172A',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
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
      <div style={{ padding: '24px 0' }}>
        <p style={loadingTextStyle}>Loading...</p>
      </div>
    )
  }

  if (noPermission) {
    return (
      <div style={{ padding: '24px 0' }}>
        <p style={noPermissionTextStyle}>You don&rsquo;t have permission to view payments.</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={upgradeContentWrapStyle}>
        <h1 style={pageTitleStyle}>Payments</h1>
        <div style={upgradeIconStyle}>💰</div>
        <h2 style={upgradeHeadingStyle}>
          Payment tracking is not included in your plan
        </h2>
        <p style={upgradeTextStyle}>
          You&rsquo;re currently on the {tierName} plan. Upgrade to track money coming into your business.
        </p>
        <Link href="/dashboard/billing" style={upgradeButtonStyle}>
          View Plans
        </Link>
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
    <div style={contentWrapStyle}>
      <h1 style={pageTitleStyle}>Payments</h1>

      {locationName && (
        <div style={locationBannerStyle}>
          📍 Showing payments for {locationName} only
        </div>
      )}

      <div style={statsGridStyle}>
        <div style={statCardGreenStyle}>
          <div style={statLabelGreenStyle}>Money Received</div>
          <div style={statValueGreenStyle}>₦{moneyReceived.toLocaleString()}</div>
        </div>
        <div style={statCardOrangeStyle}>
          <div style={statLabelOrangeStyle}>Pending</div>
          <div style={statValueOrangeStyle}>₦{pending.toLocaleString()}</div>
        </div>
        <div style={statCardNeutralStyle}>
          <div style={statLabelNeutralStyle}>Transactions</div>
          <div style={statValueNeutralStyle}>{records.length}</div>
        </div>
        <div style={statCardNeutralStyle}>
          <div style={statLabelNeutralStyle}>This Month</div>
          <div style={statValueNeutralStyle}>₦{thisMonth.toLocaleString()}</div>
        </div>
      </div>

      <Link href="/dashboard/payments/requests" style={requestsLinkStyle}>
        Payment requests
      </Link>

      <button
        onClick={() => setShowForm(!showForm)}
        style={toggleFormButtonStyle}
      >
        {showForm ? 'Cancel' : '+ Record a Payment'}
      </button>

      {showForm && (
        <div style={formBoxStyle}>
          <input placeholder="Customer name" value={customerName} onChange={e => setCustomerName(e.target.value)} style={inputStyle} />
          <input placeholder="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle} />

          <div style={statusRowStyle}>
            {(['paid', 'pending', 'partial', 'failed', 'refunded', 'cancelled'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={statusButtonStyle(status === s)}
              >{s}</button>
            ))}
          </div>

          <input placeholder="Method (cash, transfer, POS...)" value={method} onChange={e => setMethod(e.target.value)} style={inputStyle} />
          <input placeholder="Reference (optional)" value={reference} onChange={e => setReference(e.target.value)} style={inputStyle} />
          <input placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} style={{ ...inputStyle, marginBottom: '12px' }} />

          {error && (
            <div style={errorBoxStyle}>
              <p style={errorTextStyle}>{error}</p>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={saving}
            style={saveButtonStyle(saving)}
          >
            {saving ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      )}

      <div style={sectionLabelStyle}>
        Recent Transactions
      </div>

      {records.length === 0 ? (
        <p style={emptyTextStyle}>No payment records yet.</p>
      ) : (
        <div style={recordsListStyle}>
          {records.map(r => (
            <div key={r.id} style={recordCardStyle}>
              <div>
                <div style={recordNameStyle}>{r.customer_name}</div>
                <div style={recordMetaStyle}>{new Date(r.created_at).toLocaleDateString()} {r.method ? '· ' + r.method : ''}</div>
                {r.reference && <div style={recordMetaStyle}>Ref: {r.reference}</div>}
                {r.note && <div style={recordMetaNoteStyle}>{r.note}</div>}
              </div>
              <div style={recordAmountWrapStyle}>
                <div style={recordAmountStyle}>{r.currency} {Number(r.amount).toLocaleString()}</div>
                <span style={statusBadgeStyle(statusColors[r.status]?.bg, statusColors[r.status]?.color)}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
