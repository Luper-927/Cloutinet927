'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
  const [savedSlug, setSavedSlug] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)

  // If this person already has a business profile, fill the form with it so
  // "Edit business profile" doesn't open a blank form.
  useEffect(() => { loadExisting() }, [])

  async function loadExisting() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { data } = await supabase
      .from('profiles')
      .select('business_name, business_category, phone, location, tagline, business_hours, services, facebook_url, instagram_url, youtube_url, tiktok_url')
      .eq('id', userData.user.id)
      .maybeSingle()

    if (data && data.business_name) {
      setBusinessName(data.business_name || '')
      setCategory(data.business_category || '')
      setPhone(data.phone || '')
      setLocation(data.location || '')
      setTagline(data.tagline || '')
      setHours(data.business_hours || '')
      setServices(data.services || '')
      setFacebook(data.facebook_url || '')
      setInstagram(data.instagram_url || '')
      setYoutube(data.youtube_url || '')
      setTiktok(data.tiktok_url || '')
      setIsEdit(true)
    }
  }

  async function generateTagline() {
    if (!businessName || !category) {
      setError('Please enter your business name and category first')
      return
    }
    setGeneratingTagline(true)
    setError('')
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      const response = await fetch('/api/generate-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          type: 'tagline',
          businessName,
          category,
          location,
        })
      })
      const data = await response.json()
      if (data.result) setTagline(data.result)
      else setError(data.error || 'Could not generate tagline. Try again.')
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
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      const response = await fetch('/api/generate-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          type: 'services',
          businessName,
          category,
          location,
        })
      })
      const data = await response.json()
      if (data.result) setServices(data.result)
      else setError(data.error || 'Could not generate services. Try again.')
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

    // Fire-and-forget: tell Google to re-check the sitemap, and directly
    // request indexing for the business page. Doesn't block the
    // next step if either fails or is slow.
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token

    fetch('/api/ping-sitemap', { method: 'POST' }).catch(() => {})
    fetch('/api/request-indexing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ url: 'https://cloutinet.online/store/' + slug }),
    }).catch(() => {})

    setSavedSlug(slug)
  }

  if (savedSlug) {
    const storeUrl = 'https://cloutinet.online/store/' + savedSlug
    const shareText = businessName + ' is on Cloutinet. Take a look: ' + storeUrl
    const whatsappShareLink = 'https://wa.me/?text=' + encodeURIComponent(shareText)

    return (
      <div style={pageStyle}>
        <div style={topBarStyle}>
          <span style={wordmarkStyle}>Cloutinet</span>
        </div>

        <div style={{ ...contentStyle, textAlign: 'center', paddingTop: '48px' }}>
          <h1 style={{ ...titleStyle, marginBottom: '10px' }}>Your business profile is ready</h1>
          <p style={{ ...subtitleStyle, marginBottom: '24px' }}>
            {businessName} now has a public page. Search engines can find it, though it can take a while to appear in results. Share the link so people can reach you.
          </p>

          <div style={{ ...cardStyle, marginBottom: '20px', wordBreak: 'break-all' }}>
            <a href={storeUrl} style={{ color: '#fff', fontSize: '14px', fontWeight: 600, textDecoration: 'underline' }}>{storeUrl}</a>
          </div>

          <button
            onClick={() => { window.location.href = '/dashboard' }}
            style={{ ...primaryButtonStyle, width: '100%', marginBottom: '12px' }}
          >
            Go to your dashboard
          </button>

          <a
            href={whatsappShareLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '48px',
              background: 'rgba(52,211,153,0.12)',
              border: '1px solid rgba(52,211,153,0.35)',
              color: '#34D399',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Share on WhatsApp
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={topBarStyle}>
        <span style={wordmarkStyle}>Cloutinet</span>
        {isEdit ? (
          <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back to dashboard</Link>
        ) : (
          <span style={{ fontSize: '13px', color: '#94A3B8' }}>Business setup</span>
        )}
      </div>

      <div style={contentStyle}>
        <h1 style={titleStyle}>{isEdit ? 'Edit business profile' : 'Set up your business'}</h1>
        <p style={subtitleStyle}>
          Tell us about your business. This creates your business profile and your public page, which search engines can find.
        </p>

        <div style={cardStyle}>
          <label style={labelStyle}>Business name *</label>
          <input
            placeholder="e.g. Lax Furniture"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Business category *</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }}>
            <option value="">Select your category</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <label style={labelStyle}>Phone / WhatsApp number *</label>
          <input
            placeholder="e.g. 08012345678"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Location (city, state)</label>
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
            style={{ ...inputStyle, marginBottom: '10px' }}
          />
          <button
            onClick={generateTagline}
            disabled={generatingTagline}
            style={aiButtonStyle}
          >
            {generatingTagline ? 'Generating...' : 'Generate tagline with AI'}
          </button>

          <label style={labelStyle}>Business hours</label>
          <input
            placeholder="e.g. Mon-Sat 8am-6pm"
            value={hours}
            onChange={e => setHours(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Services and products</label>
          <textarea
            placeholder="e.g. Rice, Beans, Palm Oil, Garri"
            value={services}
            onChange={e => setServices(e.target.value)}
            style={{ ...inputStyle, minHeight: '96px', resize: 'vertical', marginBottom: '10px' }}
          />
          <button
            onClick={generateServices}
            disabled={generatingServices}
            style={aiButtonStyle}
          >
            {generatingServices ? 'Generating...' : 'Generate services with AI'}
          </button>

          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Social media links (optional)</div>
          <input placeholder="Facebook URL" value={facebook} onChange={e => setFacebook(e.target.value)} style={{ ...inputStyle, marginBottom: '10px' }} />
          <input placeholder="Instagram URL" value={instagram} onChange={e => setInstagram(e.target.value)} style={{ ...inputStyle, marginBottom: '10px' }} />
          <input placeholder="YouTube URL" value={youtube} onChange={e => setYoutube(e.target.value)} style={{ ...inputStyle, marginBottom: '10px' }} />
          <input placeholder="TikTok URL" value={tiktok} onChange={e => setTiktok(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }} />

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.35)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
              <p style={{ color: '#FCA5A5', fontSize: '13px', margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{ ...primaryButtonStyle, width: '100%', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Save and view my page'}
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

const topBarStyle: React.CSSProperties = {
  padding: '16px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
}

const wordmarkStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 900,
  letterSpacing: '-0.01em',
  color: '#fff',
}

const contentStyle: React.CSSProperties = {
  maxWidth: '520px',
  margin: '0 auto',
  padding: '28px 16px 48px',
}

const titleStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  color: '#fff',
  margin: '0 0 8px',
  lineHeight: 1.15,
}

const subtitleStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#94A3B8',
  margin: '0 0 20px',
  lineHeight: 1.5,
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '16px',
  padding: '20px',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#CBD5E1',
  fontSize: '13px',
  fontWeight: 600,
  marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: '8px',
  padding: '12px 14px',
  minHeight: '46px',
  color: '#fff',
  fontSize: '16px',
  marginBottom: '16px',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const primaryButtonStyle: React.CSSProperties = {
  background: '#2563EB',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '14px',
  minHeight: '48px',
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 600,
  fontFamily: 'inherit',
}

const aiButtonStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(52,211,153,0.10)',
  color: '#34D399',
  border: '1px solid rgba(52,211,153,0.30)',
  borderRadius: '8px',
  padding: '11px',
  minHeight: '44px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  marginBottom: '20px',
}
