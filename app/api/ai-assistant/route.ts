import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getUserClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getUserClient(token)
    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, question } = await req.json()

    // Figure out acting context the same way the client does: owner, or
    // an active employee working on the owner's behalf.
    const { data: ownProfile } = await supabase.from('profiles').select('id, business_name').eq('id', userData.user.id).maybeSingle()

    let ownerId = userData.user.id
    let isOwner = true
    let permissions: Record<string, boolean> = {}

    if (ownProfile) {
      permissions = { products: true, customers: true, orders: true, analytics: true, marketing: true, payments: true, documents: true, employees: true }
    } else {
      const { data: employee } = await supabase
        .from('employees')
        .select('owner_id, permissions, status')
        .eq('user_id', userData.user.id)
        .eq('status', 'active')
        .maybeSingle()

      if (!employee) {
        return NextResponse.json({ error: 'No business context found' }, { status: 403 })
      }
      ownerId = employee.owner_id
      isOwner = false
      permissions = employee.permissions as Record<string, boolean>
    }

    // Get the plan to know the AI limit AND whether advanced AI is unlocked at all.
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan_id, status, current_period_end')
      .eq('user_id', ownerId)
      .eq('status', 'active')
      .maybeSingle()

    const AI_LIMITS: Record<string, number> = { free: 10, essential: 70, growth: 180, business: 600, advanced: 2999 }
    const ADVANCED_AI_TIERS = ['business', 'advanced']
    const planId = (sub && (!sub.current_period_end || new Date(sub.current_period_end) > new Date())) ? sub.plan_id : 'free'
    const aiLimit = AI_LIMITS[planId] || 10

    // ---- Build deterministic, real-data insights (no AI, no cost) ----
    const insights: string[] = []

    if (permissions.customers) {
      const { data: customers } = await supabase.from('customers').select('id, last_contacted_at').eq('user_id', ownerId)
      const needsFollowUp = (customers || []).filter(c => {
        if (!c.last_contacted_at) return true
        return (Date.now() - new Date(c.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24) >= 30
      })
      if (needsFollowUp.length > 0) {
        insights.push(`${needsFollowUp.length} customer${needsFollowUp.length === 1 ? '' : 's'} haven't been contacted in 30+ days.`)
      }
    }

    if (permissions.payments && ADVANCED_AI_TIERS.includes(planId)) {
      const { data: pending } = await supabase.from('payment_records').select('amount, currency').eq('owner_id', ownerId).in('status', ['pending', 'partial'])
      const total = (pending || []).reduce((sum, r) => sum + Number(r.amount), 0)
      if (total > 0) {
        insights.push(`You have ${pending?.[0]?.currency || 'NGN'} ${total.toLocaleString()} in pending payments.`)
      }
    }

    if (permissions.products) {
      const { data: products } = await supabase.from('products').select('id').eq('user_id', ownerId)
      insights.push(`You have ${products?.length || 0} product${products?.length === 1 ? '' : 's'} listed.`)
    }

    if (action === 'insights') {
      return NextResponse.json({ insights })
    }

    // ---- Ask Cloutinet AI (costs one AI generation) ----
    if (!ADVANCED_AI_TIERS.includes(planId)) {
      return NextResponse.json({ error: 'Ask Cloutinet AI needs a Business or Advanced plan.' }, { status: 403 })
    }

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Missing question' }, { status: 400 })
    }

    const { data: usageResult, error: usageError } = await supabase.rpc('increment_ai_usage', { p_owner_id: ownerId, p_limit: aiLimit })
    if (usageError || !usageResult?.allowed) {
      return NextResponse.json({ error: `You've reached your monthly AI limit (${aiLimit} requests). It resets next month.` }, { status: 429 })
    }

    const contextSummary = insights.length > 0 ? insights.join(' ') : 'No notable insights available yet.'

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: `You are Cloutinet AI, a business assistant for a Nigerian SME called "${ownProfile?.business_name || 'this business'}". Only use the facts given below — never invent statistics, customers, or transactions. If you don't have enough information to answer something, say so plainly instead of guessing.\n\nCurrent business facts: ${contextSummary}`,
          },
          { role: 'user', content: question },
        ],
      }),
    })

    const groqData = await groqResponse.json()
    const answer = groqData.choices?.[0]?.message?.content

    if (!answer) {
      return NextResponse.json({ error: 'AI did not return a response. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ answer, insights })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
