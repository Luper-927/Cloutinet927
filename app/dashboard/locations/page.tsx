'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useDashboard } from '../../components/DashboardShell'

type LocationRow = {
  id: string
  business_name: string | null
  slug: string
  address: string
  phone: string | null
  is_primary: boolean
}

export default function LocationsPage() {
  const { context } = useDashboard()

  const ownerId = context.ownerId
  const isOwner = !!context.isOwner

  const [locations, setLocations] = useState<LocationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    if (!isOwner) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('locations')
      .select('id, business_name, slug, address, phone, is_primary')
      .eq('owner_id', ownerId)
      .order('is_primary', { ascending: false })

    setLocations(data || [])
    setLoading(false)
  }

  function slugify(text: string) {
    return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  async function handleAdd() {
    if (!name.trim() || !address.trim()) {
      setError('Name and address are required')
      return
    }
    setSaving(true)
    setError('')

    const slug = slugify(name) + '-' + Date.now().toString(36)

    const { error: saveError } = await supabase.from('locations').insert({
      owner_id: ownerId,
      business_name: name.trim(),
      slug,
      address: address.trim(),
      phone: phone.trim() || null,
      is_primary: locations.length === 0,
    })

    setSaving(false)
    if (saveError) { setError(saveError.message); return }

    setName(''); setAddress(''); setPhone(''); setAdding(false)
    load()
  }

  async function setPrimary(id: string) {
    setBusyId(id)
    await supabase.from('locations').update({ is_primary: false }).eq('owner_id', ownerId)
    await supabase.from('locations').update({ is_primary: true }).eq('id', id)
    await load()
    setBusyId(null)
  }

  async function remove(id: string, label: string) {
    const confirmed = confirm('Remove ' + (label || 'this location') + '?')
    if (!confirmed) return
    setBusyId(id)
    await supabase.from('locations').delete().eq('id', id)
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

  if (!isOwner) {
    return (
      <div style={{ padding: '24px 0' }}>
        <p style={mutedStyle}>Only the business owner can manage locations.</p>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <h1 style={titleStyle}>Locations</h1>

      {!adding ? (
        <button
          onClick={() => setAdding(true)}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'center',
            background: '#0F172A',
            color: '#fff',
            borderRadius: '8px',
            padding: '14px',
            fontSize: '15px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            marginBottom: '20px',
          }}
        >
          + Add location
        </button>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <label style={labelStyle}>Location name *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Wuse Branch" style={inputStyle} />

          <label style={labelStyle}>Address *</label>
          <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, area, city" style={inputStyle} />

          <label style={labelStyle}>Phone</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Optional" style={inputStyle} />

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
              <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{error}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleAdd}
              disabled={saving}
              style={{
                flex: 1,
                background: '#0F172A',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                minHeight: '44px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'inherit',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => { setAdding(false); setError('') }}
              style={{
                flex: 1,
                background: '#fff',
                color: '#0F172A',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '12px',
                minHeight: '44px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {locations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📍</div>
          <p style={{ color: '#64748B', fontSize: '14px' }}>No locations yet. Add your first branch above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {locations.map(loc => (
            <div key={loc.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>{loc.business_name}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{loc.address}</div>
                  {loc.phone && <div style={{ fontSize: '12px', color: '#64748B' }}>{loc.phone}</div>}
                </div>
                {loc.is_primary && (
                  <span style={{
                    fontSize: '11px',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontWeight: 700,
                    background: '#F0FDF4',
                    color: '#166534',
                    flexShrink: 0,
                  }}>
                    Primary
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                {!loc.is_primary && (
                  <button
                    onClick={() => setPrimary(loc.id)}
                    disabled={busyId === loc.id}
                    style={smallButtonStyle}
                  >
                    Set as primary
                  </button>
                )}
                <button
                  onClick={() => remove(loc.id, loc.business_name || loc.address)}
                  disabled={busyId === loc.id}
                  style={{ ...smallButtonStyle, background: 'transparent', color: '#DC2626', border: '1px solid #FCA5A5' }}
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

const mutedStyle: React.CSSProperties = { color: '#64748B', fontSize: '14px' }

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#475569',
  fontSize: '13px',
  fontWeight: 600,
  marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  padding: '12px 14px',
  color: '#0F172A',
  fontSize: '14px',
  marginBottom: '16px',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const smallButtonStyle: React.CSSProperties = {
  fontSize: '12px',
  padding: '6px 12px',
  minHeight: '32px',
  borderRadius: '6px',
  background: '#fff',
  color: '#0F172A',
  border: '1px solid #E2E8F0',
  cursor: 'pointer',
  fontFamily: 'inherit',
}
