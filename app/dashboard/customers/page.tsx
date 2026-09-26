'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { getBusinessTier } from '../../../lib/tiers'
import { getActingContext } from '../../../lib/permissions'
import Link from 'next/link'
import {
  loadingWrapStyle,
  loadingTextStyle,
  pageStyle,
  headerStyle,
  headerTitleStyle,
  backLinkStyle,
  contentStyle,
  upgradeWrapStyle,
  upgradeEmojiStyle,
  upgradeTitleStyle,
  upgradeTextStyle,
  upgradeButtonStyle,
  locationBannerStyle,
  addButtonStyle,
  messageButtonStyle,
  followUpBoxStyle,
  followUpTitleStyle,
  followUpTextStyle,
  emptyWrapStyle,
  emptyEmojiStyle,
  emptyTextStyle,
  listWrapStyle,
  normalCardStyle,
  flaggedCardStyle,
  nameStyle,
  detailStyle,
  notesStyle,
  tagsWrapStyle,
  tagStyle,
  contactedRowStyle,
  contactedLabelStyle,
  contactedButtonStyle,
} from './styles'

type Customer = {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  tags: string[] | null
  last_contacted_at: string | null
  created_at: string
}

type LocationRow = {
  business_name: string | null
  address: string | null
}

const FOLLOW_UP_DAYS = 30
const MS_PER_DAY = 1000 * 60 * 60 * 24

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(true)
  const [noPermission, setNoPermission] = useState(false)
  const [hasAdvanced, setHasAdvanced] = useState(false)
  const [hasMarketing, setHasMarketing] = useState(false)
  const [tierName, setTierName] = useState('Free')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [scopedLocationName, setScopedLocationName] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      window.location.href = '/auth'
      return
    }

    const context = await getActingContext(userData.user.id)
    if (!context) {
      window.location.href = '/onboarding'
      return
    }

    if (!context.permissions.customers) {
      setNoPermission(true)
      setLoading(false)
      return
    }

    const { limits } = await getBusinessTier(context.ownerId)
    setTierName(limits.name)
    setHasAdvanced(limits.advancedCustomers)
    setHasMarketing(limits.marketingAutomation)

    if (!limits.customerRecords) {
      setHasAccess(false)
      setLoading(false)
      return
    }

    const selectFields = 'id, name, phone, email'
      + ', address, notes, tags'
      + ', last_contacted_at, created_at'

    let query = supabase
      .from('customers')
      .select<string, Customer>(selectFields)
      .eq('user_id', context.ownerId)
      .order('created_at', { ascending: false })

    if (context.locationId) {
      query = query.eq('location_id', context.locationId)
    }

    const { data } = await query
    setCustomers(data || [])

    if (context.locationId) {
      const locationFields = 'business_name, address'
      const { data: loc } = await supabase
        .from('locations')
        .select<string, LocationRow>(locationFields)
        .eq('id', context.locationId)
        .maybeSingle()
      const name = loc?.business_name || loc?.address
      setScopedLocationName(name || null)
    }

    setLoading(false)
  }

  async function markContacted(id: string) {
    setUpdatingId(id)
    const now = new Date().toISOString()
    await supabase
      .from('customers')
      .update({ last_contacted_at: now })
      .eq('id', id)
    await load()
    setUpdatingId(null)
  }

  function needsFollowUp(c: Customer) {
    if (!hasAdvanced) return false
    if (!c.last_contacted_at) return true
    const then = new Date(c.last_contacted_at).getTime()
    const now = Date.now()
    const msSince = now - then
    const daysSince = msSince / MS_PER_DAY
    return daysSince >= FOLLOW_UP_DAYS
  }

  if (loading) {
    return (
      <div style={loadingWrapStyle}>
        <p style={loadingTextStyle}>Loading...</p>
      </div>
    )
  }

  if (noPermission) {
    return (
      <div style={loadingWrapStyle}>
        <p style={loadingTextStyle}>
          You don&rsquo;t have permission to view customers.
        </p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={pageStyle}>
        <div style={headerStyle}>
          <div style={headerTitleStyle}>Customers</div>
          <Link href="/dashboard" style={backLinkStyle}>Back</Link>
        </div>
        <div style={upgradeWrapStyle}>
          <div style={upgradeEmojiStyle}>👥</div>
          <h2 style={upgradeTitleStyle}>
            Customer records need Essential or higher
          </h2>
          <p style={upgradeTextStyle}>
            You&rsquo;re currently on the {tierName} plan.
            Upgrade to save customer names, contacts,
            and notes so you never lose track of who
            you&rsquo;ve sold to.
          </p>
          <Link href="/dashboard/billing" style={upgradeButtonStyle}>
            View Plans
          </Link>
        </div>
      </div>
    )
  }

  const followUpCustomers = customers.filter(needsFollowUp)

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={headerTitleStyle}>Customers</div>
        <Link href="/dashboard" style={backLinkStyle}>Back</Link>
      </div>

      <div style={contentStyle}>
        {scopedLocationName && (
          <div style={locationBannerStyle}>
            📍 Showing customers for {scopedLocationName} only
          </div>
        )}

        <Link href="/dashboard/customers/new" style={addButtonStyle}>
          + Add Customer
        </Link>

        {hasMarketing && (
          <Link
            href="/dashboard/customers/message"
            style={messageButtonStyle}
          >
            📢 Message Customers
          </Link>
        )}

        {hasAdvanced && followUpCustomers.length > 0 && (
          <div style={followUpBoxStyle}>
            <div style={followUpTitleStyle}>
              Needs Follow-Up ({followUpCustomers.length})
            </div>
            <p style={followUpTextStyle}>
              These customers haven&rsquo;t been marked
              as contacted in {FOLLOW_UP_DAYS}+ days.
            </p>
          </div>
        )}

        {customers.length === 0 ? (
          <div style={emptyWrapStyle}>
            <div style={emptyEmojiStyle}>👥</div>
            <p style={emptyTextStyle}>
              No customers yet. Add your first one above.
            </p>
          </div>
        ) : (
          <div style={listWrapStyle}>
            {customers.map(c => {
              const flagged = needsFollowUp(c)
              const cardStyle = flagged
                ? flaggedCardStyle
                : normalCardStyle
              return (
                <div key={c.id} style={cardStyle}>
                  <div style={nameStyle}>{c.name}</div>
                  {c.phone && (
                    <div style={detailStyle}>📞 {c.phone}</div>
                  )}
                  {c.email && (
                    <div style={detailStyle}>✉️ {c.email}</div>
                  )}
                  {c.address && (
                    <div style={detailStyle}>📍 {c.address}</div>
                  )}
                  {c.notes && (
                    <div style={notesStyle}>{c.notes}</div>
                  )}

                  {hasAdvanced && c.tags && c.tags.length > 0 && (
                    <div style={tagsWrapStyle}>
                      {c.tags.map(tag => (
                        <span key={tag} style={tagStyle}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {hasAdvanced && (
                    <div style={contactedRowStyle}>
                      <span style={contactedLabelStyle}>
                        {c.last_contacted_at
                          ? contactedLabel(c.last_contacted_at)
                          : 'Never contacted'}
                      </span>
                      <button
                        onClick={() => markContacted(c.id)}
                        disabled={updatingId === c.id}
                        style={contactedButtonStyle}
                      >
                        {updatingId === c.id
                          ? '...'
                          : 'Mark Contacted'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function contactedLabel(dateStr: string) {
  const d = new Date(dateStr)
  const formatted = d.toLocaleDateString()
  return 'Last contacted ' + formatted
}
