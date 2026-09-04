'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { getBusinessTier } from '../../../lib/tiers'
import { getActingContext } from '../../../lib/permissions'
import Link from 'next/link'

type ApiKey = {
  id: string
  name: string
  key_prefix: string
  revoked: boolean
  created_at: string
  last_used_at: string | null
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [hasAccess, setHasAccess] = useState(true)
  const [tierName, setTierName] = useState('Free')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

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

    const { limits } = await getBusinessTier(context.ownerId)
    setTierName(limits.name)

    if (!limits.integrations) {
      setHasAccess(false)
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
    setNewName('')
    load()
  }

  async function handleRevoke(id: string, name: string) {
    const confirmed = confirm('Revoke "' + name + '"? Any system using this key will stop working immediately.')
    if (!confirmed) return
    await supabase.from('api_keys').update({ revoked: true }).eq('id', id)
    load()
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
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif', textAlign: 'center' as const }}>Only the business owner can manage API keys.</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
        <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>API Access</div>
          <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</Link>
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔌</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            API access needs the Advanced plan
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
            You&rsquo;re currently on the {tierName} plan. Upgrade to connect Cloutinet to your own systems.
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
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>API Access</div>
        <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</Link>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
        {newKey && (
          <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#9A3412', marginBottom: '8px' }}>
              Copy this key now — you won&rsquo;t be able to see it again.
            </p>
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all' as const, marginBottom: '10px' }}>
              {newKey}
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(newKey); alert('Copied!') }}
              style={{ background: '#0F172A', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Copy
            </button>
          </div>
        )}

        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <input
            placeholder='Key name (e.g. "My POS system")'
            value={newName}
            onChange={e => setNewName(e.target.value)}
            style={{
              width: '100%', background: '#fff', border: '1px solid #E2E8F0',
              borderRadius: '8px', padding: '10px 12px', fontSize: '13px',
              marginBottom: '10px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const
            }}
          />
          {error && <p style={{ color: '#dc2626', fontSize: '12px', marginBottom: '10px' }}>{error}</p>}
          <button
            onClick={handleCreate}
            disabled={creating}
            style={{
              width: '100%', background: '#0F172A', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '10px', cursor: 'pointer',
              fontSize: '13px', fontWeight: 700, fontFamily: 'inherit', opacity: creating ? 0.7 : 1
            }}
          >
            {creating ? 'Creating...' : '+ Create New Key'}
          </button>
        </div>

        <p style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '16px' }}>
          Use this key in the <code>X-API-Key</code> header to call <code>/api/v1/products</code>. Currently supports listing and creating products only.
        </p>

        {keys.length === 0 ? (
          <p style={{ color: '#64748B', fontSize: '13px', textAlign: 'center' as const, padding: '20px' }}>No API keys yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {keys.map(k => (
              <div key={k.id} style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>{k.name}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>{k.key_prefix}...</div>
                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                    {k.last_used_at ? 'Last used ' + new Date(k.last_used_at).toLocaleDateString() : 'Never used'}
                  </div>
                </div>
                {k.revoked ? (
                  <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '999px', background: '#FEF2F2', color: '#dc2626', fontWeight: 700 }}>Revoked</span>
                ) : (
                  <button
                    onClick={() => handleRevoke(k.id, k.name)}
                    style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px', background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
