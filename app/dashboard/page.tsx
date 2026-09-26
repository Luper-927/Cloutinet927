'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getBusinessTier } from '../../lib/tiers'
import { getActingContext, ActingContext, logActivity } from '../../lib/permissions'
import Link from 'next/link'
import {
  pageWrapStyle,
  loadingWrapStyle,
  loadingTextStyle,
  topBarStyle,
  menuButtonStyle,
  brandTitleStyle,
  actingAsStyle,
  menuOverlayStyle,
  menuPanelStyle,
  menuHeaderStyle,
  menuTitleStyle,
  menuCloseStyle,
  menuListStyle,
  sidebarLinkStyle,
  signOutRowStyle,
  signOutButtonStyle,
  contentWrapStyle,
  welcomeBoxStyle,
  welcomeTitleStyle,
  welcomeTextStyle,
  welcomeButtonStyle,
  profileCardStyle,
  profileTopRowStyle,
  businessIdBadgeStyle,
  businessNameStyle,
  editLinkStyle,
  locationLineStyle,
  storeLinkStyle,
  scoreLabelStyle,
  scoreRowStyle,
  scoreNumberStyle,
  scoreNumberSuffixStyle,
  scoreChangeStyle,
  scoreTrackStyle,
  scoreFillStyle,
  actionBoxStyle,
  actionLabelStyle,
  actionTaskStyle,
  actionButtonStyle,
  indexingBoxStyle,
  indexingTitleStyle,
  indexingRowStyle,
  indexingTextStyle,
  statusDotStyle,
  statusLabelStyle,
  statsGridStyle,
  statCardStyle,
  statNumberStyle,
  statLabelStyle,
  productsHeaderRowStyle,
  productsHeadingStyle,
  addProductButtonStyle,
  locationBannerStyle,
  emptyProductsBoxStyle,
  emptyProductsTextStyle,
  emptyProductsButtonStyle,
  productRowStyle,
  productImageStyle,
  productInfoWrapStyle,
  productNameStyle,
  productPriceStyle,
  productTagRowStyle,
  publishBadgeStyle,
  editTagStyle,
  hideButtonStyle,
  deleteButtonStyle,
} from './styles'

export default function Dashboard() {
  const [context, setContext] = useState<ActingContext | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [leadCount, setLeadCount] = useState(0)
  const [viewCount, setViewCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tierLimits, setTierLimits] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scopedLocationName, setScopedLocationName] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    const currentUser = userData?.user
    if (!currentUser) {
      window.location.href = '/auth'
      return
    }

    const ctx = await getActingContext(currentUser.id)
    if (!ctx) {
      window.location.href = '/onboarding'
      return
    }
    setContext(ctx)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', ctx.ownerId)
      .single()
    setProfile(profileData)

    let productsQuery = supabase
      .from('products')
      .select('*')
      .eq('user_id', ctx.ownerId)
      .order('created_at', { ascending: false })

    if (ctx.locationId) {
      productsQuery = productsQuery.eq('location_id', ctx.locationId)
    }

    const { data: productsData } = await productsQuery
    setProducts(productsData || [])

    if (ctx.locationId) {
      const locFields = 'business_name, address'
      const { data: loc } = await supabase
        .from('locations')
        .select(locFields)
        .eq('id', ctx.locationId)
        .maybeSingle()
      const locName = loc?.business_name || loc?.address
      setScopedLocationName(locName || null)
    }

    const { limits } = await getBusinessTier(ctx.ownerId)
    setTierLimits(limits)

    if (profileData && profileData.business_slug) {
      const { count: leadC } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('business_slug', profileData.business_slug)
        .eq('event_type', 'whatsapp_click')
      const { count: viewC } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('business_slug', profileData.business_slug)
        .eq('event_type', 'page_view')
      setLeadCount(leadC || 0)
      setViewCount(viewC || 0)
    }
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  async function togglePublish(id: string, current: boolean, name: string) {
    await supabase.from('products').update({ is_published: !current }).eq('id', id)
    if (context) {
      const action = current ? 'hid' : 'published'
      await logActivity(context.ownerId, context.employeeName || 'Owner', action, 'product', name)
    }
    load()
  }

  async function deleteProduct(id: string, name: string) {
    const confirmed = confirm('Delete "' + name + '"? This cannot be undone.')
    if (!confirmed) return
    await supabase.from('products').delete().eq('id', id)
    if (context) {
      await logActivity(context.ownerId, context.employeeName || 'Owner', 'deleted', 'product', name)
    }
    load()
  }

  function calculateVisibilityScore() {
    if (!profile) return 0
    let score = 0
    if (profile.business_name) score += 20
    if (profile.location) score += 15
    if (profile.phone) score += 15
    if (profile.business_category) score += 10
    if (profile.tagline) score += 10
    if (profile.business_hours) score += 5
    if (profile.services) score += 5
    if (products.length > 0) score += 10
    if (products.length >= 5) score += 5
    if (profile.facebook_url || profile.instagram_url) score += 5
    return Math.min(100, score)
  }

  function getScoreColor(score: number) {
    if (score >= 80) return '#00aa55'
    if (score >= 50) return '#FF6B35'
    return '#ff4444'
  }

  function getOneAction() {
    if (!profile) return { task: 'Set up your business profile', link: '/onboarding' }
    if (!profile.location) return { task: 'Add your business location', link: '/onboarding' }
    if (!profile.tagline) return { task: 'Add a business tagline', link: '/onboarding' }
    if (!profile.business_hours) return { task: 'Add your business hours', link: '/onboarding' }
    if (!profile.services) return { task: 'List your services or products offered', link: '/onboarding' }
    if (products.length === 0) return { task: 'Add your first product', link: '/products/new' }
    if (products.length < 5) return { task: 'Add one more product to reach 5+', link: '/products/new' }
    if (!profile.facebook_url && !profile.instagram_url) return { task: 'Add a social media link', link: '/onboarding' }
    return { task: 'Share your store link on WhatsApp Status today', link: '/dashboard' }
  }

  if (loading) {
    return (
      <div style={loadingWrapStyle}>
        <div style={loadingTextStyle}>Loading...</div>
      </div>
    )
  }

  const hasProfile = profile && profile.business_name
  const score = calculateVisibilityScore()
  const previousScore = profile?.last_visibility_score || 0
  const scoreChange = score - previousScore
  const oneAction = getOneAction()
  const daysSinceCreated = profile?.created_at
    ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0
  const isIndexingPeriod = daysSinceCreated < 7

  const navItems: { href: string; label: string }[] = [
    context?.permissions.customers && { href: '/dashboard/customers', label: 'Customers' },
    context?.permissions.payments && tierLimits?.paymentsModule && { href: '/dashboard/payments', label: 'Payments' },
    context?.permissions.documents && tierLimits?.documentsModule && { href: '/dashboard/documents', label: 'Documents' },
    tierLimits?.marketingAutomation && { href: '/dashboard/marketing', label: 'Marketing' },
    tierLimits?.integrations && { href: '/dashboard/integrations', label: 'Integrations' },
    tierLimits?.advancedAI && { href: '/dashboard/ai', label: 'AI' },
    context?.permissions.employees && tierLimits?.employees && { href: '/dashboard/employees', label: 'Employees' },
    context?.isOwner && { href: '/dashboard/activity', label: 'Activity' },
    context?.isOwner && { href: '/dashboard/billing', label: 'Billing' },
    { href: '/dashboard/settings', label: 'Settings' },
  ].filter(Boolean) as { href: string; label: string }[]

  return (
    <div style={pageWrapStyle}>
      <div style={topBarStyle}>
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          style={menuButtonStyle}
        >
          ☰
        </button>
        <div style={brandTitleStyle}>
          Cloutinet
          {context && !context.isOwner && (
            <span style={actingAsStyle}>
              (as {context.employeeName})
            </span>
          )}
        </div>
        <div style={{ width: '36px' }} />
      </div>

      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={menuOverlayStyle}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={menuPanelStyle}
          >
            <div style={menuHeaderStyle}>
              <div style={menuTitleStyle}>Cloutinet</div>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                style={menuCloseStyle}
              >
                ✕
              </button>
            </div>

            <div style={menuListStyle}>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={sidebarLinkStyle}>
                Dashboard
              </Link>
              {navItems.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={sidebarLinkStyle}>
                  {item.label}
                </Link>
              ))}
            </div>

            <div style={signOutRowStyle}>
              <button
                onClick={handleSignOut}
                style={signOutButtonStyle}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={contentWrapStyle}>

        {!hasProfile ? (
          <div style={welcomeBoxStyle}>
            <h2 style={welcomeTitleStyle}>Welcome to Cloutinet</h2>
            <p style={welcomeTextStyle}>Set up your business profile to get started.</p>
            <Link href="/onboarding" style={welcomeButtonStyle}>Set Up Business Profile</Link>
          </div>
        ) : (
          <>
            <div style={profileCardStyle}>
              <div style={profileTopRowStyle}>
                <div>
                  {profile.business_id && (
                    <div style={businessIdBadgeStyle}>{profile.business_id}</div>
                  )}
                  <div style={businessNameStyle}>{profile.business_name}</div>
                </div>
                {context?.isOwner && (
                  <Link href="/onboarding" style={editLinkStyle}>Edit</Link>
                )}
              </div>
              <div style={locationLineStyle}>
                {profile.location || 'No location set'} {profile.phone ? '· ' + profile.phone : ''}
              </div>
              {profile.business_slug && (
                <a href={'/store/' + profile.business_slug} style={storeLinkStyle}>View your live store page →</a>
              )}
            </div>

            {context?.isOwner && (
              <div style={profileCardStyle}>
                <div style={scoreLabelStyle}>Visibility Score</div>
                <div style={scoreRowStyle}>
                  <div style={scoreNumberStyle(getScoreColor(score))}>
                    {score}<span style={scoreNumberSuffixStyle}>/100</span>
                  </div>
                  {scoreChange !== 0 && previousScore > 0 && (
                    <div style={scoreChangeStyle(scoreChange > 0)}>
                      {scoreChange > 0 ? '+' : ''}{scoreChange} this week
                    </div>
                  )}
                </div>
                <div style={scoreTrackStyle}>
                  <div style={scoreFillStyle(getScoreColor(score), score)}></div>
                </div>
              </div>
            )}

            {context?.isOwner && (
              <div style={actionBoxStyle}>
                <div style={actionLabelStyle}>This Week's Action</div>
                <div style={actionTaskStyle}>{oneAction.task}</div>
                <Link href={oneAction.link} style={actionButtonStyle}>Do This Now →</Link>
              </div>
            )}

            {context?.isOwner && (
              <div style={indexingBoxStyle}>
                <h3 style={indexingTitleStyle}>Google Indexing Status</h3>
                {isIndexingPeriod ? (
                  <div>
                    <div style={indexingRowStyle}>
                      <div style={statusDotStyle('#F59E0B')}></div>
                      <span style={statusLabelStyle('#92400E')}>Pending Indexing</span>
                    </div>
                    <p style={indexingTextStyle}>
                      Your page was created {daysSinceCreated} day{daysSinceCreated !== 1 ? 's' : ''} ago. Google typically indexes new pages within 7-14 days.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={indexingRowStyle}>
                      <div style={statusDotStyle('#00aa55')}></div>
                      <span style={statusLabelStyle('#166534')}>Likely Indexed</span>
                    </div>
                    <p style={indexingTextStyle}>
                      Your page has been live for {daysSinceCreated} days. Search "{profile.business_name}" on Google to check if it appears.
                    </p>
                  </div>
                )}
              </div>
            )}

            {context?.isOwner && (
              <div style={statsGridStyle}>
                <div style={statCardStyle}>
                  <div style={statNumberStyle}>{leadCount}</div>
                  <div style={statLabelStyle}>WhatsApp Leads</div>
                </div>
                <div style={statCardStyle}>
                  <div style={statNumberStyle}>{viewCount}</div>
                  <div style={statLabelStyle}>Page Views</div>
                </div>
              </div>
            )}

            {context?.permissions.products && (
              <>
                <div style={productsHeaderRowStyle}>
                  <h3 style={productsHeadingStyle}>Products ({products.length})</h3>
                  <Link href="/products/new" style={addProductButtonStyle}>+ Add Product</Link>
                </div>

                {scopedLocationName && (
                  <div style={locationBannerStyle}>
                    📍 Showing products for {scopedLocationName} only
                  </div>
                )}

                {products.length === 0 ? (
                  <div style={emptyProductsBoxStyle}>
                    <p style={emptyProductsTextStyle}>No products yet</p>
                    <Link href="/products/new" style={emptyProductsButtonStyle}>Add Your First Product</Link>
                  </div>
                ) : (
                  products.map(p => (
                    <div key={p.id} style={productRowStyle}>
                      {p.image_url && <img src={p.image_url} style={productImageStyle} />}
                      <div style={productInfoWrapStyle}>
                        <div style={productNameStyle}>{p.name}</div>
                        {p.price && <div style={productPriceStyle}>{p.currency} {p.price}</div>}
                        <div style={productTagRowStyle}>
                          <span style={publishBadgeStyle(p.is_published)}>{p.is_published ? 'Live' : 'Hidden'}</span>
                          <Link href={'/products/edit/' + p.id} style={editTagStyle}>Edit</Link>
                          <button onClick={() => togglePublish(p.id, p.is_published, p.name)} style={hideButtonStyle}>{p.is_published ? 'Hide' : 'Publish'}</button>
                          <button onClick={() => deleteProduct(p.id, p.name)} style={deleteButtonStyle}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
