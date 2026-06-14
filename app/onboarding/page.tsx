'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function OnboardingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [bizName, setBizName] = useState('')
  const [bizCategory, setBizCategory] = useState('')
  const [bizPhone, setBizPhone] = useState('')
  const [bizLocation, setBizLocation] = useState('')
  const [bizTagline, setBizTagline] = useState('')

  useEffect(() => {
    load()
  }, [])

  function slugify(s: string) {
    return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
  }

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    const currentUser = userData?.user
    if (!currentUser) {
      window.location.href = '/auth'
      return
    }
    setUser(currentUser)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single()

    if (profileData) {
      setBizName(profileData.business_name || '')
      setBizCategory(profileData.business_category || '')
      setBizPhone(profileData.phone || '')
      setBizLocation(profileData.location || '')
      setBizTagline(profileData.tagline || '')
    }

    setLoading(false)
  }

  async function handleSave() {
    if (!user) return
    if (!bizName.trim()) {
      setError('Business name is required')
      return
    }
    if (!bizPhone.trim()) {
      setError('Phone / WhatsApp number is required')
      return
    }

    setSaving(true)
    setError('')

    const slug = slugify(bizName)

    const { error: dbError } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      business_name: bizName,
      business_slug: slug,
      business_category: bizCategory,
      phone: bizPhone,
      location: bizLocation,
      tagline: bizTagline,
    })

    setSaving(false)

    if (dbError) {
      setError(dbError.message)
      return
    }

    window.location.href = '/dashboard'
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#07070f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#FF6B35' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', fontFamily: 'Segoe UI, system-ui, sans-serif', padding: '16px' }}>
      <div style={{ maxWidth: '420px', margin: '0 auto', paddingTop: '20px' }}>

        <div style={{
          fontSize: '20px', fontWeight: 900,
          background: 'linear-gradient(135deg, #FF6B35, #E91E8C)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '6px'
        }}>⚡ Cloutinet</div>

        <h2 style={{ color: '#f0f0ff', fontSize: '18px', marginBottom: '6px' }}>Set Up Your Business</h2>
        <p style={{ color: '#8888aa', fontSize: '13px', marginBottom: '24px' }}>
          This information appears on your free Google-searchable page.
        </p>

        <label style={labelStyle}>Business Name *</label>
        <input placeholder="e.g. Mary's Foodstuff Store" value={bizName} onChange={e => setBizName(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Category</label>
        <input placeholder="e.g. Foodstuff, Salon, Electronics" value={bizCategory} onChange={e => setBizCategory(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Phone / WhatsApp Number *</label>
        <input placeholder="e.g. 08012345678" value={bizPhone} onChange={e => setBizPhone(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Location</label>
        <input placeholder="e.g. Port Harcourt, Rivers State" value={bizLocation} onChange={e => setBizLocation(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Short Tagline</label>
        <input placeholder="e.g. Quality foodstuffs at affordable prices" value={bizTagline} onChange={e => setBizTagline(e.target.value)} style={inputStyle} />

        {error && <p style={{ color: '#ff4444', fontSize: '12px', marginBottom: '12px' }}>{error}</p>}

        <button onClick={handleSave} disabled={saving} style={{
          width: '100%', marginTop: '8px',
          background: 'linear-gradient(135deg, #FF6B35, #E91E8C)',
          color: '#fff', border: 'none', borderRadius: '10px',
          padding: '14px', cursor: 'pointer', fontSize: '14px', fontWeight: 700,
          fontFamily: 'inherit', opacity: saving ? 0.7 : 1
        }}>
          {saving ? 'Saving...' : 'Save and Continue'}
        </button>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#8888aa', fontSize: '11px',
  fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px'
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#161625', border: '1px solid #252535',
  borderRadius: '10px', padding: '12px 14px', color: '#f0f0ff',
  fontSize: '14px', marginBottom: '16px', outline: 'none', fontFamily: 'inherit'
}
