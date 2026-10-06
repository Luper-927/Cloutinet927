'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../../lib/supabase'
import { useDashboard } from '../../../../components/DashboardShell'

const OBJECTIVES = [
  'Get more enquiries',
  'Promote a product',
  'Increase WhatsApp conversations',
  'Increase page visits',
  'Promote an offer',
  'Build awareness',
]

export default function NewCampaignPage() {
  const router = useRouter()
  const { context, profile, tierLimits } = useDashboard()

  const noPermission = !context.permissions.marketing
  const hasAccess = !!tierLimits?.marketingAutomation
  const tierName = tierLimits?.name || 'Free'

  const [name, setName] = useState('')
  const [objective, setObjective] = useState(OBJECTIVES[0])
  const [destinationType, setDestinationType] = useState<'product' | 'business'>('business')
  const [productId, setProductId] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [body, setBody] = useState('')
  const [cta, setCta] = useState('Message us on WhatsApp')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (noPermission || !hasAccess) return
    supabase
      .from('products')
      .select('id, name, price, currency, description')
      .eq('user_id', context.ownerId)
      .eq('is_published', true)
      .then(({ data }) => setProducts(data || []))
  }, [])

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

    const { data: campaign, error: campaignError } = await supabase.from('campaigns').insert({
      user_id: context.ownerId,
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
    router.push('/dashboard/marketing')
  }

  if (noPermission) {
    return (
      <div style={{ padding: '24px 0' }}>
        <p style={mutedStyle}>You don&rsquo;t have permission to create campaigns.</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={wrapStyle}>
        <Link href="/dashboard/marketing" style={backStyle}>Back to marketing</Link>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '10px' }}>📣</div>
          <h2 style={{ color: '#0F172A', fontSize: '16px', marginBottom: '8px' }}>Marketing is not included in your plan</h2>
          <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
            You&rsquo;re currently on the {tierName} plan. Upgrade to create AI-generated campaigns.
          </p>
          <Link href="/dashboard/billing" style={primaryButtonStyle}>View Plans</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <Link href="/dashboard/marketing" style={backStyle}>Back to marketing</Link>
      <h1 style={titleStyle}>New campaign</h1>

      <label style={labelStyle}>Campaign name *</label>
      <input placeholder="e.g. Weekend Furniture Sale" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />

      <label style={labelStyle}>Objective</label>
      <select value={objective} onChange={e => setObjective(e.target.value)} style={inputStyle}>
        {OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
      </select>

      <label style={labelStyle}>Promote</label>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button onClick={() => setDestinationType('business')} style={{ ...toggleStyle, ...(destinationType === 'business' ? toggleActive : {}) }}>My business page</button>
        <button onClick={() => setDestinationType('product')} style={{ ...toggleStyle, ...(destinationType === 'product' ? toggleActive : {}) }}>A specific product</button>
      </div>

      {destinationType === 'product' && (
        <>
          <label style={labelStyle}>Select product</label>
          <select value={productId} onChange={e => setProductId(e.target.value)} style={inputStyle}>
            <option value="">Choose a product</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </>
      )}

      <label style={labelStyle}>Campaign message</label>
      <textarea
        placeholder="Write your promotional message..."
        value={body}
        onChange={e => setBody(e.target.value)}
        style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
      />
      <button onClick={generateCopy} disabled={generating} style={aiButtonStyle}>
        {generating ? 'Generating...' : 'Generate copy with AI'}
      </button>

      <label style={{ ...labelStyle, marginTop: '16px' }}>Call to action</label>
      <input value={cta} onChange={e => setCta(e.target.value)} style={inputStyle} />

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
          <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button
          onClick={() => handleSave('draft')}
          disabled={saving}
          style={{ flex: 1, background: '#fff', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '13px', minHeight: '44px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Save as draft
        </button>
        <button
          onClick={() => handleSave('active')}
          disabled={saving}
          style={{ flex: 1, background: '#0F172A', color: '#fff', border: 'none', borderRadius: '8px', padding: '13px', minHeight: '44px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {saving ? 'Saving...' : 'Launch campaign'}
        </button>
      </div>
    </div>
  )
}

const wrapStyle: React.CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  fontFamily: 'Segoe UI, system-ui, sans-serif',
}

const backStyle: React.CSSProperties = {
  display: 'inline-block',
  color: '#475569',
  fontSize: '13px',
  textDecoration: 'none',
  marginBottom: '12px',
  padding: '6px 0',
}

const titleStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 800,
  color: '#0F172A',
  margin: '0 0 18px',
  letterSpacing: '-0.01em',
}

const mutedStyle: React.CSSProperties = { color: '#64748B', fontSize: '14px' }

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#475569',
  fontSize: '13px',
  fontWeight: 600,
  marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  padding: '12px 14px',
  color: '#0F172A',
  fontSize: '14px',
  marginBottom: '16px',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const aiButtonStyle: React.CSSProperties = {
  width: '100%',
  background: '#FFFBEB',
  color: '#92400E',
  border: '1px solid #FDE68A',
  borderRadius: '8px',
  padding: '11px',
  minHeight: '44px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
  marginBottom: '16px',
}

const toggleStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px',
  minHeight: '44px',
  borderRadius: '8px',
  border: '1px solid #E2E8F0',
  background: '#fff',
  color: '#64748B',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
}

const toggleActive: React.CSSProperties = {
  background: '#0F172A',
  color: '#fff',
  border: '1px solid #0F172A',
}

const primaryButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  background: '#0F172A',
  color: '#fff',
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 700,
}
