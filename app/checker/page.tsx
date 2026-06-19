'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function CheckerPage() {
  const [businessName, setBusinessName] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function checkVisibility() {
    if (!businessName.trim()) return
    setLoading(true)
    setResult(null)

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .ilike('business_name', '%' + businessName + '%')
      .limit(1)
      .single()

    if (profile) {
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('is_published', true)

      const { count: viewCount } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('business_slug', profile.business_slug)
        .eq('event_type', 'page_view')

      const score = Math.min(100,
        (profile.business_name ? 20 : 0) +
        (profile.location ? 15 : 0) +
        (profile.phone ? 15 : 0) +
        (profile.business_category ? 10 : 0) +
        (profile.tagline ? 10 : 0) +
        (profile.business_hours ? 5 : 0) +
        (profile.services ? 5 : 0) +
        ((productCount || 0) > 0 ? 10 : 0) +
        ((productCount || 0) > 4 ? 5 : 0) +
        (profile.facebook_url || profile.instagram_url ? 5 : 0)
      )

      setResult({
        found: true,
        profile,
        productCount: productCount || 0,
        viewCount: viewCount || 0,
        score,
        slug: profile.business_slug,
      })
    } else {
      setResult({
        found: false,
        businessName,
        city,
        score: 0,
      })
    }

    setLoading(false)
  }

  function getScoreColor(score: number) {
    if (score >= 80) return '#00e676'
    if (score >= 50) return '#FF6B35'
    return '#ff4444'
  }

  function getScoreLabel(score: number) {
    if (score >= 80) return 'Excellent Visibility'
    if (score >= 60) return 'Good Visibility'
    if (score >= 40) return 'Moderate Visibility'
    if (score > 0) return 'Poor Visibility'
    return 'Not Registered on Cloutinet'
  }

  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', background: '#fff', color: '#1a1a2e', minHeight: '100vh' }}>

      <nav style={{ padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', background: '#6B21A8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '14px' }}>C</div>
          <span style={{ fontSize: '16px', fontWeight: 900, color: '#6B21A8' }}>Cloutinet</span>
        </Link>
        <Link href="/auth" style={{ background: '#6B21A8', color: '#fff', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>Get Started Free</Link>
      </nav>

      <section style={{ background: 'linear-gradient(135deg, #6B21A8, #9333EA)', padding: '50px 20px', textAlign: 'center', color: '#fff' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '8px' }}>🔍 Cloutinet Visibility Checker</h1>
        <p style={{ fontSize: '14px', opacity: 0.85, maxWidth: '420px', margin: '0 auto 24px' }}>
          Check if your business has a free Google-searchable page on Cloutinet, and get a visibility score based on your profile completeness.
        </p>

        <div style={{ maxWidth: '440px', margin: '0 auto' }}>
          <input
            placeholder="Enter your business name"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && checkVisibility()}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: '10px',
              border: 'none', fontSize: '15px', marginBottom: '10px',
              outline: 'none', color: '#1a1a2e'
            }}
          />
          <input
            placeholder="City (optional) e.g. Port Harcourt"
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && checkVisibility()}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: '10px',
              border: 'none', fontSize: '15px', marginBottom: '12px',
              outline: 'none', color: '#1a
