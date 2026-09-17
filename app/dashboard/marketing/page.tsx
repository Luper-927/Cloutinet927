'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { getBusinessTier } from '../../../lib/tiers'
import { getActingContext, ActingContext } from '../../../lib/permissions'
import Link from 'next/link'

export default function MarketingPage() {
  const [context, setContext] = useState<ActingContext | null>(null)
  const [tierLimits, setTierLimits] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [eventStats, setEventStats] = useState<Record<string, { views: number; ctaClicks: number; whatsappClicks: number }>>({})
  const [loading, setLoading] = useState(true)

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

    if (!limits.marketingAutomation) {
      setLoading(false)
      return
    }

    const { data: profileData } = await supabase
      .from('profiles').select('*').eq('id', ctx.ownerId).single()
    setProfile(profileData)

    const { data: campaignData } = await supabase
      .from('campaigns').select('*').eq('user_id', ctx.ownerId).order('created_at', { ascending: false })
    setCampaigns(campaignData || [])

    if (campaignData && campaignData.length > 0) {
      const campaignIds = campaignData.map(c => c.id)
      const { data: events } = await supabase
        .from('campaign_events').select('campaign_id, event_type').in('campaign_id', campaignIds)

      const stats: Record<string, { views: number; ctaClicks: number; whatsappClicks: number }> = {}
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
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Loading...</p>
      </div>
    )
  }

  if (!tierLimits?.marketingAutomation) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
        <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Marketing</div>
          <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</Link>
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '30px', textAlign: 'center' as const }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>📣</div>
            <h2 style={{ color: '#0F172A', fontSize: '16px', marginBottom: '8px' }}>Marketing is a Growth plan feature</h2>
            <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>
              Create AI-generated promotional campaigns and track views, clicks, and WhatsApp conversions by upgrading to the Growth plan or higher.
            </p>
            <Link href="/dashboard/billing" style={{ display: 'inline-block', background: '#0F172A', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              Upgrade to Growth
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const activeCampaigns = campaigns.filter(c => c.status === 'active')
  const draftCampaigns = campaigns.filter(c => c.status === 'draft')
  const completedCampaigns = campaigns.filter(c => c.status === 'completed')

  const totals = Object.values(eventStats).reduce(
    (acc, s) => ({ views: acc.views + s.views, ctaClicks: acc.ctaClicks + s.ctaClicks, whatsappClicks: acc.whatsappClicks + s.whatsappClicks }),
    { views: 0, ctaClicks: 0, whatsappClicks: 0 }
  )

  const hasEnoughData = campaigns.length > 0 && totals.views > 0

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Marketing</div>
        <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</Link>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px', textAlign: 'center' as const }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#D97706' }}>{activeCampaigns.length}</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Active</div>
          </div>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px', textAlign: 'center' as const }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#64748B' }}>{draftCampaigns.length}</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Drafts</div>
          </div>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px', textAlign: 'center' as const }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F766E' }}>{completedCampaigns.length}</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Completed</div>
          </div>
        </div>

        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' as const, marginBottom: '10px' }}>Overview</div>
          {!hasEnoughData ? (
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>Not enough data yet</p>
          ) : (
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#334155' }}>
              <span>Views: <b>{totals.views}</b></span>
              <span>CTA Clicks: <b>{totals.ctaClicks}</b></span>
              <span>WhatsApp: <b>{totals.whatsappClicks}</b></span>
            </div>
          )}
        </div>
