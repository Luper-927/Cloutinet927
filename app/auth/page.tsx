'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  async function handleSignup() {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    if (data.user) {
      await supabase.from('profiles').insert({ id: data.user.id, email: email })
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Welcome to Cloutinet',
          html: `<html><body style="font-family:sans-serif;padding:20px;background:#f5f5f5"><div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden"><div style="background:#0F172A;padding:24px;text-align:center"><div style="font-size:22px;font-weight:800;color:#fff">Cloutinet</div></div><div style="padding:24px"><h2 style="color:#0F172A">Welcome to Cloutinet!</h2><p style="color:#64748B">Your free business page is ready to set up.</p><a href="https://cloutinet.online/dashboard" style="display:block;text-align:center;background:#0F172A;color:#fff;padding:12px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:16px">Go to Dashboard</a></div></div></body></html>`
        })
      })
      await fetch('/api/send-email', {
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

  return (
    <div style={{
      minHeight: '100vh', background: '#0F172A',
      display: 'flex', flexDirection: 'column' as const,
      alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: 'Segoe UI, system-ui, sans-serif'
    }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>Cloutinet</div>
        <p style={{ color: '#94A3B8', fontSize: '14px', marginTop: '6px' }}>
          {mode === 'login' ? 'Welcome back' : 'Nigeria\'s free business visibility platform'}
        </p>
      </div>

      <div style={{
        background: '#fff', borderRadius: '12px',
        padding: '28px 24px', width: '100%', maxWidth: '400px',
      }}>
        <div style={{ display: 'flex', background: '#F8FAFC', borderRadius: '8px', padding: '4px', marginBottom: '24px' }}>
          {(['signup', 'login'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: 700,
              background: mode === m ? '#0F172A' : 'transparent',
              color: mode === m ? '#fff' : '#64748B',
              fontFamily: 'inherit'
            }}>
              {m === 'signup' ? 'Sign Up Free' : 'Log In'}
            </button>
          ))}
        </div>

        {mode === 'signup' && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px' }}>
            <p style={{ color: '#166534', fontSize: '13px', margin: 0, fontWeight: 600 }}>✓ Free forever — No credit card required</p>
          </div>
        )}

        <label style={labelStyle}>Email Address</label>
        <input
          placeholder="Enter your email address"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())}
          style={inputStyle}
        />

        <label style={labelStyle}>Password</label>
        <input
          placeholder={mode === 'signup' ? 'Create a password (min 6 characters)' : 'Enter your password'}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())}
          style={inputStyle}
        />

        {mode === 'signup' && (
          <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '16px', marginTop: '-8px' }}>
            No email? Create a free Gmail at gmail.com first.
          </p>
        )}

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
            <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{error}</p>
          </div>
        )}

        <button
          onClick={mode === 'login' ? handleLogin : handleSignup}
          disabled={loading}
          style={{
            width: '100%', padding: '14px',
            background: loading ? '#94A3B8' : '#0F172A',
            border: 'none', borderRadius: '8px', color: '#fff',
            fontSize: '15px', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', marginBottom: '16px'
          }}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Free Account'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748B', margin: 0 }}>
          {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
          <span
            onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
            style={{ color: '#0F172A', fontWeight: 700, cursor: 'pointer' }}
          >
            {mode === 'signup' ? 'Log In' : 'Sign Up Free'}
          </span>
        </p>
      </div>

      <p style={{ fontSize: '12px', color: '#475569', marginTop: '20px', textAlign: 'center' }}>
        By signing up you agree to our{' '}
        <a href="/terms" style={{ color: '#94A3B8', textDecoration: 'none' }}>Terms</a>
        {' '}and{' '}
        <a href="/privacy" style={{ color: '#94A3B8', textDecoration: 'none' }}>Privacy Policy</a>
      </p>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#0F172A', fontSize: '13px',
  fontWeight: 700, marginBottom: '6px'
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0',
  borderRadius: '8px', padding: '13px 14px', color: '#0F172A',
  fontSize: '15px', marginBottom: '16px', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box' as const
}
