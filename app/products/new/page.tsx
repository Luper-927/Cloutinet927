'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { getBusinessTier } from '../../../lib/tiers'
import { getActingContext, logActivity } from '../../../lib/permissions'
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
  const savingLock = useRef(false)

  const [productCount, setProductCount] = useState<number | null>(null)
  const [productLimit, setProductLimit] = useState<number>(5)
  const [tierName, setTierName] = useState<string>('Free')
  const [checkingLimit, setCheckingLimit] = useState(true)
  const [ownerId, setOwnerId] = useState<string>('')
  const [actorName, setActorName] = useState<string>('')
  const [noAccess, setNoAccess] = useState(false)

  useEffect(() => {
    checkProductCount()
  }, [])

  async function checkProductCount() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const context = await getActingContext(userData.user.id)
    if (!context) { window.location.href = '/onboarding'; return }

    if (!context.permissions.products) {
      setNoAccess(true)
      setCheckingLimit(false)
      return
    }

    setOwnerId(context.ownerId)
    setActorName(context.employeeName || 'Owner')

    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', context.ownerId)

    const { limits } = await getBusinessTier(context.ownerId)
    setProductLimit(limits.productLimit)
    setTierName(limits.name)

    setProductCount(count ?? 0)
    setCheckingLimit(false)
  }

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
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_name, business_category, location, phone')
        .eq('id', ownerId)
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
    if (savingLock.current) return
    savingLock.current = true

    if (!name.trim()) {
      setError('Product name is required')
      savingLock.current = false
      return
    }
    setSaving(true)
    setError('')

    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', ownerId)

    const { limits } = await getBusinessTier(ownerId)

    if ((count ?? 0) >= limits.productLimit) {
      setSaving(false)
      savingLock.current = false
      setProductCount(count ?? 0)
      setProductLimit(limits.productLimit)
      setTierName(limits.name)
      setError('You\u2019ve reached your ' + limits.name + ' plan limit of ' + limits.productLimit + ' products.')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('business_name, location, business_slug')
      .eq('id', ownerId)
      .single()

    let imageUrl = ''
    if (imageFile) {
      const fileName = ownerId + '/' + Date.now() + '.' + imageFile.name.split('.').pop()
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
      user_id: ownerId,
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
    savingLock.current = false
    if (saveError) { setError(saveError.message); return }

    await logActivity(ownerId, actorName, 'created', 'product', name)

    if (profile?.business_slug) {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      fetch('/api/request-indexing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ url: 'https://cloutinet.online/store/' + profile.business_slug + '/' + slug }),
      }).catch(() => {})
    }

    window.location.href = '/dashboard'
  }

  if (checkingLimit) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Loading...</p>
      </div>
    )
  }

  if (noAccess) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif', textAlign: 'center' as const }}>You don&rsquo;t have permission to manage products.</p>
      </div>
    )
  }

  if (productCount !== null && productCount >= productLimit) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
        <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Add Product</div>
          <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Cancel</Link>
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📦</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            You&rsquo;ve reached your {tierName} plan limit
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
            Your {tierName} Cloutinet account can list up to {productLimit} products. You currently have {productCount} listed.
            Upgrade your plan to list more.
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
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Add Product</div>
        <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Cancel</Link>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>

        {productCount !== null && (
          <p style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, marginBottom: '16px' }}>
            {productCount} / {productLimit} products used ({tierName} plan)
          </p>
        )}

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
