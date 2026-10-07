'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { useDashboard } from '../../components/DashboardShell'

type ApiKey = {
  id: string
  name: string
  key_prefix: string
  revoked: boolean
  created_at: string
  last_used_at: string | null
}

export default function ApiKeysPage() {
  const { context, tierLimits } = useDashboard()

  const isOwner = !!context.isOwner
  const hasAccess = !!tierLimits?.integrations
  const tierName = tierLimits?.name || 'Free'

  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    if (!isOwner || !hasAccess) { setLoading(false); return }

    const { data } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, revoked, created_at, last_used_at')
      .order('created_at', { ascending: false })

    setKeys(data || [])
    setLoading(false)
  }

  async function handleCreate() {
    if (!newName.trim()) { setError('Give this key a name (e.g. "My POS system")'); return }
    setCreating(true)
    setError('')

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    const res = await fetch('/api/api-keys/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: newName }),
    })
    const data = await res.json()

    setCreating(false)
    if (!res.ok) { setError(data.error || 'Could not create key'); return }

    setNewKey(data.key)
    setCopied(false)
    setNewName('')
    load()
  }

  async function handleRevoke(id: string, name: string) {
    const confirmed = confirm('Revoke "' + name + '"? Any system using this key will stop working immediately.')
    if (!confirmed) return
    await supabase.from('api_keys').update({ revoked: true }).eq('id', id)
    load()
  }

  function copyKey() {
    navigator.clipboard.writeText(newKey)
    setCopied(true)
  }

  if (loading) return <div className="ui-wrap"><p className="ui-sub">Loading...</p></div>

  if (!isOwner) {
    return <div className="ui-wrap"><p className="ui-sub">Only the business owner can manage API keys.</p></div>
  }

  if (!hasAccess) {
    return (
      <div className="ui-wrap">
        <h1 className="ui-title">Developer and API</h1>
        <div className="ui-upgrade">
          <h2>API access is not included in your plan</h2>
          <p>You&rsquo;re currently on the {tierName} plan. Upgrade to connect Cloutinet to your own systems.</p>
          <Link href="/dashboard/billing" className="ui-btn">View plans</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="ui-wrap">
      <h1 className="ui-title">Developer and API</h1>

      {newKey && (
        <div className="ui-warn">
          <div className="ui-warn-title">Copy this key now. You won&rsquo;t be able to see it again.</div>
          <div style={{ background: 'rgba(0,0,0,.35)', border: '1px solid rgba(255,255,255,.12)', borderRadius: '8px', padding: '12px', fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all', color: '#E2E8F0', margin: '10px 0' }}>
            {newKey}
          </div>
          <button onClick={copyKey} className="ui-btn ui-btn-sm">{copied ? 'Copied' : 'Copy'}</button>
        </div>
      )}

      <div className="ui-card" style={{ marginBottom: '20px' }}>
        <input
          className="ui-input tight"
          placeholder='Key name (e.g. "My POS system")'
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        {error && <p style={{ color: '#FCA5A5', fontSize: '13px', margin: '0 0 10px' }}>{error}</p>}
        <button onClick={handleCreate} disabled={creating} className="ui-btn ui-block">
          {creating ? 'Creating...' : '+ Create new key'}
        </button>
      </div>

      <p className="ui-meta" style={{ marginBottom: '16px', lineHeight: 1.5 }}>
        Use this key in the <code style={{ color: '#E2E8F0' }}>Authorization: Bearer</code> header to call <code style={{ color: '#E2E8F0' }}>/api/v1/products</code> (listing and creating products) or <code style={{ color: '#E2E8F0' }}>/api/v1/trust-score</code> (check a business&rsquo;s visibility score).
      </p>

      {keys.length === 0 ? (
        <div className="ui-empty">No API keys yet.</div>
      ) : (
        <div className="ui-list">
          {keys.map(k => (
            <div key={k.id} className="ui-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <div style={{ minWidth: 0 }}>
                <div className="ui-name" style={{ fontSize: '14px' }}>{k.name}</div>
                <div className="ui-meta" style={{ fontFamily: 'monospace' }}>{k.key_prefix}...</div>
                <div className="ui-meta">{k.last_used_at ? 'Last used ' + new Date(k.last_used_at).toLocaleDateString() : 'Never used'}</div>
              </div>
              {k.revoked ? (
                <span className="ui-badge ui-badge-bad">Revoked</span>
              ) : (
                <button onClick={() => handleRevoke(k.id, k.name)} className="ui-btn ui-btn-danger ui-btn-sm">Revoke</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
