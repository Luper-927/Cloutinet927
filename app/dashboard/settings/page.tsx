'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { useDashboard } from '../../components/DashboardShell'

type Status = { type: 'success' | 'error'; message: string } | null

function LinkRow({ href, title, hint }: { href: string; title: string; hint: string }) {
  return (
    <Link href={href} style={rowStyle}>
      <span>
        <span style={rowTitleStyle}>{title}</span>
        <span style={rowHintStyle}>{hint}</span>
      </span>
      <span style={{ color: '#94A3B8', fontSize: '18px' }} aria-hidden="true">›</span>
    </Link>
  )
}

export default function SettingsPage() {
  const { context, tierLimits, signOut } = useDashboard()

  const isOwner = !!context.isOwner
  const canTeam = isOwner && !!context.permissions.employees && !!tierLimits?.employees
  const canDeveloper = isOwner && !!tierLimits?.integrations
  const planName = tierLimits?.name || 'Free'

  const [email, setEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [emailStatus, setEmailStatus] = useState<Status>(null)
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState<Status>(null)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ''))
  }, [])

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

  return (
    <div style={wrapStyle}>
      <h1 style={titleStyle}>Settings</h1>

      {isOwner && (
        <>
          <h2 style={groupTitleStyle}>Business</h2>
          <div style={panelStyle}>
            <LinkRow href="/onboarding" title="Business profile" hint="Name, location, hours and links" />
            <LinkRow href="/dashboard/locations" title="Locations" hint="Your branches and where employees work" />
          </div>
        </>
      )}

      {canTeam && (
        <>
          <h2 style={groupTitleStyle}>Team</h2>
          <div style={panelStyle}>
            <LinkRow href="/dashboard/employees" title="Employees and permissions" hint="Invite staff and choose what each person can access" />
          </div>
        </>
      )}

      <h2 style={groupTitleStyle}>Account</h2>

      <div style={cardStyle}>
        <div style={cardTitleStyle}>Email</div>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 10px' }}>
          Current: <strong style={{ color: '#0F172A' }}>{email}</strong>
        </p>
        <input
          type="email"
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
          placeholder="New email address"
          style={inputStyle}
        />
        {emailStatus && (
          <p style={{ fontSize: '13px', margin: '8px 0 0', color: emailStatus.type === 'success' ? '#166534' : '#dc2626' }}>
            {emailStatus.message}
          </p>
        )}
        <button onClick={handleChangeEmail} disabled={emailSubmitting} style={buttonStyle(emailSubmitting)}>
          {emailSubmitting ? 'Updating...' : 'Update email'}
        </button>
      </div>

      <div style={cardStyle}>
        <div style={cardTitleStyle}>Password</div>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder="New password"
          style={{ ...inputStyle, marginBottom: '8px' }}
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          style={inputStyle}
        />
        {passwordStatus && (
          <p style={{ fontSize: '13px', margin: '8px 0 0', color: passwordStatus.type === 'success' ? '#166534' : '#dc2626' }}>
            {passwordStatus.message}
          </p>
        )}
        <button onClick={handleChangePassword} disabled={passwordSubmitting} style={buttonStyle(passwordSubmitting)}>
          {passwordSubmitting ? 'Updating...' : 'Update password'}
        </button>
      </div>

      {isOwner && (
        <>
          <h2 style={groupTitleStyle}>Billing</h2>
          <div style={panelStyle}>
            <LinkRow href="/dashboard/billing" title={'Plan: ' + planName} hint="Change your plan and see renewal dates" />
          </div>
        </>
      )}

      {canDeveloper && (
        <>
          <h2 style={groupTitleStyle}>Developer</h2>
          <div style={panelStyle}>
            <LinkRow href="/dashboard/api-keys" title="API keys" hint="Connect Cloutinet to your own systems" />
            <LinkRow href="/dashboard/integrations" title="Integrations" hint="WhatsApp, analytics, email and webhooks" />
          </div>
        </>
      )}

      <h2 style={{ ...groupTitleStyle, color: '#B91C1C' }}>Danger zone</h2>
      <div style={{ ...panelStyle, borderColor: '#FECACA' }}>
        <button onClick={signOut} style={{ ...rowStyle, width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
          <span>
            <span style={rowTitleStyle}>Sign out</span>
            <span style={rowHintStyle}>Sign out on this device</span>
          </span>
        </button>
        <a
          href="mailto:cloutinet.hello@gmail.com?subject=Account%20deletion%20request"
          style={{ ...rowStyle, borderBottom: 'none' }}
        >
          <span>
            <span style={{ ...rowTitleStyle, color: '#B91C1C' }}>Request account deletion</span>
            <span style={rowHintStyle}>Opens an email to our team to process your request</span>
          </span>
        </a>
      </div>
    </div>
  )
}

const wrapStyle: React.CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  fontFamily: 'Segoe UI, system-ui, sans-serif',
  paddingBottom: '24px',
}

const titleStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 800,
  color: '#0F172A',
  margin: '0 0 6px',
  letterSpacing: '-0.01em',
}

const groupTitleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#475569',
  margin: '24px 0 8px',
}

const panelStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  overflow: 'hidden',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  minHeight: '56px',
  padding: '12px 16px',
  borderBottom: '1px solid #EEF2F6',
  textDecoration: 'none',
  color: '#0F172A',
}

const rowTitleStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 600,
  color: '#0F172A',
}

const rowHintStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  color: '#64748B',
  marginTop: '2px',
  lineHeight: 1.4,
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '12px',
}

const cardTitleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#0F172A',
  marginBottom: '10px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: '8px',
  border: '1px solid #E2E8F0',
  fontSize: '14px',
  fontFamily: 'inherit',
  outline: 'none',
}

function buttonStyle(disabled: boolean): React.CSSProperties {
  return {
    marginTop: '10px',
    width: '100%',
    minHeight: '44px',
    padding: '11px',
    background: '#0F172A',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'inherit',
    opacity: disabled ? 0.6 : 1,
  }
}
