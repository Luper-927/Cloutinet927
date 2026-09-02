'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { getBusinessTier } from '../../../lib/tiers'
import Link from 'next/link'

type Customer = {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  created_at: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(true)
  const [tierName, setTierName] = useState('Free')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const { limits } = await getBusinessTier(userData.user.id)
    setTierName(limits.name)

    if (!limits.customerRecords) {
      setHasAccess(false)
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('customers')
      .select('id, name, phone, email, address, notes, created_at')
      .order('created_at', { ascending: false })

    setCustomers(data || [])
    setLoading(false)
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
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Customers</div>
          <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</Link>
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>👥</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            Customer records need Essential or higher
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
            You&rsquo;re currently on the {tierName} plan. Upgrade to save customer names, contacts, and notes so you never lose track of who you&rsquo;ve sold to.
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
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Customers</div>
        <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</Link>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
        <Link href="/dashboard/customers/new" style={{
          display: 'block', width: '100%', textAlign: 'center', background: '#0F172A', color: '#fff',
          borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: 700,
          textDecoration: 'none', marginBottom: '20px', boxSizing: 'border-box' as const
        }}>
          + Add Customer
        </Link>

        {customers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>👥</div>
            <p style={{ color: '#64748B', fontSize: '14px' }}>No customers yet. Add your first one above.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {customers.map(c => (
              <div key={c.id} style={{
                border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px'
              }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A', marginBottom: '4px' }}>{c.name}</div>
                {c.phone && <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '2px' }}>📞 {c.phone}</div>}
                {c.email && <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '2px' }}>✉️ {c.email}</div>}
                {c.address && <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '2px' }}>📍 {c.address}</div>}
                {c.notes && <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '6px', fontStyle: 'italic' as const }}>{c.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
