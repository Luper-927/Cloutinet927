'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

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
    if (rating === 0) {
      setError('Please select a rating')
      return
    }
    if (!liked.trim() && !improvement.trim()) {
      setError('Please fill in at least one feedback field')
      return
    }

    setSaving(true)
    setError('')

    const { error: dbError } = await supabase.from('feedback').insert({
      name: name || null,
      business_type: businessType || null,
      rating: rating,
      liked: liked || null,
      improvement: improvement || null,
    })

    setSaving(false)

    if (dbError) {
      setError(dbError.message)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div style={{
        minHeight: '100vh', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px', fontFamily: 'Segoe UI, system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '320px' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#6B21A8', marginBottom: '8px' }}>Thank You!</h2>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>Your feedback helps us improve Cloutinet for every business owner.</p>
          <Link href="/" style={{
            display: 'inline-block', background: '#6B21A8', color: '#fff',
            padding: '12px 24px', borderRadius: '10px',
            textDecoration: 'none', fontSize: '14px', fontWeight: 700
          }}>Back to Cloutinet</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#fff',
      fontFamily: 'Segoe UI, system-ui, sans-serif'
    }}>
      <nav style={{
        padding: '0 20px', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', background: '#6B21A8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '14px' }}>C</div>
          <span style={{ fontSize: '16px', fontWeight: 900, color: '#6B21A8' }}>Cloutinet</span>
        </Link>
      </nav>

      <div style={{ maxWidth: '420px', margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '6px', color: '#1a1a2e' }}>Share Your Feedback</h1>
        <p style={{ color: '#888', fontSize: '13px', marginBottom: '24px' }}>Help us make Cloutinet better for every business owner.</p>

        <label style={labelStyle}>Your Name (optional)</label>
        <input
          placeholder="e.g. Emeka"
          value={name}
          onChange={e => setName(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Business Type</label>
        <select value={businessType} onChange={e => setBusinessType(e.target.value)} style={inputStyle}>
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

        <label style={labelStyle}>How would you rate Cloutinet? *</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              style={{
                width: '44px', height: '44px', borderRadius: '10px',
                border: '2px solid ' + (rating >= star ? '#6B21A8' : '#e5e7eb'),
                background: rating >= star ? '#6B21A8' : '#fff',
                color: rating >= star ? '#fff' : '#888',
                fontSize: '18px', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >⭐</button>
          ))}
        </div>

        <label style={labelStyle}>What do you like about Cloutinet?</label>
        <textarea
          placeholder="e.g. Easy to use, my products show on Google..."
          value={liked}
          onChange={e => setLiked(e.target.value)}
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
        />

        <label style={labelStyle}>What needs improvement?</label>
        <textarea
          placeholder="e.g. I wish I could add more photos..."
          value={improvement}
          onChange={e => setImprovement(e.target.value)}
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
        />

        {error && <p style={{ color: '#ff4444', fontSize: '12px', marginBottom: '12px' }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            width: '100%', background: '#6B21A8',
            color: '#fff', border: 'none', borderRadius: '10px',
            padding: '14px', cursor: 'pointer', fontSize: '14px', fontWeight: 700,
            fontFamily: 'inherit', opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#555', fontSize: '12px',
  fontWeight: 700, marginBottom: '6px'
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#fafafa', border: '1px solid #e5e7eb',
  borderRadius: '10px', padding: '12px 14px', color: '#1a1a2e',
  fontSize: '14px', marginBottom: '16px', outline: 'none', fontFamily: 'inherit'
}
