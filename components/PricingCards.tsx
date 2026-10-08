'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const C = {
  bg: '#0F172A',
  card: '#1E293B',
  border: '#334155',
  text: '#F8FAFC',
  muted: '#94A3B8',
  accent: '#3B82F6',
  good: '#22C55E',
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

type Quote = {
  tier: string
  originalPrice: number
  discountPercent: number
  discountAmount: number
  finalPrice: number
  eligible: boolean
}

const NAMES: Record<string, string> = {
  startup: 'Startup',
  growth: 'Growth',
  scale: 'Scale',
}

const naira = (n: number) => '₦' + n.toLocaleString('en-NG')

export default function PricingCards() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [signedIn, setSignedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.auth.getSession()
        const token = data.session?.access_token
        const res = await fetch('/api/pricing-quote', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const json = await res.json()
        setQuotes(json.quotes || [])
        setSignedIn(!!json.signedIn)
      } catch {
        setQuotes([])
      }
      setLoading(false)
    }
    load()
  }, [])

  async function pay(tier: string) {
    setStarting(tier)
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) {
        window.location.href = `/signup?plan=${tier}`
        return
      }
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })
      const json = await res.json()
      if (json.authorization_url) {
        window.location.href = json.authorization_url
        return
      }
    } catch {
      // fall through
    }
    setStarting('')
  }

  const anyDiscount = quotes.some((q) => q.eligible && q.discountPercent > 0)
  const percent = quotes.find((q) => q.discountPercent > 0)?.discountPercent

  if (loading) {
    return <div style={{ color: C.muted, textAlign: 'center', padding: 40 }}>Loading prices…</div>
  }

  return (
    <div style={{ background: C.bg, padding: '32px 16px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {anyDiscount && (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span style={{ display: 'inline-block', background: 'rgba(34,197,94,0.12)', color: C.good, border: `1px solid ${C.good}`, borderRadius: 30, padding: '8px 18px', fontWeight: 700, fontSize: 14 }}>
              🎉 New customers get {percent}% off their first month
            </span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
          {quotes.map((q) => {
            const discounted = q.eligible && q.discountPercent > 0
            return (
              <div key={q.tier} style={{ background: C.card, border: `1px solid ${discounted ? C.accent : C.border}`, borderRadius: 14, padding: 20, position: 'relative' }}>
                {discounted && (
                  <div style={{ position: 'absolute', top: -11, right: 14, background: C.good, color: '#052e16', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>
                    {q.discountPercent}% OFF
                  </div>
                )}

                <div style={{ color: C.text, fontSize: 18, fontWeight: 800, marginBottom: 12 }}>
                  {NAMES[q.tier] || q.tier}
                </div>

                {discounted && (
                  <div style={{ color: C.muted, fontSize: 15, textDecoration: 'line-through' }}>
                    {naira(q.originalPrice)}
                  </div>
                )}

                <div style={{ color: C.text, fontSize: 30, fontWeight: 800, lineHeight: 1.2 }}>
                  {naira(discounted ? q.finalPrice : q.originalPrice)}
                  <span style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}> /month</span>
                </div>

                <div style={{ color: C.muted, fontSize: 12, margin: '8px 0 16px', minHeight: 32, lineHeight: 1.4 }}>
                  {discounted
                    ? `First month only. Then ${naira(q.originalPrice)}/month.`
                    : 'Billed monthly.'}
                </div>

                <button
                  onClick={() => pay(q.tier)}
                  disabled={starting === q.tier}
                  style={{ width: '100%', background: C.accent, color: '#fff', border: 'none', padding: '11px 0', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: starting === q.tier ? 0.6 : 1 }}
                >
                  {starting === q.tier ? 'Please wait…' : signedIn ? `Start ${NAMES[q.tier] || q.tier} Plan` : 'Get started'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}
