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
    // request indexing for the new business page. Doesn't block the
    // redirect if either fails or is slow.
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
