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
      <div style={{ padding: '24px 0' }}>
        <p style={mutedStyle}>Loading...</p>
      </div>
    )
  }

  if (noPermission) {
    return (
      <div style={{ padding: '24px 0' }}>
        <p style={mutedStyle}>You don&rsquo;t have permission to message customers.</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={wrapStyle}>
        <Link href="/dashboard/customers" style={backStyle}>Back to customers</Link>
        <div style={{ padding: '36px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📢</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            Messaging is not included in your plan
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
            You&rsquo;re currently on the {tierName} plan. Upgrade to send announcements to your saved customers.
          </p>
          <Link href="/dashboard/billing" style={upgradeButtonStyle}>View Plans</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <Link href="/dashboard/customers" style={backStyle}>Back to customers</Link>
      <h1 style={titleStyle}>Message customers</h1>

      <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px', lineHeight: 1.5 }}>
        Type one message below, then tap each customer to open a pre-filled WhatsApp chat. WhatsApp doesn&rsquo;t allow true one-tap-to-all sending, so you&rsquo;ll tap through your list, but you won&rsquo;t need to retype anything.
      </p>

      <label style={labelStyle}>Your message</label>
      <textarea
        placeholder="e.g. New stock just arrived! Check out our latest products."
        value={message}
        onChange={e => setMessage(e.target.value)}
        style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', marginBottom: '24px' }}
      />

      {customers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 20px' }}>
          <p style={{ color: '#64748B', fontSize: '13px' }}>No customers with phone numbers saved yet.</p>
        </div>
      ) : (
        <>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '10px' }}>
            Send to ({customers.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '48px',
                    background: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    textDecoration: 'none',
                    color: '#0F172A',
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{c.name}</span>
                  <span style={{ fontSize: '13px', color: '#15803D', fontWeight: 700 }}>Open chat</span>
                </a>
              )
            })}
          </div>
        </>
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

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#475569',
  fontSize: '13px',
  fontWeight: 600,
  marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  padding: '12px 14px',
  color: '#0F172A',
  fontSize: '14px',
  marginBottom: '16px',
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
