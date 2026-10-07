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
    if (!context.isOwner) { router.replace('/dashboard'); return }
    load()
  }, [employeeId])

  async function load() {
    const { data, error: fetchError } = await supabase
      .from('employees')
      .select('id, owner_id, name, email, role, status, permissions, location_id')
      .eq('id', employeeId)
      .eq('owner_id', context.ownerId)
      .maybeSingle()

    if (fetchError || !data) { setNotFound(true); setLoading(false); return }

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

  if (!context.isOwner || loading) return <div className="ui-wrap"><p className="ui-sub">Loading...</p></div>

  if (notFound || !employee) {
    return (
      <div className="ui-wrap">
        <Link href="/dashboard/employees" className="ui-back">Back to employees</Link>
        <p className="ui-sub">Employee not found.</p>
      </div>
    )
  }

  return (
    <div className="ui-wrap">
      <Link href="/dashboard/employees" className="ui-back">Back to employees</Link>
      <h1 className="ui-title">Edit permissions</h1>

      <div style={{ marginBottom: '20px' }}>
        <div className="ui-name" style={{ fontSize: '17px' }}>{employee.name || employee.email}</div>
        <div className="ui-meta" style={{ overflowWrap: 'anywhere' }}>{employee.email}</div>
      </div>

      <label className="ui-label">Role</label>
      <div className="ui-pills" style={{ marginBottom: '24px' }}>
        <button onClick={() => { setRole('manager'); setSaved(false) }} className={'ui-pill' + (role === 'manager' ? ' is-on' : '')}>Manager</button>
        <button onClick={() => { setRole('staff'); setSaved(false) }} className={'ui-pill' + (role === 'staff' ? ' is-on' : '')}>Staff</button>
      </div>

      {locations.length > 0 && (
        <>
          <label className="ui-label">Location</label>
          <select className="ui-input" value={locationId} onChange={e => { setLocationId(e.target.value); setSaved(false) }}>
            <option value="">All locations</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.business_name || loc.address}</option>
            ))}
          </select>
        </>
      )}

      <label className="ui-label">Permissions</label>
      <div className="ui-list" style={{ marginBottom: '24px' }}>
        {PERMISSION_ORDER.map(key => (
          <label
            key={key}
            className="ui-card"
            style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', padding: '12px', background: permissions[key] ? 'rgba(59,130,246,.12)' : undefined }}
          >
            <input
              type="checkbox"
              checked={!!permissions[key]}
              onChange={() => togglePermission(key)}
              style={{ marginTop: '2px', width: '16px', height: '16px', flexShrink: 0, accentColor: '#2563EB' }}
            />
            <span style={{ fontSize: '14px', color: '#E2E8F0', lineHeight: 1.4 }}>{PERMISSION_LABELS[key]}</span>
          </label>
        ))}
      </div>

      {error && <div className="ui-error"><p>{error}</p></div>}
      {saved && (
        <div className="ui-card" style={{ marginBottom: '16px', borderColor: 'rgba(52,211,153,.4)' }}>
          <p style={{ color: '#34D399', fontSize: '13px', margin: 0, fontWeight: 600 }}>Saved.</p>
        </div>
      )}

      <button onClick={handleSave} disabled={saving} className="ui-btn ui-block">
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </div>
  )
}
