'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function AcceptInvitePage({ params }: { params: { token: string } }) {
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<any>(null)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loggedInEmail, setLoggedInEmail] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data, error: fnError } = await supabase.rpc('get_invitation_details', { token: params.token })

    if (fnError || !data?.found) {
      setError('This invitation link is invalid.')
      setLoading(false)
      return
    }

    setDetails(data)

    const { data: userData } = await supabase.auth.getUser()
    if (userData.user) {
      setIsLoggedIn(true)
      setLoggedInEmail(userData.user.email || '')
    }

    setLoading(false)
  }

  async function handleAccept() {
    setAccepting(true)
    setError('')

    const { data, error: rpcError } = await supabase.rpc('accept_employee_invitation', { token: params.token })

    setAccepting(false)

    if (rpcError || !data?.success) {
      setError(data?.error || 'Could not accept invitation. Please try again.')
      return
    }

    setAccepted(true)
    setTimeout(() => { window.location.href = '/dashboard' }, 2000)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Loading...</p>
      </div>
    )
  }

  if (error && !details) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>❌</div>
          <p style={{ color: '#64748B', fontSize: '14px' }}>{error}</p>
        </div>
      </div>
    )
  }

  if (accepted) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>✅</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>You&rsquo;re in!</h2>
          <p style={{ color: '#64748B', fontSize: '14px' }}>Taking you to the dashboard...</p>
        </div>
      </div>
    )
  }

  if (!details.valid) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
          <p style={{ color: '#64748B', fontSize: '14px' }}>This invitation has already been used or is no longer valid.</p>
        </div>
      </div>
    )
  }

  const emailMismatch = isLoggedIn && loggedInEmail.toLowerCase() !== details.employee_email.toLowerCase()

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ background: '#0F172A', padding: '14px 20px' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Cloutinet</div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '32px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🧑‍💼</div>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
          You&rsquo;ve been invited to join {details.business_name}
        </h2>
        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px', textTransform: 'capitalize' as const }}>
          Role: {details.role}
        </p>

        {!isLoggedIn ? (
          <div>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px', lineHeight: 1.5 }}>
              Sign in or create an account with <strong>{details.employee_email}</strong> to accept this invitation.
            </p>
            <a href={'/auth?redirect=/employee-invite/' + params.token} style={{
              display: 'inline-block', background: '#0F172A', color: '#fff',
              borderRadius: '8px', padding: '12px 24px', fontSize: '14px',
              fontWeight: 700, textDecoration: 'none'
            }}>
              Sign In / Sign Up
            </a>
          </div>
        ) : emailMismatch ? (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '14px' }}>
            <p style={{ color: '#dc2626', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
              This invitation was sent to <strong>{details.employee_email}</strong>, but you&rsquo;re signed in as {loggedInEmail}. Please sign in with the correct email.
            </p>
          </div>
        ) : (
          <div>
            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>{error}</p>
              </div>
            )}
            <button
              onClick={handleAccept}
              disabled={accepting}
              style={{
                background: '#0F172A', color: '#fff', border: 'none',
                borderRadius: '8px', padding: '12px 32px', cursor: 'pointer',
                fontSize: '14px', fontWeight: 700, fontFamily: 'inherit',
                opacity: accepting ? 0.7 : 1
              }}
            >
              {accepting ? 'Joining...' : 'Accept Invitation'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
