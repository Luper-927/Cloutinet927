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

  useEffect(() => { load() }, [])

  async function load() {
    if (!context.isOwner) { setLoading(false); return }

    const { data } = await supabase
      .from('activity_log')
      .select('id, actor_name, action, object_type, object_label, created_at')
      .eq('owner_id', context.ownerId)
      .order('created_at', { ascending: false })
      .limit(100)

    setLogs(data || [])
    setLoading(false)
  }

  if (loading) return <div className="ui-wrap"><p className="ui-sub">Loading...</p></div>

  if (!context.isOwner) {
    return <div className="ui-wrap"><p className="ui-sub">Only the business owner can view the activity log.</p></div>
  }

  return (
    <div className="ui-wrap">
      <h1 className="ui-title">Activity</h1>

      {logs.length === 0 ? (
        <div className="ui-empty">No activity recorded yet.</div>
      ) : (
        <div className="ui-list" style={{ gap: '14px' }}>
          {logs.map(log => (
            <div key={log.id} style={{ borderLeft: '2px solid rgba(96,165,250,.5)', paddingLeft: '12px' }}>
              <div style={{ fontSize: '14px', color: '#E2E8F0', lineHeight: 1.45 }}>
                <strong style={{ color: '#fff' }}>{log.actor_name}</strong> {log.action} {log.object_type}
                {log.object_label ? ': ' + log.object_label : ''}
              </div>
              <div className="ui-meta">{new Date(log.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
