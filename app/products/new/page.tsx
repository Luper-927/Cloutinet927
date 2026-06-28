'use client'

import { useState, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

const currencies = ['NGN', 'USD', 'GBP', 'EUR', 'GHS']

export default function NewProductPage() {
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('NGN')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function generateDescription() {
    if (!name.trim()) {
      setError('Please enter product name first')
      return
    }
    setGenerating(true)
    setError('')
    try {
      const { data: userData } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_name, business_category, location, phone')
        .eq('id', userData.user?.id)
        .single()

      const response = await fetch('/api/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'product_description',
          productName: name,
          businessName: profile?.business_name,
          category: profile?.business_category,
          location: profile?.location,
          phone: profile?.phone,
          price,
          currency,
        })
      })
      const data = await response.json()
      if (data.result) setDescription(data.result)
      else setError(data.error || 'Could not generate description. Try again.')
    } catch (e) {
      setError('Could not generate description. Please try again.')
    }
    setGenerating(false)
  }

  async function handleSave() {
    if (!name.trim()) { setError('Product name is required'); return }
    setSaving(true)
    setError('')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('business_name, location, business_slug')
      .eq('id', userData.user.id)
      .single()

    let imageUrl = ''
    if (imageFile) {
      const fileName = userData.user.id + '/' + Date.now() + '.' + imageFile.name.split('.').pop()
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile, { upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
      }
    }

    const slug = name.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-5)

    const seoTitle = name + (profile?.location ? ' in ' + profile.location : '') + (profile?.business_name ? ' | ' + profile.business_name : '')
    const seoDescription = description || ('Buy ' + name + (profile?.location ? ' in ' + profile.location : '') + '. Contact us on WhatsApp for orders and inquiries.')

    const { error: saveError } = await supabase.from('products').insert({
      user_id: userData.user.id,
      name,
      slug,
      description,
      price: price ? parseFloat(price) : null,
      currency,
      image_url: imageUrl || null,
      is_published: true,
      seo_title: seoTitle,
      seo_description: seoDescription,
    })

    setSaving(false)
    if (saveError) { setError(saveError.message); return }
    window.location.href = '/dashboard'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Add Product</div>
        <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Cancel</Link>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>

        <div
          onClick={() => fileRef.current?.click()}
          style={{
            width: '100%', height: '180px', background: '#F8FAFC',
            border: '2px dashed #E2E8F0', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', marginBottom: '16px', overflow: 'hidden'
          }}
        >
          {imagePreview ? (
            <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📷</div>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Tap to add product photo</div>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />

        <label style={labelStyle}>Product / Service Name *</label>
        <input
          placeholder="e.g. Rice 50kg Bag"
          value={name}
          onChange={e => setName(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Price</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ ...inputStyle, marginBottom: '0', width: '100px', flexShrink: 0 }}>
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            placeholder="0.00"
            value={price}
            onChange={e => setPrice(e.target.value)}
            type="number"
            style={{ ...inputStyle, marginBottom: '0', flex: 1 }}
          />
        </div>

        <label style={labelStyle}>Description</label>
        <textarea
          placeholder="Describe your product or service..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' as const }}
        />
        <button
          onClick={generateDescription}
          disabled={generating}
          style={aiButtonStyle}
        >
          {generating ? '⏳ Generating...' : '✨ Generate SEO Description with AI'}
        </button>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
            <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>{error}</p>
          </div>
        )}

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
          {saving ? 'Saving...' : 'Save Product'}
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
