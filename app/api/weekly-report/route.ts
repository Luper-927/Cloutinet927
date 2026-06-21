import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .not('business_name', 'is', null)
      .not('business_slug', 'is', null)

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ success: true, sent: 0 })
    }

    const { count: totalBusinesses } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('business_name', 'is', null)

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    let sentCount = 0

    for (const profile of profiles) {
      const { count: viewCount } = await supabaseAdmin
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('business_slug', profile.business_slug)
        .eq('event_type', 'page_view')
        .gte('created_at', oneWeekAgo)

      const { count: leadCount } = await supabaseAdmin
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('business_slug', profile.business_slug)
        .eq('event_type', 'whatsapp_click')
        .gte('created_at', oneWeekAgo)

      const { count: productCount } = await supabaseAdmin
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('is_published', true)

      let score = 0
      if (profile.business_name) score += 20
      if (profile.location) score += 15
      if (profile.phone) score += 15
      if (profile.business_category) score += 10
      if (profile.tagline) score += 10
      if (profile.business_hours) score += 5
      if (profile.services) score += 5
      if ((productCount || 0) > 0) score += 10
      if ((productCount || 0) >= 5) score += 5
      if (profile.facebook_url || profile.instagram_url) score += 5

      const previousScore = profile.last_visibility_score || 0
      const scoreChange = score - previousScore
      const scoreChangeText = scoreChange > 0 ? `+${scoreChange}` : scoreChange < 0 ? `${scoreChange}` : 'no change'
      const scoreChangeColor = scoreChange > 0 ? '#00aa55' : scoreChange < 0 ? '#ff4444' : '#888'

      const oneAction = !profile.location ? { task: 'Add your business location', link: '/onboarding' } :
                         !profile.tagline ? { task: 'Add a business tagline', link: '/onboarding' } :
                         !profile.business_hours ? { task: 'Add your business hours', link: '/onboarding' } :
                         !profile.services ? { task: 'List your services or products offered', link: '/onboarding' } :
                         (productCount || 0) === 0 ? { task: 'Add your first product', link: '/products/new' } :
                         (productCount || 0) < 5 ? { task: 'Add one more product to reach 5+', link: '/products/new' } :
                         !(profile.facebook_url || profile.instagram_url) ? { task: 'Add a social media link', link: '/onboarding' } :
                         { task: 'Share your store link on WhatsApp Status', link: '/dashboard' }

      const leadsText = (leadCount || 0) > 0
        ? `${leadCount} customer inquir${leadCount === 1 ? 'y' : 'ies'} this week`
        : 'Tracking active — none yet this week'

      const emailHtml = `
        <html>
          <body style="font-family: Segoe UI, system-ui, sans-serif; background: #f5f5f5; padding: 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
              <div style="background: #0F172A; padding: 28px 24px; text-align: center;">
                <div style="font-size: 22px; font-weight: 800; color: #fff;">Cloutinet</div>
                <div style="color: #94A3B8; font-size: 12px; margin-top: 4px;">Your Weekly Progress Report</div>
              </div>
              <div style="padding: 28px 24px;">
                <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">Hi ${profile.business_name},</h2>
                <p style="color: #64748B; font-size: 13px; margin-bottom: 20px;">Here's what's happening with your business on Cloutinet this week.</p>

                <div style="background: #F8FAFC; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
                  <div style="font-size: 11px; color: #94A3B8; margin-bottom: 4px; text-transform: uppercase; font-weight: 700;">Visibility Score</div>
                  <div style="display: flex; align-items: baseline; gap: 10px;">
                    <div style="font-size: 32px; font-weight: 800; color: #0F172A;">${score}/100</div>
                    <div style="font-size: 13px; font-weight: 700; color: ${scoreChangeColor};">${scoreChangeText}</div>
                  </div>
                </div>

                <div style="display: flex; gap: 10px; margin-bottom: 16px;">
                  <div style="flex: 1; background: #F8FAFC; border-radius: 10px; padding: 14px; text-align: center;">
                    <div style="font-size: 22px; font-weight: 800; color: #0F172A;">${viewCount || 0}</div>
                    <div style="font-size: 11px; color: #64748B;">Page Views</div>
                  </div>
                  <div style="flex: 1; background: #F8FAFC; border-radius: 10px; padding: 14px; text-align: center;">
                    <div style="font-size: 22px; font-weight: 800; color: #0F172A;">${productCount || 0}</div>
                    <div style="font-size: 11px; color: #64748B;">Products Live</div>
                  </div>
                </div>

                <div style="background: #F0FDF4; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
                  <div style="font-size: 12px; font-weight: 700; color: #166534; margin-bottom: 2px;">Customer Inquiries</div>
                  <div style="font-size: 13px; color: #166534;">${leadsText}</div>
                </div>

                <div style="background: #FFF7ED; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
                  <div style="font-size: 11px; font-weight: 700; color: #9A3412; margin-bottom: 6px; text-transform: uppercase;">This Week's Action</div>
                  <div style="font-size: 14px; color: #1a1a2e; font-weight: 600;">${oneAction.task}</div>
                </div>

                <div style="font-size: 12px; color: #94A3B8; text-align: center; margin-bottom: 20px;">
                  Cloutinet now has ${totalBusinesses || 1} businesses growing together
                </div>

                <a href="https://cloutinet.online${oneAction.link}" style="display: block; text-align: center; background: #0F172A; color: #fff; padding: 13px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 700;">
                  Complete This Week's Action
                </a>
              </div>
              <div style="background: #F8FAFC; padding: 18px 24px; text-align: center; border-top: 1px solid #E2E8F0;">
                <div style="font-size: 12px; font-weight: 700; color: #0F172A;">cloutinet.online</div>
              </div>
            </div>
          </body>
        </html>
      `

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Cloutinet <noreply@cloutinet.online>',
          to: [profile.email],
          subject: `Your Cloutinet Score: ${score}/100 (${scoreChangeText}) this week`,
          html: emailHtml,
        }),
      })

      await supabaseAdmin
        .from('profiles')
        .update({ last_visibility_score: score, last_score_check: new Date().toISOString() })
        .eq('id', profile.id)

      sentCount++
    }

    return NextResponse.json({ success: true, sent: sentCount })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
