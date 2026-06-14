'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function EditProductPage() {
  const params = useParams()
  const productId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [pName, setPName] = useState('')
  const [pPrice, setPPrice] = useState('')
  const [pCurrency, setPCurrency] = useState('NGN')
  const [pDesc, setPDesc] = useState('')
  const [pImage, setPImage] = useState<string | null>(null)

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
    setUser(currentUser)

    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('user_id', currentUser.id)
      .single()

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

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = function (ev) {
      setPImage(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    if (!user) return
    if (!pName.trim()) {
      setError('Product name is required')
      return
    }

    setSaving(true)
    setError('')

    const { error: dbError } = await supabase
      .from('products')
      .update({
        name: pName,
        description: pDesc,
        price: pPrice ? parseFloat(pPrice) : null,
        currency: pCurrency,
        image_url: pImage,
      })
      .eq('id', productId)
      .eq('user_id', user.id)

    setSaving(false)

    if (dbError) {
      setError(dbError.message)
      return
    }

    window.location.href = '/dashboard'
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#07070f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#FF6B35' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#0f0f1a', borderBottom: '1px solid #252535' }}>
        <Link href="/dashboard" style={{ color: '#8888aa', textDecoration: 'none', fontSize: '13px' }}>← Dashboard</Link>
        <div style={{ color: '#f0f0ff', fontWeight: 700, fontSize: '14px' }}>Edit Product</div>
        <div style={{ width: '60px' }}></div>
      </div>

      <div style={{ maxWidth: '420px', margin: '0 auto', padding: '16px' }}>

        <label style={{ display: 'block', marginBottom: '14px' }}>
          <div style={{
            border: '1px dashed #252535', borderRadius: '12px',
            height: pImage ? 'auto' : '120px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', overflow: 'hidden', background: '#161625'
          }}>
            {pImage ? (
              <img src={pImage} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#8888aa', fontSize: '13px' }}>📷 Tap to add photo</span>
            )}
          </div>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
        </label>

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

        {error && <p style={{ color: '#ff4444', fontSize: '12px', marginBottom: '12px' }}>{error}</p>}

        <button onClick={handleSave} disabled={saving} style={{
          width: '100%', background: 'linear-gradient(135deg, #FF6B35, #E91E8C)',
          color: '#fff', border: 'none', borderRadius: '10px',
          padding: '14px', cursor: 'pointer', fontSize: '14px', fontWeight: 700,
          fontFamily: 'inherit', opacity: saving ? 0.7 : 1
        }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#8888aa', fontSize: '11px',
  fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px'
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#161625', border: '1px solid #252535',
  borderRadius: '10px', padding: '12px 14px', color: '#f0f0ff',
  fontSize: '14px', marginBottom: '16px', outline: 'none', fontFamily: 'inherit'
}
