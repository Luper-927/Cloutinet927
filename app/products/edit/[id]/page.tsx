'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import { logActivity } from '../../../../lib/permissions'
import DashboardShell, { useDashboard } from '../../../components/DashboardShell'
import { uiCss } from '../../../dashboard/ui'

export default function EditProductPage() {
  return (
    <>
      <style>{uiCss}</style>
      <DashboardShell>
        <EditProductForm />
      </DashboardShell>
    </>
  )
}

function EditProductForm() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { context } = useDashboard()

  const ownerId = context.ownerId
  const actorName = context.employeeName || 'Owner'
  const locationId = context.locationId
  const noAccess = !context.permissions.products

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')

  const [pName, setPName] = useState('')
  const [pPrice, setPPrice] = useState('')
  const [pCurrency, setPCurrency] = useState('NGN')
  const [pDesc, setPDesc] = useState('')
  const [pImage, setPImage] = useState<string | null>(null)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { load() }, [])

  async function load() {
    if (noAccess) { setLoading(false); return }

    let productQuery = supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('user_id', ownerId)

    if (locationId) {
      productQuery = productQuery.eq('location_id', locationId)
    }

    const { data: product } = await productQuery.single()

    if (!product) {
      router.replace('/dashboard')
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

    router.push('/dashboard')
  }

  if (noAccess) {
    return <div className="ui-wrap"><p className="ui-sub">You don&rsquo;t have permission to manage products.</p></div>
  }

  if (loading) {
    return <div className="ui-wrap"><p className="ui-sub">Loading...</p></div>
  }

  return (
    <div className="ui-wrap">
      <Link href="/dashboard" className="ui-back">Back to dashboard</Link>
      <h1 className="ui-title">Edit product</h1>

      <div
        onClick={() => fileRef.current?.click()}
        style={{
          border: '1px dashed rgba(255,255,255,.25)', borderRadius: '16px',
          minHeight: '120px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', overflow: 'hidden', background: 'rgba(255,255,255,.04)', marginBottom: '16px',
        }}
      >
        {pImage ? (
          <img src={pImage} alt="Product" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: '#94A3B8', fontSize: '14px' }}>Tap to add a photo</span>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />

      <label className="ui-label">Product or service name *</label>
      <input className="ui-input" placeholder="e.g. Rice 50kg bag" value={pName} onChange={e => setPName(e.target.value)} />

      <label className="ui-label">Price</label>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <select className="ui-input" value={pCurrency} onChange={e => setPCurrency(e.target.value)} style={{ marginBottom: 0, width: '120px', flexShrink: 0 }}>
          <option value="NGN">NGN ₦</option>
          <option value="USD">USD $</option>
          <option value="GBP">GBP £</option>
          <option value="EUR">EUR €</option>
          <option value="GHS">GHS ₵</option>
        </select>
        <input className="ui-input" placeholder="Price" value={pPrice} onChange={e => setPPrice(e.target.value)} type="number" style={{ marginBottom: 0, flex: 1 }} />
      </div>

      <label className="ui-label">Description</label>
      <textarea className="ui-input" placeholder="Short description" value={pDesc} onChange={e => setPDesc(e.target.value)} style={{ minHeight: '110px' }} />

      {error && <div className="ui-error"><p>{error}</p></div>}

      <button onClick={handleSave} disabled={saving} className="ui-btn ui-block">
        {uploadingImage ? 'Uploading image...' : saving ? 'Saving...' : 'Save changes'}
      </button>
    </div>
  )
}
