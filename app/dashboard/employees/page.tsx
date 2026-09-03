'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { getBusinessTier } from '../../../lib/tiers'
import Link from 'next/link'

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
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(true)
  const [tierName, setTierName] = useState('Free')
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const { limits } = await getBusinessTier(userData.user.id)
    setTierName(limits.name)

    if (!limits.employees) {
      setHasAccess(false)
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('employees')
      .select('id, name, email, role, status, permissions, invited_at, joined_at')
      .eq('owner_id', userData.user.id)
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
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Loading...</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
        <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Employees</div>
          <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</Link>
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🧑‍💼</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            Team management needs Business or higher
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
            You&rsquo;re currently on the {tierName} plan. Upgrade to invite staff and managers to help run your business.
          </p>
          <Link href="/dashboard/billing" style={{
            display: 'inline-block', background: '#0F172A', color: '#fff',
            borderRadius: '8px', padding: '12px 24px', fontSize: '14px',
            fontWeight: 700, textDecoration: 'none'
          }}>
            View Plans
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Employees</div>
        <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</Link>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
        <Link href="/dashboard/employees/invite" style={{
          display: 'block', width: '100%', textAlign: 'center', background: '#0F172A', color: '#fff',
          borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: 700,
          textDecoration: 'none', marginBottom: '20px', boxSizing: 'border-box' as const
        }}>
          + Invite Employee
        </Link>

        {employees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🧑‍💼</div>
            <p style={{ color: '#64748B', fontSize: '14px' }}>No employees yet. Invite your first one above.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {employees.map(e => (
              <div key={e.id} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>{e.name || e.email}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{e.email}</div>
                  </div>
                  <span style={{
                    fontSize: '10px', padding: '3px 10px', borderRadius: '999px', fontWeight: 700,
                    background: e.status === 'active' ? '#F0FDF4' : e.status === 'invited' ? '#FFF7ED' : '#FEF2F2',
                    color: e.status === 'active' ? '#166534' : e.status === 'invited' ? '#9A3412' : '#dc2626',
                  }}>
                    {e.status}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '10px', textTransform: 'capitalize' as const }}>
                  Role: {e.role}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                  <Link href={'/dashboard/employees/' + e.id} style={{
                    fontSize: '10px', padding: '4px 10px', borderRadius: '6px',
                    background: '#fff', color: '#0F172A', border: '1px solid #E2E8F0', textDecoration: 'none'
                  }}>Edit Permissions</Link>
                  {e.status !== 'invited' && (
                    <button
                      onClick={() => suspend(e.id, e.status)}
                      disabled={busyId === e.id}
                      style={{
                        fontSize: '10px', padding: '4px 10px', borderRadius: '6px',
                        background: '#fff', color: '#64748B', border: '1px solid #E2E8F0',
                        cursor: 'pointer', fontFamily: 'inherit'
                      }}
                    >
                      {e.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                    </button>
                  )}
                  <button
                    onClick={() => remove(e.id, e.name || e.email)}
                    disabled={busyId === e.id}
                    style={{
                      fontSize: '10px', padding: '4px 10px', borderRadius: '6px',
                      background: 'transparent', color: '#ff4444', border: '1px solid #ff4444',
                      cursor: 'pointer', fontFamily: 'inherit'
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
