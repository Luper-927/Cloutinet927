'use client'

import { useState } from 'react'
import { supabase } from '../../../../lib/supabase'

const PERMISSION_LABELS: Record<string, string> = {
  products: 'Products',
  customers: 'Customers',
  orders: 'Orders & Inquiries',
  analytics: 'Analytics',
  marketing: 'Marketing',
  payments: 'Payments',
  documents: 'Documents',
  employees: 'Employees',
}

const DEFAULT_STAFF_PERMISSIONS: Record<string, boolean> = {
  products: true, customers: true, orders: true, analytics: false,
  marketing: false, payments: false, documents: false, employees: false,
}

const DEFAULT_MANAGER_PERMISSIONS: Record<string, boolean> = {
  products: true, customers: true, orders: true, analytics: true,
  marketing: true, documents: true, payments: false, employees: false,
}

export default function InviteEmployeePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'staff' | 'manager'>('staff')
  const [permissions, setPermissions] = useState(DEFAULT_STAFF_PERMISSIONS)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [inviteLink, setInviteLink] = useState('')

  function handleRoleChange(newRole: 'staff' | 'manager') {
    setRole(newRole)
    setPermissions(newRole === 'manager' ? DEFAULT_MANAGER_PERMISSIONS : DEFAULT_STAFF_PERMISSIONS)
  }

  function togglePermission(key: string) {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleInvite() {
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required')
      return
    }
    setSaving(true)
    setError('')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const { data, error: saveError } = await supabase
      .from('employees')
      .insert({
        owner_id: userData.user.id,
        name,
        email: email.trim().toLowerCase(),
        role,
        permissions,
      })
      .select('invite_token')
      .single()

    setSaving(false)

    if (saveError) {
      if (saveError.code === '23505') {
        setError('You\u2019ve already invited someone with this email.')
      } else {
        setError(saveError.message)
      }
      return
    }

    // No email-sending service is wired up yet, so show the link directly —
    // the owner copies and sends it themselves (WhatsApp, SMS, etc.) for now.
    const link = window.location.origin + '/employee-invite/' + data.invite_token
    setInviteLink(link)
  }

  if (inviteLink) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
        <div style={{ background: '#0F172A', padding: '14px 20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Invite Sent</div>
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '32px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>✅</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>Share this invite link</h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px', lineHeight: 1.5 }}>
            Send this link to {name} directly — via WhatsApp, SMS, or however you normally reach them. They&rsquo;ll create or sign into their own Cloutinet account to accept.
          </p>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px', fontSize: '12px', color: '#0F172A', wordBreak: 'break-all' as const, marginBottom: '20px' }}>
            {inviteLink}
          </div>
          <a href="/dashboard/employees" style={{
            display: 'inline-block', background: '#0F172A', color: '#fff',
            borderRadius: '8px', padding: '12px 24px', fontSize: '14px',
            fontWeight: 700, textDecoration: 'none'
          }}>
            Back to Employees
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Invite Employee</div>
        <a href="/dashboard/employees" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Cancel</a>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
        <label style={labelStyle}>Name *</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Amaka Johnson" style={inputStyle} />

        <label style={labelStyle}>Email *</label>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="employee@example.com" type="email" style={inputStyle} />

        <label style={labelStyle}>Role</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            onClick={() => handleRoleChange('staff')}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
              border: '1px solid ' + (role === 'staff' ? '#0F172A' : '#E2E8F0'),
              background: role === 'staff' ? '#0F172A' : '#fff',
              color: role === 'staff' ? '#fff' : '#0F172A', cursor: 'pointer', fontFamily: 'inherit'
            }}
          >Staff</button>
          <button
            onClick={() => handleRoleChange('manager')}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
              border: '1px solid ' + (role === 'manager' ? '#0F172A' : '#E2E8F0'),
              background: role === 'manager' ? '#0F172A' : '#fff',
              color: role === 'manager' ? '#fff' : '#0F172A', cursor: 'pointer', fontFamily: 'inherit'
            }}
          >Manager</button>
        </div>

        <label style={labelStyle}>Permissions</label>
        <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
          {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
            <label key={key} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
              fontSize: '13px', color: '#0F172A', cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={permissions[key] || false}
                onChange={() => togglePermission(key)}
              />
              {label}
            </label>
          ))}
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
            <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleInvite}
          disabled={saving}
          style={{
            width: '100%', background: '#0F172A', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '14px', cursor: 'pointer',
            fontSize: '15px', fontWeight: 700, fontFamily: 'inherit',
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? 'Sending...' : 'Send Invitation'}
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
