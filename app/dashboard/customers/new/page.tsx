'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import { getBusinessTier } from '../../../../lib/tiers'
import { logActivity } from '../../../../lib/permissions'
import { useDashboard } from '../../../components/DashboardShell'

export default function NewCustomerPage() {
  const router = useRouter()
  const { context, tierLimits } = useDashboard()

  const ownerId = context.ownerId
  const actorName = context.employeeName || 'Owner'
  const locationId = context.locationId

  const noPermission = !context.permissions.customers
  const hasTags = !!tierLimits?.advancedCustomers
  const tierName = tierLimits?.name || 'Free'

  const [planBlocked, setPlanBlocked] = useState(!tierLimits?.customerRecords)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function parseTags(raw: string) {
    return raw
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Customer name is required')
      return
    }
    setSaving(true)
    setError('')

    // Fresh plan check at save time, in case the plan changed
    const { limits } = await getBusinessTier(ownerId)
    if (!limits.customerRecords) {
      setSaving(false)
      setPlanBlocked(true)
      return
    }

    const tags = limits.advancedCustomers ? parseTags(tagsInput) : []

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

    await logActivity(ownerId, actorName, 'added', 'customer', name)

    router.push('/dashboard/customers')
  }

  if (noPermission) {
    return (
      <div style={{ padding: '24px 0' }}>
        <p style={mutedTextStyle}>You don&rsquo;t have permission to manage customers.</p>
      </div>
    )
  }

  if (planBlocked) {
    return (
      <div style={wrapStyle}>
        <Link href="/dashboard/customers" style={backStyle}>Back to customers</Link>
        <div style={upgradeWrapStyle}>
          <div style={upgradeEmojiStyle}>👥</div>
          <h2 style={upgradeTitleStyle}>Customer records are not included in your plan</h2>
          <p style={upgradeTextStyle}>
            You&rsquo;re currently on the {tierName} plan. Upgrade to start saving customer records.
          </p>
          <Link href="/dashboard/billing" style={upgradeButtonStyle}>View Plans</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <Link href="/dashboard/customers" style={backStyle}>Back to customers</Link>
      <h1 style={titleStyle}>Add customer</h1>

      <label style={labelStyle}>Customer name *</label>
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

      <button onClick={handleSave} disabled={saving} style={saveButtonStyle(saving)}>
        {saving ? 'Saving...' : 'Save customer'}
      </button>
      <Link href="/dashboard/customers" style={cancelStyle}>Cancel</Link>
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
  margin: '0 0 18px',
  letterSpacing: '-0.01em',
}

const mutedTextStyle: React.CSSProperties = {
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
  fontSize: '13px',
  margin: 0,
}

const cancelStyle: React.CSSProperties = {
  display: 'block',
  textAlign: 'center',
  color: '#475569',
  fontSize: '14px',
  textDecoration: 'none',
  padding: '14px 0 4px',
}

const upgradeWrapStyle: React.CSSProperties = {
  padding: '36px 8px',
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
