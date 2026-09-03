'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { getActingContext } from '../../../lib/permissions'
import Link from 'next/link'

type LogEntry = {
  id: string
  actor_name: string
  action: string
  object_type: string
  object_label: string | null
  created_at: string
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const context = await getActingContext(userData.user.id)
    if (!context) { window.location.href = '/onboarding'; return }

    if (!context.isOwner) {
      setLoading(false)
      return
    }
    setIsOwner(true)

    const { data } = await supabase
      .from('activity_log')
      .select('id, actor_name, action, object_type, object_label, created_at')
      .eq('owner_id', context.ownerId)
      .order('created_at', { ascending: false })
      .limit(100)

    setLogs(data || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Loading...</p>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif', textAlign: 'center' as const }}>Only the business owner can view the activity log.</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Activity Log</div>
        <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</Link>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
        {logs.length === 0 ? (
          <p style={{ color: '#64748B', fontSize: '13px', textAlign: 'center' as const, padding: '30px' }}>No activity recorded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {logs.map(log => (
              <div key={log.id} style={{ borderLeft: '2px solid #E2E8F0', paddingLeft: '12px' }}>
                <div style={{ fontSize: '13px', color: '#0F172A' }}>
                  <strong>{log.actor_name}</strong> {log.action} {log.object_type}
                  {log.object_label ? ': ' + log.object_label : ''}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
