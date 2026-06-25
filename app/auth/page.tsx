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
      minHeight: '100vh', background: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', fontFamily: 'Segoe UI, system-ui, sans-serif'
    }}>
      <div style={{
        background: '#fff', border: '1px solid #E2E8F0',
        borderRadius: '12px', padding: '32px',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.06)'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Cloutinet</div>
        <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '24px' }}>
          {mode === 'login' ? 'Welcome back' : 'Create your free account'}
        </p>

        <div style={{ display: 'flex', background: '#F8FAFC', borderRadius: '8px', padding: '4px', marginBottom: '20px' }}>
          {(['signup', 'login'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600,
              background: mode === m ? '#0F172A' : 'transparent',
              color: mode === m ? '#fff' : '#64748B'
            }}>
              {m === 'signup' ? 'Sign Up' : 'Log In'}
            </button>
          ))}
        </div>

        <input
          placeholder="Email address"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Password (min 6 characters)"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        {error && <p style={{ color: '#ff4444', fontSize: '12px', marginBottom: '12px' }}>{error}</p>}

        <button
          onClick={mode === 'login' ? handleLogin : handleSignup}
          disabled={loading}
          style={{
            width: '100%', padding: '12px',
            background: '#0F172A',
            border: 'none', borderRadius: '8px', color: '#fff',
            fontSize: '14px', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
        </button>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0',
  borderRadius: '8px', padding: '12px 14px', color: '#0F172A',
  fontSize: '14px', marginBottom: '12px', outline: 'none', fontFamily: 'inherit'
}
