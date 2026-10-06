'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { useDashboard } from '../../components/DashboardShell'

type Stats = { views: number; ctaClicks: number; whatsappClicks: number }

export default function MarketingPage() {
  const { context, tierLimits } = useDashboard()

  const noPermission = !context.permissions.marketing
  const hasAccess = !!tierLimits?.marketingAutomation
  const tierName = tierLimits?.name || 'Free'

  const [campaigns, setCampaigns] = useState<any[]>([])
  const [eventStats, setEventStats] = useState<Record<string, Stats>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    if (noPermission || !hasAccess) {
      setLoading(false)
      return
    }

    const { data: campaignData } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', context.ownerId)
      .order('created_at', { ascending: false })
    setCampaigns(campaignData || [])

    if (campaignData && campaignData.length > 0) {
      const campaignIds = campaignData.map(c => c.id)
      const { data: events } = await supabase
        .from('campaign_events')
        .select('campaign_id, event_type')
        .in('campaign_id', campaignIds)

      const stats: Record<string, Stats> = {}
      ;(events || []).forEach((e: any) => {
        if (!stats[e.campaign_id]) stats[e.campaign_id] = { views: 0, ctaClicks: 0, whatsappClicks: 0 }
        if (e.event_type === 'view') stats[e.campaign_id].views++
        if (e.event_type === 'cta_click') stats[e.campaign_id].ctaClicks++
        if (e.event_type === 'whatsapp_click') stats[e.campaign_id].whatsappClicks++
      })
      setEventStats(stats)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div style={{ padding: '24px 0' }}>
        <p style={mutedStyle}>Loading...</p>
      </div>
    )
  }

  if (noPermission) {
    return (
      <div style={{ padding: '24px 0' }}>
        <p style={mutedStyle}>You don&rsquo;t have permission to view marketing.</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={wrapStyle}>
        <h1 style={titleStyle}>Marketing</h1>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '10px' }}>📣</div>
          <h2 style={{ color: '#0F172A', fontSize: '16px', marginBottom: '8px' }}>Marketing is not included in your plan</h2>
          <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
            You&rsquo;re currently on the {tierName} plan. Upgrade to create AI-generated promotional campaigns and track views, clicks, and WhatsApp conversions.
          </p>
          <Link href="/dashboard/billing" style={primaryButtonStyle}>View Plans</Link>
        </div>
      </div>
    )
  }

  const activeCampaigns = campaigns.filter(c => c.status === 'active')
  const draftCampaigns = campaigns.filter(c => c.status === 'draft')
  const completedCampaigns = campaigns.filter(c => c.status === 'completed')

  const totals = Object.values(eventStats).reduce(
    (acc, s) => ({
      views: acc.views + s.views,
      ctaClicks: acc.ctaClicks + s.ctaClicks,
      whatsappClicks: acc.whatsappClicks + s.whatsappClicks,
    }),
    { views: 0, ctaClicks: 0, whatsappClicks: 0 }
  )

  const hasEnoughData = campaigns.length > 0 && totals.views > 0

  return (
    <div style={wrapStyle}>
      <h1 style={titleStyle}>Marketing</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div style={countCardStyle}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#D97706' }}>{activeCampaigns.length}</div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>Active</div>
        </div>
        <div style={countCardStyle}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#64748B' }}>{draftCampaigns.length}</div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>Drafts</div>
        </div>
        <div style={countCardStyle}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F766E' }}>{completedCampaigns.length}</div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>Completed</div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '10px' }}>Overview</div>
        {!hasEnoughData ? (
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>Not enough data yet</p>
        ) : (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: '#334155' }}>
            <span>Views: <b>{totals.views}</b></span>
            <span>CTA clicks: <b>{totals.ctaClicks}</b></span>
            <span>WhatsApp: <b>{totals.whatsappClicks}</b></span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Campaigns</h2>
        <Link href="/dashboard/marketing/campaigns/new" style={smallPrimaryStyle}>+ New campaign</Link>
      </div>

      {campaigns.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
          <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '12px' }}>No campaigns yet</p>
          <Link href="/dashboard/marketing/campaigns/new" style={primaryButtonStyle}>Create your first campaign</Link>
        </div>
      ) : (
        campaigns.map(c => {
          const s = eventStats[c.id] || { views: 0, ctaClicks: 0, whatsappClicks: 0 }
          return (
            <div key={c.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{c.name}</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 10px',
                  borderRadius: '999px',
                  height: 'fit-content',
                  background: c.status === 'active' ? '#FFFBEB' : c.status === 'completed' ? '#F0FDFA' : '#F8FAFC',
                  color: c.status === 'active' ? '#D97706' : c.status === 'completed' ? '#0F766E' : '#64748B',
                }}>{c.status}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>{c.objective}</div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: '#64748B' }}>
                <span>{s.views} views</span>
                <span>{s.ctaClicks} CTA clicks</span>
                <span>{s.whatsappClicks} WhatsApp</span>
              </div>
            </div>
          )
        })
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

const mutedStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '14px',
}

const countCardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: '10px',
  padding: '12px',
  textAlign: 'center',
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

const smallPrimaryStyle: React.CSSProperties = {
  background: '#0F172A',
  color: '#fff',
  padding: '10px 16px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 700,
}
