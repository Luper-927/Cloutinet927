'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

interface Plan {
  id: string
  name: string
  price_ngn: number
}

interface Subscription {
  plan_id: string
  status: string
  current_period_end: string | null
}

const TIER_ORDER = ['free', 'essential', 'growth', 'business', 'advanced']

const TIER_STYLE: Record<string, { accent: string; tint: string; label: string }> = {
  free:      { accent: '#64748B', tint: '#F8FAFC', label: 'Getting started' },
  essential: { accent: '#0F766E', tint: '#F0FDFA', label: 'Build visibility' },
  growth:    { accent: '#D97706', tint: '#FFFBEB', label: 'Recommended' },
  business:  { accent: '#C2410C', tint: '#FFF7ED', label: 'Multiple locations' },
  advanced:  { accent: '#4C1D95', tint: '#FAF5FF', label: 'Full platform' },
}

function BillingContent() {
  const searchParams = useSearchParams()
  const [plans, setPlans] = useState<Plan[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [banner, setBanner] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  useEffect(() => {
    init()
  }, [])

  async function init() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    await loadPlansAndSubscription()

    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (reference) {
      await verifyPayment(reference)
    }

    setLoading(false)
  }

  async function loadPlansAndSubscription() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const [{ data: plansData }, { data: subData }] = await Promise.all([
      supabase.from('plans').select('*').eq('is_active', true).order('price_ngn', { ascending: true }),
      supabase.from('subscriptions').select('*').eq('user_id', userData.user.id).single(),
    ])

    setPlans(plansData || [])
    setSubscription(subData || { plan_id: 'free', status: 'active', current_period_end: null })
  }

  async function verifyPayment(reference: string) {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) return

    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ reference }),
      })
      const data = await response.json()

      if (data.status === 'success') {
        setBanner({ type: 'success', message: 'Payment successful! Your plan has been upgraded.' })
        await loadPlansAndSubscription()
      } else if (data.status === 'pending') {
        setBanner({ type: 'info', message: 'Your payment is still processing. This page will update shortly — refresh in a moment.' })
      } else {
        setBanner({ type: 'error', message: 'We could not confirm this payment. If you were charged, contact support.' })
      }
    } catch (e) {
      setBanner({ type: 'error', message: 'Could not verify payment status. Please refresh the page.' })
    }
  }

  async function handleUpgrade(planId: string) {
    setUpgrading(planId)
    setBanner(null)

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) { window.location.href = '/auth'; return }

    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ plan_id: planId }),
      })
      const data = await response.json()

      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        setBanner({ type: 'error', message: data.error || 'Could not start payment. Please try again.' })
        setUpgrading(null)
      }
    } catch (e) {
      setBanner({ type: 'error', message: 'Could not start payment. Please try again.' })
      setUpgrading(null)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Loading...</p>
      </div>
    )
  }

  const currentPlanId = subscription?.plan_id || 'free'
  const currentIndex = TIER_ORDER.indexOf(currentPlanId)

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Billing & Subscription</div>
        <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</Link>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>

        {banner && (
          <div style={{
            background: banner.type === 'success' ? '#F0FDF4' : banner.type === 'error' ? '#FEF2F2' : '#EFF6FF',
            border: '1px solid ' + (banner.type === 'success' ? '#BBF7D0' : banner.type === 'error' ? '#FECACA' : '#BFDBFE'),
            borderRadius: '10px', padding: '14px', marginBottom: '20px'
          }}>
            <p style={{
              color: banner.type === 'success' ? '#166534' : banner.type === 'error' ? '#dc2626' : '#1D4ED8',
              fontSize: '13px', margin: 0, fontWeight: 600
            }}>{banner.message}</p>
          </div>
        )}

        {/* CURRENT PLAN — signature gradient hero */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #0F766E 100%)',
          borderRadius: '16px', padding: '22px', marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(15,23,42,0.18)'
        }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: 700, marginBottom: '6px' }}>Current plan</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', textTransform: 'capitalize' as const, marginBottom: '4px' }}>
            {plans.find(p => p.id === currentPlanId)?.name || 'Free'}
          </div>
          {subscription?.current_period_end && (
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '14px' }}>
              Renews {new Date(subscription.current_period_end).toLocaleDateString()}
            </div>
          )}

          {/* Tier ladder — a real sequence, so a stepped marker earns its place */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '14px' }}>
            {TIER_ORDER.map((tierId, i) => (
              <div key={tierId} style={{
                flex: 1, height: '5px', borderRadius: '3px',
                background: i <= currentIndex ? '#E7A93D' : 'rgba(255,255,255,0.2)'
              }} />
            ))}
          </div>
        </div>

        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '14px' }}>Available Plans</h2>

        {plans.map(plan => {
          const isCurrent = plan.id === currentPlanId
          const style = TIER_STYLE[plan.id] || TIER_STYLE.free
          return (
            <div key={plan.id} style={{
              border: '1px solid ' + (isCurrent ? style.accent : '#E2E8F0'),
              borderLeft: '4px solid ' + style.accent,
              borderRadius: '10px', padding: '16px', marginBottom: '12px',
              background: isCurrent ? style.tint : '#fff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <div>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{plan.name}</span>
                  {plan.id === 'growth' && !isCurrent && (
                    <span style={{
                      marginLeft: '8px', fontSize: '10px', fontWeight: 700, color: style.accent,
                      background: style.tint, border: '1px solid ' + style.accent,
                      borderRadius: '999px', padding: '2px 8px'
                    }}>Recommended</span>
                  )}
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{style.label}</div>
                </div>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' as const }}>
                  {plan.price_ngn === 0 ? 'Free' : '₦' + plan.price_ngn.toLocaleString() + '/mo'}
                </span>
              </div>

              {isCurrent ? (
                <div style={{
                  marginTop: '10px', textAlign: 'center' as const, padding: '10px',
                  background: '#fff', border: '1px solid ' + style.accent, borderRadius: '8px',
                  fontSize: '13px', fontWeight: 700, color: style.accent
                }}>
                  Current Plan
                </div>
              ) : plan.price_ngn === 0 ? null : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={upgrading === plan.id}
                  style={{
                    marginTop: '10px', width: '100%', padding: '11px',
                    background: style.accent, color: '#fff', border: 'none',
                    borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    opacity: upgrading === plan.id ? 0.6 : 1
                  }}
                >
                  {upgrading === plan.id ? 'Redirecting to payment...' : 'Upgrade to ' + plan.name}
                </button>
              )}
            </div>
          )
        })}

        <p style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center' as const, marginTop: '20px', lineHeight: 1.5 }}>
          Payments are securely processed by Paystack. Your card details are never stored on Cloutinet's servers.
        </p>
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Loading...</p>
      </div>
    }>
      <BillingContent />
    </Suspense>
  )
}
