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
    return 'Not Visible on Google'
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

          {/* GOOGLE RESULT */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' as const, marginBottom: '12px' }}>Google Visibility</div>

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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '12px' }}>
                  {[
                    { label: 'Business Name', done: result.googleData.breakdown.name },
                    { label: 'Address Listed', done: result.googleData.breakdown.address },
                    { label: 'Phone Number', done: result.googleData.breakdown.phone },
                    { label: 'Business Hours', done: result.googleData.breakdown.hours },
                    { label: 'Website Link', done: result.googleData.breakdown.website },
                    { label: 'Star Rating', done: result.googleData.breakdown.rating },
                    { label: 'Customer Reviews', done: result.googleData.breakdown.reviews },
                    { label: 'Photos Added', done: result.googleData.breakdown.photos },
                    { label: 'Business Category', done: result.googleData.breakdown.verified },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0', fontSize: '12px' }}>
                      <span style={{ color: item.done ? '#00aa55' : '#ff4444', fontWeight: 700 }}>{item.done ? '✓' : '✗'}</span>
                      <span style={{ color: '#475569' }}>{item.label}</span>
                    </div>
                  ))}
                </div>

                {!result.googleData.breakdown.website && (
                  <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#9A3412', marginBottom: '4px' }}>No website found</div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>A free Cloutinet page counts as your website and boosts your Google score.</div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: '48px', fontWeight: 800, color: '#ff4444', marginBottom: '6px' }}>0</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ff4444', marginBottom: '8px' }}>Not Found on Google</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>This business has no Google presence. Customers searching online cannot find it.</div>
              </div>
            )}
          </div>

          {/* CLOUTINET STATUS */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' as const, marginBottom: '12px' }}>Cloutinet Page Status</div>

            {result.cloutProfile ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00aa55' }}></div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#00aa55' }}>Listed on Cloutinet</span>
                </div>
                <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: 600, marginBottom: '4px' }}>{result.cloutProfile.business_name}</div>
                <div style={{ fontSize: '12px', color: '#475569', marginBottom: '10px' }}>Score: {result.cloutScore}/100 · {result.productCount} products</div>
                <a href={'/store/' + result.cloutProfile.business_slug} style={{ display: 'inline-block', background: '#0F172A', color: '#fff', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}>View Store →</a>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff4444' }}></div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#ff4444' }}>Not on Cloutinet Yet</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>Create a free Cloutinet page — get Google indexed, list products, receive WhatsApp leads.</div>
                <Link href="/auth" style={{ display: 'inline-block', background: '#0F172A', color: '#fff', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>Create Free Page →</Link>
              </div>
            )}
          </div>

          {/* IMPROVEMENT TIPS */}
          {result.googleData.found && result.googleData.googleScore < 100 && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#166534', marginBottom: '10px' }}>How to improve your Google score:</div>
              {!result.googleData.breakdown.website && <div style={{ fontSize: '12px', color: '#166534', marginBottom: '6px' }}>• Add a website — create your free Cloutinet page</div>}
              {!result.googleData.breakdown.hours && <div style={{ fontSize: '12px', color: '#166534', marginBottom: '6px' }}>• Add business hours to Google Business Profile</div>}
              {!result.googleData.breakdown.photos && <div style={{ fontSize: '12px', color: '#166534', marginBottom: '6px' }}>• Add photos to Google Business Profile</div>}
              {!result.googleData.breakdown.reviews && <div style={{ fontSize: '12px', color: '#166534', marginBottom: '6px' }}>• Ask customers to leave you Google reviews</div>}
              {!result.cloutProfile && <div style={{ fontSize: '12px', color: '#166534', marginBottom: '6px' }}>• Create a free Cloutinet page to add a website link</div>}
            </div>
          )}

          {!result.googleData.found && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626', marginBottom: '10px' }}>Steps to get found on Google:</div>
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px' }}>• Create a free Google Business Profile at business.google.com</div>
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px' }}>• Create a free Cloutinet page to add a website immediately</div>
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px' }}>• Add your business address, phone, and hours</div>
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px' }}>• Ask your first customers to leave Google reviews</div>
            </div>
          )}

          <button
            onClick={() => { setResult(null); setBusinessName(''); setCity('') }}
            style={{ width: '100%', background: '#F8FAFC', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit' }}
          >
            Check Another Business
          </button>

        </section>
      )}

      {!result && !loading && (
        <section style={{ maxWidth: '520px', margin: '0 auto', padding: '32px 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#0F172A' }}>What this tool checks</h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>We search Google for your business and score it across 9 key visibility factors.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'left' as const }}>
            {['Business Name', 'Address Listed', 'Phone Number', 'Business Hours', 'Website Link', 'Star Rating', 'Customer Reviews', 'Photos Added', 'Business Category'].map(item => (
              <div key={item} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: '#475569' }}>
                <span style={{ color: '#0F172A', fontWeight: 700 }}>✓</span> {item}
              </div>
            ))}
          </div>
        </section>
      )}

      <footer style={{ background: '#F8FAFC', padding: '24px', textAlign: 'center', borderTop: '1px solid #E2E8F0', marginTop: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>Cloutinet</div>
        <p style={{ fontSize: '12px', color: '#94A3B8' }}>Nigeria's free business visibility platform — cloutinet.online</p>
      </footer>

    </div>
  )
}
