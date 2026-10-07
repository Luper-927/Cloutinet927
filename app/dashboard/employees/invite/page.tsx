'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../../lib/supabase'
import { useDashboard } from '../../../components/DashboardShell'

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

type LocationOption = { id: string; business_name: string | null; address: string }

export default function InviteEmployeePage() {
  const { context, profile, tierLimits } = useDashboard()

  const ownerId = context.ownerId
  const noPermission = !context.permissions.employees
  const planBlocked = !tierLimits?.employees
  const tierName = tierLimits?.name || ''
  const seatLimit: number | null = tierLimits?.employeeSeatLimit ?? null

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'staff' | 'manager'>('staff')
  const [permissions, setPermissions] = useState(DEFAULT_STAFF_PERMISSIONS)
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [locationId, setLocationId] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [checkingSeats, setCheckingSeats] = useState(true)
  const [seatsUsed, setSeatsUsed] = useState(0)
  const [seatsFull, setSeatsFull] = useState(false)

  useEffect(() => {
    if (noPermission || planBlocked) { setCheckingSeats(false); return }
    loadLocations()
    checkSeats()
  }, [])

  async function loadLocations() {
    const { data } = await supabase
      .from('locations')
      .select('id, business_name, address')
      .eq('owner_id', ownerId)
      .order('is_primary', { ascending: false })
    setLocations(data || [])
  }

  async function checkSeats() {
    if (seatLimit !== null) {
      const { count } = await supabase
        .from('employees')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', ownerId)
      const used = count ?? 0
      setSeatsUsed(used)
      if (used >= seatLimit) setSeatsFull(true)
    }
    setCheckingSeats(false)
  }

  function handleRoleChange(newRole: 'staff' | 'manager') {
    setRole(newRole)
    setPermissions(newRole === 'manager' ? DEFAULT_MANAGER_PERMISSIONS : DEFAULT_STAFF_PERMISSIONS)
  }

  function togglePermission(key: string) {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleInvite() {
    if (!name.trim() || !email.trim()) { setError('Name and email are required'); return }
    setSaving(true)
    setError('')

    // Re-check right before insert, in case two invites are sent quickly.
    if (seatLimit !== null) {
      const { count } = await supabase
        .from('employees')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', ownerId)
      if ((count ?? 0) >= seatLimit) {
        setSaving(false)
        setSeatsFull(true)
        setSeatsUsed(count ?? 0)
        return
      }
    }

    const { data, error: saveError } = await supabase
      .from('employees')
      .insert({
        owner_id: ownerId,
        name,
        email: email.trim().toLowerCase(),
        role,
        permissions,
        location_id: locationId || null,
      })
      .select('invite_token')
      .single()

    if (saveError) {
      setSaving(false)
      setError(saveError.code === '23505' ? 'You\u2019ve already invited someone with this email.' : saveError.message)
      return
    }

    const link = window.location.origin + '/employee-invite/' + data.invite_token
    setInviteLink(link)

    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token

    try {
      const res = await fetch('/api/employees/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify({
          name,
          email: email.trim().toLowerCase(),
          inviteLink: link,
          businessName: profile?.business_name || 'A business',
          role,
        }),
      })
      if (res.ok) setEmailSent(true)
    } catch (e) {
      // The link is still shown below. The email is a bonus, not a blocker.
    }

    setSaving(false)
  }

  if (checkingSeats) return <div className="ui-wrap"><p className="ui-sub">Loading...</p></div>

  if (noPermission) {
    return <div className="ui-wrap"><p className="ui-sub">You don&rsquo;t have permission to invite employees.</p></div>
  }

  if (planBlocked) {
    return (
      <div className="ui-wrap">
        <Link href="/dashboard/employees" className="ui-back">Back to employees</Link>
        <div className="ui-upgrade">
          <h2>Team management is not included in your plan</h2>
          <p>You&rsquo;re currently on the {tierName} plan. Upgrade to invite staff and managers.</p>
          <Link href="/dashboard/billing" className="ui-btn">View plans</Link>
        </div>
      </div>
    )
  }

  if (seatsFull) {
    return (
      <div className="ui-wrap">
        <Link href="/dashboard/employees" className="ui-back">Back to employees</Link>
        <div className="ui-upgrade">
          <h2>You&rsquo;ve used all {seatLimit} employee seats</h2>
          <p>Your {tierName} plan includes {seatLimit} employee seat{seatLimit === 1 ? '' : 's'}. You currently have {seatsUsed}. Upgrade to add more team members.</p>
          <Link href="/dashboard/billing" className="ui-btn">View plans</Link>
        </div>
      </div>
    )
  }

  if (inviteLink) {
    return (
      <div className="ui-wrap">
        <div className="ui-upgrade">
          <h2>{emailSent ? `Email sent to ${name}` : 'Share this invite link'}</h2>
          <p>
            {emailSent
              ? `We emailed the invitation to ${email}. You can also share the link below directly, for example on WhatsApp.`
              : `We couldn\u2019t confirm the email was sent. Share this link with ${name} directly (WhatsApp, SMS, etc.) as a backup.`}
          </p>
          <div className="ui-card" style={{ fontSize: '12px', color: '#E2E8F0', wordBreak: 'break-all', textAlign: 'left', marginBottom: '20px' }}>
            {inviteLink}
          </div>
          <Link href="/dashboard/employees" className="ui-btn">Back to employees</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="ui-wrap">
      <Link href="/dashboard/employees" className="ui-back">Back to employees</Link>
      <h1 className="ui-title">Invite employee</h1>

      {seatLimit !== null && (
        <p className="ui-sub">{seatsUsed} of {seatLimit} employee seats used ({tierName} plan)</p>
      )}

      <label className="ui-label">Name *</label>
      <input className="ui-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Amaka Johnson" />

      <label className="ui-label">Email *</label>
      <input className="ui-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="employee@example.com" type="email" />

      <label className="ui-label">Role</label>
      <div className="ui-pills" style={{ marginBottom: '20px' }}>
        <button onClick={() => handleRoleChange('staff')} className={'ui-pill' + (role === 'staff' ? ' is-on' : '')}>Staff</button>
        <button onClick={() => handleRoleChange('manager')} className={'ui-pill' + (role === 'manager' ? ' is-on' : '')}>Manager</button>
      </div>

      {locations.length > 0 && (
        <>
          <label className="ui-label">Location</label>
          <select className="ui-input" value={locationId} onChange={e => setLocationId(e.target.value)}>
            <option value="">All locations</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.business_name || loc.address}</option>
            ))}
          </select>
        </>
      )}

      <label className="ui-label">Permissions</label>
      <div className="ui-card" style={{ padding: '6px', marginBottom: '20px' }}>
        {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', minHeight: '44px', fontSize: '14px', color: '#E2E8F0', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={permissions[key] || false}
              onChange={() => togglePermission(key)}
              style={{ width: '16px', height: '16px', accentColor: '#2563EB' }}
            />
            {label}
          </label>
        ))}
      </div>

      {error && <div className="ui-error"><p>{error}</p></div>}

      <button onClick={handleInvite} disabled={saving} className="ui-btn ui-block">
        {saving ? 'Sending...' : 'Send invitation'}
      </button>
    </div>
  )
}
