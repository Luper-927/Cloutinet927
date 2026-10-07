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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
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
    return <div className="ui-wrap"><p className="ui-sub">You don&rsquo;t have permission to create campaigns.</p></div>
  }

  if (!hasAccess) {
    return (
      <div className="ui-wrap">
        <Link href="/dashboard/marketing" className="ui-back">Back to marketing</Link>
        <div className="ui-upgrade">
          <h2>Marketing is not included in your plan</h2>
          <p>You&rsquo;re currently on the {tierName} plan. Upgrade to create AI-generated campaigns.</p>
          <Link href="/dashboard/billing" className="ui-btn">View plans</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="ui-wrap">
      <Link href="/dashboard/marketing" className="ui-back">Back to marketing</Link>
      <h1 className="ui-title">New campaign</h1>

      <label className="ui-label">Campaign name *</label>
      <input className="ui-input" placeholder="e.g. Weekend Furniture Sale" value={name} onChange={e => setName(e.target.value)} />

      <label className="ui-label">Objective</label>
      <select className="ui-input" value={objective} onChange={e => setObjective(e.target.value)}>
        {OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
      </select>

      <label className="ui-label">Promote</label>
      <div className="ui-pills" style={{ marginBottom: '16px' }}>
        <button onClick={() => setDestinationType('business')} className={'ui-pill' + (destinationType === 'business' ? ' is-on' : '')}>My business page</button>
        <button onClick={() => setDestinationType('product')} className={'ui-pill' + (destinationType === 'product' ? ' is-on' : '')}>A specific product</button>
      </div>

      {destinationType === 'product' && (
        <>
          <label className="ui-label">Select product</label>
          <select className="ui-input" value={productId} onChange={e => setProductId(e.target.value)}>
            <option value="">Choose a product</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </>
      )}

      <label className="ui-label">Campaign message</label>
      <textarea className="ui-input tight" style={{ minHeight: '110px' }} placeholder="Write your promotional message..." value={body} onChange={e => setBody(e.target.value)} />
      <button onClick={generateCopy} disabled={generating} className="ui-btn ui-btn-ghost ui-block" style={{ marginBottom: '20px' }}>
        {generating ? 'Generating...' : 'Generate copy with AI'}
      </button>

      <label className="ui-label">Call to action</label>
      <input className="ui-input" value={cta} onChange={e => setCta(e.target.value)} />

      {error && <div className="ui-error"><p>{error}</p></div>}

      <div className="ui-actions">
        <button onClick={() => handleSave('draft')} disabled={saving} className="ui-btn ui-btn-ghost">Save as draft</button>
        <button onClick={() => handleSave('active')} disabled={saving} className="ui-btn">{saving ? 'Saving...' : 'Launch campaign'}</button>
      </div>
    </div>
  )
}
