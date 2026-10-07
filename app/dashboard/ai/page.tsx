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
    if (!hasAccess) { setLoading(false); return }

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

  if (loading) return <div className="ui-wrap"><p className="ui-sub">Loading...</p></div>

  if (!hasAccess) {
    return (
      <div className="ui-wrap">
        <h1 className="ui-title">Intelligence</h1>
        <div className="ui-upgrade">
          <h2>Cloutinet AI is not included in your plan</h2>
          <p>You&rsquo;re currently on the {tierName} plan. Upgrade to get an AI assistant that understands your business.</p>
          <Link href="/dashboard/billing" className="ui-btn">View plans</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="ui-wrap">
      <h1 className="ui-title">Intelligence</h1>

      {insights.length > 0 && (
        <>
          <div className="ui-section-label" style={{ marginTop: 0 }}>Insights</div>
          <div className="ui-list" style={{ marginBottom: '20px' }}>
            {insights.map((insight, i) => (
              <div key={i} className="ui-card" style={{ background: 'rgba(59,130,246,.10)', borderColor: 'rgba(59,130,246,.30)', fontSize: '14px', color: '#BFDBFE', lineHeight: 1.5 }}>
                {insight}
              </div>
            ))}
          </div>
        </>
      )}

      {(answer || error) && (
        <div style={{ marginBottom: '20px' }}>
          {error ? (
            <div className="ui-error"><p>{error}</p></div>
          ) : (
            <div className="ui-card">
              <div className="ui-meta" style={{ marginBottom: '6px' }}>Cloutinet AI</div>
              <p style={{ color: '#E2E8F0', fontSize: '14px', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{answer}</p>
            </div>
          )}
        </div>
      )}

      <textarea
        className="ui-input tight"
        placeholder="Ask Cloutinet anything about your business..."
        value={question}
        onChange={e => setQuestion(e.target.value)}
      />
      <button onClick={() => handleAsk()} disabled={asking} className="ui-btn ui-block" style={{ marginBottom: '24px' }}>
        {asking ? 'Thinking...' : 'Ask'}
      </button>

      <div className="ui-section-label" style={{ marginTop: 0 }}>Suggested</div>
      <div className="ui-list">
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => handleAsk(s)}
            disabled={asking}
            className="ui-linkrow"
            style={{ width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
