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
