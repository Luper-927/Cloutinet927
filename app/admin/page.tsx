'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

const ADMIN_EMAIL = 'luperabenga8@gmail.com'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'businesses' | 'products' | 'feedback'>('overview')

  const [stats, setStats] = useState({ businesses: 0, products: 0, views: 0, leads: 0, feedback: 0 })
  const [businesses, setBusinesses] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [feedbacks, setFeedbacks] = useState<any[]>([])

  useEffect(() => { load() }, [])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    const currentUser = userData?.user
    if (!currentUser) { window.location.href = '/auth'; return }
    if (currentUser.email !== ADMIN_EMAIL) { setUnauthorized(true); setLoading(false); return }
    setUser(currentUser)

    const [
      { count: bizCount },
      { count: prodCount },
      { count: viewCount },
      { count: leadCount },
      { count: feedCount },
      { data: bizData },
      { data: prodData },
      { data: feedData },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).not('business_name', 'is', null),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'page_view'),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'whatsapp_click'),
      supabase.from('feedback').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*').not('business_name', 'is', null).order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('feedback').select('*').order('created_at', { ascending: false }),
    ])

    setStats({
      businesses: bizCount || 0,
      products: prodCount || 0,
      views: viewCount || 0,
      leads: leadCount || 0,
      feedback: feedCount || 0,
    })
    setBusinesses(bizData || [])
    setProducts(prodData || [])
    setFeedbacks(feedData || [])
    setLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#07070f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#FF6B35' }}>Loading...</div>
    </div>
  )

  if (unauthorized) return (
    <div style={{ minHeight: '100vh', background: '#07070f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ textAlign: 'center', color: '#f0f0ff' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div>
        <h2>Unauthorized</h2>
        <Link href="/dashboard" style={{ color: '#FF6B35' }}>Go to Dashboard</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#0f0f1a', borderBottom: '1px solid #252535' }}>
        <div style={{ fontSize: '16px', fontWeight: 900, background: 'linear-gradient(135deg, #FF6B35, #E91E8C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>⚡ Cloutinet Admin</div>
        <Link href="/dashboard" style={{ color: '#8888aa', fontSize: '12px', textDecoration: 'none' }}>← Dashboard</Link>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '16px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Businesses', value: stats.businesses, color: '#FF6B35' },
            { label: 'Products', value: stats.products, color: '#06B6D4' },
            { label: 'Page Views', value: stats.views, color: '#9333EA' },
            { label: 'WhatsApp Leads', value: stats.leads, color: '#00e676' },
            { label: 'Feedback', value: stats.feedback, color: '#FFD600' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#0f0f1a', border: '1px solid #252535', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: '#8888aa', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '4px', background: '#0f0f1a', borderRadius: '10px', padding: '4px', marginBottom: '20px', border: '1px solid #252535' }}>
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'businesses', label: '🏪 Businesses' },
            { id: 'products', label: '📦 Products' },
            { id: 'feedback', label: '💬 Feedback' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{
              flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: 600,
              background: activeTab === tab.id ? 'linear-gradient(135deg, #FF6B35, #E91E8C)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#8888aa'
            }}>{tab.label}</button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div style={{ background: '#0f0f1a', border: '1px solid #252535', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ color: '#f0f0ff', fontSize: '14px', marginBottom: '12px' }}>Platform Overview</h3>
            {[
              { label: 'Total Registered Users', value: stats.businesses },
              { label: 'Total Products Listed', value: stats.products },
              { label: 'Total Page Views', value: stats.views },
              { label: 'Total WhatsApp Leads', value: stats.leads },
              { label: 'Total Feedback Submitted', value: stats.feedback },
              { label: 'Avg Products Per Business', value: stats.businesses > 0 ? (stats.products / stats.businesses).toFixed(1) : 0 },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #252535', fontSize: '13px' }}>
                <span style={{ color: '#8888aa' }}>{item.label}</span>
                <span style={{ color: '#f0f0ff', fontWeight: 700 }}>{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'businesses' && (
          <div>
            <h3 style={{ color: '#f0f0ff', fontSize: '14px', marginBottom: '12px' }}>All Businesses ({businesses.length})</h3>
            {businesses.map(b => (
              <div key={b.id} style={{ background: '#0f0f1a', border: '1px solid #252535', borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ color: '#f0f0ff', fontWeight: 600, fontSize: '13px' }}>{b.business_name}</div>
                    <div style={{ color: '#6B21A8', fontSize: '11px' }}>{b.business_id}</div>
                    <div style={{ color: '#8888aa', fontSize: '11px' }}>{b.business_category} · {b.location}</div>
                    <div style={{ color: '#8888aa', fontSize: '11px' }}>{b.email}</div>
                  </div>
                  {b.business_slug && (
                    <a href={'/store/' + b.business_slug} style={{ color: '#06B6D4', fontSize: '11px', textDecoration: 'none' }}>View →</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <h3 style={{ color: '#f0f0ff', fontSize: '14px', marginBottom: '12px' }}>All Products ({products.length})</h3>
            {products.map(p => (
              <div key={p.id} style={{ background: '#0f0f1a', border: '1px solid #252535', borderRadius: '10px', padding: '12px', marginBottom: '8px', display: 'flex', gap: '10px' }}>
                {p.image_url && <img src={p.image_url} style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#f0f0ff', fontWeight: 600, fontSize: '13px' }}>{p.name}</div>
                  {p.price && <div style={{ color: '#FF6B35', fontSize: '12px' }}>{p.currency} {p.price}</div>}
                  <div style={{ color: '#8888aa', fontSize: '11px' }}>{p.is_published ? '🌐 Live' : '🔒 Hidden'}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'feedback' && (
          <div>
            <h3 style={{ color: '#f0f0ff', fontSize: '14px', marginBottom: '12px' }}>All Feedback ({feedbacks.length})</h3>
            {feedbacks.length === 0 ? (
              <p style={{ color: '#8888aa', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No feedback yet</p>
            ) : (
              feedbacks.map(f => (
                <div key={f.id} style={{ background: '#0f0f1a', border: '1px solid #252535', borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ color: '#f0f0ff', fontWeight: 600, fontSize: '13px' }}>{f.name || 'Anonymous'}</div>
                    <div style={{ color: '#FFD600', fontSize: '13px' }}>{'⭐'.repeat(f.rating || 0)}</div>
                  </div>
                  {f.business_type && <div style={{ color: '#6B21A8', fontSize: '11px', marginBottom: '4px' }}>{f.business_type}</div>}
                  {f.liked && <div style={{ color: '#00e676', fontSize: '12px', marginBottom: '4px' }}>👍 {f.liked}</div>}
                  {f.improvement && <div style={{ color: '#FF6B35', fontSize: '12px' }}>💡 {f.improvement}</div>}
                  <div style={{ color: '#8888aa', fontSize: '10px', marginTop: '6px' }}>{new Date(f.created_at).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  )
}
