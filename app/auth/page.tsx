'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  async function handleSignup() {
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    if (data.user) {
      await supabase.from('profiles').insert({ id: data.user.id, email: email })
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Welcome to Cloutinet',
          html: `<html><body style="font-family:sans-serif;padding:20px;background:#f5f5f5"><div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden"><div style="background:#0A0E27;padding:24px;text-align:center"><div style="font-size:22px;font-weight:800;color:#fff">Cloutinet</div></div><div style="padding:24px"><h2 style="color:#0F172A">Welcome!</h2><p style="color:#64748B">Your Cloutinet account is ready. Set up your business profile to get started.</p><a href="https://cloutinet.online/dashboard" style="display:block;text-align:center;background:#2563EB;color:#fff;padding:12px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:16px">Go to Dashboard</a></div></div></body></html>`
        })
      })
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'cloutinet.hello@gmail.com',
          subject: 'New Cloutinet Signup',
          html: `<p>New signup: <strong>${email}</strong></p>`
        })
      })
    }
    window.location.href = '/dashboard'
  }

  const submit = () => (mode === 'login' ? handleLogin() : handleSignup())

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '30px', fontWeight: 900, letterSpacing: '-0.01em', color: '#fff' }}>Cloutinet</div>
        <p style={{ color: '#94A3B8', fontSize: '14px', margin: '8px 0 0' }}>
          {mode === 'login' ? 'Welcome back' : 'Run your business from one connected platform'}
        </p>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px', marginBottom: '24px' }}>
          {(['signup', 'login'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '10px', minHeight: '44px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: 600,
              background: mode === m ? '#2563EB' : 'transparent',
              color: mode === m ? '#fff' : '#94A3B8',
              fontFamily: 'inherit'
            }}>
              {m === 'signup' ? 'Sign Up Free' : 'Log In'}
            </button>
          ))}
        </div>

        {mode === 'signup' && (
          <div style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.30)', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px' }}>
            <p style={{ color: '#34D399', fontSize: '13px', margin: 0, fontWeight: 600 }}>Free plan available. No credit card required.</p>
          </div>
        )}

        <label style={labelStyle}>Email address</label>
        <input
          placeholder="Enter your email address"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          style={inputStyle}
        />

        <label style={labelStyle}>Password</label>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <input
            placeholder={mode === 'signup' ? 'Create a password (min 6 characters)' : 'Enter your password'}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            style={{ ...inputStyle, marginBottom: 0, paddingRight: '64px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={toggleStyle}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {mode === 'signup' && (
          <>
            <label style={labelStyle}>Confirm password</label>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <input
                placeholder="Re-enter your password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignup()}
                style={{ ...inputStyle, marginBottom: 0, paddingRight: '64px' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                style={toggleStyle}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </>
        )}

        {error && (
          <div style={{ background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.35)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
            <p style={{ color: '#FCA5A5', fontSize: '13px', margin: 0 }}>{error}</p>
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', minHeight: '48px',
            background: '#2563EB',
            border: 'none', borderRadius: '8px', color: '#fff',
            fontSize: '15px', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontFamily: 'inherit', marginBottom: '16px'
          }}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Free Account'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#94A3B8', margin: 0 }}>
          {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError('') }}
            style={{ background: 'transparent', border: 'none', padding: 0, color: '#60A5FA', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
          >
            {mode === 'signup' ? 'Log In' : 'Sign Up Free'}
          </button>
        </p>
      </div>

      <p style={{ fontSize: '12px', color: '#64748B', marginTop: '20px', textAlign: 'center' }}>
        By signing up you agree to our{' '}
        <a href="/terms" style={{ color: '#94A3B8', textDecoration: 'underline' }}>Terms</a>
        {' '}and{' '}
        <a href="/privacy" style={{ color: '#94A3B8', textDecoration: 'underline' }}>Privacy Policy</a>
      </p>
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
  maxWidth: '400px',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#CBD5E1', fontSize: '13px',
  fontWeight: 600, marginBottom: '6px'
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: '8px', padding: '13px 14px', minHeight: '48px', color: '#fff',
  fontSize: '16px', marginBottom: '16px', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box'
}

const toggleStyle: React.CSSProperties = {
  position: 'absolute', right: '6px', top: '50%',
  transform: 'translateY(-50%)', background: 'transparent',
  border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
  color: '#60A5FA', padding: '10px', fontFamily: 'inherit'
}
