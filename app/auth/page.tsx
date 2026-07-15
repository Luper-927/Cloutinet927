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
          html: `
            <html>
              <body style="font-family: Segoe UI, system-ui, sans-serif; background: #f5f5f5; padding: 20px;">
                <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden;">
                  <div style="background: #0F172A; padding: 32px 24px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 800; color: #fff;">Cloutinet</div>
                    <div style="color: #94A3B8; font-size: 13px; margin-top: 4px;">Create. Share. Grow.</div>
                  </div>
                  <div style="padding: 32px 24px;">
                    <h2 style="font-size: 20px; font-weight: 700; color: #0F172A; margin-bottom: 12px;">Welcome to Cloutinet</h2>
                    <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">Your account has been created. Here's what to do next:</p>
                    <div style="background: #F8FAFC; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
                      <div style="font-size: 13px; color: #444; margin-bottom: 8px;">1. Set up your business profile</div>
                      <div style="font-size: 13px; color: #444; margin-bottom: 8px;">2. Add your products with photos and prices</div>
                      <div style="font-size: 13px; color: #444; margin-bottom: 8px;">3. Share your store link on WhatsApp Status</div>
                      <div style="font-size: 13px; color: #444;">4. Watch customers find you on Google</div>
                    </div>
                    <a href="https://cloutinet.online/dashboard" style="display: block; text-align: center; background: #0F172A; color: #fff; padding: 14px 24px; border-radius: 10px; text-decoration: none; font-size: 15px; font-weight: 700;">Go to My Dashboard</a>
                  </div>
                </div>
              </body>
            </html>
          `
        })
      })

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'cloutinet.hello@gmail.com',
          subject: 'New Cloutinet Signup',
          html: `<p>New user signed up: <strong>${email}</strong></p>`
        })
      })
    }

    window.location.href = '/dashboard'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Segoe UI, system-ui, sans-serif'
    }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A' }}>Cloutinet</div>
        <p style={{ color: '#64748B', fontSize: '15px', marginTop: '6px' }}>
          {mode === 'login' ? 'Welcome back — log in to your account' : 'Create your free business page today'}
        </p>
      </div>

      <div style={{
        background: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '32px 24px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
      }}>

        <div style={{ display: 'flex', background: '#F8FAFC', borderRadius: '10px', padding: '4px', marginBottom: '28px' }}>
          {(['signup', 'login'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '15px', fontWeight: 700,
              background: mode === m ? '#0F172A' : 'transparent',
              color: mode === m ? '#fff' : '#64748B',
              transition: 'all 0.2s'
            }}>
              {m === 'signup' ? 'Sign Up' : 'Log In'}
            </button>
          ))}
        </div>

        {mode === 'signup' && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
            <p style={{ color: '#166534', fontSize: '13px', margin: 0, fontWeight: 600 }}>
              ✓ Free forever — No credit card required
            </p>
          </div>
        )}

        <label style={labelStyle}>Email Address</label>
        <input
          placeholder="Enter your email address"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Password</label>
        <input
          placeholder="Create a password (min 6 characters)"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        {mode === 'signup' && (
          <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '16px', marginTop: '-8px' }}>
            Don't have an email? Use any email — even a Gmail you created just for this.
          </p>
        )}

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
            <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{error}</p>
          </div>
        )}

        <button
          onClick={mode === 'login' ? handleLogin : handleSignup}
          disabled={loading}
          style={{
            width: '100%', padding: '16px',
            background: '#0F172A',
            border: 'none', borderRadius: '10px', color: '#fff',
            fontSize: '16px', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            marginBottom: '16px'
          }}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Log In to My Account' : 'Create My Free Account'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
          {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
          <span
            onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
            style={{ color: '#0F172A', fontWeight: 700, cursor: 'pointer' }}
          >
            {mode === 'signup' ? 'Log In' : 'Sign Up Free'}
          </span>
        </p>

      </div>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#94A3B8' }}>
          By signing up you agree to our{' '}
          <a href="/terms" style={{ color: '#0F172A', textDecoration: 'none', fontWeight: 600 }}>Terms</a>
          {' '}and{' '}
          <a href="/privacy" style={{ color: '#0F172A', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</a>
        </p>
      </div>

    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#0F172A', fontSize: '14px',
  fontWeight: 700, marginBottom: '8px'
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#F8FAFC', border: '2px solid #E2E8F0',
  borderRadius: '10px', padding: '14px 16px', color: '#0F172A',
  fontSize: '15px', marginBottom: '16px', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box'
}
