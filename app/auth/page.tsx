'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
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
    }
    if (data.session) {
      window.location.href = '/dashboard'
    } else {
      setMessage('Account created. Please check your email to confirm, then log in.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#07070f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', fontFamily: 'Segoe UI, system-ui, sans-serif'
    }}>
      <div style={{
        background: '#0f0f1a', border: '1px solid #252535',
        borderRadius: '16px', padding: '32px',
        width: '100%', maxWidth: '380px'
      }}>
        <div style={{
          fontSize: '22px', fontWeight: 900,
          background: 'linear-gradient(135deg, #FF6B35, #E91E8C)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>⚡ Cloutinet</div>
        <p style={{ color: '#8888aa', fontSize: '13px', marginBottom: '24px' }}>
          {mode === 'login' ? 'Welcome back' : 'Create your free account'}
        </p>

        <div style={{ display: 'flex', background: '#161625', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
          {(['signup', 'login'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setMessage('') }} style={{
              flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600,
              background: mode === m ? 'linear-gradient(135deg, #FF6B35, #E91E8C)' : 'transparent',
              color: mode === m ? '#fff' : '#8888aa'
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
        {message && <p style={{ color: '#00e676', fontSize: '12px', marginBottom: '12px' }}>{message}</p>}

        <button
          onClick={mode === 'login' ? handleLogin : handleSignup}
          disabled={loading}
          style={{
            width: '100%', padding: '12px',
            background: 'linear-gradient(135deg, #FF6B35, #E91E8C)',
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
  width: '100%', background: '#161625', border: '1px solid #252535',
  borderRadius: '10px', padding: '12px 14px', color: '#f0f0ff',
  fontSize: '14px', marginBottom: '12px', outline: 'none', fontFamily: 'inherit'
}
