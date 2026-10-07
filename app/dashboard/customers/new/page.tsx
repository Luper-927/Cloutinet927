'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import { getBusinessTier } from '../../../../lib/tiers'
import { logActivity } from '../../../../lib/permissions'
import { useDashboard } from '../../../components/DashboardShell'

export default function NewCustomerPage() {
  const router = useRouter()
  const { context, tierLimits } = useDashboard()

  const ownerId = context.ownerId
  const actorName = context.employeeName || 'Owner'
  const locationId = context.locationId

  const noPermission = !context.permissions.customers
  const hasTags = !!tierLimits?.advancedCustomers
  const tierName = tierLimits?.name || 'Free'

  const [planBlocked, setPlanBlocked] = useState(!tierLimits?.customerRecords)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function parseTags(raw: string) {
    return raw
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Customer name is required')
      return
    }
    setSaving(true)
    setError('')

    // Fresh plan check at save time, in case the plan changed
    const { limits } = await getBusinessTier(ownerId)
    if (!limits.customerRecords) {
      setSaving(false)
      setPlanBlocked(true)
      return
    }

    const tags = limits.advancedCustomers ? parseTags(tagsInput) : []

    const { error: saveError } = await supabase
      .from('customers')
      .insert({
        user_id: ownerId,
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        notes: notes || null,
        tags,
        location_id: locationId,
      })

    setSaving(false)
    if (saveError) {
      setError(saveError.message)
      return
    }

    await logActivity(ownerId, actorName, 'added', 'customer', name)

    router.push('/dashboard/customers')
  }

  if (noPermission) {
    return (
      <div className="ui-wrap">
        <p className="ui-sub">You don&rsquo;t have permission to manage customers.</p>
      </div>
    )
  }

  if (planBlocked) {
    return (
      <div className="ui-wrap">
        <Link href="/dashboard/customers" className="ui-back">Back to customers</Link>
        <div className="ui-upgrade">
          <h2>Customer records are not included in your plan</h2>
          <p>You&rsquo;re currently on the {tierName} plan. Upgrade to start saving customer records.</p>
          <Link href="/dashboard/billing" className="ui-btn">View plans</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="ui-wrap">
      <Link href="/dashboard/customers" className="ui-back">Back to customers</Link>
      <h1 className="ui-title">Add customer</h1>

      <label className="ui-label">Customer name *</label>
      <input
        className="ui-input"
        placeholder="e.g. Chidi Okafor"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <label className="ui-label">Phone / WhatsApp</label>
      <input
        className="ui-input"
        placeholder="e.g. 08012345678"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />

      <label className="ui-label">Email</label>
      <input
        className="ui-input"
        placeholder="customer@example.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <label className="ui-label">Address</label>
      <input
        className="ui-input"
        placeholder="Delivery address (optional)"
        value={address}
        onChange={e => setAddress(e.target.value)}
      />

      {hasTags && (
        <>
          <label className="ui-label">Tags</label>
          <input
            className="ui-input"
            placeholder="e.g. VIP, Wholesale"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
          />
        </>
      )}

      <label className="ui-label">Notes</label>
      <textarea
        className="ui-input"
        placeholder="e.g. Prefers weekend delivery"
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />

      {error && (
        <div className="ui-error"><p>{error}</p></div>
      )}

      <button onClick={handleSave} disabled={saving} className="ui-btn ui-block">
        {saving ? 'Saving...' : 'Save customer'}
      </button>
      <Link href="/dashboard/customers" className="ui-back" style={{ display: 'block', textAlign: 'center', marginTop: '10px' }}>
        Cancel
      </Link>
    </div>
  )
}
