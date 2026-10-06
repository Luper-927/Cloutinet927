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
    if (!isOwner || !hasAccess) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, revoked, created_at, last_used_at')
      .order('created_at', { ascending: false })

    setKeys(data || [])
    setLoading(false)
  }

  async function handleCreate() {
    if (!newName.trim()) {
      setError('Give this key a name (e.g. "My POS system")')
      return
    }
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

  if (loading) {
    return (
      <div style={{ padding: '24px 0' }}>
        <p style={mutedStyle}>Loading...</p>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div style={{ padding: '24px 0' }}>
        <p style={mutedStyle}>Only the business owner can manage API keys.</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={wrapStyle}>
        <h1 style={titleStyle}>Developer and API</h1>
        <div style={{ padding: '36px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔌</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            API access is not included in your plan
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
            You&rsquo;re currently on the {tierName} plan. Upgrade to connect Cloutinet to your own systems.
          </p>
          <Link href="/dashboard/billing" style={upgradeButtonStyle}>View Plans</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <h1 style={titleStyle}>Developer and API</h1>

      {newKey && (
        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#9A3412', marginBottom: '8px' }}>
            Copy this key now. You won&rsquo;t be able to see it again.
          </p>
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: '10px' }}>
            {newKey}
          </div>
          <button
            onClick={copyKey}
            style={{ background: '#0F172A', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', minHeight: '36px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
        <input
          placeholder='Key name (e.g. "My POS system")'
          value={newName}
          onChange={e => setNewName(e.target.value)}
          style={{
            width: '100%',
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '14px',
            marginBottom: '10px',
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
        {error && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '10px' }}>{error}</p>}
        <button
          onClick={handleCreate}
          disabled={creating}
          style={{
            width: '100%',
            background: '#0F172A',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px',
            minHeight: '44px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: 'inherit',
            opacity: creating ? 0.7 : 1,
          }}
        >
          {creating ? 'Creating...' : '+ Create new key'}
        </button>
      </div>

      <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px', lineHeight: 1.5 }}>
        Use this key in the <code>Authorization: Bearer</code> header to call <code>/api/v1/products</code> (listing and creating products) or <code>/api/v1/trust-score</code> (check a business&rsquo;s visibility score).
      </p>

      {keys.length === 0 ? (
        <p style={{ color: '#64748B', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No API keys yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {keys.map(k => (
            <div key={k.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>{k.name}</div>
                <div style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'monospace' }}>{k.key_prefix}...</div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {k.last_used_at ? 'Last used ' + new Date(k.last_used_at).toLocaleDateString() : 'Never used'}
                </div>
              </div>
              {k.revoked ? (
                <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '999px', background: '#FEF2F2', color: '#dc2626', fontWeight: 700, flexShrink: 0 }}>Revoked</span>
              ) : (
                <button
                  onClick={() => handleRevoke(k.id, k.name)}
                  style={{ fontSize: '12px', padding: '6px 12px', minHeight: '32px', borderRadius: '6px', background: 'transparent', color: '#DC2626', border: '1px solid #FCA5A5', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
                >
                  Revoke
                </button>
              )}
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

const mutedStyle: React.CSSProperties = { color: '#64748B', fontSize: '14px' }

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
