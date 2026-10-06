'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useDashboard } from '../../components/DashboardShell'

type LogEntry = {
  id: string
  actor_name: string
  action: string
  object_type: string
  object_label: string | null
  created_at: string
}

export default function ActivityLogPage() {
  const { context } = useDashboard()

  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    if (!context.isOwner) {
      setLoading(false)
      return
    }

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
      <div style={{ padding: '24px 0' }}>
        <p style={mutedStyle}>Loading...</p>
      </div>
    )
  }

  if (!context.isOwner) {
    return (
      <div style={{ padding: '24px 0' }}>
        <p style={mutedStyle}>Only the business owner can view the activity log.</p>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <h1 style={titleStyle}>Activity</h1>

      {logs.length === 0 ? (
        <p style={{ color: '#64748B', fontSize: '13px', textAlign: 'center', padding: '30px' }}>No activity recorded yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {logs.map(log => (
            <div key={log.id} style={{ borderLeft: '2px solid #CBD5E1', paddingLeft: '12px' }}>
              <div style={{ fontSize: '14px', color: '#0F172A', lineHeight: 1.45 }}>
                <strong>{log.actor_name}</strong> {log.action} {log.object_type}
                {log.object_label ? ': ' + log.object_label : ''}
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                {new Date(log.created_at).toLocaleString()}
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
