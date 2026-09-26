'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { getBusinessTier } from '../../../lib/tiers'
import { getActingContext, logActivity } from '../../../lib/permissions'
import Link from 'next/link'
import {
  loadingWrapStyle,
  loadingTextStyle,
  noPermissionWrapStyle,
  noPermissionTextStyle,
  pageWrapStyle,
  headerBarStyle,
  headerTitleStyle,
  backLinkStyle,
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

export default function PaymentsPage() {
  const [records, setRecords] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(true)
  const [noPermission, setNoPermission] = useState(false)
  const [tierName, setTierName] = useState('Free')
  const [ownerId, setOwnerId] = useState('')
  const [actorName, setActorName] = useState('')
  const [locationId, setLocationId] = useState<string | null>(null)
  const [scopedLocationName, setScopedLocationName] = useState<string | null>(null)

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
    setLocationId(context.locationId)

    const { limits } = await getBusinessTier(context.ownerId)
    setTierName(limits.name)

    if (!limits.paymentsModule) {
      setHasAccess(false)
      setLoading(false)
      return
    }

    let recordsQuery = supabase
      .from('payment_records')
      .select('id, customer_name, amount, currency, status, method, reference, note, created_at')
      .eq('owner_id', context.ownerId)
      .order('created_at', { ascending: false })

    if (context.locationId) {
      recordsQuery = recordsQuery.eq('location_id', context.locationId)
    }

    const { data } = await recordsQuery
    setRecords(data || [])

    if (context.locationId) {
      const locFields = 'business_name, address'
      const { data: loc } = await supabase
        .from('locations')
        .select(locFields)
        .eq('id', context.locationId)
        .maybeSingle()
      const locName = loc?.business_name || loc?.address
      setScopedLocationName(locName || null)
    }

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
      <div style={loadingWrapStyle}>
        <p style={loadingTextStyle}>Loading...</p>
      </div>
    )
  }

  if (noPermission) {
    return (
      <div style={noPermissionWrapStyle}>
        <p style={noPermissionTextStyle}>You&rsquo;t have permission to view payments.</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={pageWrapStyle}>
        <div style={headerBarStyle}>
          <div style={headerTitleStyle}>Payments</div>
          <Link href="/dashboard" style={backLinkStyle}>Back</Link>
        </div>
        <div style={upgradeContentWrapStyle}>
          <div style={upgradeIconStyle}>💰</div>
          <h2 style={upgradeHeadingStyle}>
            Payment tracking needs Business or higher
          </h2>
          <p style={upgradeTextStyle}>
            You&rsquo;re currently on the {tierName} plan. Upgrade to track money coming into your business.
          </p>
          <Link href="/dashboard/billing" style={upgradeButtonStyle}>
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
    <div style={pageWrapStyle}>
      <div style={headerBarStyle}>
        <div style={headerTitleStyle}>Payments</div>
        <Link href="/dashboard" style={backLinkStyle}>Back</Link>
      </div>

      <div style={contentWrapStyle}>

        {scopedLocationName && (
          <div style={locationBannerStyle}>
            📍 Showing payments for {scopedLocationName} only
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
    </div>
  )
}
