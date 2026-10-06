'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../../lib/supabase'
import { PermissionKey } from '../../../../lib/permissions'
import { useDashboard } from '../../../components/DashboardShell'

type Employee = {
  id: string
  owner_id: string
  name: string | null
  email: string
  role: string
  status: string
  permissions: Record<string, boolean>
  location_id: string | null
}

type LocationOption = { id: string; business_name: string | null; address: string }

const PERMISSION_LABELS: Record<PermissionKey, string> = {
  products: 'Products: add, edit, publish or hide products',
  customers: 'Customers: view and manage customer records',
  orders: 'Orders: view and manage orders',
  analytics: 'Analytics: view visibility score and traffic stats',
  marketing: 'Marketing: create and manage campaigns',
  payments: 'Payments: record and view payment transactions',
  documents: 'Documents: upload and manage business documents',
  employees: 'Employees: invite, edit, and remove other employees',
}

const PERMISSION_ORDER: PermissionKey[] = [
  'products', 'customers', 'orders', 'analytics', 'marketing', 'payments', 'documents', 'employees',
]

export default function EditEmployeePage() {
  const router = useRouter()
  const params = useParams()
  const employeeId = params?.id as string
  const { context } = useDashboard()

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [role, setRole] = useState<'manager' | 'staff'>('staff')
  const [permissions, setPermissions] = useState<Record<string, boolean>>({})
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [locationId, setLocationId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Only the business owner can edit permissions
    if (!context.isOwner) {
      router.replace('/dashboard')
      return
    }
    load()
  }, [employeeId])

  async function load() {
    const { data, error: fetchError } = await supabase
      .from('employees')
      .select('id, owner_id, name, email, role, status, permissions, location_id')
      .eq('id', employeeId)
      .eq('owner_id', context.ownerId)
      .maybeSingle()

    if (fetchError || !data) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setEmployee(data)
    setRole(data.role === 'manager' ? 'manager' : 'staff')
    setPermissions(data.permissions || {})
    setLocationId(data.location_id || '')

    const { data: locs } = await supabase
      .from('locations')
      .select('id, business_name, address')
      .eq('owner_id', context.ownerId)
      .order('is_primary', { ascending: false })
    setLocations(locs || [])

    setLoading(false)
  }

  function togglePermission(key: PermissionKey) {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }

  async function handleSave() {
    if (!employee) return
    setSaving(true)
    setError('')
    setSaved(false)

    const { error: saveError } = await supabase
      .from('employees')
      .update({ role, permissions, location_id: locationId || null })
      .eq('id', employee.id)

    setSaving(false)
    if (saveError) { setError(saveError.message); return }
    setSaved(true)
  }

  if (!context.isOwner || loading) {
    return (
      <div style={{ padding: '24px 0' }}>
        <p style={mutedStyle}>Loading...</p>
      </div>
    )
  }

  if (notFound || !employee) {
    return (
      <div style={wrapStyle}>
        <Link href="/dashboard/employees" style={backStyle}>Back to employees</Link>
        <p style={mutedStyle}>Employee not found.</p>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <Link href="/dashboard/employees" style={backStyle}>Back to employees</Link>
      <h1 style={titleStyle}>Edit permissions</h1>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontWeight: 700, fontSize: '16px', color: '#0F172A' }}>{employee.name || employee.email}</div>
        <div style={{ fontSize: '13px', color: '#64748B', overflowWrap: 'anywhere' }}>{employee.email}</div>
      </div>

      <label style={labelStyle}>Role</label>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          onClick={() => { setRole('manager'); setSaved(false) }}
          style={{ ...toggleStyle, ...(role === 'manager' ? toggleActive : {}) }}
        >
          Manager
        </button>
        <button
          onClick={() => { setRole('staff'); setSaved(false) }}
          style={{ ...toggleStyle, ...(role === 'staff' ? toggleActive : {}) }}
        >
          Staff
        </button>
      </div>

      {locations.length > 0 && (
        <>
          <label style={labelStyle}>Location</label>
          <select
            value={locationId}
            onChange={e => { setLocationId(e.target.value); setSaved(false) }}
            style={selectStyle}
          >
            <option value="">All locations</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.business_name || loc.address}
              </option>
            ))}
          </select>
        </>
      )}

      <label style={labelStyle}>Permissions</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
        {PERMISSION_ORDER.map(key => (
          <label
            key={key}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '12px',
              cursor: 'pointer',
              background: permissions[key] ? '#F1F5F9' : '#fff',
            }}
          >
            <input
              type="checkbox"
              checked={!!permissions[key]}
              onChange={() => togglePermission(key)}
              style={{ marginTop: '2px', width: '16px', height: '16px', flexShrink: 0 }}
            />
            <span style={{ fontSize: '14px', color: '#0F172A', lineHeight: 1.4 }}>{PERMISSION_LABELS[key]}</span>
          </label>
        ))}
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
          <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{error}</p>
        </div>
      )}

      {saved && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
          <p style={{ color: '#166534', fontSize: '13px', margin: 0, fontWeight: 600 }}>Saved.</p>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
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
        }}
      >
        {saving ? 'Saving...' : 'Save changes'}
      </button>
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
  marginBottom: '10px',
}

const toggleStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px',
  minHeight: '44px',
  borderRadius: '8px',
  border: '1px solid #E2E8F0',
  background: '#fff',
  color: '#64748B',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
}

const toggleActive: React.CSSProperties = {
  background: '#0F172A',
  color: '#fff',
  border: '1px solid #0F172A',
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  padding: '12px 14px',
  color: '#0F172A',
  fontSize: '14px',
  marginBottom: '24px',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  appearance: 'auto',
}
