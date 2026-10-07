'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { calculateVisibilityScore } from '../../lib/visibility-score'

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
          .maybeSingle()
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
        cloutScore = calculateVisibilityScore(cloutProfile, productCount)
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
    if (score >= 70) return '#059669'
    if (score >= 40) return '#D97706'
    return '#DC2626'
  }

  function getScoreLabel(score: number) {
    if (score >= 70) return 'Good visibility'
    if (score >= 40) return 'Moderate visibility'
    if (score > 0) return 'Poor visibility'
    return 'No Google Business Profile'
  }

  return (
    <div style={pageStyle}>

      <nav style={navStyle}>
        <Link href="/" style={wordmarkStyle}>Cloutinet</Link>
        <Link href="/auth" style={navButtonStyle}>Start Free</Link>
      </nav>

      <section style={heroStyle}>
        <h1 style={heroTitleStyle}>Business Visibility Checker</h1>
        <p style={heroTextStyle}>
          Check how visible any business is on Google. Free, no signup needed.
        </p>

        <div style={{ maxWidth: '440px', margin: '0 auto' }}>
          <input
            placeholder="Enter business name e.g. Chicken Republic"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && checkVisibility()}
            style={heroInputStyle}
          />
          <input
            placeholder="City e.g. Port Harcourt, Lagos, Abuja"
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && checkVisibility()}
            style={heroInputStyle}
          />
          <button
            onClick={checkVisibility}
            disabled={loading || !businessName.trim()}
            style={{
              ...primaryButtonStyle,
              width: '100%',
              opacity: loading || !businessName.trim() ? 0.6 : 1,
            }}
          >
            {loading ? 'Checking Google...' : 'Check visibility score'}
          </button>
        </div>
      </section>

      {result && (
        <section style={resultsWrapStyle}>

          <div style={{
            ...cardStyle,
            background: result.googleData.onCloutinetSearch ? '#F0FDF4' : '#fff',
            borderColor: result.googleData.onCloutinetSearch ? '#BBF7D0' : '#E2E8F0',
          }}>
            <div style={cardLabelStyle}>Cloutinet page search status</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: result.googleData.onCloutinetSearch ? '#166534' : '#334155' }}>
              {result.googleData.onCloutinetSearch
                ? 'This business\u2019s Cloutinet page is showing up in Google Search'
                : 'No Cloutinet page found in Google Search for this business'}
            </div>
            <div style={{ fontSize: '13px', color: '#64748B', marginTop: '6px', lineHeight: 1.5 }}>
              {result.googleData.onCloutinetSearch
                ? 'A Cloutinet page for this business is already ranking on Google.'
                : result.cloutProfile
                  ? 'This business has a Cloutinet page, but it may still be indexing. New pages can take 1-2 weeks to appear on Google.'
                  : 'This only checks for a Cloutinet page, not the business\u2019s overall Google presence. See their Google Business Profile below.'}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={cardLabelStyle}>Google Business Profile</div>

            {result.googleData.found ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.02em', color: getScoreColor(result.googleData.googleScore) }}>{result.googleData.googleScore}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: getScoreColor(result.googleData.googleScore) }}>{getScoreLabel(result.googleData.googleScore)}</div>
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>out of 100</div>
                  </div>
                </div>

                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px', color: '#0F172A' }}>{result.googleData.business.name}</div>
                {result.googleData.business.address && <div style={detailStyle}>Address: {result.googleData.business.address}</div>}
                {result.googleData.business.phone && <div style={detailStyle}>Phone: {result.googleData.business.phone}</div>}
                {result.googleData.business.rating && <div style={{ ...detailStyle, marginBottom: '12px' }}>Rating: {result.googleData.business.rating} ({result.googleData.business.reviewCount} reviews)</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '12px' }}>
                  {[
                    { label: 'Business name', done: result.googleData.breakdown.name },
                    { label: 'Address listed', done: result.googleData.breakdown.address },
                    { label: 'Phone number', done: result.googleData.breakdown.phone },
                    { label: 'Business hours', done: result.googleData.breakdown.hours },
                    { label: 'Website link', done: result.googleData.breakdown.website },
                    { label: 'Star rating', done: result.googleData.breakdown.rating },
                    { label: 'Customer reviews', done: result.googleData.breakdown.reviews },
                    { label: 'Photos added', done: result.googleData.breakdown.photos },
                    { label: 'Business category', done: result.googleData.breakdown.category },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0', fontSize: '13px' }}>
                      <span style={{ color: item.done ? '#059669' : '#DC2626', fontWeight: 700 }}>{item.done ? '✓' : '✗'}</span>
                      <span style={{ color: '#475569' }}>{item.label}</span>
                    </div>
                  ))}
                </div>

                {!result.googleData.breakdown.website && (
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400E', marginBottom: '4px' }}>No website found</div>
                    <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>Adding a website link, such as your free Cloutinet page, improves this score.</div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: '48px', fontWeight: 800, color: '#DC2626', marginBottom: '6px' }}>0</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#DC2626', marginBottom: '8px' }}>No Google Business Profile found</div>
                <div style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>This checks Google Maps and Business Profile specifically. A website can still rank in Google Search separately. Add a Business Profile at business.google.com to improve local visibility further.</div>
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <div style={cardLabelStyle}>Cloutinet page status</div>

            {result.cloutProfile ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }}></div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#059669' }}>On Cloutinet</span>
                </div>
                <div style={{ fontSize: '14px', color: '#0F172A', fontWeight: 600, marginBottom: '4px' }}>{result.cloutProfile.business_name}</div>
                <div style={{ fontSize: '13px', color: '#475569', marginBottom: '12px' }}>Score: {result.cloutScore}/100 · {result.productCount} products</div>
                <a href={'/store/' + result.cloutProfile.business_slug} style={smallButtonStyle}>View public page</a>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626' }}></div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#DC2626' }}>Not on Cloutinet yet</span>
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '14px', lineHeight: 1.5 }}>
                  Create a free Cloutinet page to make your business easier to find and contact: a public page search engines can index, your products and services, and WhatsApp contact.
                </div>
                <Link href="/auth" style={smallButtonStyle}>Create a free page</Link>
              </div>
            )}
          </div>

          {result.googleData.found && result.googleData.googleScore < 100 && (
            <div style={{ ...cardStyle, background: '#F0FDF4', borderColor: '#BBF7D0' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#166534', marginBottom: '10px' }}>How to improve your Google score</div>
              {!result.googleData.breakdown.website && <div style={tipStyle}>• Add a website. Your free Cloutinet page works.</div>}
              {!result.googleData.breakdown.hours && <div style={tipStyle}>• Add business hours to your Google Business Profile</div>}
              {!result.googleData.breakdown.photos && <div style={tipStyle}>• Add photos to your Google Business Profile</div>}
              {!result.googleData.breakdown.reviews && <div style={tipStyle}>• Ask customers to leave you Google reviews</div>}
              {!result.cloutProfile && <div style={tipStyle}>• Create a free Cloutinet page to add a website link</div>}
            </div>
          )}

          {!result.googleData.found && (
            <div style={{ ...cardStyle, background: '#FEF2F2', borderColor: '#FECACA' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#B91C1C', marginBottom: '10px' }}>Steps to get found on Google</div>
              <div style={{ ...tipStyle, color: '#475569' }}>• Create a free Google Business Profile at business.google.com</div>
              <div style={{ ...tipStyle, color: '#475569' }}>• Create a free Cloutinet page to add a website straight away</div>
              <div style={{ ...tipStyle, color: '#475569' }}>• Add your business address, phone, and hours</div>
              <div style={{ ...tipStyle, color: '#475569' }}>• Ask your first customers to leave Google reviews</div>
            </div>
          )}

          <button
            onClick={() => { setResult(null); setBusinessName(''); setCity('') }}
            style={{ ...ghostButtonStyle, width: '100%', marginBottom: '16px' }}
          >
            Check another business
          </button>

          <BeyondVisibility />
        </section>
      )}

      {!result && !loading && (
        <section style={{ ...resultsWrapStyle, textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#0F172A' }}>What this tool checks</h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px', lineHeight: 1.5 }}>
            We check both Google Search visibility and the Google Business Profile across 9 key factors.
          </p>
          <div style={{ ...cardStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'left' }}>
            {['Business name', 'Address listed', 'Phone number', 'Business hours', 'Website link', 'Star rating', 'Customer reviews', 'Photos added', 'Business category'].map(item => (
              <div key={item} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: '#475569' }}>
                <span style={{ color: '#059669', fontWeight: 700 }}>✓</span> {item}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'left', marginTop: '16px' }}>
            <BeyondVisibility />
          </div>
        </section>
      )}

      <footer style={footerStyle}>
        <Link href="/" style={{ ...wordmarkStyle, fontSize: '18px' }}>Cloutinet</Link>
        <p style={{ fontSize: '13px', color: '#94A3B8', margin: '8px 0 0' }}>
          The Business Operating System · cloutinet.online
        </p>
      </footer>

    </div>
  )
}

function BeyondVisibility() {
  return (
    <div style={{ background: '#0A0E27', borderRadius: '16px', padding: '20px' }}>
      <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
        Visibility is one part of Cloutinet
      </div>
      <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 14px' }}>
        Run customers, payments, documents and your team from the same place as your public page.
      </p>
      <Link href="/" style={{ color: '#34D399', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
        See the platform
      </Link>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  fontFamily: 'inherit',
  background: '#F5F7FB',
  color: '#0F172A',
  minHeight: '100vh',
}

const navStyle: React.CSSProperties = {
  padding: '0 20px',
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#0A0E27',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
}

const wordmarkStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 900,
  letterSpacing: '-0.01em',
  color: '#fff',
  textDecoration: 'none',
}

const navButtonStyle: React.CSSProperties = {
  background: '#2563EB',
  color: '#fff',
  padding: '8px 16px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 600,
}

const heroStyle: React.CSSProperties = {
  background: '#0A0E27',
  backgroundImage:
    'radial-gradient(ellipse 700px 500px at 10% -10%, rgba(29,78,216,0.35), transparent 70%), radial-gradient(ellipse 600px 600px at 100% 0%, rgba(37,99,235,0.28), transparent 70%)',
  padding: '56px 20px 64px',
  textAlign: 'center',
  color: '#fff',
}

const heroTitleStyle: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  margin: '0 0 10px',
  lineHeight: 1.1,
}

const heroTextStyle: React.CSSProperties = {
  fontSize: '15px',
  color: '#94A3B8',
  maxWidth: '420px',
  margin: '0 auto 28px',
  lineHeight: 1.5,
}

const heroInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  minHeight: '48px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
  fontSize: '16px',
  marginBottom: '10px',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const primaryButtonStyle: React.CSSProperties = {
  padding: '14px',
  minHeight: '48px',
  background: '#2563EB',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const ghostButtonStyle: React.CSSProperties = {
  background: '#fff',
  color: '#0F172A',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  padding: '12px',
  minHeight: '44px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'inherit',
}

const smallButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  background: '#2563EB',
  color: '#fff',
  padding: '10px 18px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 600,
}

const resultsWrapStyle: React.CSSProperties = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '32px 20px',
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '16px',
}

const cardLabelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#475569',
  marginBottom: '10px',
}

const detailStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#475569',
  marginBottom: '4px',
}

const tipStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#166534',
  marginBottom: '6px',
  lineHeight: 1.45,
}

const footerStyle: React.CSSProperties = {
  background: '#0A0E27',
  padding: '28px 20px',
  textAlign: 'center',
  marginTop: '24px',
}
