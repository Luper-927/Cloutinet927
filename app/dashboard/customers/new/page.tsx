'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { getBusinessTier } from '../../../../lib/tiers'

export default function NewCustomerPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [checkingAccess, setCheckingAccess] = useState(true)
  const [hasAccess, setHasAccess] = useState(true)
  const [hasTags, setHasTags] = useState(false)
  const [tierName, setTierName] = useState('Free')

  useEffect(() => {
    checkAccess()
  }, [])

  async function checkAccess() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const { limits } = await getBusinessTier(userData.user.id)
    setTierName(limits.name)
    setHasAccess(limits.customerRecords)
    setHasTags(limits.advancedCustomers)
    setCheckingAccess(false)
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Customer name is required')
      return
    }
    setSaving(true)
    setError('')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const { limits } = await getBusinessTier(userData.user.id)
    if (!limits.customerRecords) {
      setSaving(false)
      setHasAccess(false)
      setTierName(limits.name)
      return
    }

    // Only save tags if this business's tier actually has advancedCustomers —
    // re-checked here too, not just trusted from what rendered on screen.
    const tags = limits.advancedCustomers
      ? tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      : []

    const { error: saveError } = await supabase.from('customers').insert({
      user_id: userData.user.id,
      name,
      phone: phone || null,
      email: email || null,
      address: address || null,
      notes: notes || null,
      tags,
    })

    setSaving(false)
    if (saveError) { setError(saveError.message); return }

    window.location.href = '/dashboard/customers'
  }

  if (checkingAccess) {
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
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Add Customer</div>
          <a href="/dashboard/customers" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</a>
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>👥</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            Customer records need Essential or higher
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
            You&rsquo;re currently on the {tierName} plan. Upgrade to start saving customer records.
          </p>
          <a href="/dashboard/billing" style={{
            display: 'inline-block', background: '#0F172A', color: '#fff',
            borderRadius: '8px', padding: '12px 24px', fontSize: '14px',
            fontWeight: 700, textDecoration: 'none'
          }}>
            View Plans
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Add Customer</div>
        <a href="/dashboard/customers" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Cancel</a>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
        <label style={labelStyle}>Customer Name *</label>
        <input
          placeholder="e.g. Chidi Okafor"
          value={name}
          onChange={e => setName(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Phone / WhatsApp</label>
        <input
          placeholder="e.g. 08012345678"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Email</label>
        <input
          placeholder="customer@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Address</label>
        <input
          placeholder="Delivery address (optional)"
          value={address}
          onChange={e => setAddress(e.target.value)}
          style={inputStyle}
        />

        {hasTags && (
          <>
            <label style={labelStyle}>Tags</label>
            <input
              placeholder="e.g. VIP, Wholesale (separate with commas)"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              style={inputStyle}
            />
          </>
        )}

        <label style={labelStyle}>Notes</label>
        <textarea
          placeholder="e.g. Prefers weekend delivery, buys in bulk..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' as const }}
        />

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
            <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', background: '#0F172A', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '14px', cursor: 'pointer',
            fontSize: '15px', fontWeight: 700, fontFamily: 'inherit',
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? 'Saving...' : 'Save Customer'}
        </button>
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
