'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [leadCount, setLeadCount] = useState(0)
  const [viewCount, setViewCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    const currentUser = userData?.user
    if (!currentUser) { window.location.href = '/auth'; return }
    setUser(currentUser)

    const { data: profileData } = await supabase
      .from('profiles').select('*').eq('id', currentUser.id).single()
    setProfile(profileData)

    const { data: productsData } = await supabase
      .from('products').select('*').eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
    setProducts(productsData || [])

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

  async function togglePublish(id: string, current: boolean) {
    await supabase.from('products').update({ is_published: !current }).eq('id', id)
    load()
  }

  async function deleteProduct(id: string, name: string) {
    const confirmed = confirm('Delete "' + name + '"? This cannot be undone.')
    if (!confirmed) return
    await supabase.from('products').delete().eq('id', id)
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

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#0F172A' }}>
        <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Cloutinet</div>
        <button onClick={handleSignOut} style={{ background: 'rgba(255,255,255,0.1)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>Sign Out</button>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>

        {!hasProfile ? (
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#0F172A', fontSize: '16px', marginBottom: '8px' }}>Welcome to Cloutinet</h2>
            <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '16px' }}>Set up your business profile to get started.</p>
            <Link href="/onboarding" style={{ display: 'inline-block', background: '#0F172A', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>Set Up Business Profile</Link>
          </div>
        ) : (
          <>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  {profile.business_id && (
                    <div style={{ display: 'inline-block', background: '#0F172A', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 10px', borderRadius: '4px', marginBottom: '6px' }}>{profile.business_id}</div>
                  )}
                  <div style={{ color: '#0F172A', fontWeight: 700, fontSize: '15px' }}>{profile.business_name}</div>
                </div>
                <Link href="/onboarding" style={{ background: '#fff', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', textDecoration: 'none' }}>Edit</Link>
              </div>
              <div style={{ color: '#64748B', fontSize: '12px', marginBottom: '8px' }}>
                {profile.location || 'No location set'} {profile.phone ? '· ' + profile.phone : ''}
              </div>
              {profile.business_slug && (
                <a href={'/store/' + profile.business_slug} style={{ color: '#0F172A', fontSize: '12px', textDecoration: 'underline', fontWeight: 600 }}>View your live store page →</a>
              )}
            </div>

            {/* VISIBILITY SCORE */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: '6px' }}>Visibility Score</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: getScoreColor(score) }}>{score}<span style={{ fontSize: '16px', color: '#94A3B8' }}>/100</span></div>
                {scoreChange !== 0 && previousScore > 0 && (
                  <div style={{ fontSize: '13px', fontWeight: 700, color: scoreChange > 0 ? '#00aa55' : '#ff4444' }}>
                    {scoreChange > 0 ? '+' : ''}{scoreChange} this week
                  </div>
                )}
              </div>
              <div style={{ background: '#E2E8F0', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                <div style={{ background: getScoreColor(score), height: '100%', width: score + '%', borderRadius: '10px' }}></div>
              </div>
            </div>

            {/* ONE ACTION */}
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#9A3412', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: '6px' }}>This Week's Action</div>
              <div style={{ fontSize: '14px', color: '#0F172A', fontWeight: 600, marginBottom: '10px' }}>{oneAction.task}</div>
              <Link href={oneAction.link} style={{ display: 'inline-block', background: '#0F172A', color: '#fff', padding: '8px 18px', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}>Do This Now →</Link>
            </div>

            {/* GOOGLE INDEXING STATUS */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <h3 style={{ color: '#0F172A', fontSize: '14px', marginBottom: '10px' }}>Google Indexing Status</h3>
              {isIndexingPeriod ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></div>
                    <span style={{ color: '#92400E', fontSize: '13px', fontWeight: 700 }}>Pending Indexing</span>
                  </div>
                  <p style={{ color: '#64748B', fontSize: '12px', lineHeight: 1.5 }}>
                    Your page was created {daysSinceCreated} day{daysSinceCreated !== 1 ? 's' : ''} ago. Google typically indexes new pages within 7-14 days.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00aa55' }}></div>
                    <span style={{ color: '#166534', fontSize: '13px', fontWeight: 700 }}>Likely Indexed</span>
                  </div>
                  <p style={{ color: '#64748B', fontSize: '12px', lineHeight: 1.5 }}>
                    Your page has been live for {daysSinceCreated} days. Search "{profile.business_name}" on Google to check if it appears.
                  </p>
                </div>
              )}
            </div>

            {/* STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ color: '#0F172A', fontSize: '24px', fontWeight: 800 }}>{leadCount}</div>
                <div style={{ color: '#64748B', fontSize: '12px', marginTop: '4px' }}>WhatsApp Leads</div>
              </div>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ color: '#0F172A', fontSize: '24px', fontWeight: 800 }}>{viewCount}</div>
                <div style={{ color: '#64748B', fontSize: '12px', marginTop: '4px' }}>Page Views</div>
              </div>
            </div>

            {/* PRODUCTS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ color: '#0F172A', fontSize: '15px' }}>Your Products ({products.length})</h3>
              <Link href="/products/new" style={{ background: '#0F172A', color: '#fff', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}>+ Add Product</Link>
            </div>

            {products.length === 0 ? (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
                <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '12px' }}>No products yet</p>
                <Link href="/products/new" style={{ display: 'inline-block', background: '#0F172A', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>Add Your First Product</Link>
              </div>
            ) : (
              products.map(p => (
                <div key={p.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px', marginBottom: '10px', display: 'flex', gap: '12px' }}>
                  {p.image_url && <img src={p.image_url} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' as const, flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#0F172A', fontWeight: 600, fontSize: '13px' }}>{p.name}</div>
                    {p.price && <div style={{ color: '#475569', fontSize: '12px' }}>{p.currency} {p.price}</div>}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' as const }}>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: p.is_published ? '#F0FDF4' : '#F8FAFC', color: p.is_published ? '#166534' : '#94A3B8', border: '1px solid ' + (p.is_published ? '#BBF7D0' : '#E2E8F0') }}>{p.is_published ? 'Live' : 'Hidden'}</span>
                      <Link href={'/products/edit/' + p.id} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: '#fff', color: '#0F172A', border: '1px solid #E2E8F0', textDecoration: 'none' }}>Edit</Link>
                      <button onClick={() => togglePublish(p.id, p.is_published)} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: '#fff', color: '#64748B', border: '1px solid #E2E8F0', cursor: 'pointer', fontFamily: 'inherit' }}>{p.is_published ? 'Hide' : 'Publish'}</button>
                      <button onClick={() => deleteProduct(p.id, p.name)} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}
