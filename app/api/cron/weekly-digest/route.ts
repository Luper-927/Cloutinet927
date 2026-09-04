import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getBusinessTier } from '../../../../lib/tiers'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function sendEmail(to: string, subject: string, html: string) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Cloutinet <reports@cloutinet.online>',
      to,
      subject,
      html,
    }),
  })
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, business_name')
    .not('email', 'is', null)

  let sent = 0

  for (const profile of profiles || []) {
    const { limits } = await getBusinessTier(profile.id)
    if (!limits.aiAutomation) continue

    const insights: string[] = []

    const { data: customers } = await supabase.from('customers').select('id, last_contacted_at').eq('user_id', profile.id)
    const needsFollowUp = (customers || []).filter((c: any) => {
      if (!c.last_contacted_at) return true
      return (Date.now() - new Date(c.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24) >= 30
    })
    if (needsFollowUp.length > 0) {
      insights.push(needsFollowUp.length + ' customer' + (needsFollowUp.length === 1 ? '' : 's') + " haven't been contacted in 30+ days.")
    }

    const { data: pending } = await supabase.from('payment_records').select('amount, currency').eq('owner_id', profile.id).in('status', ['pending', 'partial'])
    const pendingList = pending || []
    const pendingTotal = pendingList.reduce((sum: number, r: any) => sum + Number(r.amount), 0)
    if (pendingTotal > 0) {
      insights.push((pendingList[0]?.currency || 'NGN') + ' ' + pendingTotal.toLocaleString() + ' in pending payments.')
    }

    const { count: productCount } = await supabase.from('products').select('id', { count: 'exact', head: true }).eq('user_id', profile.id)
    insights.push((productCount || 0) + ' product' + (productCount === 1 ? '' : 's') + ' currently listed.')

    if (insights.length === 0) continue

    const html = '<h2>Your weekly Cloutinet digest</h2><p>Here\'s what\'s happening with ' + profile.business_name + ':</p><ul>' + insights.map(i => '<li>' + i + '</li>').join('') + '</ul><p><a href="https://cloutinet.online/dashboard">View your dashboard</a></p>'

    await sendEmail(profile.email as string, 'Your weekly update - ' + profile.business_name, html)
    sent++
  }

  return NextResponse.json({ success: true, sent })
}
