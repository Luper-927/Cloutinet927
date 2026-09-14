'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { getBusinessTier } from '../../../lib/tiers'
import { getActingContext, ActingContext, logActivity } from '../../../lib/permissions'
import Link from 'next/link'
import { Menu, X, Users, CreditCard, FileText, Sparkles, UserCog, Activity as ActivityIcon, Wallet, LogOut } from 'lucide-react'

export default function Dashboard() {
  const [context, setContext] = useState<ActingContext | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [leadCount, setLeadCount] = useState(0)
  const [viewCount, setViewCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tierLimits, setTierLimits] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    const currentUser = userData?.user
    if (!currentUser) { window.location.href = '/auth'; return }

    const ctx = await getActingContext(currentUser.id)
    if (!ctx) { window.location.href = '/onboarding'; return }
    setContext(ctx)

    const { data: profileData } = await supabase
      .from('profiles').select('*').eq('id', ctx.ownerId).single()
    setProfile(profileData)

    const { data: productsData } = await supabase
      .from('products').select('*').eq('user_id', ctx.ownerId)
      .order('created_at', { ascending: false })
    setProducts(productsData || [])

    const { limits } = await getBusinessTier(ctx.ownerId)
    setTierLimits(limits)

    if (profileData && profileData.business_slug) {
      const { count: leadC } = await supabase
        .from('analytics_events').select('*', { count: 'exact', head: true })
        .eq('business_slug', profileData.business_slug).eq('event_type', 'whatsapp_click')
      const { count: viewC } = await supabase
        .from('analytics_events').select('*', { count: 'exact', head: true })
        .eq('business_slug', profileData.business_slug).eq('event_type', 'page_view')
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
    if (context) await logActivity(context.ownerId, context.employeeName || 'Owner', current ? 'hid' : 'published', 'product', name)
    load()
  }

  async function deleteProduct(id: string, name: string) {
    const confirmed = confirm('Delete "' + name + '"? This cannot be undone.')
    if (!confirmed) return
    await supabase.from('products').delete().eq('id', id)
    if (context) await logActivity(context.ownerId, context.employeeName || 'Owner', 'deleted', 'product', name)
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
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#0F172A', fontSize: '14px' }}>Loading...</div>
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

  const navItems = [
    context?.permissions.customers && { href: '/dashboard/customers', label: 'Customers', icon: Users },
    context?.permissions.payments && tierLimits?.paymentsModule && { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
    context?.permissions.documents && tierLimits?.documentsModule && { href: '/dashboard/documents', label: 'Documents', icon: FileText },
    tierLimits?.advancedAI && { href: '/dashboard/ai', label: 'AI', icon: Sparkles },
    context?.permissions.employees && tierLimits?.employees && { href: '/dashboard/employees', label: 'Employees', icon: UserCog },
    context?.isOwner && { href: '/dashboard/activity', label: 'Activity', icon: ActivityIcon },
    context?.isOwner && { href: '/dashboard/billing', label: 'Billing', icon: Wallet },
  ].filter(Boolean) as { href: string; label: string; icon: any }[]

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#0F172A' }}>
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Menu size={18} color="#fff" />
        </button>
        <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
          Cloutinet
          {context && !context.isOwner && (
            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 400, marginLeft: '8px' }}>
              (as {context.employeeName})
            </span>
          )}
        </div>
        <div style={{ width: '36px' }} />
      </div>

      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 50 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0, width: '260px', maxWidth: '80vw',
              background: '#0F172A', boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
              display: 'flex', flexDirection: 'column', padding: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Cloutinet</div>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="#94A3B8" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                style={sidebarLinkStyle}
              >
                Dashboard
              </Link>
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  style={sidebarLinkStyle}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
              <button
                onClick={handleSignOut}
                style={{ ...sidebarLinkStyle, width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: '#F87171', fontFamily: 'inherit' }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
