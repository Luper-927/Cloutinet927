'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { useDashboard } from '../../components/DashboardShell'

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

const TIER_STYLE: Record<string, { accent: string; tint: string; label: string }> = {
  free:       { accent: '#64748B', tint: '#F8FAFC', label: 'Getting started' },
  startup:    { accent: '#0F766E', tint: '#F0FDFA', label: 'Early-stage' },
  growth_v2:  { accent: '#D97706', tint: '#FFFBEB', label: 'Recommended' },
  scale:      { accent: '#C2410C', tint: '#FFF7ED', label: 'Multiple locations' },
  enterprise: { accent: '#4C1D95', tint: '#FAF5FF', label: 'Custom' },
  // Legacy: only ever shown as someone's current plan, never in "Available plans"
  essential:  { accent: '#0F766E', tint: '#F0FDFA', label: 'Legacy plan' },
  growth:     { accent: '#D97706', tint: '#FFFBEB', label: 'Legacy plan' },
  business:   { accent: '#C2410C', tint: '#FFF7ED', label: 'Legacy plan' },
  advanced:   { accent: '#4C1D95', tint: '#FAF5FF', label: 'Legacy plan' },
}

const RECOMMENDED_PLAN_ID = 'growth_v2'

function BillingContent() {
  const { context } = useDashboard()
  const searchParams = useSearchParams()

  const [plans, setPlans] = useState<Plan[]>([])
  const [currentPlanDetails, setCurrentPlanDetails] = useState<Plan | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [banner, setBanner] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  useEffect(() => {
    init()
  }, [])

  async function init() {
    if (!context.isOwner) {
      setLoading(false)
      return
    }

    await loadPlansAndSubscription()

    if (searchParams.get('upgraded')) {
      setBanner({ type: 'success', message: 'Payment successful! Your plan has been upgraded.' })
    }

    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (reference) {
      await verifyPayment(reference)
    }

    setLoading(false)
  }

  async function loadPlansAndSubscription() {
    const [{ data: plansData }, { data: subData }] = await Promise.all([
      supabase.from('plans').select('*').eq('is_active', true).order('price_ngn', { ascending: true }),
      supabase.from('subscriptions').select('*').eq('user_id', context.ownerId).single(),
    ])

    const activePlans = plansData || []
    setPlans(activePlans)

    const sub = subData || { plan_id: 'free', status: 'active', current_period_end: null }
    setSubscription(sub)

    // The current plan might be a legacy or inactive one (for example a
    // subscriber from before the plan change). Fetch it directly rather than
    // relying on the active-only list, so the top section never shows "Free"
    // for someone who is actually paying.
    if (sub.plan_id === 'free') {
      setCurrentPlanDetails({ id: 'free', name: 'Free', price_ngn: 0 })
    } else {
      const fromActive = activePlans.find(p => p.id === sub.plan_id)
      if (fromActive) {
        setCurrentPlanDetails(fromActive)
      } else {
        const { data: legacyPlan } = await supabase
          .from('plans')
          .select('id, name, price_ngn')
          .eq('id', sub.plan_id)
          .maybeSingle()
        setCurrentPlanDetails(legacyPlan || { id: sub.plan_id, name: sub.plan_id, price_ngn: 0 })
      }
    }
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
        // Reload once on a clean URL so the menu and feature access update
        window.location.replace('/dashboard/billing?upgraded=1')
        return
      } else if (data.status === 'pending') {
        setBanner({ type: 'info', message: 'Your payment is still processing. Refresh this page in a moment.' })
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

  if (!context.isOwner) {
    return (
      <div style={{ padding: '24px 0' }}>
        <p style={{ color: '#64748B', fontSize: '14px' }}>Only the business owner can manage billing.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ padding: '24px 0' }}>
        <p style={{ color: '#64748B', fontSize: '14px' }}>Loading...</p>
      </div>
    )
  }

  const currentPlanId = subscription?.plan_id || 'free'

  // The ladder is built from whatever plans exist (the active list, plus the
  // current plan if it is a legacy one) sorted by price, so it never goes
  // stale when plans change.
  const ladderPlans = [...plans]
  if (currentPlanDetails && !ladderPlans.find(p => p.id === currentPlanDetails.id)) {
    ladderPlans.push(currentPlanDetails)
  }
  ladderPlans.sort((a, b) => a.price_ngn - b.price_ngn)
  const currentIndex = ladderPlans.findIndex(p => p.id === currentPlanId)

  const currentStyle = TIER_STYLE[currentPlanId] || TIER_STYLE.free

  return (
    <div style={wrapStyle}>
      <h1 style={titleStyle}>Billing</h1>

      {banner && (
        <div style={{
          background: banner.type === 'success' ? '#F0FDF4' : banner.type === 'error' ? '#FEF2F2' : '#EFF6FF',
          border: '1px solid ' + (banner.type === 'success' ? '#BBF7D0' : banner.type === 'error' ? '#FECACA' : '#BFDBFE'),
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '20px',
        }}>
          <p style={{
            color: banner.type === 'success' ? '#166534' : banner.type === 'error' ? '#dc2626' : '#1D4ED8',
            fontSize: '14px',
            margin: 0,
            fontWeight: 600,
          }}>{banner.message}</p>
        </div>
      )}

      <div style={{ background: '#0F172A', borderRadius: '14px', padding: '22px', marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', fontWeight: 600, marginBottom: '6px' }}>Current plan</div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
          {currentPlanDetails?.name || 'Free'}
        </div>
        {subscription?.current_period_end && (
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
            Renews {new Date(subscription.current_period_end).toLocaleDateString()}
          </div>
        )}

        {ladderPlans.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '16px' }}>
            {ladderPlans.map((p, i) => (
              <div key={p.id} style={{
                flex: 1,
                height: '5px',
                borderRadius: '3px',
                background: i <= currentIndex ? '#E7A93D' : 'rgba(255,255,255,0.2)',
              }} />
            ))}
          </div>
        )}
      </div>

      <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '14px' }}>Available plans</h2>

      {plans.map(plan => {
        const isCurrent = plan.id === currentPlanId
        const style = TIER_STYLE[plan.id] || TIER_STYLE.free
        return (
          <div key={plan.id} style={{
            border: '1px solid ' + (isCurrent ? style.accent : '#E2E8F0'),
            borderLeft: '4px solid ' + style.accent,
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '12px',
            background: isCurrent ? style.tint : '#fff',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '4px' }}>
              <div>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{plan.name}</span>
                {plan.id === RECOMMENDED_PLAN_ID && !isCurrent && (
                  <span style={{
                    marginLeft: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: style.accent,
                    background: style.tint,
                    border: '1px solid ' + style.accent,
                    borderRadius: '999px',
                    padding: '2px 8px',
                  }}>Recommended</span>
                )}
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{style.label}</div>
              </div>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>
                {plan.price_ngn === 0 ? 'Free' : '₦' + plan.price_ngn.toLocaleString() + '/mo'}
              </span>
            </div>

            {isCurrent ? (
              <div style={{
                marginTop: '10px',
                textAlign: 'center',
                padding: '10px',
                background: '#fff',
                border: '1px solid ' + style.accent,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                color: style.accent,
              }}>
                Current plan
              </div>
            ) : plan.price_ngn === 0 ? null : (
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={upgrading === plan.id}
                style={{
                  marginTop: '10px',
                  width: '100%',
                  minHeight: '44px',
                  padding: '11px',
                  background: style.accent,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  opacity: upgrading === plan.id ? 0.6 : 1,
                }}
              >
                {upgrading === plan.id ? 'Redirecting to payment...' : 'Upgrade to ' + plan.name}
              </button>
            )}
          </div>
        )
      })}

      {/* If the current plan is a legacy one hidden from new signups,
          show it here too so it isn't invisible on this page. */}
      {currentPlanDetails && !plans.find(p => p.id === currentPlanDetails.id) && (
        <div style={{
          border: '1px solid ' + currentStyle.accent,
          borderLeft: '4px solid ' + currentStyle.accent,
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '12px',
          background: currentStyle.tint,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{currentPlanDetails.name}</span>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{currentStyle.label}</div>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>
              {currentPlanDetails.price_ngn === 0 ? 'Free' : '₦' + currentPlanDetails.price_ngn.toLocaleString() + '/mo'}
            </span>
          </div>
          <div style={{
            marginTop: '10px',
            textAlign: 'center',
            padding: '10px',
            background: '#fff',
            border: '1px solid ' + currentStyle.accent,
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            color: currentStyle.accent,
          }}>
            Current plan
          </div>
        </div>
      )}

      <p style={{ fontSize: '12px', color: '#94A3B8', textAlign: 'center', marginTop: '20px', lineHeight: 1.5 }}>
        Payments are securely processed by Paystack. Your card details are never stored on Cloutinet&rsquo;s servers.
      </p>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '24px 0' }}>
        <p style={{ color: '#64748B', fontSize: '14px' }}>Loading...</p>
      </div>
    }>
      <BillingContent />
    </Suspense>
  )
}

const wrapStyle: React.CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  fontFamily: 'Segoe UI, system-ui, sans-serif',
}

const titleStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 800,
  color: '#0F172A',
  margin: '0 0 14px',
  letterSpacing: '-0.01em',
}
