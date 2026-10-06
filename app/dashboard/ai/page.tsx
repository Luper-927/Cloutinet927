'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { useDashboard } from '../../components/DashboardShell'

const SUGGESTIONS = [
  'How is my business performing?',
  'Find customers I should follow up with',
  'Create a marketing message for new stock',
  'What should I improve this week?',
]

export default function AIPage() {
  const { tierLimits } = useDashboard()

  const hasAccess = !!tierLimits?.advancedAI
  const tierName = tierLimits?.name || 'Free'

  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<string[]>([])
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [asking, setAsking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    if (!hasAccess) {
      setLoading(false)
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'insights' }),
      })
      const data = await res.json()
      setInsights(data.insights || [])
    } catch {
      // Insights are a nice-to-have. A failure here shouldn't block the page.
    }

    setLoading(false)
  }

  async function handleAsk(q?: string) {
    const finalQuestion = q || question
    if (!finalQuestion.trim()) return

    setAsking(true)
    setError('')
    setAnswer('')

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'ask', question: finalQuestion }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
      } else {
        setAnswer(data.answer)
        setQuestion(finalQuestion)
      }
    } catch {
      setError('Could not reach Cloutinet AI. Please try again.')
    }
    setAsking(false)
  }

  if (loading) {
    return (
      <div style={{ padding: '24px 0' }}>
        <p style={mutedStyle}>Loading...</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={wrapStyle}>
        <h1 style={titleStyle}>Intelligence</h1>
        <div style={{ padding: '36px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🤖</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            Cloutinet AI is not included in your plan
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
            You&rsquo;re currently on the {tierName} plan. Upgrade to get an AI assistant that understands your business.
          </p>
          <Link href="/dashboard/billing" style={upgradeButtonStyle}>View Plans</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <h1 style={titleStyle}>Intelligence</h1>

      {insights.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={sectionLabelStyle}>Insights</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {insights.map((insight, i) => (
              <div key={i} style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', padding: '12px', fontSize: '14px', color: '#0369A1', lineHeight: 1.5 }}>
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {(answer || error) && (
        <div style={{ marginBottom: '20px' }}>
          {error ? (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '14px' }}>
              <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{error}</p>
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>Cloutinet AI</div>
              <p style={{ color: '#0F172A', fontSize: '14px', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{answer}</p>
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: '12px' }}>
        <textarea
          placeholder="Ask Cloutinet anything about your business..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
        />
        <button
          onClick={() => handleAsk()}
          disabled={asking}
          style={{
            width: '100%',
            background: '#0F172A',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            minHeight: '44px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: 'inherit',
            opacity: asking ? 0.7 : 1,
          }}
        >
          {asking ? 'Thinking...' : 'Ask'}
        </button>
      </div>

      <div style={sectionLabelStyle}>Suggested</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => handleAsk(s)}
            disabled={asking}
            style={{
              textAlign: 'left',
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px',
              minHeight: '44px',
              fontSize: '14px',
              color: '#0F172A',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {s}
          </button>
        ))}
      </div>
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

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#475569',
  marginBottom: '10px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  padding: '12px 14px',
  color: '#0F172A',
  fontSize: '14px',
  marginBottom: '10px',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const upgradeButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  background: '#0F172A',
  color: '#fff',
  borderRadius: '8px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: 700,
  textDecoration: 'none',
}
