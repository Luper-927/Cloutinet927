'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { getBusinessTier } from '../../../../lib/tiers'
import Link from 'next/link'

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
  const [customers, setCustomers] = useState<Customer[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(true)
  const [tierName, setTierName] = useState('Free')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const { limits } = await getBusinessTier(userData.user.id)
    setTierName(limits.name)

    if (!limits.marketingAutomation) {
      setHasAccess(false)
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('customers')
      .select('id, name, phone')
      .not('phone', 'is', null)
      .order('name', { ascending: true })

    setCustomers(data || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Loading...</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
        <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Message Customers</div>
          <Link href="/dashboard/customers" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</Link>
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📢</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            Messaging needs Growth or higher
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
            You&rsquo;re currently on the {tierName} plan. Upgrade to send announcements to all your saved customers.
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

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Message Customers</div>
        <Link href="/dashboard/customers" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</Link>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px', lineHeight: 1.5 }}>
          Type one message below, then tap each customer to open a pre-filled WhatsApp chat. WhatsApp doesn&rsquo;t allow true one-tap-to-all sending, so you&rsquo;ll tap through your list — but you won&rsquo;t need to retype anything.
        </p>

        <label style={labelStyle}>Your Message</label>
        <textarea
          placeholder="e.g. New stock just arrived! Check out our latest products."
          value={message}
          onChange={e => setMessage(e.target.value)}
          style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' as const, marginBottom: '24px' }}
        />

        {customers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px' }}>
            <p style={{ color: '#64748B', fontSize: '13px' }}>No customers with phone numbers saved yet.</p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' as const, marginBottom: '10px' }}>
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
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 14px',
                      textDecoration: 'none', color: '#0F172A'
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{c.name}</span>
                    <span style={{ fontSize: '12px', color: '#00aa55', fontWeight: 700 }}>Open Chat →</span>
                  </a>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#475569', fontSize: '12px',
  fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase'
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0',
  borderRadius: '8px', padding: '12px 14px', color: '#0F172A',
  fontSize: '14px', marginBottom: '16px', outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box'
}
