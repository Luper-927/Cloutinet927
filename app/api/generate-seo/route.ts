'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../../lib/supabase'
import Link from 'next/link'

const OBJECTIVES = [
  'Get more enquiries',
  'Promote a product',
  'Increase WhatsApp conversations',
  'Increase page visits',
  'Promote an offer',
  'Build awareness',
]

export default function NewCampaignPage() {
  const [name, setName] = useState('')
  const [objective, setObjective] = useState(OBJECTIVES[0])
  const [destinationType, setDestinationType] = useState<'product' | 'business'>('business')
  const [productId, setProductId] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [body, setBody] = useState('')
  const [cta, setCta] = useState('Message us on WhatsApp')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const [{ data: profileData }, { data: productsData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userData.user.id).single(),
      supabase.from('products').select('id, name, price, currency, description').eq('user_id', userData.user.id).eq('is_published', true),
    ])
    setProfile(profileData)
    setProducts(productsData || [])
  }

  async function generateCopy() {
    if (!name.trim()) { setError('Give your campaign a name first'); return }
    setGenerating(true)
    setError('')

    const selectedProduct = products.find(p => p.id === productId)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      if (!accessToken) {
        setError('Your session expired. Please refresh the page and try again.')
        setGenerating(false)
        return
      }

      const response = await fetch('/api/generate-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          type: 'campaign_copy',
          businessName: profile?.business_name,
          category: profile?.business_category,
          location: profile?.location,
          campaignName: name,
          objective,
          productName: selectedProduct?.name,
          price: selectedProduct?.price,
          currency: selectedProduct?.currency,
        }),
      })
      const data = await response.json()
      if (data.result) setBody(data.result)
      else setError(data.error || 'Could not generate copy. Try again.')
    } catch (e) {
      setError('Could not generate copy. Please try again.')
    }
    setGenerating(false)
  }

  async function handleSave(status: 'draft' | 'active') {
    if (!name.trim()) { setError('Campaign name is required'); return }
    setSaving(true)
    setError('')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const { data: campaign, error: campaignError } = await supabase.from('campaigns').insert({
      user_id: userData.user.id,
      name,
      objective,
      status,
      destination_type: destinationType,
      destination_id: destinationType === 'product' ? productId : null,
    }).select().single()

    if (campaignError || !campaign) {
      setSaving(false)
      setError(campaignError?.message || 'Could not save campaign')
      return
    }

    await supabase.from('campaign_content').insert({
      campaign_id: campaign.id,
      content_type: 'promotional_post',
      title: name,
      body,
      cta,
    })

    setSaving(false)
    window.location.href = '/dashboard/marketing'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>New Campaign</div>
        <Link href="/dashboard/marketing" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Cancel</Link>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>

        <label style={labelStyle}>Campaign Name *</label>
        <input placeholder="e.g. Weekend Furniture Sale" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Objective</label>
        <select value={objective} onChange={e => setObjective(e.target.value)} style={inputStyle}>
          {OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
        </select>

        <label style={labelStyle}>Promote</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button onClick={() => setDestinationType('business')} style={{ ...toggleStyle, ...(destinationType === 'business' ? toggleActive : {}) }}>My Business Page</button>
          <button onClick={() => setDestinationType('product')} style={{ ...toggleStyle, ...(destinationType === 'product' ? toggleActive : {}) }}>A Specific Product</button>
        </div>

        {destinationType === 'product' && (
          <>
            <label style={labelStyle}>Select Product</label>
            <select value={productId} onChange={e => setProductId(e.target.value)} style={inputStyle}>
              <option value="">Choose a product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </>
        )}

        <label style={labelStyle}>Campaign Message</label>
        <textarea placeholder="Write your promotional message..." value={body} onChange={e => setBody(e.target.value)} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' as const }} />
        <button onClick={generateCopy} disabled={generating} style={aiButtonStyle}>
          {generating ? '⏳ Generating...' : '✨ Generate Copy with AI'}
        </button>

        <label style={{ ...labelStyle, marginTop: '16px' }}>Call to Action</label>
        <input value={cta} onChange={e => setCta(e.target.value)} style={inputStyle} />

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
            <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>{error}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button onClick={() => handleSave('draft')} disabled={saving} style={{ flex: 1, background: '#fff', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '13px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Save as Draft</button>
          <button onClick={() => handleSave('active')} disabled={saving} style={{ flex: 1, background: '#0F172A', color: '#fff', border: 'none', borderRadius: '8px', padding: '13px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{saving ? 'Saving...' : 'Launch Campaign'}</button>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', color: '#475569', fontSize: '12px', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }
const inputStyle: React.CSSProperties = { width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px', color: '#0F172A', fontSize: '14px', marginBottom: '16px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const aiButtonStyle: React.CSSProperties = { width: '100%', background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A', borderRadius: '8px', padding: '11px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: '16px' }
const toggleStyle: React.CSSProperties = { flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const toggleActive: React.CSSProperties = { background: '#0F172A', color: '#fff', border: '1px solid #0F172A' }
