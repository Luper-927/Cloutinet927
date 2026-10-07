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
  const [copiedId, setCopiedId] = useState<string | null>(null)

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

  function copyLink(id: string, token: string) {
    const link = window.location.origin + '/pay/' + token
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
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
        <p className="ui-sub">You don&rsquo;t have permission to create payment requests.</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="ui-wrap">
        <Link href="/dashboard/payments" className="ui-back">Back to payments</Link>
        <div className="ui-upgrade">
          <h2>Payment requests are not included in your plan</h2>
          <p>You&rsquo;re currently on the {tierName} plan. Upgrade to send payment requests to your customers.</p>
          <Link href="/dashboard/billing" className="ui-btn">View plans</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="ui-wrap">
      <Link href="/dashboard/payments" className="ui-back">Back to payments</Link>
      <h1 className="ui-title">Payment requests</h1>

      <button onClick={() => setShowForm(!showForm)} className="ui-btn ui-block" style={{ marginBottom: '16px' }}>
        {showForm ? 'Cancel' : '+ Create payment request'}
      </button>

      {showForm && (
        <div className="ui-card" style={{ marginBottom: '20px' }}>
          <input className="ui-input tight" placeholder="Customer name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
          <input className="ui-input tight" placeholder="Amount (NGN)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
          <input className="ui-input tight" placeholder="Description (e.g. Office chairs x2)" value={description} onChange={e => setDescription(e.target.value)} />
          <label className="ui-label">Due date (optional)</label>
          <input className="ui-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />

          {error && (
            <div className="ui-error"><p>{error}</p></div>
          )}

          <button onClick={handleCreate} disabled={saving} className="ui-btn ui-block">
            {saving ? 'Creating...' : 'Create request'}
          </button>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="ui-empty">No payment requests yet.</div>
      ) : (
        <div className="ui-list">
          {requests.map(r => (
            <div key={r.id} className="ui-card">
              <div className="ui-between">
                <div className="ui-name">{r.customer_name}</div>
                <div className="ui-name" style={{ flexShrink: 0 }}>{r.currency} {Number(r.amount).toLocaleString()}</div>
              </div>
              {r.description && <div className="ui-note">{r.description}</div>}
              {r.due_date && <div className="ui-meta">Due {new Date(r.due_date).toLocaleDateString()}</div>}
              <div className="ui-contacted">
                <span className={'ui-badge ' + (r.status === 'paid' ? 'ui-badge-good' : 'ui-badge-warn')}>{r.status}</span>
                <button onClick={() => copyLink(r.id, r.public_token)} className="ui-btn ui-btn-ghost ui-btn-sm">
                  {copiedId === r.id ? 'Copied' : 'Copy link'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
