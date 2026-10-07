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

  const shell = (children: React.ReactNode) => (
    <div style={pageStyle}>
      <div style={{ marginBottom: '24px', fontSize: '28px', fontWeight: 900, letterSpacing: '-0.01em', color: '#fff' }}>Cloutinet</div>
      <div style={cardStyle}>{children}</div>
    </div>
  )

  if (loading) {
    return shell(<p style={{ color: '#94A3B8', fontSize: '14px', margin: 0, textAlign: 'center' }}>Loading...</p>)
  }

  if (error && !details) {
    return shell(<p style={{ color: '#FCA5A5', fontSize: '14px', margin: 0, textAlign: 'center' }}>{error}</p>)
  }

  if (accepted) {
    return shell(
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.01em', color: '#fff', margin: '0 0 8px' }}>You&rsquo;re in</h2>
        <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>Taking you to the dashboard...</p>
      </div>
    )
  }

  if (!details.valid) {
    return shell(<p style={{ color: '#94A3B8', fontSize: '14px', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>This invitation has already been used or is no longer valid.</p>)
  }

  const emailMismatch = isLoggedIn && loggedInEmail.toLowerCase() !== details.employee_email.toLowerCase()

  return shell(
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.01em', color: '#fff', margin: '0 0 8px', lineHeight: 1.25 }}>
        You&rsquo;ve been invited to join {details.business_name}
      </h2>
      <p style={{ fontSize: '14px', color: '#94A3B8', margin: '0 0 24px', textTransform: 'capitalize' }}>
        Role: {details.role}
      </p>

      {!isLoggedIn ? (
        <div>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 16px', lineHeight: 1.5 }}>
            Sign in or create an account with <strong style={{ color: '#fff' }}>{details.employee_email}</strong> to accept this invitation.
          </p>
          <a href={'/auth?redirect=/employee-invite/' + params.token} style={primaryButtonStyle}>
            Sign In / Sign Up
          </a>
        </div>
      ) : emailMismatch ? (
        <div style={{ background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.35)', borderRadius: '10px', padding: '14px' }}>
          <p style={{ color: '#FCA5A5', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
            This invitation was sent to <strong>{details.employee_email}</strong>, but you&rsquo;re signed in as {loggedInEmail}. Please sign in with the correct email.
          </p>
        </div>
      ) : (
        <div>
          {error && (
            <div style={{ background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.35)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
              <p style={{ color: '#FCA5A5', fontSize: '13px', margin: 0 }}>{error}</p>
            </div>
          )}
          <button
            onClick={handleAccept}
            disabled={accepting}
            style={{ ...primaryButtonStyle, border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: accepting ? 0.7 : 1 }}
          >
            {accepting ? 'Joining...' : 'Accept invitation'}
          </button>
        </div>
      )}
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  fontFamily: 'inherit',
  backgroundColor: '#0A0E27',
  backgroundImage:
    'radial-gradient(ellipse 700px 500px at 10% -10%, rgba(29,78,216,0.35), transparent 70%), radial-gradient(ellipse 600px 600px at 100% 0%, rgba(37,99,235,0.28), transparent 70%)',
  backgroundRepeat: 'no-repeat',
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '16px',
  padding: '28px 24px',
  width: '100%',
  maxWidth: '420px',
  boxSizing: 'border-box',
}

const primaryButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  background: '#2563EB',
  color: '#fff',
  borderRadius: '8px',
  padding: '13px 28px',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
}
