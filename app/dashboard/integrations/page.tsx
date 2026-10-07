'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { useDashboard } from '../../components/DashboardShell'

type IntegrationField = { key: string; label: string; placeholder: string; type: 'text' | 'url' | 'password' }
type IntegrationDefinition = { key: string; name: string; category: string; description: string; fields: IntegrationField[] }

const INTEGRATIONS: IntegrationDefinition[] = [
  {
    key: 'whatsapp_business_api',
    name: 'WhatsApp Business API',
    category: 'Messaging',
    description: 'Auto-reply to customer enquiries and sync your product catalog directly to WhatsApp.',
    fields: [
      { key: 'phone_number_id', label: 'Phone Number ID', placeholder: 'e.g. 109273726...', type: 'text' },
      { key: 'access_token', label: 'Access Token', placeholder: 'Meta system user token', type: 'password' },
    ],
  },
  {
    key: 'facebook_instagram',
    name: 'Facebook & Instagram Shop',
    category: 'Social Commerce',
    description: 'Sync your published products to your Facebook Page and Instagram Shop automatically.',
    fields: [
      { key: 'page_id', label: 'Facebook Page ID', placeholder: 'e.g. 61234567890', type: 'text' },
      { key: 'access_token', label: 'Page Access Token', placeholder: 'Meta page access token', type: 'password' },
    ],
  },
  {
    key: 'google_analytics',
    name: 'Google Analytics',
    category: 'Analytics',
    description: 'Track visitor behavior on your store page with your own GA4 property.',
    fields: [{ key: 'measurement_id', label: 'Measurement ID', placeholder: 'e.g. G-XXXXXXXXXX', type: 'text' }],
  },
  {
    key: 'tiktok_pixel',
    name: 'TikTok Pixel',
    category: 'Analytics',
    description: 'Track store visits and WhatsApp clicks driven by your TikTok ads.',
    fields: [{ key: 'pixel_id', label: 'Pixel ID', placeholder: 'e.g. CXXXXXXXXXXXXXXXXXXX', type: 'text' }],
  },
  {
    key: 'mailchimp',
    name: 'Mailchimp',
    category: 'Email Marketing',
    description: 'Automatically add new WhatsApp leads to a Mailchimp audience for follow-up campaigns.',
    fields: [
      { key: 'api_key', label: 'API Key', placeholder: 'e.g. abc123-us21', type: 'password' },
      { key: 'audience_id', label: 'Audience ID', placeholder: 'e.g. a1b2c3d4e5', type: 'text' },
    ],
  },
  {
    key: 'webhook',
    name: 'Custom Webhook',
    category: 'Developer',
    description: 'Send a real-time HTTP POST to your own server whenever a new lead or order comes in.',
    fields: [{ key: 'webhook_url', label: 'Webhook URL', placeholder: 'https://yourserver.com/webhook', type: 'url' }],
  },
]

type SavedIntegration = { integration_key: string; status: 'connected' | 'disconnected'; config: Record<string, string> }

export default function IntegrationsPage() {
  const { context, tierLimits } = useDashboard()

  const isOwner = !!context.isOwner
  const hasAccess = !!tierLimits?.integrations
  const tierName = tierLimits?.name || 'Free'

  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState<Record<string, SavedIntegration>>({})
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    if (isOwner && hasAccess) {
      const { data: integrationsData } = await supabase
        .from('business_integrations')
        .select('integration_key, status, config')
        .eq('user_id', context.ownerId)

      const map: Record<string, SavedIntegration> = {}
      for (const row of integrationsData || []) map[row.integration_key] = row as SavedIntegration
      setSaved(map)
    }
    setLoading(false)
  }

  function openConnect(def: IntegrationDefinition) {
    const existing = saved[def.key]?.config || {}
    const initialValues: Record<string, string> = {}
    def.fields.forEach(f => { initialValues[f.key] = existing[f.key] || '' })
    setFormValues(initialValues)
    setActiveKey(def.key)
    setError('')
  }

  function closeModal() {
    setActiveKey(null)
    setFormValues({})
    setError('')
  }

  async function saveIntegration() {
    if (!activeKey) return
    const def = INTEGRATIONS.find(i => i.key === activeKey)
    if (!def) return

    for (const field of def.fields) {
      if (!formValues[field.key]?.trim()) { setError(`${field.label} is required`); return }
    }

    setSaving(true)
    setError('')

    const { error: upsertError } = await supabase
      .from('business_integrations')
      .upsert({
        user_id: context.ownerId,
        integration_key: activeKey,
        status: 'connected',
        config: formValues,
        connected_at: new Date().toISOString(),
      }, { onConflict: 'user_id,integration_key' })

    setSaving(false)

    if (upsertError) { setError(upsertError.message || 'Could not save integration'); return }

    setSaved(prev => ({ ...prev, [activeKey]: { integration_key: activeKey, status: 'connected', config: formValues } }))
    closeModal()
  }

  async function disconnectIntegration(key: string) {
    const confirmed = confirm('Disconnect this integration?')
    if (!confirmed) return

    await supabase
      .from('business_integrations')
      .update({ status: 'disconnected' })
      .eq('user_id', context.ownerId)
      .eq('integration_key', key)

    setSaved(prev => ({ ...prev, [key]: { ...prev[key], status: 'disconnected' } }))
  }

  if (loading) return <div className="ui-wrap"><p className="ui-sub">Loading...</p></div>

  if (!isOwner) {
    return <div className="ui-wrap"><p className="ui-sub">Only the business owner can manage integrations.</p></div>
  }

  if (!hasAccess) {
    return (
      <div className="ui-wrap">
        <h1 className="ui-title">Integrations</h1>
        <div className="ui-upgrade">
          <h2>Integrations are not included in your plan</h2>
          <p>You&rsquo;re currently on the {tierName} plan. Upgrade to connect WhatsApp Business API, Facebook &amp; Instagram Shop, analytics tools, and custom webhooks.</p>
          <Link href="/dashboard/billing" className="ui-btn">View plans</Link>
        </div>
      </div>
    )
  }

  const categories = Array.from(new Set(INTEGRATIONS.map(i => i.category)))
  const activeDef = INTEGRATIONS.find(i => i.key === activeKey)

  return (
    <div className="ui-wrap">
      <h1 className="ui-title">Integrations</h1>
      <p className="ui-sub">Connect external tools to automate your marketing, messaging, and analytics.</p>

      {categories.map(category => (
        <div key={category} style={{ marginBottom: '8px' }}>
          <div className="ui-section-label">{category}</div>
          <div className="ui-list">
            {INTEGRATIONS.filter(i => i.category === category).map(def => {
              const isConnected = saved[def.key]?.status === 'connected'
              return (
                <div key={def.key} className="ui-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span className="ui-name">{def.name}</span>
                    {isConnected && <span className="ui-badge ui-badge-good">Connected</span>}
                  </div>
                  <p className="ui-meta" style={{ margin: 0, lineHeight: 1.45 }}>{def.description}</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button onClick={() => openConnect(def)} className={'ui-btn ui-btn-sm' + (isConnected ? ' ui-btn-ghost' : '')}>
                      {isConnected ? 'Manage' : 'Connect'}
                    </button>
                    {isConnected && (
                      <button onClick={() => disconnectIntegration(def.key)} className="ui-btn ui-btn-danger ui-btn-sm">Disconnect</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {activeDef && (
        <div
          onClick={closeModal}
          style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 80 }}
        >
          <div
            role="dialog"
            aria-label={activeDef.name}
            onClick={e => e.stopPropagation()}
            style={{ background: '#0F1433', border: '1px solid rgba(255,255,255,.12)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '480px', padding: '20px', maxHeight: '85vh', overflowY: 'auto' }}
          >
            <div className="ui-between" style={{ alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ color: '#fff', fontSize: '17px', fontWeight: 800, margin: 0 }}>{activeDef.name}</h3>
              <button onClick={closeModal} aria-label="Close" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#94A3B8', minWidth: '36px', minHeight: '36px' }}>✕</button>
            </div>

            <p className="ui-sub" style={{ fontSize: '13px' }}>{activeDef.description}</p>

            {activeDef.fields.map(field => (
              <div key={field.key}>
                <label className="ui-label">{field.label}</label>
                <input
                  className="ui-input"
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formValues[field.key] || ''}
                  onChange={e => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                />
              </div>
            ))}

            {error && <div className="ui-error"><p>{error}</p></div>}

            <button onClick={saveIntegration} disabled={saving} className="ui-btn ui-block">
              {saving ? 'Saving...' : 'Save and connect'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
