'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { getBusinessTier } from '../../../lib/tiers'
import { getActingContext } from '../../../lib/permissions'
import Link from 'next/link'

const SUGGESTIONS = [
  'How is my business performing?',
  'Find customers I should follow up with',
  'Create a marketing message for new stock',
  'What should I improve this week?',
]

export default function AIPage() {
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(true)
  const [tierName, setTierName] = useState('Free')
  const [insights, setInsights] = useState<string[]>([])
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [asking, setAsking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const context = await getActingContext(userData.user.id)
    if (!context) { window.location.href = '/onboarding'; return }

    const { limits } = await getBusinessTier(context.ownerId)
    setTierName(limits.name)

    if (!limits.advancedAI) {
      setHasAccess(false)
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
      // Insights are a nice-to-have — a failure here shouldn't block the page.
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
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Loading...</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
        <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Cloutinet AI</div>
          <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</Link>
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🤖</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            Cloutinet AI needs Business or higher
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
            You&rsquo;re currently on the {tierName} plan. Upgrade to get an AI assistant that understands your business.
          </p>
          <Link href="/dashboard/billing" style={{
            display: 'inline-block', background: '#0F172A', color: '#fff',
            borderRadius: '8px', padding: '12px 24px', fontSize: '14px',
            fontWeight: 700, textDecoration: 'none'
          }}>
            View Plans
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Cloutinet AI</div>
        <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</Link>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
        {insights.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' as const, marginBottom: '10px' }}>Insights</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {insights.map((insight, i) => (
                <div key={i} style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', padding: '12px', fontSize: '13px', color: '#0369A1' }}>
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
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', marginBottom: '6px', textTransform: 'uppercase' as const }}>Cloutinet AI</div>
                <p style={{ color: '#0F172A', fontSize: '13px', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' as const }}>{answer}</p>
              </div>
            )}
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <textarea
            placeholder="Ask Cloutinet anything about your business..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' as const }}
          />
          <button
            onClick={() => handleAsk()}
            disabled={asking}
            style={{
              width: '100%', background: '#0F172A', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '12px', cursor: 'pointer',
              fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', opacity: asking ? 0.7 : 1
            }}
          >
            {asking ? 'Thinking...' : 'Ask'}
          </button>
        </div>

        <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' as const, marginBottom: '10px' }}>Suggested</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => handleAsk(s)}
              disabled={asking}
              style={{
                textAlign: 'left' as const, background: '#fff', border: '1px solid #E2E8F0',
                borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#0F172A',
                cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0',
  borderRadius: '8px', padding: '12px 14px', color: '#0F172A',
  fontSize: '14px', marginBottom: '10px', outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box'
}
