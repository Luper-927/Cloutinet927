'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { useDashboard } from '../../components/DashboardShell'

type Employee = {
  id: string
  name: string | null
  email: string
  role: string
  status: string
  permissions: Record<string, boolean>
  invited_at: string
  joined_at: string | null
}

export default function EmployeesPage() {
  const { context, tierLimits } = useDashboard()

  const ownerId = context.ownerId
  const noPermission = !context.permissions.employees
  const hasAccess = !!tierLimits?.employees
  const tierName = tierLimits?.name || 'Free'

  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    if (noPermission || !hasAccess) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('employees')
      .select('id, name, email, role, status, permissions, invited_at, joined_at')
      .eq('owner_id', ownerId)
      .order('invited_at', { ascending: false })

    setEmployees(data || [])
    setLoading(false)
  }

  async function suspend(id: string, currentStatus: string) {
    setBusyId(id)
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended'
    await supabase.from('employees').update({ status: newStatus }).eq('id', id)
    await load()
    setBusyId(null)
  }

  async function remove(id: string, name: string) {
    const confirmed = confirm('Remove ' + (name || 'this employee') + '? They will lose access immediately.')
    if (!confirmed) return
    setBusyId(id)
    await supabase.from('employees').delete().eq('id', id)
    await load()
    setBusyId(null)
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
        <p style={mutedStyle}>You don&rsquo;t have permission to manage employees.</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={wrapStyle}>
        <h1 style={titleStyle}>Employees</h1>
        <div style={{ padding: '36px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🧑‍💼</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            Team management is not included in your plan
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
            You&rsquo;re currently on the {tierName} plan. Upgrade to invite staff and managers to help run your business.
          </p>
          <Link href="/dashboard/billing" style={upgradeButtonStyle}>View Plans</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <h1 style={titleStyle}>Employees</h1>

      <Link href="/dashboard/employees/invite" style={inviteButtonStyle}>
        + Invite employee
      </Link>

      {employees.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🧑‍💼</div>
          <p style={{ color: '#64748B', fontSize: '14px' }}>No employees yet. Invite your first one above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {employees.map(e => (
            <div key={e.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>{e.name || e.email}</div>
                  <div style={{ fontSize: '12px', color: '#64748B', overflowWrap: 'anywhere' }}>{e.email}</div>
                </div>
                <span style={{
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  flexShrink: 0,
                  background: e.status === 'active' ? '#F0FDF4' : e.status === 'invited' ? '#FFF7ED' : '#FEF2F2',
                  color: e.status === 'active' ? '#166534' : e.status === 'invited' ? '#9A3412' : '#dc2626',
                }}>
                  {e.status}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '10px', textTransform: 'capitalize' }}>
                Role: {e.role}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <Link href={'/dashboard/employees/' + e.id} style={smallButtonStyle}>Edit permissions</Link>
                {e.status !== 'invited' && (
                  <button
                    onClick={() => suspend(e.id, e.status)}
                    disabled={busyId === e.id}
                    style={{ ...smallButtonStyle, color: '#64748B', cursor: 'pointer' }}
                  >
                    {e.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                  </button>
                )}
                <button
                  onClick={() => remove(e.id, e.name || e.email)}
                  disabled={busyId === e.id}
                  style={{ ...smallButtonStyle, background: 'transparent', color: '#DC2626', border: '1px solid #FCA5A5', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const wrapStyle: React.CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  fontFamily: 'Segoe UI, system-ui, sans-serif',
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

const inviteButtonStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'center',
  background: '#0F172A',
  color: '#fff',
  borderRadius: '8px',
  padding: '14px',
  fontSize: '15px',
  fontWeight: 700,
  textDecoration: 'none',
  marginBottom: '20px',
  boxSizing: 'border-box',
}

const smallButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '32px',
  fontSize: '12px',
  padding: '4px 12px',
  borderRadius: '6px',
  background: '#fff',
  color: '#0F172A',
  border: '1px solid #E2E8F0',
  textDecoration: 'none',
  fontFamily: 'inherit',
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
