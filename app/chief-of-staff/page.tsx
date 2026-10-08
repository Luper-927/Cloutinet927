'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Colours: navy/slate palette. Change the accent here if your page.tsx uses a different one.
const C = {
  bg: '#0F172A',
  card: '#1E293B',
  border: '#334155',
  text: '#F8FAFC',
  muted: '#94A3B8',
  accent: '#3B82F6',
  good: '#22C55E',
  warn: '#F59E0B',
  bad: '#EF4444',
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

type Briefing = {
  headline: string
  priorities: { title: string; why: string; action: string; effort: string }[]
  risks: string[]
  opportunities: string[]
  draft_messages: { to: string; channel: string; text: string }[]
  gaps: string[]
  answer: string
}

const card: React.CSSProperties = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  padding: 18,
  marginBottom: 14,
}

const label: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: C.muted,
  marginBottom: 10,
}

export default function ChiefOfStaffPage() {
  const [briefing, setBriefing] = useState<Briefing | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [question, setQuestion] = useState('')
  const [copied, setCopied] = useState<number | null>(null)
  const [signedIn, setSignedIn] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(!!data.session)
      if (data.session) run('')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function run(q: string) {
    setLoading(true)
    setError('')
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) {
        setSignedIn(false)
        setLoading(false)
        return
      }
      const res = await fetch('/api/chief-of-staff', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Request failed')
      setBriefing(json.briefing)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    }
    setLoading(false)
  }

  function copy(text: string, i: number) {
    navigator.clipboard.writeText(text)
    setCopied(i)
    setTimeout(() => setCopied(null), 1500)
  }

  function effortColor(e: string) {
    if (e === 'low') return C.good
    if (e === 'high') return C.bad
    return C.warn
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 16px 60px' }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 13, color: C.accent, fontWeight: 700, letterSpacing: 1 }}>CLOUTINET</div>
          <h1 style={{ fontSize: 28, margin: '4px 0 6px', fontWeight: 800 }}>Chief of Staff</h1>
          <div style={{ color: C.muted, fontSize: 15 }}>Your daily briefing, priorities and ready-to-send messages.</div>
        </div>

        {signedIn === false && (
          <div style={card}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Please sign in first</div>
            <div style={{ color: C.muted, fontSize: 14, marginBottom: 14 }}>Your briefing is built from your own business data.</div>
            <a href="/login" style={{ display: 'inline-block', background: C.accent, color: '#fff', padding: '10px 18px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
              Sign in
            </a>
          </div>
        )}

        {signedIn && (
          <div style={{ ...card, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !loading) run(question) }}
              placeholder="Ask anything, e.g. Who should I follow up with today?"
              style={{ flex: 1, minWidth: 200, background: C.bg, color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', fontSize: 15, outline: 'none' }}
            />
            <button
              onClick={() => run(question)}
              disabled={loading}
              style={{ background: C.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 20px', fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Thinking…' : question.trim() ? 'Ask' : 'Refresh'}
            </button>
          </div>
        )}

        {error && (
          <div style={{ ...card, borderColor: C.bad, color: C.bad, fontSize: 14 }}>{error}</div>
        )}

        {loading && !briefing && (
          <div style={{ ...card, color: C.muted }}>Preparing your briefing…</div>
        )}

        {briefing && (
          <>
            <div style={{ ...card, borderColor: C.accent }}>
              <div style={label}>Today</div>
              <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4 }}>{briefing.headline}</div>
            </div>

            {briefing.answer && (
              <div style={card}>
                <div style={label}>Answer</div>
                <div style={{ fontSize: 15, lineHeight: 1.6 }}>{briefing.answer}</div>
              </div>
            )}

            {briefing.priorities.length > 0 && (
              <div style={card}>
                <div style={label}>Priorities</div>
                {briefing.priorities.map((p, i) => (
                  <div key={i} style={{ padding: '12px 0', borderTop: i === 0 ? 'none' : `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{i + 1}. {p.title}</div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: effortColor(p.effort), border: `1px solid ${effortColor(p.effort)}`, borderRadius: 20, padding: '2px 10px', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
                        {p.effort}
                      </span>
                    </div>
                    <div style={{ color: C.muted, fontSize: 14, margin: '4px 0 8px', lineHeight: 1.5 }}>{p.why}</div>
                    <div style={{ fontSize: 14, color: C.text, background: C.bg, borderRadius: 8, padding: '8px 12px', lineHeight: 1.5 }}>
                      <span style={{ color: C.accent, fontWeight: 700 }}>Do this: </span>{p.action}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {briefing.risks.length > 0 && (
              <div style={card}>
                <div style={label}>Risks</div>
                {briefing.risks.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', fontSize: 14, lineHeight: 1.5 }}>
                    <span style={{ color: C.bad }}>●</span><span>{r}</span>
                  </div>
                ))}
              </div>
            )}

            {briefing.opportunities.length > 0 && (
              <div style={card}>
                <div style={label}>Opportunities</div>
                {briefing.opportunities.map((o, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', fontSize: 14, lineHeight: 1.5 }}>
                    <span style={{ color: C.good }}>●</span><span>{o}</span>
                  </div>
                ))}
              </div>
            )}

            {briefing.draft_messages.length > 0 && (
              <div style={card}>
                <div style={label}>Ready-to-send messages</div>
                {briefing.draft_messages.map((m, i) => (
                  <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, marginTop: i === 0 ? 0 : 10 }}>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>
                      To: <span style={{ color: C.text, fontWeight: 600 }}>{m.to}</span> · {m.channel}
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{m.text}</div>
                    <button
                      onClick={() => copy(m.text, i)}
                      style={{ marginTop: 10, background: 'transparent', color: C.accent, border: `1px solid ${C.accent}`, borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                    >
                      {copied === i ? 'Copied ✓' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {briefing.gaps.length > 0 && (
              <div style={card}>
                <div style={label}>Add this data for better briefings</div>
                {briefing.gaps.map((g, i) => (
                  <div key={i} style={{ color: C.muted, fontSize: 14, padding: '4px 0', lineHeight: 1.5 }}>• {g}</div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
