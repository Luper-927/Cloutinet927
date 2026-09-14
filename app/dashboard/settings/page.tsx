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
    if (context) await logActivity(context.ownerId, context.employeeName || 'Owner', current
