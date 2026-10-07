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
    if (noPermission || !hasAccess) { setLoading(false); return }

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

  if (loading) return <div className="ui-wrap"><p className="ui-sub">Loading...</p></div>

  if (noPermission) {
    return <div className="ui-wrap"><p className="ui-sub">You don&rsquo;t have permission to view marketing.</p></div>
  }

  if (!hasAccess) {
    return (
      <div className="ui-wrap">
        <h1 className="ui-title">Marketing</h1>
        <div className="ui-upgrade">
          <h2>Marketing is not included in your plan</h2>
          <p>You&rsquo;re currently on the {tierName} plan. Upgrade to create AI-generated promotional campaigns and track views, clicks, and WhatsApp conversions.</p>
          <Link href="/dashboard/billing" className="ui-btn">View plans</Link>
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
    <div className="ui-wrap">
      <h1 className="ui-title">Marketing</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '18px' }}>
        <div className="ui-stat ui-stat-warn" style={{ textAlign: 'center' }}>
          <div className="ui-stat-value">{activeCampaigns.length}</div>
          <div className="ui-stat-label">Active</div>
        </div>
        <div className="ui-stat" style={{ textAlign: 'center' }}>
          <div className="ui-stat-value">{draftCampaigns.length}</div>
          <div className="ui-stat-label">Drafts</div>
        </div>
        <div className="ui-stat ui-stat-good" style={{ textAlign: 'center' }}>
          <div className="ui-stat-value">{completedCampaigns.length}</div>
          <div className="ui-stat-label">Completed</div>
        </div>
      </div>

      <div className="ui-card" style={{ marginBottom: '20px' }}>
        <div className="ui-meta" style={{ marginBottom: '8px' }}>Overview</div>
        {!hasEnoughData ? (
          <p className="ui-meta" style={{ margin: 0 }}>Not enough data yet</p>
        ) : (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: '#CBD5E1' }}>
            <span>Views: <b style={{ color: '#fff' }}>{totals.views}</b></span>
            <span>CTA clicks: <b style={{ color: '#fff' }}>{totals.ctaClicks}</b></span>
            <span>WhatsApp: <b style={{ color: '#fff' }}>{totals.whatsappClicks}</b></span>
          </div>
        )}
      </div>

      <div className="ui-between" style={{ alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: 0 }}>Campaigns</h2>
        <Link href="/dashboard/marketing/campaigns/new" className="ui-btn ui-btn-sm">+ New campaign</Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="ui-card" style={{ textAlign: 'center', padding: '28px' }}>
          <p className="ui-sub" style={{ marginBottom: '14px' }}>No campaigns yet</p>
          <Link href="/dashboard/marketing/campaigns/new" className="ui-btn">Create your first campaign</Link>
        </div>
      ) : (
        <div className="ui-list">
          {campaigns.map(c => {
            const s = eventStats[c.id] || { views: 0, ctaClicks: 0, whatsappClicks: 0 }
            return (
              <div key={c.id} className="ui-card">
                <div className="ui-between">
                  <span className="ui-name">{c.name}</span>
                  <span className={'ui-badge ' + (c.status === 'active' ? 'ui-badge-warn' : c.status === 'completed' ? 'ui-badge-good' : 'ui-badge-mute')}>
                    {c.status}
                  </span>
                </div>
                <div className="ui-meta" style={{ margin: '4px 0 8px' }}>{c.objective}</div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: '#94A3B8' }}>
                  <span>{s.views} views</span>
                  <span>{s.ctaClicks} CTA clicks</span>
                  <span>{s.whatsappClicks} WhatsApp</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
