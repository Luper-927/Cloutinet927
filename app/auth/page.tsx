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
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: email,
      })

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Welcome to Cloutinet 🚀',
          html: `
            <html>
              <body style="font-family: Segoe UI, system-ui, sans-serif; background: #f5f5f5; padding: 20px;">
                <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                  <div style="background: linear-gradient(135deg, #6B21A8, #9333EA); padding: 32px 24px; text-align: center;">
                    <img src="https://i.ibb.co/whv46QjG/Screenshot-20260603-212319.jpg" alt="Cloutinet" style="height: 60px; object-fit: contain; margin-bottom: 12px;" />
                    <div style="font-size: 28px; font-weight: 900; color: #fff;">⚡ Cloutinet</div>
                    <div style="color: rgba(255,255,255,0.8); font-size: 13px; margin-top: 4px;">Create. Share. Grow.</div>
                  </div>
                  <div style="padding: 32px 24px;">
                    <h2 style="font-size: 20px; font-weight: 800; color: #1a1a2e; margin-bottom: 12px;">Welcome to Cloutinet! 🎉</h2>
                    <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
                      Your account has been created successfully. You are now part of Nigeria's fastest growing business visibility platform.
                    </p>
                    <div style="background: #f9f5ff; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
                      <div style="font-size: 13px; color: #444; margin-bottom: 8px;">1️⃣ Set up your business profile</div>
                      <div style="font-size: 13px; color: #444; margin-bottom: 8px;">2️⃣ Add your products with photos and prices</div>
                      <div style="font-size: 13px; color: #444; margin-bottom: 8px;">3️⃣ Share your store link on WhatsApp Status</div>
                      <div style="font-size: 13px; color: #444;">4️⃣ Watch customers find you on Google</div>
                    </div>
                    <a href="https://cloutinet.online/dashboard" style="display: block; text-align: center; background: #6B21A8; color: #fff; padding: 14px 24px; border-radius: 10px; text-decoration: none; font-size: 15px; font-weight: 700;">
                      Go to My Dashboard
                    </a>
                  </div>
                  <div style="background: #f9f5ff; padding: 20px 24px; text-align: center; border-top: 1px solid #e5d5ff;">
                    <div style="font-size: 13px; font-weight: 700; color: #6B21A8;">cloutinet.online</div>
                    <div style="color: #aaa; font-size: 11px; margin-top: 4px;">Nigeria's free business visibility platform</div>
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
          subject: '🚀 New Cloutinet Signup!',
          html: `<p>New user signed up: <strong>${email}</strong></p><p>Check Supabase: <a href="https://supabase.com/dashboard/project/ujtsoawkedgsfkjkpfzj/auth/users">View Users</a></p>`
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
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: '16px', padding: '32px',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.06)'
      }}>
        <div style={{ fontSize: '22px', fontWeight: 900, color: '#6B21A8', marginBottom: '8px' }}>
          ⚡ Cloutinet
        </div>
        <p style={{ color: '#888', fontSize: '13px', marginBottom: '24px' }}>
          {mode === 'login' ? 'Welcome back' : 'Create your free account'}
        </p>

        <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
          {(['signup', 'login'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600,
              background: mode === m ? '#6B21A8' : 'transparent',
              color: mode === m ? '#fff' : '#888'
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
            background: '#6B21A8',
            border: 'none', borderRadius: '10px', color: '#fff',
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
  width: '100%', background: '#fafafa', border: '1px solid #e5e7eb',
  borderRadius: '10px', padding: '12px 14px', color: '#1a1a2e',
  fontSize: '14px', marginBottom: '12px', outline: 'none', fontFamily: 'inherit'
}
