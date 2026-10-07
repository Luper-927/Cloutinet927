'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../../lib/supabase'
import { useDashboard } from '../../../components/DashboardShell'

type Customer = {
  id: string
  name: string
  phone: string | null
}

function toWhatsAppNumber(phone: string) {
  let clean = phone.replace(/\D/g, '')
  if (clean.startsWith('0')) clean = '234' + clean.slice(1)
  if (!clean.startsWith('234')) clean = '234' + clean
  return clean
}

export default function MessageCustomersPage() {
  const { context, tierLimits } = useDashboard()

  const ownerId = context.ownerId
  const locationId = context.locationId
  const noPermission = !context.permissions.customers
  const hasAccess = !!tierLimits?.marketingAutomation
  const tierName = tierLimits?.name || 'Free'

  const [customers, setCustomers] = useState<Customer[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    if (noPermission || !hasAccess) {
      setLoading(false)
      return
    }

    let query = supabase
      .from('customers')
      .select('id, name, phone')
      .eq('user_id', ownerId)
      .not('phone', 'is', null)
      .order('name', { ascending: true })

    if (locationId) {
      query = query.eq('location_id', locationId)
    }

    const { data } = await query
    setCustomers(data || [])
    setLoading(false)
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
        <p className="ui-sub">You don&rsquo;t have permission to message customers.</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="ui-wrap">
        <Link href="/dashboard/customers" className="ui-back">Back to customers</Link>
        <div className="ui-upgrade">
          <h2>Messaging is not included in your plan</h2>
          <p>
            You&rsquo;re currently on the {tierName} plan. Upgrade to send announcements to your saved customers.
          </p>
          <Link href="/dashboard/billing" className="ui-btn">View plans</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="ui-wrap">
      <Link href="/dashboard/customers" className="ui-back">Back to customers</Link>
      <h1 className="ui-title">Message customers</h1>

      <p className="ui-sub">
        Type one message below, then tap each customer to open a pre-filled WhatsApp chat. WhatsApp doesn&rsquo;t allow true one-tap-to-all sending, so you&rsquo;ll tap through your list, but you won&rsquo;t need to retype anything.
      </p>

      <label className="ui-label">Your message</label>
      <textarea
        className="ui-input"
        style={{ minHeight: '110px', marginBottom: '24px' }}
        placeholder="e.g. New stock just arrived! Check out our latest products."
        value={message}
        onChange={e => setMessage(e.target.value)}
      />

      {customers.length === 0 ? (
        <div className="ui-empty">No customers with phone numbers saved yet.</div>
      ) : (
        <>
          <div className="ui-section-label" style={{ marginTop: 0 }}>Send to ({customers.length})</div>
          <div className="ui-list">
            {customers.map(c => {
              const waNumber = toWhatsAppNumber(c.phone!)
              const link = message.trim()
                ? `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
                : `https://wa.me/${waNumber}`
              return (
                <a
                  key={c.id}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ui-linkrow"
                >
                  <span>{c.name}</span>
                  <span className="go">Open chat</span>
                </a>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
