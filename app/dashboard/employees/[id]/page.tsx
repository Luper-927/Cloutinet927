'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import { getActingContext, PermissionKey } from '../../../../lib/permissions'
import Link from 'next/link'

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
  products: 'Products — add, edit, publish/hide products',
  customers: 'Customers — view and manage customer records',
  orders: 'Orders — view and manage orders',
  analytics: 'Analytics — view visibility score and traffic stats',
  marketing: 'Marketing — create and manage campaigns',
  payments: 'Payments — record and view payment transactions',
  documents: 'Documents — upload and manage business documents',
  employees: 'Employees — invite, edit, and remove other employees',
}

const PERMISSION_ORDER: PermissionKey[] = [
  'products', 'customers', 'orders', 'analytics', 'marketing', 'payments', 'documents', 'employees',
]

export default function EditEmployeePage() {
  const params = useParams()
  const employeeId = params?.id as string

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

  useEffect(() => { load() }, [employeeId])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const ctx = await getActingContext(userData.user.id)
    if (!ctx || !ctx.isOwner) { window.location.href = '/dashboard'; return }

    const { data, error: fetchError } = await supabase
      .from('employees')
      .select('id, owner_id, name, email, role, status, permissions, location_id')
      .eq('id', employeeId)
      .eq('owner_id', ctx.ownerId)
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
      .eq('owner_id', ctx.ownerId)
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Loading...</p>
      </div>
    )
  }

  if (notFound || !employee) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif', textAlign: 'center' as const }}>Employee not found.</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Edit Permissions</div>
        <Link href="/dashboard/employees" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</Link>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#0F172A' }}>{employee.name || employee.email}</div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>{employee.email}</div>
        </div>

        <label style={labelStyle}>Role</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button
            onClick={() => setRole('manager')}
            style={{ ...toggleStyle, ...(role === 'manager' ? toggleActive : {}) }}
          >
            Manager
          </button>
          <button
            onClick={() => setRole('staff')}
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
              style={{ ...selectStyle }}
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
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px',
                cursor: 'pointer', background: permissions[key] ? '#F8FAFC' : '#fff'
              }}
            >
              <input
                type="checkbox"
                checked={!!permissions[key]}
                onChange={() => togglePermission(key)}
                style={{ marginTop: '2px', width: '16px', height: '16px', flexShrink: 0 }}
              />
              <span style={{ fontSize: '13px', color: '#0F172A', lineHeight: 1.4 }}>{PERMISSION_LABELS[key]}</span>
            </label>
          ))}
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
            <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>{error}</p>
          </div>
        )}

        {saved && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
            <p style={{ color: '#166534', fontSize: '12px', margin: 0, fontWeight: 600 }}>Saved.</p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', background: '#0F172A', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '14px', cursor: 'pointer',
            fontSize: '15px', fontWeight: 700, fontFamily: 'inherit', opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#475569', fontSize: '12px',
  fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase'
}

const toggleStyle: React.CSSProperties = {
  flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0',
  background: '#fff', color: '#64748B', fontSize: '13px', fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit'
}

const toggleActive: React.CSSProperties = {
  background: '#0F172A', color: '#fff', border: '1px solid #0F172A'
}

const selectStyle: React.CSSProperties = {
  width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0',
  borderRadius: '8px', padding: '12px 14px', color: '#0F172A',
  fontSize: '14px', marginBottom: '24px', outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box', appearance: 'auto' as const
}
