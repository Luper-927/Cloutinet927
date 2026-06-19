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

      const tip = !profile.location ? 'Add your business location to improve visibility' :
                  !profile.tagline ? 'Add a tagline to make your page more appealing' :
                  (productCount || 0) === 0 ? 'Add your first product to start getting found' :
                  (productCount || 0) < 5 ? 'Add more products — businesses with 5+ products get more views' :
                  'Share your store link on WhatsApp Status to get more visitors'

      const emailHtml = `
        <html>
          <body style="font-family: Segoe UI, system-ui, sans-serif; background: #f5f5f5; padding: 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
              <div style="background: linear-gradient(135deg, #6B21A8, #9333EA); padding: 28px 24px; text-align: center;">
                <div style="font-size: 24px; font-weight: 900; color: #fff;">⚡ Cloutinet</div>
                <div style="color: rgba(255,255,255,0.8); font-size: 12px; margin-top: 4px;">Your Weekly Report</div>
              </div>
              <div style="padding: 28px 24px;">
                <h2 style="font-size: 18px; font-weight: 800; color: #1a1a2e; margin-bottom: 4px;">Hi ${profile.business_name},</h2>
                <p style="color: #888; font-size: 13px; margin-bottom: 20px;">Here's how your business performed this week on Cloutinet.</p>

                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                  <div style="flex: 1; background: #f9f5ff; border-radius: 10px; padding: 14px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 900; color: #6B21A8;">${viewCount || 0}</div>
                    <div style="font-size: 11px; color: #888;">Page Views</div>
                  </div>
                  <div style="flex: 1; background: #f0fff4; border-radius: 10px; padding: 14px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 900; color: #00aa55;">${leadCount || 0}</div>
                    <div style="font-size: 11px; color: #888;">WhatsApp Leads</div>
                  </div>
                </div>

                <div style="background: #fff3eb; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
                  <div style="font-size: 12px; color: #888; margin-bottom: 4px;">Your Visibility Score</div>
                  <div style="font-size: 28px; font-weight: 900; color: ${score >= 80 ? '#00aa55' : score >= 50 ? '#FF6B35' : '#ff4444'};">${score}/100</div>
                </div>

                <div style="background: #f9f5ff; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
                  <div style="font-size: 12px; font-weight: 700; color: #6B21A8; margin-bottom: 4px;">💡 This Week's Tip</div>
                  <div style="font-size: 13px; color: #444;">${tip}</div>
                </div>

                <a href="https://cloutinet.online/dashboard" style="display: block; text-align: center; background: #6B21A8; color: #fff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700;">
                  View Full Dashboard
                </a>
              </div>
              <div style="background: #f9f5ff; padding: 18px 24px; text-align: center; border-top: 1px solid #e5d5ff;">
                <div style="font-size: 12px; font-weight: 700; color: #6B21A8;">cloutinet.online</div>
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
          subject: `📊 Your Weekly Cloutinet Report — ${viewCount || 0} views this week`,
          html: emailHtml,
        }),
      })

      sentCount++
    }

    return NextResponse.json({ success: true, sent: sentCount })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
