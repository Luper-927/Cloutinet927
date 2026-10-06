'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { logActivity } from '../../lib/permissions'
import { calculateVisibilityScore } from '../../lib/visibility-score'
import { useDashboard } from '../components/DashboardShell'
import { homeCss } from './home-styles'

type Totals = Record<string, number>

type DashData = {
  customers: number | null
  newCustomers: number | null
  staleCustomers: number | null
  revenue30: Totals
  revenuePrev30: Totals
  pendingCount: number
  pendingTotals: Totals
  overdueCount: number
  invitedEmployees: number
  views7: number
  viewsPrev7: number
  clicks7: number
  clicksPrev7: number
}

const emptyData: DashData = {
  customers: null,
  newCustomers: null,
  staleCustomers: null,
  revenue30: {},
  revenuePrev30: {},
  pendingCount: 0,
  pendingTotals: {},
  overdueCount: 0,
  invitedEmployees: 0,
  views7: 0,
  viewsPrev7: 0,
  clicks7: 0,
  clicksPrev7: 0,
}

type BriefItem = { text: string; href?: string; label?: string }
type AttentionItem = { text: string; href: string; label: string }

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return currency + ' ' + Math.round(amount).toLocaleString()
  }
}

function moneyMap(totals: Totals) {
  const entries = Object.entries(totals).filter(([, v]) => v > 0)
  if (entries.length === 0) return null
  return entries.map(([c, v]) => money(v, c)).join(' + ')
}

function addTo(totals: Totals, currency: string, amount: number) {
  totals[currency] = (totals[currency] || 0) + amount
}

function pctChange(current: number, previous: number): number | null {
  if (previous <= 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

function plural(n: number, word: string) {
  return n + ' ' + word + (n === 1 ? '' : 's')
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return mins + ' min ago'
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours + 'h ago'
  const days = Math.floor(hours / 24)
  if (days < 30) return days + 'd ago'
  return new Date(iso).toLocaleDateString()
}

function scoreColor(score: number) {
  if (score >= 80) return '#00aa55'
  if (score >= 50) return '#FF6B35'
  return '#ff4444'
}

async function countOf(query: any): Promise<number | null> {
  const { count, error } = await query
  return error ? null : count ?? 0
}

export default function Dashboard() {
  const { context, profile, tierLimits, locationName } = useDashboard()

  const [products, setProducts] = useState<any[]>([])
  const [data, setData] = useState<DashData>(emptyData)
  const [insights, setInsights] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllProducts, setShowAllProducts] = useState(false)

  const isOwner = !!context.isOwner
  const perms = context.permissions
  const canCustomers = !!perms.customers
  const canPayments = !!perms.payments && !!tierLimits?.paymentsModule
  const canEmployees = isOwner && !!perms.employees && !!tierLimits?.employees
  const canDocuments = !!perms.documents && !!tierLimits?.documentsModule
  const slug = profile?.business_slug

  useEffect(() => { loadData() }, [])

  async function fetchProducts() {
    let q: any = supabase
      .from('products')
      .select('*')
      .eq('user_id', context.ownerId)
      .order('created_at', { ascending: false })
    if (context.locationId) q = q.eq('location_id', context.locationId)
    const { data: rows } = await q
    setProducts(rows || [])
    return rows || []
  }

  async function loadData() {
    const ownerId = context.ownerId
    const locId = context.locationId

    const now = Date.now()
    const day = 86400000
    const iso = (ms: number) => new Date(ms).toISOString()
    const d7 = iso(now - 7 * day)
    const d14 = iso(now - 14 * day)
    const d30 = iso(now - 30 * day)
    const d60 = iso(now - 60 * day)
    const today = new Date().toISOString().slice(0, 10)

    const none: Promise<any> = Promise.resolve(null)
    const scoped = (q: any) => (locId ? q.eq('location_id', locId) : q)
    const events = (type: string, from: string, to?: string) => {
      let q: any = supabase
        .from('analytics_events')
        .select('id', { count: 'exact', head: true })
        .eq('business_slug', slug)
        .eq('event_type', type)
        .gte('created_at', from)
      if (to) q = q.lt('created_at', to)
      return countOf(q)
    }
    const hasAnalytics = isOwner && !!slug

    const [
      ,
      customersTotal,
      newCustomers,
      staleCustomers,
      paidRes,
      pendingRes,
      invited,
      views7,
      viewsPrev7,
      clicks7,
      clicksPrev7,
      insightsRes,
      activityRes,
    ] = await Promise.all([
      fetchProducts(),
      canCustomers
        ? countOf(scoped(supabase.from('customers').select('id', { count: 'exact', head: true }).eq('user_id', ownerId)))
        : none,
      canCustomers
        ? countOf(scoped(supabase.from('customers').select('id', { count: 'exact', head: true }).eq('user_id', ownerId).gte('created_at', d7)))
        : none,
      canCustomers
        ? countOf(
            scoped(
              supabase
                .from('customers')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', ownerId)
                .lt('created_at', d7)
                .or('last_contacted_at.is.null,last_contacted_at.lt.' + d30)
            )
          )
        : none,
      canPayments
        ? Promise.resolve(
            scoped(
              supabase
                .from('payment_records')
                .select('amount,currency,created_at')
                .eq('owner_id', ownerId)
                .eq('status', 'paid')
                .gte('created_at', d60)
            ).limit(2000)
          )
        : none,
      canPayments
        ? Promise.resolve(
            supabase
              .from('payment_requests')
              .select('amount,currency,due_date')
              .eq('owner_id', ownerId)
              .eq('status', 'pending')
          )
        : none,
      canEmployees
        ? countOf(supabase.from('employees').select('id', { count: 'exact', head: true }).eq('owner_id', ownerId).eq('status', 'invited'))
        : none,
      hasAnalytics ? events('page_view', d7) : none,
      hasAnalytics ? events('page_view', d14, d7) : none,
      hasAnalytics ? events('whatsapp_click', d7) : none,
      hasAnalytics ? events('whatsapp_click', d14, d7) : none,
      isOwner && tierLimits?.aiAutomation
        ? Promise.resolve(
            supabase
              .from('ai_insights')
              .select('*')
              .eq('owner_id', ownerId)
              .eq('dismissed', false)
              .order('created_at', { ascending: false })
              .limit(5)
          )
        : none,
      isOwner
        ? Promise.resolve(
            supabase
              .from('activity_log')
              .select('id,actor_name,action,object_type,object_label,created_at')
              .eq('owner_id', ownerId)
              .order('created_at', { ascending: false })
              .limit(6)
          )
        : none,
    ])

    const revenue30: Totals = {}
    const revenuePrev30: Totals = {}
    for (const row of (paidRes?.data as any[]) || []) {
      const cur = row.currency || 'NGN'
      const amt = Number(row.amount) || 0
      if (new Date(row.created_at).getTime() >= now - 30 * day) addTo(revenue30, cur, amt)
      else addTo(revenuePrev30, cur, amt)
    }

    const pendingTotals: Totals = {}
    let pendingCount = 0
    let overdueCount = 0
    for (const row of (pendingRes?.data as any[]) || []) {
      pendingCount += 1
      addTo(pendingTotals, row.currency || 'NGN', Number(row.amount) || 0)
      if (row.due_date && row.due_date < today) overdueCount += 1
    }

    setData({
      customers: customersTotal,
      newCustomers,
      staleCustomers,
      revenue30,
      revenuePrev30,
      pendingCount,
      pendingTotals,
      overdueCount,
      invitedEmployees: invited || 0,
      views7: views7 || 0,
      viewsPrev7: viewsPrev7 || 0,
      clicks7: clicks7 || 0,
      clicksPrev7: clicksPrev7 || 0,
    })
    setInsights((insightsRes?.data as any[]) || [])
    setActivity((activityRes?.data as any[]) || [])
    setLoading(false)
  }

  async function dismissInsight(id: string) {
    setInsights(prev => prev.filter(i => i.id !== id))
    await supabase.from('ai_insights').update({ dismissed: true }).eq('id', id)
  }

  async function togglePublish(id: string, current: boolean, name: string) {
    await supabase.from('products').update({ is_published: !current }).eq('id', id)
    await logActivity(context.ownerId, context.employeeName || 'Owner', current ? 'hid' : 'published', 'product', name)
    fetchProducts()
  }

  async function deleteProduct(id: string, name: string) {
    const confirmed = confirm('Delete "' + name + '"? This cannot be undone.')
    if (!confirmed) return
    await supabase.from('products').delete().eq('id', id)
    await logActivity(context.ownerId, context.employeeName || 'Owner', 'deleted', 'product', name)
    fetchProducts()
  }

  function getOneAction() {
    if (!profile) return { task: 'Set up your business profile', link: '/onboarding' }
    if (!profile.location) return { task: 'Add your business location', link: '/onboarding' }
    if (!profile.tagline) return { task: 'Add a business tagline', link: '/onboarding' }
    if (!profile.business_hours) return { task: 'Add your business hours', link: '/onboarding' }
    if (!profile.services) return { task: 'List the services or products you offer', link: '/onboarding' }
    if (products.length === 0) return { task: 'Add your first product', link: '/products/new' }
    if (products.length < 5) return { task: 'Add more products so your page has at least 5', link: '/products/new' }
    if (!profile.facebook_url && !profile.instagram_url) return { task: 'Add a social media link to your profile', link: '/onboarding' }
    return null
  }

  const hasProfile = !!(profile && profile.business_name)
  const score = profile ? calculateVisibilityScore(profile, products.length) : 0
  const previousScore = profile?.last_visibility_score || 0
  const scoreChange = score - previousScore
  const daysSinceCreated = profile?.created_at
    ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000)
    : 0
  const isIndexingPeriod = daysSinceCreated < 7

  const currencyTotals: Totals = {}
  Object.entries(data.revenue30).forEach(([c, v]) => addTo(currencyTotals, c, v))
  Object.entries(data.revenuePrev30).forEach(([c, v]) => addTo(currencyTotals, c, v))
  const mainCurrency =
    Object.entries(currencyTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'NGN'
  const rev30 = data.revenue30[mainCurrency] || 0
  const revPrev30 = data.revenuePrev30[mainCurrency] || 0
  const revChange = pctChange(rev30, revPrev30)
  const viewsChange = pctChange(data.views7, data.viewsPrev7)

  const brief: BriefItem[] = []
  if (canPayments && (rev30 > 0 || revPrev30 > 0)) {
    if (rev30 > 0) {
      const change =
        revChange !== null
          ? ', ' + (revChange >= 0 ? 'up ' : 'down ') + Math.abs(revChange) + '% from the 30 days before'
          : ''
      brief.push({
        text: 'You recorded ' + money(rev30, mainCurrency) + ' in payments over the last 30 days' + change + '.',
        href: '/dashboard/payments',
        label: 'View payments',
      })
    } else {
      brief.push({
        text: 'No payments were recorded in the last 30 days, compared with ' + money(revPrev30, mainCurrency) + ' in the 30 days before.',
        href: '/dashboard/payments',
        label: 'View payments',
      })
    }
  }
  if (canPayments && data.pendingCount > 0) {
    brief.push({
      text:
        plural(data.pendingCount, 'payment request') +
        ' outstanding, ' +
        (moneyMap(data.pendingTotals) || '') +
        ' in total' +
        (data.overdueCount > 0 ? ', ' + data.overdueCount + ' past due' : '') +
        '.',
      href: '/dashboard/payments/requests',
      label: 'Review payments',
    })
  }
  if (canCustomers && (data.newCustomers || 0) > 0) {
    brief.push({
      text: plural(data.newCustomers || 0, 'new customer') + ' added this week.',
      href: '/dashboard/customers',
      label: 'View customers',
    })
  }
  if (canCustomers && (data.staleCustomers || 0) > 0) {
    const n = data.staleCustomers || 0
    brief.push({
      text: plural(n, 'customer') + (n === 1 ? ' has' : ' have') + ' not been contacted in over 30 days.',
      href: '/dashboard/customers/message',
      label: 'Message customers',
    })
  }
  if (isOwner && data.views7 > 0) {
    const change =
      viewsChange !== null
        ? ' (' + Math.abs(viewsChange) + '% ' + (viewsChange >= 0 ? 'more' : 'fewer') + ' than the week before)'
        : ''
    brief.push({
      text: 'Your public page had ' + plural(data.views7, 'visit') + ' in the last 7 days' + change + '.',
      href: '/dashboard#visibility',
      label: 'See visibility',
    })
  }
  if (isOwner && data.clicks7 > 0) {
    brief.push({
      text: data.clicks7 + ' ' + (data.clicks7 === 1 ? 'person' : 'people') + ' tapped WhatsApp to contact you this week.',
      href: '/dashboard#visibility',
      label: 'See visibility',
    })
  }

  const attention: AttentionItem[] = []
  if (canPayments && data.overdueCount > 0) {
    attention.push({
      text: plural(data.overdueCount, 'payment request') + ' past due.',
      href: '/dashboard/payments/requests',
      label: 'Review',
    })
  }
  const notYetDue = data.pendingCount - data.overdueCount
  if (canPayments && notYetDue > 0) {
    attention.push({
      text: plural(notYetDue, 'payment request') + ' waiting to be paid.',
      href: '/dashboard/payments/requests',
      label: 'View',
    })
  }
  if (canCustomers && (data.staleCustomers || 0) > 0) {
    attention.push({
      text: plural(data.staleCustomers || 0, 'customer') + ' not contacted in over 30 days.',
      href: '/dashboard/customers/message',
      label: 'Message',
    })
  }
  if (canEmployees && data.invitedEmployees > 0) {
    attention.push({
      text: plural(data.invitedEmployees, 'employee invite') + ' not accepted yet.',
      href: '/dashboard/employees',
      label: 'View',
    })
  }
  const setupAction = isOwner && hasProfile ? getOneAction() : null
  if (setupAction) {
    attention.push({ text: setupAction.task + '.', href: setupAction.link, label: 'Do this' })
  }

  const metrics: { label: string; value: string; sub: string; subClass?: string; href: string }[] = []
  if (canPayments) {
    metrics.push({
      label: 'Revenue',
      value: money(rev30, mainCurrency),
      sub:
        revChange !== null
          ? (revChange >= 0 ? '+' : '') + revChange + '% vs previous 30 days'
          : 'Last 30 days',
      subClass: revChange === null ? undefined : revChange >= 0 ? 'dh-up' : 'dh-down',
      href: '/dashboard/payments',
    })
  }
  if (canCustomers && data.customers !== null) {
    metrics.push({
      label: 'Customers',
      value: String(data.customers),
      sub: (data.newCustomers || 0) > 0 ? '+' + data.newCustomers + ' this week' : 'No new this week',
      href: '/dashboard/customers',
    })
  }
  if (canPayments) {
    metrics.push({
      label: 'Pending payments',
      value: String(data.pendingCount),
      sub: moneyMap(data.pendingTotals) || 'Nothing outstanding',
      href: '/dashboard/payments/requests',
    })
  }
  if (isOwner && slug) {
    metrics.push({
      label: 'Page visits',
      value: String(data.views7),
      sub:
        viewsChange !== null
          ? (viewsChange >= 0 ? '+' : '') + viewsChange + '% vs previous 7 days'
          : 'Last 7 days',
      subClass: viewsChange === null ? undefined : viewsChange >= 0 ? 'dh-up' : 'dh-down',
      href: '/dashboard#visibility',
    })
  }

  const actions: { href: string; label: string }[] = []
  if (canCustomers) actions.push({ href: '/dashboard/customers/new', label: 'Add customer' })
  if (perms.products) actions.push({ href: '/products/new', label: 'Add product' })
  if (canPayments) actions.push({ href: '/dashboard/payments/requests', label: 'Request payment' })
  if (canEmployees) actions.push({ href: '/dashboard/employees/invite', label: 'Invite employee' })
  if (canDocuments) actions.push({ href: '/dashboard/documents', label: 'Upload document' })
  if (tierLimits?.marketingAutomation) actions.push({ href: '/dashboard/marketing/campaigns/new', label: 'Create campaign' })

  const visibleProducts = showAllProducts ? products : products.slice(0, 5)

  if (!hasProfile) {
    return (
      <div className="dh-wrap">
        <style>{homeCss}</style>
        <div className="dh-welcome">
          <h2>Welcome to Cloutinet</h2>
          <p>Set up your business profile to start running your business from one place.</p>
          <Link href="/onboarding" className="dh-btn">Set up business profile</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="dh-wrap">
        <style>{homeCss}</style>
        <div className="dh-loading">Loading your business...</div>
      </div>
    )
  }

  return (
    <div className="dh-wrap">
      <style>{homeCss}</style>

      <div className="dh-head">
        <div>
          <h1 className="dh-h1">{profile.business_name}</h1>
          <div className="dh-sub">
            {profile.business_id ? profile.business_id + ' - ' : ''}
            {profile.location || 'No location set'}
          </div>
        </div>
        {isOwner && <Link href="/onboarding" className="dh-btn-ghost">Edit business profile</Link>}
      </div>

      <section className="dh-brief" aria-label="Business brief">
        <h2>Here is what changed in your business</h2>
        <p className="dh-brief-note">Summarised from your recorded customers, payments and page activity.</p>

        {brief.map((item, i) => (
          <div key={i} className="dh-brief-item">
            <div>{item.text}</div>
            {item.href && <Link href={item.href} className="dh-brief-link">{item.label}</Link>}
          </div>
        ))}

        {insights.map(insight => (
          <div key={insight.id} className="dh-brief-item">
            <div>{insight.message}</div>
            <button className="dh-brief-dismiss" onClick={() => dismissInsight(insight.id)} aria-label="Dismiss insight">Dismiss</button>
          </div>
        ))}

        {brief.length === 0 && insights.length === 0 && (
          <div className="dh-brief-empty">
            Nothing has changed yet. As you add customers, record payments and get visits to your public page, a summary of what changed will appear here.
          </div>
        )}
      </section>

      {metrics.length > 0 && (
        <div className="dh-strip" style={{ ['--n' as any]: metrics.length }}>
          {metrics.map(m => (
            <Link key={m.label} href={m.href} className="dh-metric">
              <div className="dh-m-label">{m.label}</div>
              <div className="dh-m-value">{m.value}</div>
              <div className={'dh-m-sub ' + (m.subClass || '')}>{m.sub}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="dh-grid">
        <section className="dh-sec dh-att">
          <div className="dh-sec-head"><h3>Needs your attention</h3></div>
          <div className="dh-panel">
            {attention.length === 0 ? (
              <div className="dh-empty">Nothing needs your attention right now.</div>
            ) : (
              attention.map((item, i) => (
                <div key={i} className="dh-row">
                  <div className="dh-row-main">
                    <span className="dh-dot" aria-hidden="true" />
                    <span>{item.text}</span>
                  </div>
                  <Link href={item.href} className="dh-text-link">{item.label}</Link>
                </div>
              ))
            )}
          </div>
        </section>

        {actions.length > 0 && (
          <section className="dh-sec dh-qa">
            <div className="dh-sec-head"><h3>Quick actions</h3></div>
            <div className="dh-actions">
              {actions.map(a => (
                <Link key={a.href + a.label} href={a.href} className="dh-action">{a.label}</Link>
              ))}
            </div>
          </section>
        )}

        {isOwner && (
          <section className="dh-sec dh-act">
            <div className="dh-sec-head">
              <h3>Recent activity</h3>
              <Link href="/dashboard/activity" className="dh-text-link">See all</Link>
            </div>
            <div className="dh-panel">
              {activity.length === 0 ? (
                <div className="dh-empty">Activity from you and your team will show up here.</div>
              ) : (
                activity.map(a => (
                  <div key={a.id} className="dh-row">
                    <span>
                      <strong>{a.actor_name}</strong> {a.action} {a.object_type}
                      {a.object_label ? ' "' + a.object_label + '"' : ''}
                    </span>
                    <span className="dh-time">{a.created_at ? timeAgo(a.created_at) : ''}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {isOwner && (
          <section id="visibility" className="dh-sec dh-vis">
            <div className="dh-sec-head">
              <h3>Visibility</h3>
              <span className="dh-muted">Your public presence</span>
            </div>
            <div className="dh-panel dh-pad">
              <div className="dh-m-label">Visibility score</div>
              <div className="dh-score-row">
                <div className="dh-score" style={{ color: scoreColor(score) }}>
                  {score}<small>/100</small>
                </div>
                {scoreChange !== 0 && previousScore > 0 && (
                  <div className={scoreChange > 0 ? 'dh-up' : 'dh-down'} style={{ fontSize: 13, fontWeight: 700 }}>
                    {scoreChange > 0 ? '+' : ''}{scoreChange} this week
                  </div>
                )}
              </div>
              <div className="dh-track">
                <div className="dh-fill" style={{ width: score + '%', background: scoreColor(score) }} />
              </div>

              <div className="dh-status">
                <i style={{ background: isIndexingPeriod ? '#F59E0B' : '#00aa55' }} />
                <span style={{ color: isIndexingPeriod ? '#92400E' : '#166534' }}>
                  {isIndexingPeriod ? 'Waiting for Google to index your page' : 'Your page has been live for a while'}
                </span>
              </div>
              <div className="dh-muted" style={{ lineHeight: 1.5 }}>
                {isIndexingPeriod
                  ? 'Created ' + plural(daysSinceCreated, 'day') + ' ago. Google usually indexes new pages within 7 to 14 days.'
                  : 'Live for ' + daysSinceCreated + ' days. Search for "' + profile.business_name + '" on Google to see if it appears.'}
              </div>

              <div className="dh-vis-line">
                <span>{data.views7} visits and {data.clicks7} WhatsApp taps in the last 7 days</span>
                {slug && (
                  <a href={'/store/' + slug} target="_blank" rel="noopener noreferrer" className="dh-text-link">View public page</a>
                )}
              </div>
            </div>
          </section>
        )}

        {perms.products && (
          <section id="products" className="dh-sec dh-prod-sec">
            <div className="dh-sec-head">
              <h3>Products ({products.length})</h3>
              <Link href="/products/new" className="dh-btn">Add product</Link>
            </div>

            {locationName && (
              <div className="dh-banner">Showing products for {locationName} only</div>
            )}

            <div className="dh-panel">
              {products.length === 0 ? (
                <div className="dh-empty">
                  <p style={{ margin: '0 0 12px' }}>No products yet. Products appear on your public page.</p>
                  <Link href="/products/new" className="dh-btn">Add your first product</Link>
                </div>
              ) : (
                <>
                  {visibleProducts.map(p => (
                    <div key={p.id} className="dh-prod">
                      {p.image_url && <img src={p.image_url} alt={p.name} />}
                      <div className="dh-prod-main">
                        <div className="dh-prod-name">{p.name}</div>
                        {p.price && <div className="dh-prod-price">{p.currency} {p.price}</div>}
                        <div className="dh-prod-tags">
                          <span className={'dh-tag ' + (p.is_published ? 'dh-tag-live' : 'dh-tag-hidden')}>
                            {p.is_published ? 'Live' : 'Hidden'}
                          </span>
                          <Link href={'/products/edit/' + p.id} className="dh-tag">Edit</Link>
                          <button className="dh-tag" onClick={() => togglePublish(p.id, p.is_published, p.name)}>
                            {p.is_published ? 'Hide' : 'Publish'}
                          </button>
                          <button className="dh-tag dh-tag-danger" onClick={() => deleteProduct(p.id, p.name)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {products.length > 5 && (
                    <button className="dh-more" onClick={() => setShowAllProducts(s => !s)}>
                      {showAllProducts ? 'Show fewer products' : 'Show all ' + products.length + ' products'}
                    </button>
                  )}
                </>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
