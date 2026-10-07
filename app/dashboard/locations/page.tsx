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
    if (!isOwner) { setLoading(false); return }

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
    if (!name.trim() || !address.trim()) { setError('Name and address are required'); return }
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

  if (loading) return <div className="ui-wrap"><p className="ui-sub">Loading...</p></div>

  if (!isOwner) {
    return <div className="ui-wrap"><p className="ui-sub">Only the business owner can manage locations.</p></div>
  }

  return (
    <div className="ui-wrap">
      <h1 className="ui-title">Locations</h1>

      {!adding ? (
        <button onClick={() => setAdding(true)} className="ui-btn ui-block" style={{ marginBottom: '20px' }}>
          + Add location
        </button>
      ) : (
        <div className="ui-card" style={{ marginBottom: '20px' }}>
          <label className="ui-label">Location name *</label>
          <input className="ui-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Wuse Branch" />

          <label className="ui-label">Address *</label>
          <input className="ui-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, area, city" />

          <label className="ui-label">Phone</label>
          <input className="ui-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Optional" />

          {error && <div className="ui-error"><p>{error}</p></div>}

          <div className="ui-actions">
            <button onClick={handleAdd} disabled={saving} className="ui-btn">{saving ? 'Saving...' : 'Save'}</button>
            <button onClick={() => { setAdding(false); setError('') }} className="ui-btn ui-btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {locations.length === 0 ? (
        <div className="ui-empty">No locations yet. Add your first branch above.</div>
      ) : (
        <div className="ui-list">
          {locations.map(loc => (
            <div key={loc.id} className="ui-card">
              <div className="ui-between">
                <div style={{ minWidth: 0 }}>
                  <div className="ui-name">{loc.business_name}</div>
                  <div className="ui-meta">{loc.address}</div>
                  {loc.phone && <div className="ui-meta">{loc.phone}</div>}
                </div>
                {loc.is_primary && <span className="ui-badge ui-badge-good">Primary</span>}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                {!loc.is_primary && (
                  <button onClick={() => setPrimary(loc.id)} disabled={busyId === loc.id} className="ui-btn ui-btn-ghost ui-btn-sm">
                    Set as primary
                  </button>
                )}
                <button onClick={() => remove(loc.id, loc.business_name || loc.address)} disabled={busyId === loc.id} className="ui-btn ui-btn-danger ui-btn-sm">
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
