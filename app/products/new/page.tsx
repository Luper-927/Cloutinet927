'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { getBusinessTier } from '../../../lib/tiers'
import { logActivity } from '../../../lib/permissions'
import DashboardShell, { useDashboard } from '../../components/DashboardShell'
import { uiCss } from '../../dashboard/ui'

const currencies = ['NGN', 'USD', 'GBP', 'EUR', 'GHS']

export default function NewProductPage() {
  return (
    <>
      <style>{uiCss}</style>
      <DashboardShell>
        <NewProductForm />
      </DashboardShell>
    </>
  )
}

function NewProductForm() {
  const router = useRouter()
  const { context, profile, tierLimits } = useDashboard()

  const ownerId = context.ownerId
  const actorName = context.employeeName || 'Owner'
  const locationId = context.locationId
  const noAccess = !context.permissions.products
  const productLimit: number = tierLimits?.productLimit ?? 5
  const tierName: string = tierLimits?.name || 'Free'

  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('NGN')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [productCount, setProductCount] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const savingLock = useRef(false)

  useEffect(() => {
    if (noAccess) return
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', ownerId)
      .then(({ count }) => setProductCount(count ?? 0))
  }, [])

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    try {
      const compressed = await compressImage(file)
      setImageFile(compressed)
      setImagePreview(URL.createObjectURL(compressed))
    } catch {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  async function compressImage(file: File): Promise<File> {
    const MAX_DIMENSION = 1200
    const QUALITY = 0.8

    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob: Blob | null = await new Promise(resolve =>
      canvas.toBlob(resolve, 'image/jpeg', QUALITY)
    )
    if (!blob) return file

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], newName, { type: 'image/jpeg' })
  }

  async function generateDescription() {
    if (!name.trim()) {
      setError('Please enter product name first')
      return
    }
    setGenerating(true)
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
      setError('You\u2019ve reached your ' + limits.name + ' plan limit of ' + limits.productLimit + ' products.')
      return
    }

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
      location_id: locationId,
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

    router.push('/dashboard')
  }

  if (noAccess) {
    return <div className="ui-wrap"><p className="ui-sub">You don&rsquo;t have permission to manage products.</p></div>
  }

  if (productCount === null) {
    return <div className="ui-wrap"><p className="ui-sub">Loading...</p></div>
  }

  if (productCount >= productLimit) {
    return (
      <div className="ui-wrap">
        <Link href="/dashboard" className="ui-back">Back to dashboard</Link>
        <div className="ui-upgrade">
          <h2>You&rsquo;ve reached your {tierName} plan limit</h2>
          <p>Your {tierName} account can list up to {productLimit} products. You currently have {productCount} listed. Upgrade your plan to list more.</p>
          <Link href="/dashboard/billing" className="ui-btn">View plans</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="ui-wrap">
      <Link href="/dashboard" className="ui-back">Back to dashboard</Link>
      <h1 className="ui-title">Add product</h1>

      <p className="ui-sub">{productCount} of {productLimit} products used ({tierName} plan)</p>

      <div
        onClick={() => fileRef.current?.click()}
        style={{
          width: '100%', height: '180px', background: 'rgba(255,255,255,.04)',
          border: '2px dashed rgba(255,255,255,.2)', borderRadius: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', marginBottom: '16px', overflow: 'hidden',
        }}
      >
        {imagePreview ? (
          <img src={imagePreview} alt="Product preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 600 }}>Tap to add a product photo</div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />

      <label className="ui-label">Product or service name *</label>
      <input className="ui-input" placeholder="e.g. Rice 50kg Bag" value={name} onChange={e => setName(e.target.value)} />

      <label className="ui-label">Price</label>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <select className="ui-input" value={currency} onChange={e => setCurrency(e.target.value)} style={{ marginBottom: 0, width: '110px', flexShrink: 0 }}>
          {currencies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input className="ui-input" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} type="number" style={{ marginBottom: 0, flex: 1 }} />
      </div>

      <label className="ui-label">Description</label>
      <textarea
        className="ui-input tight"
        placeholder="Describe your product or service..."
        value={description}
        onChange={e => setDescription(e.target.value)}
        style={{ minHeight: '110px' }}
      />
      <button onClick={generateDescription} disabled={generating} className="ui-btn ui-btn-ghost ui-block" style={{ marginBottom: '20px' }}>
        {generating ? 'Generating...' : 'Generate SEO description with AI'}
      </button>

      {error && <div className="ui-error"><p>{error}</p></div>}

      <button onClick={handleSave} disabled={saving} className="ui-btn ui-block">
        {saving ? 'Saving...' : 'Save product'}
      </button>
    </div>
  )
}
