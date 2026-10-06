'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { useDashboard } from '../../components/DashboardShell'

type IntegrationField = {
  key: string
  label: string
  placeholder: string
  type: 'text' | 'url' | 'password'
}

type IntegrationDefinition = {
  key: string
  name: string
  category: string
  description: string
  fields: IntegrationField[]
}

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
    fields: [
      { key: 'measurement_id', label: 'Measurement ID', placeholder: 'e.g. G-XXXXXXXXXX', type: 'text' },
    ],
  },
  {
    key: 'tiktok_pixel',
    name: 'TikTok Pixel',
    category: 'Analytics',
    description: 'Track store visits and WhatsApp clicks driven by your TikTok ads.',
    fields: [
      { key: 'pixel_id', label: 'Pixel ID', placeholder: 'e.g. CXXXXXXXXXXXXXXXXXXX', type: 'text' },
    ],
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
    fields: [
      { key: 'webhook_url', label: 'Webhook URL', placeholder: 'https://yourserver.com/webhook', type: 'url' },
    ],
  },
]

type SavedIntegration = {
  integration_key: string
  status: 'connected' | 'disconnected'
  config: Record<string, string>
}

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
      for (const row of integrationsData || []) {
        map[row.integration_key] = row as SavedIntegration
      }
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
      if (!formValues[field.key]?.trim()) {
        setError(`${field.label} is required`)
        return
      }
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

    if (upsertError) {
      setError(upsertError.message || 'Could not save integration')
      return
    }

    setSaved(prev => ({
      ...prev,
      [activeKey]: { integration_key: activeKey, status: 'connected', config: formValues },
    }))
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

    setSaved(prev => ({
      ...prev,
      [key]: { ...prev[key], status: 'disconnected' },
    }))
  }

  if (loading) {
    return (
      <div style={{ padding: '24px 0' }}>
        <p style={mutedStyle}>Loading...</p>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div style={{ padding: '24px 0' }}>
        <p style={mutedStyle}>Only the business owner can manage integrations.</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={wrapStyle}>
        <h1 style={titleStyle}>Integrations</h1>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '10px' }}>🔌</div>
          <h2 style={{ color: '#0F172A', fontSize: '16px', marginBottom: '8px' }}>Integrations are not included in your plan</h2>
          <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
            You&rsquo;re currently on the {tierName} plan. Upgrade to connect WhatsApp Business API, Facebook &amp; Instagram Shop, analytics tools, and custom webhooks.
          </p>
          <Link href="/dashboard/billing" style={primaryButtonStyle}>View Plans</Link>
        </div>
      </div>
    )
  }

  const categories = Array.from(new Set(INTEGRATIONS.map(i => i.category)))
  const activeDef = INTEGRATIONS.find(i => i.key === activeKey)

  return (
    <div style={{ ...wrapStyle, maxWidth: '600px' }}>
      <h1 style={titleStyle}>Integrations</h1>
      <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
        Connect external tools to automate your marketing, messaging, and analytics.
      </p>

      {categories.map(category => (
        <div key={category} style={{ marginBottom: '24px' }}>
          <h2 style={{ color: '#475569', fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>
            {category}
          </h2>
          {INTEGRATIONS.filter(i => i.category === category).map(def => {
            const isConnected = saved[def.key]?.status === 'connected'
            return (
              <div key={def.key} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <div style={{ color: '#0F172A', fontWeight: 700, fontSize: '14px' }}>{def.name}</div>
                  {isConnected && (
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}>Connected</span>
                  )}
                </div>
                <p style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.45, margin: 0 }}>{def.description}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={() => openConnect(def)}
                    style={{
                      background: isConnected ? '#fff' : '#0F172A',
                      color: isConnected ? '#0F172A' : '#fff',
                      border: '1px solid ' + (isConnected ? '#E2E8F0' : '#0F172A'),
                      borderRadius: '6px',
                      padding: '8px 16px',
                      minHeight: '36px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {isConnected ? 'Manage' : 'Connect'}
                  </button>
                  {isConnected && (
                    <button
                      onClick={() => disconnectIntegration(def.key)}
                      style={{
                        background: 'transparent',
                        color: '#DC2626',
                        border: '1px solid #FCA5A5',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        minHeight: '36px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}

      {activeDef && (
        <div
          onClick={closeModal}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 80 }}
        >
          <div
            role="dialog"
            aria-label={activeDef.name}
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: '480px', padding: '20px', maxHeight: '85vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#0F172A', fontSize: '16px', fontWeight: 800, margin: 0 }}>{activeDef.name}</h3>
              <button
                onClick={closeModal}
                aria-label="Close"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748B', minWidth: '36px', minHeight: '36px' }}
              >✕</button>
            </div>

            <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '16px', lineHeight: 1.5 }}>{activeDef.description}</p>

            {activeDef.fields.map(field => (
              <div key={field.key} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', color: '#475569', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formValues[field.key] || ''}
                  onChange={e => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  style={{ width: '100%', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px', color: '#0F172A', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
            ))}

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
                <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{error}</p>
              </div>
            )}

            <button
              onClick={saveIntegration}
              disabled={saving}
              style={{ width: '100%', background: '#0F172A', color: '#fff', border: 'none', borderRadius: '8px', padding: '13px', minHeight: '44px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {saving ? 'Saving...' : 'Save and connect'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const wrapStyle: React.CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  fontFamily: 'Segoe UI, system-ui, sans-serif',
}

const titleStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 800,
  color: '#0F172A',
  margin: '0 0 14px',
  letterSpacing: '-0.01em',
}

const mutedStyle: React.CSSProperties = { color: '#64748B', fontSize: '14px' }

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
