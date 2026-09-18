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

    try {
      const [googleRes, cloutRes] = await Promise.all([
        fetch(`/api/check-google?name=${encodeURIComponent(businessName)}&city=${encodeURIComponent(city || 'Nigeria')}`),
        supabase
          .from('profiles')
          .select('*')
          .ilike('business_name', '%' + businessName + '%')
          .limit(1)
          .single()
      ])

      const googleData = await googleRes.json()
      const cloutProfile = cloutRes.data

      let cloutScore = 0
      let productCount = 0

      if (cloutProfile) {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', cloutProfile.id)
          .eq('is_published', true)
        productCount = count || 0

        if (cloutProfile.business_name) cloutScore += 20
        if (cloutProfile.location) cloutScore += 15
        if (cloutProfile.phone) cloutScore += 15
        if (cloutProfile.business_category) cloutScore += 10
        if (cloutProfile.tagline) cloutScore += 10
        if (cloutProfile.business_hours) cloutScore += 5
        if (cloutProfile.services) cloutScore += 5
        if (productCount > 0) cloutScore += 10
        if (productCount >= 5) cloutScore += 5
        if (cloutProfile.facebook_url || cloutProfile.instagram_url) cloutScore += 5
      }

      setResult({
        googleData,
        cloutProfile,
        cloutScore,
        productCount,
      })

    } catch (e) {
      console.error(e)
    }

    setLoading(false)
  }

  function getScoreColor(score: number) {
    if (score >= 70) return '#00aa55'
    if (score >= 40) return '#FF6B35'
    return '#ff4444'
  }

  function getScoreLabel(score: number) {
    if (score >= 70) return 'Good Visibility'
    if (score >= 40) return 'Moderate Visibility'
    if (score > 0) return 'Poor Visibility'
    return 'No Google Business Profile'
  }

  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', background: '#fff', color: '#0F172A', minHeight: '100vh' }}>

      <nav style={{ padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', background: '#0F172A', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>C</div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Cloutinet</span>
        </Link>
        <Link href="/auth" style={{ background: '#0F172A', color: '#fff', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>Get Started Free</Link>
      </nav>

      <section style={{ background: '#0F172A', padding: '50px 20px', textAlign: 'center', color: '#fff' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Business Visibility Checker</h1>
        <p style={{ fontSize: '14px', color: '#94A3B8', maxWidth: '420px', margin: '0 auto 24px' }}>
          Check how visible any business is on Google — free, no signup needed.
        </p>

        <div style={{ maxWidth: '440px', margin: '0 auto' }}>
          <input
            placeholder="Enter business name e.g. Chicken Republic"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && checkVisibility()}
            style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: 'none', fontSize: '15px', marginBottom: '10px', outline: 'none', color: '#0F172A', boxSizing: 'border-box' as const }}
          />
          <input
            placeholder="City e.g. Port Harcourt, Lagos, Abuja"
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && checkVisibility()}
            style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: 'none', fontSize: '15px', marginBottom: '12px', outline: 'none', color: '#0F172A', boxSizing: 'border-box' as const }}
          />
          <button
            onClick={checkVisibility}
            disabled={loading || !businessName.trim()}
            style={{
              width: '100%', padding: '14px',
              background: loading ? 'rgba(255,255,255,0.5)' : '#fff',
              color: '#0F172A', border: 'none', borderRadius: '8px',
              fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              boxSizing: 'border-box' as const
            }}
          >
            {loading ? 'Checking Google...' : 'Check Visibility Score'}
          </button>
        </div>
      </section>

      {result && (
        <section style={{ maxWidth: '520px', margin: '0 auto', padding: '32px 20px' }}>

          {/* CLOUTINET SEARCH VISIBILITY - NEW, HONEST CHECK */}
          <div style={{
            background: result.googleData.onCloutinetSearch ? '#F0FDF4' : '#FFF7ED',
            border: result.googleData.onCloutinetSearch ? '1px solid #BBF7D0' : '1px solid #FED7AA',
            borderRadius: '12px', padding: '16px', marginBottom: '16px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' as const, marginBottom: '8px' }}>Google Search Visibility</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>{result.googleData.onCloutinetSearch ? '✅' : '⏳'}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: result.googleData.onCloutinetSearch ? '#166534' : '#9A3412' }}>
                {result.googleData.onCloutinetSearch
                  ? 'This business page is showing up in Google Search results'
                  : 'Not yet appearing in Google Search for this name'}
              </span>
            </div>
            {!result.googleData.onCloutinetSearch && (
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
                New pages can take 1-2 weeks to appear. This is separate from Google Business Profile below.
              </div>
            )}
          </div>

          {/* GOOGLE RESULT */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' as const, marginBottom: '12px' }}>Google Business Profile</div>

            {result.googleData.found ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '48px', fontWeight: 800, color: getScoreColor(result.googleData.googleScore) }}>{result.googleData.googleScore}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: getScoreColor(result.googleData.googleScore) }}>{getScoreLabel(result.googleData.googleScore)}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>out of 100</div>
                  </div>
                </div>

                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px', color: '#0F172A' }}>{result.googleData.business.name}</div>
                {result.googleData.business.address && <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>📍 {result.googleData.business.address}</div>}
                {result.googleData.business.phone && <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>📞 {result.googleData.business.phone}</div>}
                {result.googleData.business.rating && <div style={{ fontSize: '12px', color: '#475569', marginBottom: '12px' }}>⭐ {result.googleData.business.rating} ({result.googleData.business.reviewCount} reviews)</div>}

                <div style={{ display: 'grid',
