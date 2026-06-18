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

    const slug = businessName.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')

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
      const score = 0
      setResult({
        found: false,
        businessName,
        city,
        score,
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
    return 'Not Visible on Google'
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
        <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '8px' }}>🔍 Business Visibility Checker</h1>
        <p style={{ fontSize: '14px', opacity: 0.85, maxWidth: '400px', margin: '0 auto 24px' }}>
          Check if your business is visible on Google. Get your free visibility score in seconds.
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
              outline: 'none', color: '#1a1a2e'
            }}
          />
          <button
            onClick={checkVisibility}
            disabled={loading || !businessName.trim()}
            style={{
              width: '100%', padding: '14px',
              background: loading ? 'rgba(255,255,255,0.5)' : '#fff',
              color: '#6B21A8', border: 'none', borderRadius: '10px',
              fontSize: '15px', fontWeight: 800, cursor: 'pointer'
            }}
          >
            {loading ? 'Checking...' : '🔍 Check My Visibility Score'}
          </button>
        </div>
      </section>

      {result && (
        <section style={{ maxWidth: '500px', margin: '0 auto', padding: '32px 20px' }}>

          {result.found ? (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '72px', fontWeight: 900, color: getScoreColor(result.score) }}>
                  {result.score}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: getScoreColor(result.score) }}>
                  {getScoreLabel(result.score)}
                </div>
                <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>out of 100</div>
              </div>

              <div style={{ background: '#f9f5ff', border: '1px solid #e5d5ff', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>✅ {result.profile.business_name} is on Cloutinet</div>
                {[
                  { label: 'Business Name', done: !!result.profile.business_name },
                  { label: 'Location', done: !!result.profile.location },
                  { label: 'Phone / WhatsApp', done: !!result.profile.phone },
                  { label: 'Business Category', done: !!result.profile.business_category },
                  { label: 'Tagline', done: !!result.profile.tagline },
                  { label: 'Business Hours', done: !!result.profile.business_hours },
                  { label: 'Services Listed', done: !!result.profile.services },
                  { label: 'Products Added', done: result.productCount > 0 },
                  { label: '5+ Products', done: result.productCount >= 5 },
                  { label: 'Social Media Links', done: !!(result.profile.facebook_url || result.profile.instagram_url) },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e5d5ff', fontSize: '13px' }}>
                    <span style={{ color: '#444' }}>{item.label}</span>
                    <span>{item.done ? '✅' : '❌'}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: '#f9f5ff', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#6B21A8' }}>{result.viewCount}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>Page Views</div>
                </div>
                <div style={{ background: '#f9f5ff', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#6B21A8' }}>{result.productCount}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>Products Listed</div>
                </div>
              </div>

              <a href={'/store/' + result.slug} style={{
                display: 'block', textAlign: 'center', background: '#6B21A8',
                color: '#fff', padding: '14px', borderRadius: '10px',
                textDecoration: 'none', fontSize: '14px', fontWeight: 700, marginBottom: '10px'
              }}>View Your Store Page →</a>

              <Link href="/auth" style={{
                display: 'block', textAlign: 'center', background: '#f9f5ff',
                color: '#6B21A8', padding: '14px', borderRadius: '10px',
                textDecoration: 'none', fontSize: '14px', fontWeight: 700,
                border: '1px solid #e5d5ff'
              }}>Improve Your Score →</Link>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '72px', fontWeight: 900, color: '#ff4444' }}>0</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ff4444', marginBottom: '8px' }}>Not Visible on Google</div>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
                We couldn't find <strong>{result.businessName}</strong> on Cloutinet or Google.
                {result.city && ` in ${result.city}`}
              </div>

              <div style={{ background: '#fff3f3', border: '1px solid #ffcccc', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'left' }}>
                <div style={{ fontWeight: 700, marginBottom: '8px', color: '#ff4444' }}>⚠️ What this means:</div>
                {[
                  'Customers searching for your business on Google cannot find you',
                  'You are losing potential customers to competitors every day',
                  'Your business has zero Google visibility score',
                ].map(item => (
                  <div key={item} style={{ fontSize: '13px', color: '#666', padding: '4px 0' }}>• {item}</div>
                ))}
              </div>

              <Link href="/auth" style={{
                display: 'block', textAlign: 'center',
                background: 'linear-gradient(135deg, #FF6B35, #E91E8C)',
                color: '#fff', padding: '14px', borderRadius: '10px',
                textDecoration: 'none', fontSize: '15px', fontWeight: 800, marginBottom: '10px'
              }}>🚀 Create Your Free Google Page Now</Link>

              <p style={{ fontSize: '12px', color: '#888' }}>Free forever. No credit card. Setup in 5 minutes.</p>
            </div>
          )}
        </section>
      )}

      {!result && (
        <section style={{ maxWidth: '500px', margin: '0 auto', padding: '32px 20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', textAlign: 'center' }}>What is a Visibility Score?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { score: '80-100', label: 'Excellent', desc: 'Your business is fully optimized and visible on Google', color: '#00e676' },
              { score: '50-79', label: 'Good', desc: 'Visible but missing some key information', color: '#FF6B35' },
              { score: '1-49', label: 'Poor', desc: 'Low visibility — customers struggle to find you', color: '#ff8c00' },
              { score: '0', label: 'Not Found', desc: 'Your business is invisible on Google', color: '#ff4444' },
            ].map(item => (
              <div key={item.score} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: '#fafafa', borderRadius: '10px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '10px', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700, textAlign: 'center', flexShrink: 0 }}>{item.score}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer style={{ background: '#f9f5ff', padding: '24px', textAlign: 'center', borderTop: '1px solid #e5d5ff', marginTop: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#6B21A8', marginBottom: '6px' }}>⚡ Cloutinet</div>
        <p style={{ fontSize: '12px', color: '#888' }}>Nigeria's free business visibility platform — cloutinet.online</p>
      </footer>

    </div>
  )
}
