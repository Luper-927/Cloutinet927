'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const categories = [
  'Food & Groceries', 'Fashion & Clothing', 'Electronics & Gadgets', 'Furniture & Interior',
  'Building Materials', 'Supermarket & Store', 'Wholesale & Distribution', 'Salon & Hair',
  'Barber Shop', 'Spa & Massage', 'Cosmetics & Skincare', 'Gym & Fitness',
  'Restaurant & Eatery', 'Fast Food & Snacks', 'Catering Services', 'Bakery & Pastry',
  'Bar & Drinks', 'Logistics & Delivery', 'Printing & Graphics', 'Photography & Video',
  'Event Planning', 'Cleaning Services', 'Security Services', 'Laundry & Dry Cleaning',
  'Tailoring & Fashion Design', 'Shoe Making & Repair', 'Pharmacy & Chemist', 'Hospital & Clinic',
  'Optical Services', 'Dental Care', 'Herbal & Natural Health', 'Real Estate & Property',
  'Architecture & Design', 'Plumbing & Electrical', 'Building & Construction', 'Paint & Finishing',
  'School & Tutorial', 'Church & Ministry', 'Mosque & Islamic Center', 'Skills & Training',
  'Tech & IT Services', 'Phone Repair', 'Computer Services', 'Digital Marketing',
  'Farming & Agriculture', 'Livestock & Poultry', 'Fish Farming', 'Crop Production',
  'Car Sales', 'Auto Repair & Mechanic', 'Spare Parts', 'Car Wash & Detailing',
  'Financial Services', 'Insurance', 'POS & Mobile Money', 'Welding & Fabrication', 'Other',
]

export default function OnboardingPage() {
  const [businessName, setBusinessName] = useState('')
  const [category, setCategory] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [tagline, setTagline] = useState('')
  const [hours, setHours] = useState('')
  const [services, setServices] = useState('')
  const [facebook, setFacebook] = useState('')
  const [instagram, setInstagram] = useState('')
  const [youtube, setYoutube] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [saving, setSaving] = useState(false)
  const [generatingTagline, setGeneratingTagline] = useState(false)
  const [generatingServices, setGeneratingServices] = useState(false)
  const [error, setError] = useState('')

  async function generateTagline() {
    if (!businessName || !category) {
      setError('Please enter your business name and category first')
      return
    }
    setGeneratingTagline(true)
    setError('')
    try {
      const response = await fetch('/api/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tagline',
          businessName,
          category,
          location,
        })
      })
      const data = await response.json()
      if (data.result) setTagline(data.result)
      else setError('Could not generate tagline. Try again.')
    } catch (e) {
      setError('Could not generate tagline. Please try again.')
    }
    setGeneratingTagline(false)
  }

  async function generateServices() {
    if (!businessName || !category) {
      setError('Please enter your business name and category first')
      return
    }
    setGeneratingServices(true)
    setError('')
    try {
      const response = await fetch('/api/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'services',
          businessName,
          category,
          location,
        })
      })
      const data = await response.json()
      if (data.result) setServices(data.result)
      else setError('Could not generate services. Try again.')
    } catch (e) {
      setError('Could not generate services. Please try again.')
    }
    setGeneratingServices(false)
  }

  async function handleSave() {
    if (!businessName.trim() || !category || !phone.trim()) {
      setError('Business name, category and phone are required')
      return
    }
    setSaving(true)
    setError('')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const slug = businessName.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    const { error: saveError } = await supabase.from('profiles').upsert({
      id: userData.user.id,
      email: userData.user.email,
      business_name: businessName,
      business_slug: slug,
      business_category: category,
      phone,
      location,
      tagline,
      business_hours: hours,
      services,
      facebook_url: facebook || null,
      instagram_url: instagram || null,
      youtube_url: youtube || null,
      tiktok_url: tiktok || null,
    })

    setSaving(false)
    if (saveError) { setError(saveError.message); return }
    window.location.href = '/dashboard'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ background: '#0F172A', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Cloutinet</div>
        <div style={{ fontSize: '12px', color: '#94A3B8' }}>Business Setup</div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>Set Up Your Business</h1>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>Fill in your details to create your free Google-searchable business page.</p>

        <label style={labelStyle}>Business Name *</label>
        <input
          placeholder="e.g. Lax Furniture"
          value={businessName}
          onChange={e => setBusinessName(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Business Category *</label>
        <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
          <option value="">Select your category</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <label style={labelStyle}>Phone / WhatsApp Number *</label>
        <input
          placeholder="e.g. 08012345678"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Location (City, State)</label>
        <input
          placeholder="e.g. Port Harcourt, Rivers State"
          value={location}
          onChange={e => setLocation(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Tagline</label>
        <input
          placeholder="A short description of your business"
          value={tagline}
          onChange={e => setTagline(e.target.value)}
          style={inputStyle}
        />
        <button
          onClick={generateTagline}
          disabled={generatingTagline}
          style={aiButtonStyle}
        >
          {generatingTagline ? '⏳ Generating...' : '✨ Generate SEO Tagline with AI'}
        </button>

        <label style={{ ...labelStyle, marginTop: '16px' }}>Business Hours</label>
        <input
          placeholder="e.g. Mon-Sat 8am-6pm"
          value={hours}
          onChange={e => setHours(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Services & Products</label>
        <textarea
          placeholder="e.g. Rice, Beans, Palm Oil, Garri"
          value={services}
          onChange={e => setServices(e.target.value)}
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' as const }}
        />
        <button
          onClick={generateServices}
          disabled={generatingServices}
          style={aiButtonStyle}
        >
          {generatingServices ? '⏳ Generating...' : '✨ Generate Services with AI'}
        </button>

        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', marginTop: '20px', marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>Social Media Links (Optional)</div>
          <input placeholder="Facebook URL" value={facebook} onChange={e => setFacebook(e.target.value)} style={{ ...inputStyle, marginBottom: '10px' }} />
          <input placeholder="Instagram URL" value={instagram} onChange={e => setInstagram(e.target.value)} style={{ ...inputStyle, marginBottom: '10px' }} />
          <input placeholder="YouTube URL" value={youtube} onChange={e => setYoutube(e.target.value)} style={{ ...inputStyle, marginBottom: '10px' }} />
          <input placeholder="TikTok URL" value={tiktok} onChange={e => setTiktok(e.target.value)} style={{ ...inputStyle, marginBottom: '0' }} />
        </div>

        {error && <p style={{ color: '#ff4444', fontSize: '12px', marginBottom: '12px' }}>{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', background: '#0F172A', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '14px', cursor: 'pointer',
            fontSize: '15px', fontWeight: 700, fontFamily: 'inherit',
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? 'Saving...' : 'Save & View My Page'}
        </button>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#475569', fontSize: '12px',
  fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase'
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0',
  borderRadius: '8px', padding: '12px 14px', color: '#0F172A',
  fontSize: '14px', marginBottom: '16px', outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box'
}

const aiButtonStyle: React.CSSProperties = {
  width: '100%', background: '#F0FDF4', color: '#166534',
  border: '1px solid #BBF7D0', borderRadius: '8px', padding: '11px',
  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
  fontFamily: 'inherit', marginBottom: '16px'
}
