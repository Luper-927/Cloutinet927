'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { PublicNav } from '../components/PublicChrome'

export default function FeedbackPage() {
  const [name, setName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [rating, setRating] = useState(0)
  const [liked, setLiked] = useState('')
  const [improvement, setImprovement] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (rating === 0) { setError('Please select a rating'); return }
    if (!liked.trim() && !improvement.trim()) { setError('Please fill in at least one feedback field'); return }

    setSaving(true)
    setError('')

    const { error: dbError } = await supabase.from('feedback').insert({
      name: name || null, business_type: businessType || null,
      rating, liked: liked || null, improvement: improvement || null,
    })

    setSaving(false)
    if (dbError) { setError(dbError.message); return }
    setDone(true)
  }

  if (done) {
    return (
      <div style={pageStyle}>
        <PublicNav />
        <div style={{ maxWidth: '360px', margin: '0 auto', padding: '72px 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', margin: '0 0 10px' }}>Thank you</h2>
          <p style={{ color: '#94A3B8', fontSize: '15px', margin: '0 0 24px', lineHeight: 1.5 }}>
            Your feedback helps us improve Cloutinet for every business owner.
          </p>
          <Link href="/" style={primaryLinkStyle}>Back to Cloutinet</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <PublicNav />

      <div style={{ maxWidth: '460px', margin: '0 auto', padding: '32px 16px 56px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', margin: '0 0 8px', lineHeight: 1.15 }}>Share your feedback</h1>
        <p style={{ color: '#94A3B8', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.5 }}>Help us make Cloutinet better for every business owner.</p>

        <div style={cardStyle}>
          <label style={labelStyle}>Your name (optional)</label>
          <input placeholder="e.g. Emeka" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>Business type</label>
          <select value={businessType} onChange={e => setBusinessType(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }}>
            <option value="">Select your business type</option>
            <option value="Restaurant / Food">Restaurant / Food</option>
            <option value="Salon / Barber">Salon / Barber</option>
            <option value="Shop / Retail">Shop / Retail</option>
            <option value="Fashion">Fashion</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Church / Ministry">Church / Ministry</option>
            <option value="Furniture / Interior">Furniture / Interior</option>
            <option value="Electronics">Electronics</option>
            <option value="Health / Pharmacy">Health / Pharmacy</option>
            <option value="Other">Other</option>
          </select>

          <label style={labelStyle}>Rating *</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                aria-label={star + ' out of 5'}
                style={{
                  width: '48px', height: '48px', borderRadius: '8px',
                  border: '1px solid ' + (rating >= star ? '#2563EB' : 'rgba(255,255,255,0.15)'),
                  background: rating >= star ? '#2563EB' : 'transparent',
                  color: rating >= star ? '#fff' : '#94A3B8',
                  fontSize: '16px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                }}
              >{star}</button>
            ))}
          </div>

          <label style={labelStyle}>What do you like about Cloutinet?</label>
          <textarea placeholder="e.g. Easy to use, my products show on Google..." value={liked} onChange={e => setLiked(e.target.value)} style={{ ...inputStyle, minHeight: '96px', resize: 'vertical' }} />

          <label style={labelStyle}>What needs improvement?</label>
          <textarea placeholder="e.g. I wish I could add more photos..." value={improvement} onChange={e => setImprovement(e.target.value)} style={{ ...inputStyle, minHeight: '96px', resize: 'vertical' }} />

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.35)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px' }}>
              <p style={{ color: '#FCA5A5', fontSize: '13px', margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              width: '100%', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '14px', minHeight: '48px', cursor: 'pointer', fontSize: '15px', fontWeight: 600,
              fontFamily: 'inherit', opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? 'Submitting...' : 'Submit feedback'}
          </button>
        </div>
      </div>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  color: '#E2E8F0',
  fontFamily: 'inherit',
  backgroundColor: '#0A0E27',
  backgroundImage:
    'radial-gradient(ellipse 700px 420px at 12% -8%, rgba(29,78,216,0.30), transparent 70%), radial-gradient(ellipse 600px 500px at 100% 0%, rgba(37,99,235,0.18), transparent 70%)',
  backgroundRepeat: 'no-repeat',
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '16px',
  padding: '20px',
}

const primaryLinkStyle: React.CSSProperties = {
  display: 'inline-block',
  background: '#2563EB',
  color: '#fff',
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 600,
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#CBD5E1', fontSize: '13px', fontWeight: 600, marginBottom: '6px'
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: '8px', padding: '12px 14px', minHeight: '46px', color: '#fff',
  fontSize: '16px', marginBottom: '16px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
}
