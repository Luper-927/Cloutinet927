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

  useEffect(() => { load() }, [])

  async function load() {
    if (noPermission || !hasAccess) { setLoading(false); return }

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

  if (loading) return <div className="ui-wrap"><p className="ui-sub">Loading...</p></div>

  if (noPermission) {
    return <div className="ui-wrap"><p className="ui-sub">You don&rsquo;t have permission to manage employees.</p></div>
  }

  if (!hasAccess) {
    return (
      <div className="ui-wrap">
        <h1 className="ui-title">Employees</h1>
        <div className="ui-upgrade">
          <h2>Team management is not included in your plan</h2>
          <p>You&rsquo;re currently on the {tierName} plan. Upgrade to invite staff and managers to help run your business.</p>
          <Link href="/dashboard/billing" className="ui-btn">View plans</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="ui-wrap">
      <h1 className="ui-title">Employees</h1>

      <Link href="/dashboard/employees/invite" className="ui-btn ui-block" style={{ marginBottom: '20px' }}>
        + Invite employee
      </Link>

      {employees.length === 0 ? (
        <div className="ui-empty">No employees yet. Invite your first one above.</div>
      ) : (
        <div className="ui-list">
          {employees.map(e => (
            <div key={e.id} className="ui-card">
              <div className="ui-between">
                <div style={{ minWidth: 0 }}>
                  <div className="ui-name">{e.name || e.email}</div>
                  <div className="ui-meta" style={{ overflowWrap: 'anywhere' }}>{e.email}</div>
                </div>
                <span className={'ui-badge ' + (e.status === 'active' ? 'ui-badge-good' : e.status === 'invited' ? 'ui-badge-warn' : 'ui-badge-bad')}>
                  {e.status}
                </span>
              </div>
              <div className="ui-meta" style={{ textTransform: 'capitalize', margin: '6px 0 12px' }}>Role: {e.role}</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <Link href={'/dashboard/employees/' + e.id} className="ui-btn ui-btn-ghost ui-btn-sm">Edit permissions</Link>
                {e.status !== 'invited' && (
                  <button onClick={() => suspend(e.id, e.status)} disabled={busyId === e.id} className="ui-btn ui-btn-ghost ui-btn-sm">
                    {e.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                  </button>
                )}
                <button onClick={() => remove(e.id, e.name || e.email)} disabled={busyId === e.id} className="ui-btn ui-btn-danger ui-btn-sm">
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
