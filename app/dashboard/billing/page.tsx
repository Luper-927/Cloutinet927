'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { useDashboard } from '../../components/DashboardShell'

interface Plan { id: string; name: string; price_ngn: number }
interface Subscription { plan_id: string; status: string; current_period_end: string | null }

const TIER_STYLE: Record<string, { accent: string; label: string }> = {
  free:       { accent: '#94A3B8', label: 'Getting started' },
  startup:    { accent: '#2DD4BF', label: 'Early-stage' },
  growth_v2:  { accent: '#FBBF24', label: 'Recommended' },
  scale:      { accent: '#FB923C', label: 'Multiple locations' },
  enterprise: { accent: '#A78BFA', label: 'Custom' },
  essential:  { accent: '#2DD4BF', label: 'Legacy plan' },
  growth:     { accent: '#FBBF24', label: 'Legacy plan' },
  business:   { accent: '#FB923C', label: 'Legacy plan' },
  advanced:   { accent: '#A78BFA', label: 'Legacy plan' },
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

  useEffect(() => { init() }, [])

  async function init() {
    if (!context.isOwner) { setLoading(false); return }

    await loadPlansAndSubscription()

    if (searchParams.get('upgraded')) {
      setBanner({ type: 'success', message: 'Payment successful! Your plan has been upgraded.' })
    }

    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (reference) await verifyPayment(reference)

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

    // The current plan may be a legacy or inactive one, so fetch it directly
    // rather than relying on the active-only list.
    if (sub.plan_id === 'free') {
      setCurrentPlanDetails({ id: 'free', name: 'Free', price_ngn: 0 })
    } else {
      const fromActive = activePlans.find(p => p.id === sub.plan_id)
      if (fromActive) {
        setCurrentPlanDetails(fromActive)
      } else {
        const { data: legacyPlan } = await supabase
          .from('plans').select('id, name, price_ngn').eq('id', sub.plan_id).maybeSingle()
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
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
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
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
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
    return <div className="ui-wrap"><p className="ui-sub">Only the business owner can manage billing.</p></div>
  }

  if (loading) {
    return <div className="ui-wrap"><p className="ui-sub">Loading...</p></div>
  }

  const currentPlanId = subscription?.plan_id || 'free'

  const ladderPlans = [...plans]
  if (currentPlanDetails && !ladderPlans.find(p => p.id === currentPlanDetails.id)) {
    ladderPlans.push(currentPlanDetails)
  }
  ladderPlans.sort((a, b) => a.price_ngn - b.price_ngn)
  const currentIndex = ladderPlans.findIndex(p => p.id === currentPlanId)

  const priceLabel = (p: Plan) => (p.price_ngn === 0 ? 'Free' : '₦' + p.price_ngn.toLocaleString() + '/mo')

  function PlanCard({ plan, isCurrent, canUpgrade }: { plan: Plan; isCurrent: boolean; canUpgrade: boolean }) {
    const style = TIER_STYLE[plan.id] || TIER_STYLE.free
    return (
      <div className="ui-card" style={{ marginBottom: '12px', borderLeft: '4px solid ' + style.accent, borderColor: isCurrent ? style.accent : undefined }}>
        <div className="ui-between">
          <div>
            <span className="ui-name">{plan.name}</span>
            {plan.id === RECOMMENDED_PLAN_ID && !isCurrent && (
              <span className="ui-badge ui-badge-warn" style={{ marginLeft: '8px' }}>Recommended</span>
            )}
            <div className="ui-meta">{style.label}</div>
          </div>
          <span className="ui-name" style={{ whiteSpace: 'nowrap' }}>{priceLabel(plan)}</span>
        </div>

        {isCurrent ? (
          <div style={{ marginTop: '12px', textAlign: 'center', padding: '10px', border: '1px solid ' + style.accent, borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: style.accent }}>
            Current plan
          </div>
        ) : canUpgrade && plan.price_ngn > 0 ? (
          <button
            onClick={() => handleUpgrade(plan.id)}
            disabled={upgrading === plan.id}
            className="ui-btn ui-block"
            style={{ marginTop: '12px' }}
          >
            {upgrading === plan.id ? 'Redirecting to payment...' : 'Upgrade to ' + plan.name}
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="ui-wrap">
      <h1 className="ui-title">Billing</h1>

      {banner && (
        <div
          className="ui-card"
          style={{
            marginBottom: '20px',
            borderColor: banner.type === 'success' ? 'rgba(52,211,153,.4)' : banner.type === 'error' ? 'rgba(248,113,113,.4)' : 'rgba(96,165,250,.4)',
          }}
        >
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: banner.type === 'success' ? '#34D399' : banner.type === 'error' ? '#F87171' : '#93C5FD' }}>
            {banner.message}
          </p>
        </div>
      )}

      <div className="ui-card" style={{ marginBottom: '24px', padding: '22px', background: 'linear-gradient(135deg, rgba(37,99,235,.25), rgba(10,14,39,0) 70%), rgba(255,255,255,.04)' }}>
        <div className="ui-meta">Current plan</div>
        <div style={{ fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: '4px 0' }}>
          {currentPlanDetails?.name || 'Free'}
        </div>
        {subscription?.current_period_end && (
          <div className="ui-meta">Renews {new Date(subscription.current_period_end).toLocaleDateString()}</div>
        )}
        {ladderPlans.length > 1 && (
          <div style={{ display: 'flex', gap: '4px', marginTop: '16px' }}>
            {ladderPlans.map((p, i) => (
              <div key={p.id} style={{ flex: 1, height: '5px', borderRadius: '3px', background: i <= currentIndex ? '#34D399' : 'rgba(255,255,255,.15)' }} />
            ))}
          </div>
        )}
      </div>

      <div className="ui-section-label" style={{ marginTop: 0 }}>Available plans</div>

      {plans.map(plan => (
        <PlanCard key={plan.id} plan={plan} isCurrent={plan.id === currentPlanId} canUpgrade />
      ))}

      {currentPlanDetails && !plans.find(p => p.id === currentPlanDetails.id) && (
        <PlanCard plan={currentPlanDetails} isCurrent canUpgrade={false} />
      )}

      <p className="ui-meta" style={{ textAlign: 'center', marginTop: '20px', lineHeight: 1.5 }}>
        Payments are securely processed by Paystack. Your card details are never stored on Cloutinet&rsquo;s servers.
      </p>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="ui-wrap"><p className="ui-sub">Loading...</p></div>}>
      <BillingContent />
    </Suspense>
  )
}
