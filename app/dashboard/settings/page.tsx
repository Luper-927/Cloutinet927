'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { getBusinessTier } from '../../../lib/tiers'
import { getActingContext, ActingContext } from '../../../lib/permissions'
import Link from 'next/link'

export default function SettingsPage() {
  const [context, setContext] = useState<ActingContext | null>(null)
  const [email, setEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [planName, setPlanName] = useState('Free')
  const [loading, setLoading] = useState(true)

  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }
    setEmail(userData.user.email || '')

    const ctx = await getActingContext(userData.user.id)
    if (!ctx) { window.location.href = '/onboarding'; return }
    setContext(ctx)

    if (ctx.isOwner) {
      const { tierKey } = await getBusinessTier(ctx.ownerId)
      setPlanName(tierKey.charAt(0).toUpperCase() + tierKey.slice(1))
    }

    setLoading(false)
  }

  async function handleChangeEmail() {
    setEmailStatus(null)
    if (!newEmail.includes('@')) {
      setEmailStatus({ type: 'error', message: 'Please enter a valid email address.' })
      return
    }
    setEmailSubmitting(true)
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) {
      setEmailStatus({ type: 'error', message: error.message })
    } else {
      setEmailStatus({ type: 'success', message: 'Check both your old and new email for a confirmation link to complete the change.' })
      setNewEmail('')
    }
    setEmailSubmitting(false)
  }

  async function handleChangePassword() {
    setPasswordStatus(null)
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Passwords do not match.' })
      return
    }
    setPasswordSubmitting(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordStatus({ type: 'error', message: error.message })
    } else {
      setPasswordStatus({ type: 'success', message: 'Password updated.' })
      setNewPassword('')
      setConfirmPassword('')
    }
    setPasswordSubmitting(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Settings</div>
        <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</Link>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>

        {context?.isOwner && (
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #0F766E 100%)',
            borderRadius: '14px', padding: '18px', marginBottom: '24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: 700, marginBottom: '4px' }}>Current plan</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{planName}</div>
            </div>
            <Link href="/dashboard/billing" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '8px 14px', borderRadius: '8px', textDecoration: 'none' }}>
              Manage →
            </Link>
          </div>
        )}

        <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, marginBottom: '10px' }}>Business Profile</h2>
        <Link href="/onboarding" style={{
          display: 'block', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px',
          padding: '14px 16px', marginBottom: '24px', textDecoration: 'none', color: '#0F172A', fontSize: '13px', fontWeight: 600
        }}>
          Edit business info, location, hours & links →
        </Link>

        <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, marginBottom: '10px' }}>Account Email</h2>
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
          <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '10px' }}>Current: <strong style={{ color: '#0F172A' }}>{email}</strong></p>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="New email address"
            style={inputStyle}
          />
          {emailStatus && (
            <p style={{ fontSize: '12px', marginTop: '8px', marginBottom: 0, color: emailStatus.type === 'success' ? '#166534' : '#dc2626' }}>{emailStatus.message}</p>
          )}
          <button onClick={handleChangeEmail} disabled={emailSubmitting} style={buttonStyle(emailSubmitting)}>
            {emailSubmitting ? 'Updating...' : 'Update Email'}
          </button>
        </div>

        <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as
