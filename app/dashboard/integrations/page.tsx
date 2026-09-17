'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { getBusinessTier } from '../../../lib/tiers'
import { getActingContext, ActingContext } from '../../../lib/permissions'
import Link from 'next/link'

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
  const [context, setContext] = useState<ActingContext | null>(null)
  const [tierLimits, setTierLimits] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState<Record<string, SavedIntegration>>({})
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    const currentUser = userData?.user
    if (!currentUser) { window.location.href = '/auth'; return }

    const ctx = await getActingContext(currentUser.id)
    if (!ctx) { window.location.href = '/onboarding'; return }
    setContext(ctx)

    const { limits } = await getBusinessTier(ctx.ownerId)
    setTierLimits(limits)

    if (limits.integrations) {
      const { data: integrationsData } = await supabase
        .from('business_integrations')
        .select('integration_key, status, config')
        .eq('user_id', ctx.ownerId)

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
    if (!context || !activeKey) return
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
    if (!context) return
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
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#0F172A', fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  if (!context?.isOwner) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
        <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Integrations</div>
          <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</Link>
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 16px', textAlign: 'center' }}>
          <p style={{ color: '#64748B', fontSize: '13px' }}>Only the business owner can manage integrations.</p>
        </div>
      </div>
    )
  }

  if (!tierLimits?.integrations) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
        <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Integrations</div>
          <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</Link>
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>🔌</div>
            <h2 style={{ color: '#0F172A', fontSize: '16px', marginBottom: '8px' }}>Integrations is an Advanced plan feature</h2>
            <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>
              Connect WhatsApp Business API, Facebook & Instagram Shop, analytics tools, and custom webhooks by upgrading to the Advanced plan.
            </p>
            <Link href="/dashboard/billing" style={{ display: 'inline-block', background: '#0F172A', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              Upgrade to Advanced
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const categories = Array.from(new Set(INTEGRATIONS.map(i => i.category)))
  const activeDef = INTEGRATIONS.find(i => i.key === activeKey)

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Integrations</div>
        <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</Link>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
        <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>
          Connect external tools to automate your marketing, messaging, and analytics.
        </p>

        {error && !activeKey && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
            <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>{error}</p>
          </div>
        )}

        {categories.map(category => (
          <div key={category} style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#94A3B8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: '10px', letterSpacing: '0.5px' }}>
              {category}
            </h3>
            {INTEGRATIONS.filter(i => i.category === category).map(def => {
              const isConnected = saved[def.key]?.status === 'connected'
              return (
                <div key={def.key} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ color: '#0F172A', fontWeight: 700, fontSize: '13px' }}>{def.name}</div>
                        {isConnected && (
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}>Connected</span>
                        )}
                      </div>
                      <p style={{ color: '#64748B', fontSize: '12px', lineHeight: 1.4, margin: 0 }}>{def.description}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      onClick={() => openConnect(def)}
                      style={{ background: isConnected ? '#fff' : '#0F172A', color: isConnected ? '#0F172A' : '#fff', border: '1px solid ' + (isConnected ? '#E2E8F0' : '#0F172A'), borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      {isConnected ? 'Manage' : 'Connect'}
                    </button>
                    {isConnected && (
                      <button
                        onClick={() => disconnectIntegration(def.key)}
                        style={{ background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
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
      </div>

      {activeDef && (
        <div
          onClick={closeModal}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: '480px', padding: '20px', maxHeight: '85vh', overflowY: 'auto' as const }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#0F172A', fontSize: '15px', fontWeight: 800, margin: 0 }}>{activeDef.name}</h3>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#94A3B8' }}>✕</button>
            </div>

            <p style={{ color: '#64748B', fontSize: '12px', marginBottom: '16px', lineHeight: 1.5 }}>{activeDef.description}</p>

            {activeDef.fields.map(field => (
              <div key={field.key} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', color: '#475569', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formValues[field.key] || ''}
                  onChange={e => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px', color: '#0F172A', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const }}
                />
              </div>
            ))}

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
                <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>{error}</p>
              </div>
            )}

            <button
              onClick={saveIntegration}
              disabled={saving}
              style={{ width: '100%', background: '#0F172A', color: '#fff', border: 'none', borderRadius: '8px', padding: '13px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {saving ? 'Saving...' : 'Save & Connect'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
