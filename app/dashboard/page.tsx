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

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    const currentUser = userData?.user
    if (!currentUser) {
      window.location.href = '/auth'
      return
    }
    setUser(currentUser)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single()
    setProfile(profileData)

    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
    setProducts(productsData || [])

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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#07070f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#FF6B35' }}>Loading...</div>
      </div>
    )
  }

  const hasProfile = profile && profile.business_name

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#0f0f1a', borderBottom: '1px solid #252535' }}>
        <div style={{
          fontSize: '18px', fontWeight: 900,
          background: 'linear-gradient(135deg, #FF6B35, #E91E8C)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>⚡ Cloutinet</div>
        <button onClick={handleSignOut} style={{
          background: '#161625', color: '#8888aa',
          border: '1px solid #252535', borderRadius: '8px',
          padding: '6px 12px', cursor: 'pointer', fontSize: '12px'
        }}>Sign Out</button>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>

        {!hasProfile ? (
          <div style={{ background: '#0f0f1a', border: '1px solid #252535', borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>👋</div>
            <h2 style={{ color: '#f0f0ff', fontSize: '16px', marginBottom: '8px' }}>Welcome to Cloutinet</h2>
            <p style={{ color: '#8888aa', fontSize: '13px', marginBottom: '16px' }}>Set up your business profile to get started.</p>
            <Link href="/onboarding" style={{
              display: 'inline-block', background: 'linear-gradient(135deg, #FF6B35, #E91E8C)',
              color: '#fff', padding: '12px 24px', borderRadius: '10px',
              textDecoration: 'none', fontSize: '14px', fontWeight: 700
            }}>Set Up Business Profile</Link>
          </div>
        ) : (
          <>
            <div style={{ background: '#0f0f1a', border: '1px solid #252535', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  {profile.business_id && (
                    <div style={{
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #FF6B35, #E91E8C)',
                      color: '#fff', fontSize: '10px', fontWeight: 700,
                      padding: '2px 10px', borderRadius: '20px', marginBottom: '6px'
                    }}>{profile.business_id}</div>
                  )}
                  <div style={{ color: '#f0f0ff', fontWeight: 700, fontSize: '15px' }}>{profile.business_name}</div>
                </div>
                <Link href="/onboarding" style={{ background: '#161625', color: '#FF6B35', border: '1px solid #252535', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', textDecoration: 'none' }}>Edit</Link>
              </div>
              <div style={{ color: '#8888aa', fontSize: '12px', marginBottom: '8px' }}>
                {profile.location || 'No location set'} {profile.phone ? '· ' + profile.phone : ''}
              </div>
              {profile.business_slug && (
                <a href={'/store/' + profile.business_slug} style={{ color: '#06B6D4', fontSize: '12px', textDecoration: 'none' }}>
                  View your live store page →
                </a>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#0f0f1a', border: '1px solid #252535', borderRadius: '12px', padding: '16px' }}>
                <div style={{ color: '#00e676', fontSize: '24px', fontWeight: 800 }}>{leadCount}</div>
                <div style={{ color: '#8888aa', fontSize: '12px', marginTop: '4px' }}>WhatsApp Leads</div>
              </div>
              <div style={{ background: '#0f0f1a', border: '1px solid #252535', borderRadius: '12px', padding: '16px' }}>
                <div style={{ color: '#06B6D4', fontSize: '24px', fontWeight: 800 }}>{viewCount}</div>
                <div style={{ color: '#8888aa', fontSize: '12px', marginTop: '4px' }}>Page Views</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ color: '#f0f0ff', fontSize: '15px' }}>Your Products ({products.length})</h3>
              <Link href="/products/new" style={{
                background: 'linear-gradient(135deg, #FF6B35, #E91E8C)',
                color: '#fff', padding: '8px 16px', borderRadius: '8px',
                textDecoration: 'none', fontSize: '12px', fontWeight: 700
              }}>+ Add Product</Link>
            </div>

            {products.length === 0 ? (
              <div style={{ background: '#0f0f1a', border: '1px solid #252535', borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
                <p style={{ color: '#8888aa', fontSize: '13px', marginBottom: '12px' }}>No products yet</p>
                <Link href="/products/new" style={{
                  display: 'inline-block', background: 'linear-gradient(135deg, #FF6B35, #E91E8C)',
                  color: '#fff', padding: '10px 20px', borderRadius: '8px',
                  textDecoration: 'none', fontSize: '13px', fontWeight: 700
                }}>Add Your First Product</Link>
              </div>
            ) : (
              products.map(p => (
                <div key={p.id} style={{ background: '#0f0f1a', border: '1px solid #252535', borderRadius: '10px', padding: '12px', marginBottom: '10px', display: 'flex', gap: '12px' }}>
                  {p.image_url && <img src={p.image_url} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#f0f0ff', fontWeight: 600, fontSize: '13px' }}>{p.name}</div>
                    {p.price && <div style={{ color: '#FF6B35', fontSize: '12px' }}>{p.currency} {p.price}</div>}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '10px', padding: '2px 8px', borderRadius: '5px',
                        background: p.is_published ? 'rgba(0,230,118,0.1)' : '#161625',
                        color: p.is_published ? '#00e676' : '#8888aa',
                        border: '1px solid ' + (p.is_published ? '#00e676' : '#252535')
                      }}>{p.is_published ? 'Live' : 'Hidden'}</span>

                      <Link href={'/products/edit/' + p.id} style={{
                        fontSize: '10px', padding: '2px 8px', borderRadius: '5px',
                        background: '#161625', color: '#06B6D4',
                        border: '1px solid #252535', textDecoration: 'none'
                      }}>Edit</Link>

                      <button onClick={() => togglePublish(p.id, p.is_published)} style={{
                        fontSize: '10px', padding: '2px 8px', borderRadius: '5px',
                        background: '#161625', color: '#8888aa',
                        border: '1px solid #252535', cursor: 'pointer', fontFamily: 'inherit'
                      }}>{p.is_published ? 'Hide' : 'Publish'}</button>

                      <button onClick={() => deleteProduct(p.id, p.name)} style={{
                        fontSize: '10px', padding: '2px 8px', borderRadius: '5px',
                        background: 'transparent', color: '#ff4444',
                        border: '1px solid #ff4444', cursor: 'pointer', fontFamily: 'inherit'
                      }}>Delete</button>
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
