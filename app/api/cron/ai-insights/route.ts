import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getBusinessTier } from '../../../../lib/tiers'

const ALERT_EMAIL = 'luperabenga8@gmail.com'

// Thresholds — one place to tune.
const DROP_THRESHOLD = -30   // % change that counts as a concerning drop
const SPIKE_THRESHOLD = 50   // % change that counts as a notable spike
const RENOTIFY_COOLDOWN_DAYS = 6 // don't re-alert on the same ongoing trend every day

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function sendFailureAlert(subject: string, details: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: 'Cloutinet Alerts <alerts@cloutinet.online>',
        to: ALERT_EMAIL,
        subject,
        text: details,
      }),
    })
  } catch (e) {
    // If even the alert email fails, there's nothing more we can do here.
  }
}

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch('https://api.resend.com/emails', {
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

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`${response.status}: ${errorBody}`)
  }
}

async function countEvents(supabase: any, businessSlug: string, eventType: string, fromDaysAgo: number, toDaysAgo: number) {
  const from = new Date(Date.now() - fromDaysAgo * 24 * 60 * 60 * 1000).toISOString()
  const to = new Date(Date.now() - toDaysAgo * 24 * 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('analytics_events')
    .select('id', { count: 'exact', head: true })
    .eq('business_slug', businessSlug)
    .eq('event_type', eventType)
    .gte('created_at', from)
    .lt('created_at', to)
  return count || 0
}

interface MetricCheck {
  insightType: string
  label: string
}

const METRICS: MetricCheck[] = [
  { insightType: 'views', label: 'page views' },
  { insightType: 'leads', label: 'WhatsApp leads' },
]

const EVENT_TYPE_FOR_METRIC: Record<string, string> = {
  views: 'page_view',
  leads: 'whatsapp_click',
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getServiceClient()

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, business_name, business_slug')
      .not('business_slug', 'is', null)

    let insightsCreated = 0
    let emailsSent = 0
    const failures: { email: string; error: string }[] = []

    for (const profile of profiles || []) {
      const { limits } = await getBusinessTier(profile.id)
      if (!limits.aiAutomation) continue

      const newInsightsForThisBusiness: { type: string; message: string; change: number }[] = []

      for (const metric of METRICS) {
        const eventType = EVENT_TYPE_FOR_METRIC[metric.insightType]
        const thisWeek = await countEvents(supabase, profile.business_slug, eventType, 7, 0)
        const lastWeek = await countEvents(supabase, profile.business_slug, eventType, 14, 7)

        // No baseline yet — nothing meaningful to compare against.
        if (lastWeek === 0) continue

        const pctChange = ((thisWeek - lastWeek) / lastWeek) * 100
        const isDrop = pctChange <= DROP_THRESHOLD
        const isSpike = pctChange >= SPIKE_THRESHOLD
        if (!isDrop && !isSpike) continue

        const insightType = metric.insightType + (isDrop ? '_drop' : '_spike')

        // Don't re-alert on the same ongoing trend every single day.
        const cooldownSince = new Date(Date.now() - RENOTIFY_COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString()
        const { data: recent } = await supabase
          .from('ai_insights')
          .select('id')
          .eq('owner_id', profile.id)
          .eq('insight_type', insightType)
          .gte('created_at', cooldownSince)
          .limit(1)

        if (recent && recent.length > 0) continue

        const direction = isDrop ? 'dropped' : 'jumped'
        const message = `Your ${metric.label} ${direction} ${Math.abs(Math.round(pctChange))}% this week compared to last week (${lastWeek} → ${thisWeek}).`

        const today = new Date()
        const periodStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        const periodEnd = today.toISOString().slice(0, 10)

        const { error: insertError } = await supabase.from('ai_insights').insert({
          owner_id: profile.id,
          insight_type: insightType,
          message,
          metric_change: Math.round(pctChange * 10) / 10,
          period_start: periodStart,
          period_end: periodEnd,
        })

        if (!insertError) {
          insightsCreated++
          newInsightsForThisBusiness.push({ type: insightType, message, change: pctChange })
        }
      }

      if (newInsightsForThisBusiness.length === 0 || !profile.email) continue

      const html =
        '<h2>Heads up on ' + profile.business_name + '</h2>' +
        '<ul>' + newInsightsForThisBusiness.map(i => '<li>' + i.message + '</li>').join('') + '</ul>' +
        '<p><a href="https://cloutinet.online/dashboard">View your dashboard</a></p>'

      try {
        await sendEmail(profile.email as string, 'New insight for ' + profile.business_name, html)
        emailsSent++
      } catch (e: any) {
        failures.push({ email: profile.email as string, error: e.message })
      }
    }

    if (failures.length > 0) {
      await sendFailureAlert(
        `⚠️ Cloutinet: AI insights cron had ${failures.length} failed email send(s)`,
        `Insights created: ${insightsCreated}\nEmails sent: ${emailsSent}\nFailed: ${failures.length}\n\n${JSON.stringify(failures, null, 2)}`
      )
    }

    return NextResponse.json({ success: true, insightsCreated, emailsSent, failed: failures.length })
  } catch (e: any) {
    await sendFailureAlert('🔴 Cloutinet: AI insights cron crashed entirely', `${e.message}\n\n${e.stack || ''}`)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
