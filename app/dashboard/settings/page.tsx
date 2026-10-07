'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { useDashboard } from '../../components/DashboardShell'

type Status = { type: 'success' | 'error'; message: string } | null

function LinkRow({ href, title, hint }: { href: string; title: string; hint: string }) {
  return (
    <Link href={href} className="ui-linkrow">
      <span>
        <span style={{ display: 'block' }}>{title}</span>
        <span className="ui-meta" style={{ display: 'block', fontWeight: 400 }}>{hint}</span>
      </span>
      <span className="go">Open</span>
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

  const statusColor = (s: Status) => (s?.type === 'success' ? '#34D399' : '#F87171')

  return (
    <div className="ui-wrap" style={{ paddingBottom: '24px' }}>
      <h1 className="ui-title">Settings</h1>

      {isOwner && (
        <>
          <div className="ui-section-label">Business</div>
          <div className="ui-list">
            <LinkRow href="/onboarding" title="Business profile" hint="Name, location, hours and links" />
            <LinkRow href="/dashboard/locations" title="Locations" hint="Your branches and where employees work" />
          </div>
        </>
      )}

      {canTeam && (
        <>
          <div className="ui-section-label">Team</div>
          <div className="ui-list">
            <LinkRow href="/dashboard/employees" title="Employees and permissions" hint="Invite staff and choose what each person can access" />
          </div>
        </>
      )}

      <div className="ui-section-label">Account</div>
      <div className="ui-list">
        <div className="ui-card">
          <div className="ui-name" style={{ marginBottom: '8px' }}>Email</div>
          <p className="ui-meta" style={{ margin: '0 0 12px' }}>Current: <strong style={{ color: '#fff' }}>{email}</strong></p>
          <input className="ui-input tight" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="New email address" />
          {emailStatus && <p style={{ fontSize: '13px', margin: '0 0 10px', color: statusColor(emailStatus) }}>{emailStatus.message}</p>}
          <button onClick={handleChangeEmail} disabled={emailSubmitting} className="ui-btn ui-block">
            {emailSubmitting ? 'Updating...' : 'Update email'}
          </button>
        </div>

        <div className="ui-card">
          <div className="ui-name" style={{ marginBottom: '12px' }}>Password</div>
          <input className="ui-input tight" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" />
          <input className="ui-input tight" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
          {passwordStatus && <p style={{ fontSize: '13px', margin: '0 0 10px', color: statusColor(passwordStatus) }}>{passwordStatus.message}</p>}
          <button onClick={handleChangePassword} disabled={passwordSubmitting} className="ui-btn ui-block">
            {passwordSubmitting ? 'Updating...' : 'Update password'}
          </button>
        </div>
      </div>

      {isOwner && (
        <>
          <div className="ui-section-label">Billing</div>
          <div className="ui-list">
            <LinkRow href="/dashboard/billing" title={'Plan: ' + planName} hint="Change your plan and see renewal dates" />
          </div>
        </>
      )}

      {canDeveloper && (
        <>
          <div className="ui-section-label">Developer</div>
          <div className="ui-list">
            <LinkRow href="/dashboard/api-keys" title="API keys" hint="Connect Cloutinet to your own systems" />
            <LinkRow href="/dashboard/integrations" title="Integrations" hint="WhatsApp, analytics, email and webhooks" />
          </div>
        </>
      )}

      <div className="ui-section-label" style={{ color: '#F87171' }}>Danger zone</div>
      <div className="ui-card" style={{ borderColor: 'rgba(248,113,113,.35)' }}>
        <div className="ui-actions" style={{ flexWrap: 'wrap' }}>
          <button onClick={signOut} className="ui-btn ui-btn-ghost">Sign out</button>
          <a href="mailto:cloutinet.hello@gmail.com?subject=Account%20deletion%20request" className="ui-btn ui-btn-danger">
            Request account deletion
          </a>
        </div>
        <p className="ui-meta" style={{ margin: '10px 0 0' }}>Account deletion opens an email to our team, who process the request.</p>
      </div>
    </div>
  )
}
