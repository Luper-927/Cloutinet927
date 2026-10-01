'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../../../lib/supabase'
import { getActingContext, logActivity } from '../../../../lib/permissions'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function EditProductPage() {
  const params = useParams()
  const productId = params.id as string

  const [ownerId, setOwnerId] = useState('')
  const [actorName, setActorName] = useState('')
  const [locationId, setLocationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [noAccess, setNoAccess] = useState(false)

  const [pName, setPName] = useState('')
  const [pPrice, setPPrice] = useState('')
  const [pCurrency, setPCurrency] = useState('NGN')
  const [pDesc, setPDesc] = useState('')
  const [pImage, setPImage] = useState<string | null>(null)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    const currentUser = userData?.user
    if (!currentUser) {
      window.location.href = '/auth'
      return
    }

    const context = await getActingContext(currentUser.id)
    if (!context) {
      window.location.href = '/onboarding'
      return
    }

    if (!context.permissions.products) {
      setNoAccess(true)
      setLoading(false)
      return
    }

    setOwnerId(context.ownerId)
    setActorName(context.employeeName || 'Owner')
    setLocationId(context.locationId)

    let productQuery = supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('user_id', context.ownerId)

    if (context.locationId) {
      productQuery = productQuery.eq('location_id', context.locationId)
    }

    const { data: product } = await productQuery.single()

    if (!product) {
      window.location.href = '/dashboard'
      return
    }

    setPName(product.name || '')
    setPPrice(product.price ? String(product.price) : '')
    setPCurrency(product.currency || 'NGN')
    setPDesc(product.description || '')
    setPImage(product.image_url || null)

    setLoading(false)
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    setPendingImageFile(file)
    setPImage(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!ownerId) return
    if (!pName.trim()) {
      setError('Product name is required')
      return
    }

    setSaving(true)
    setError('')

    let finalImageUrl = pImage

    if (pendingImageFile) {
      setUploadingImage(true)
      const fileName = ownerId + '/' + Date.now() + '.' + pendingImageFile.name.split('.').pop()
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, pendingImageFile, { upsert: true })

      setUploadingImage(false)

      if (uploadError) {
        setSaving(false)
        setError('Image upload failed: ' + uploadError.message)
        return
      }

      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
      finalImageUrl = urlData.publicUrl
    }

    let updateQuery = supabase
      .from('products')
      .update({
        name: pName,
        description: pDesc,
        price: pPrice ? parseFloat(pPrice) : null,
        currency: pCurrency,
        image_url: finalImageUrl,
      })
      .eq('id', productId)
      .eq('user_id', ownerId)

    if (locationId) {
      updateQuery = updateQuery.eq('location_id', locationId)
    }

    const { error: dbError } = await updateQuery

    setSaving(false)

    if (dbError) {
      setError(dbError.message)
      return
    }

    await logActivity(ownerId, actorName, 'updated', 'product', pName)

    window.location.href = '/dashboard'
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#0F172A', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Loading...</div>
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

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#0F172A' }}>
        <Link href="/dashboard" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '13px' }}>← Dashboard</Link>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>Edit Product</div>
        <div style={{ width: '60px' }}></div>
      </div>

      <div style={{ maxWidth: '420px', margin: '0 auto', padding: '16px' }}>

        <label
          onClick={() => fileRef.current?.click()}
          style={{ display: 'block', marginBottom: '14px' }}
        >
          <div style={{
            border: '1px dashed #E2E8F0', borderRadius: '10px',
            height: pImage ? 'auto' : '120px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', overflow: 'hidden', background: '#F8FAFC'
          }}>
            {pImage ? (
              <img src={pImage} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#64748B', fontSize: '13px' }}>📷 Tap to add photo</span>
            )}
          </div>
        </label>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />

        <label style={labelStyle}>Product / Service Name *</label>
        <input placeholder="e.g. Rice 50kg bag" value={pName} onChange={e => setPName(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Price</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <select value={pCurrency} onChange={e => setPCurrency(e.target.value)} style={{ ...inputStyle, marginBottom: 0, width: '90px' }}>
            <option value="NGN">NGN ₦</option>
            <option value="USD">USD $</option>
            <option value="GBP">GBP £</option>
            <option value="EUR">EUR €</option>
            <option value="GHS">GHS ₵</option>
          </select>
          <input placeholder="Price" value={pPrice} onChange={e => setPPrice(e.target.value)} style={{ ...inputStyle, marginBottom: 0, flex: 1 }} type="number" />
        </div>

        <label style={labelStyle}>Description</label>
        <textarea placeholder="Short description" value={pDesc} onChange={e => setPDesc(e.target.value)} style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} />

        {error && <p style={{ color: '#dc2626', fontSize: '12px', marginBottom: '12px' }}>{error}</p>}

        <button onClick={handleSave} disabled={saving} style={{
          width: '100%', background: '#0F172A',
          color: '#fff', border: 'none', borderRadius: '8px',
          padding: '14px', cursor: 'pointer', fontSize: '15px', fontWeight: 700,
          fontFamily: 'inherit', opacity: saving ? 0.7 : 1
        }}>
          {uploadingImage ? 'Uploading image...' : saving ? 'Saving...' : 'Save Changes'}
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
