'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { getBusinessTier } from '../../../../lib/tiers'
import { getActingContext, logActivity } from '../../../../lib/permissions'

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
  const [noPermission, setNoPermission] = useState(false)
  const [hasTags, setHasTags] = useState(false)
  const [tierName, setTierName] = useState('Free')
  const [ownerId, setOwnerId] = useState('')
  const [actorName, setActorName] = useState('')
  const [locationId, setLocationId] = useState<string | null>(null)

  useEffect(() => {
    checkAccess()
  }, [])

  async function checkAccess() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      window.location.href = '/auth'
      return
    }

    const context = await getActingContext(userData.user.id)
    if (!context) {
      window.location.href = '/onboarding'
      return
    }

    if (!context.permissions.customers) {
      setNoPermission(true)
      setCheckingAccess(false)
      return
    }

    setOwnerId(context.ownerId)
    setActorName(context.employeeName || 'Owner')
    setLocationId(context.locationId)

    const { limits } = await getBusinessTier(context.ownerId)
    setTierName(limits.name)
    setHasAccess(limits.customerRecords)
    setHasTags(limits.advancedCustomers)
    setCheckingAccess(false)
  }

  function parseTags(raw: string) {
    const parts = raw.split(',')
    const trimmed = parts.map(cleanTag)
    const filtered = trimmed.filter(Boolean)
    return filtered
  }

  function cleanTag(t: string) {
    return t.trim()
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Customer name is required')
      return
    }
    setSaving(true)
    setError('')

    const { limits } = await getBusinessTier(ownerId)
    if (!limits.customerRecords) {
      setSaving(false)
      setHasAccess(false)
      setTierName(limits.name)
      return
    }

    const tags = limits.advancedCustomers
      ? parseTags(tagsInput)
      : []

    const { error: saveError } = await supabase
      .from('customers')
      .insert({
        user_id: ownerId,
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        notes: notes || null,
        tags,
        location_id: locationId,
      })

    setSaving(false)
    if (saveError) {
      setError(saveError.message)
      return
    }

    await logActivity(
      ownerId,
      actorName,
      'added',
      'customer',
      name
    )

    window.location.href = '/dashboard/customers'
  }

  if (checkingAccess) {
    return (
      <div style={loadingWrapStyle}>
        <p style={loadingTextStyle}>Loading...</p>
      </div>
    )
  }

  if (noPermission) {
    return (
      <div style={loadingWrapStyle}>
        <p style={loadingTextStyle}>
          You don&rsquo;t have permission to manage customers.
        </p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={pageStyle}>
        <div style={headerStyle}>
          <div style={headerTitleStyle}>Add Customer</div>
          <a href="/dashboard/customers" style={backLinkStyle}>
            Back
          </a>
        </div>
        <div style={upgradeWrapStyle}>
          <div style={upgradeEmojiStyle}>👥</div>
          <h2 style={upgradeTitleStyle}>
            Customer records need Essential or higher
          </h2>
          <p style={upgradeTextStyle}>
            You&rsquo;re currently on the {tierName} plan.
            Upgrade to start saving customer records.
          </p>
          <a href="/dashboard/billing" style={upgradeButtonStyle}>
            View Plans
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={headerTitleStyle}>Add Customer</div>
        <a href="/dashboard/customers" style={backLinkStyle}>
          Cancel
        </a>
      </div>

      <div style={contentStyle}>
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
              placeholder="e.g. VIP, Wholesale"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              style={inputStyle}
            />
          </>
        )}

        <label style={labelStyle}>Notes</label>
        <textarea
          placeholder="e.g. Prefers weekend delivery"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={notesInputStyle}
        />

        {error && (
          <div style={errorBoxStyle}>
            <p style={errorTextStyle}>{error}</p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={saveButtonStyle(saving)}
        >
          {saving ? 'Saving...' : 'Save Customer'}
        </button>
      </div>
    </div>
  )
}

const loadingWrapStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
}

const loadingTextStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '14px',
  fontFamily: 'Segoe UI, system-ui, sans-serif',
  textAlign: 'center',
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#fff',
  fontFamily: 'Segoe UI, system-ui, sans-serif',
}

const headerStyle: React.CSSProperties = {
  background: '#0F172A',
  padding: '14px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const headerTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 800,
  color: '#fff',
}

const backLinkStyle: React.CSSProperties = {
  color: '#94A3B8',
  fontSize: '13px',
  textDecoration: 'none',
}

const contentStyle: React.CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '24px 16px',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#475569',
  fontSize: '12px',
  fontWeight: 700,
  marginBottom: '6px',
  textTransform: 'uppercase',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#F8FAFC',
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

const notesInputStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: '80px',
  resize: 'vertical',
}

const errorBoxStyle: React.CSSProperties = {
  background: '#FEF2F2',
  border: '1px solid #FECACA',
  borderRadius: '8px',
  padding: '12px',
  marginBottom: '12px',
}

const errorTextStyle: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '12px',
  margin: 0,
}

const upgradeWrapStyle: React.CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '48px 20px',
  textAlign: 'center',
}

const upgradeEmojiStyle: React.CSSProperties = {
  fontSize: '36px',
  marginBottom: '12px',
}

const upgradeTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 800,
  color: '#0F172A',
  marginBottom: '8px',
}

const upgradeTextStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#64748B',
  lineHeight: 1.5,
  marginBottom: '24px',
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

function saveButtonStyle(saving: boolean): React.CSSProperties {
  return {
    width: '100%',
    background: '#0F172A',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 700,
    fontFamily: 'inherit',
    opacity: saving ? 0.7 : 1,
  }
}
