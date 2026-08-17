import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

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
    const failures: { email: string; error: string }[] = []

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

      const scoreLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Just Getting Started'
      const scoreSubtext = score >= 80
        ? 'Your business is performing strongly on Cloutinet.'
        : score >= 60
        ? 'Your business is doing well — a few small updates could push this higher.'
        : score >= 40
        ? "There's real opportunity to boost how discoverable your business is."
        : "Let's build up your visibility — every detail you add helps."

      const hasSocial = !!(profile.facebook_url || profile.instagram_url)

      const oneAction = !profile.location
        ? { task: 'Add your business location', link: '/onboarding', why: 'Customers searching nearby need to know where to find you. Adding your location helps you show up in local searches.' }
        : !profile.tagline
        ? { task: 'Add a business tagline', link: '/onboarding', why: 'A short, clear tagline helps customers instantly understand what you offer and builds trust at first glance.' }
        : !profile.business_hours
        ? { task: 'Add your business hours', link: '/onboarding', why: 'Letting customers know when you\'re open reduces wasted trips and missed inquiries.' }
        : !profile.services
        ? { task: 'List your services or products offered', link: '/onboarding', why: 'A clear list of what you offer makes it easier for the right customers to find and choose you.' }
        : (productCount || 0) === 0
        ? { task: 'Add your first product', link: '/products/new', why: 'Businesses with products listed get discovered far more often than empty profiles.' }
        : (productCount || 0) < 5
        ? { task: 'Add one more product to reach 5+', link: '/products/new', why: 'More listings mean more chances to appear in searches and catch a customer\'s eye.' }
        : !hasSocial
        ? { task: 'Add your social media link', link: '/onboarding', why: 'Connecting your social media accounts can strengthen your digital presence and give potential customers more ways to discover and connect with your business.' }
        : { task: 'Share your store link on WhatsApp Status', link: '/dashboard', why: 'Your existing contacts are often your fastest path to new customers — a quick share goes a long way.' }

      const leadsText = (leadCount || 0) > 0
        ? `${leadCount} Customer Inquir${leadCount === 1 ? 'y' : 'ies'}`
        : '0 Customer Inquiries'

      const socialText = hasSocial ? 'Connected' : 'Not connected yet'

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
                <p style="color: #64748B; font-size: 13px; margin-bottom: 22px;">Here's what's happening with your business on Cloutinet this week.</p>

                <div style="font-size: 12px; font-weight: 700; color: #0F172A; margin-bottom: 8px;">📊 Your Visibility Score</div>
                <div style="background: #F8FAFC; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
                  <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 4px;">
                    <div style="font-size: 32px; font-weight: 800; color: #0F172A;">${score}/100</div>
                    <div style="font-size: 13px; font-weight: 700; color: #0F172A;">— ${scoreLabel}</div>
                    <div style="font-size: 12px; font-weight: 700; color: ${scoreChangeColor};">${scoreChangeText}</div>
                  </div>
                  <div style="font-size: 12px; color: #64748B;">${scoreSubtext}</div>
                </div>

                <div style="font-size: 12px; font-weight: 700; color: #0F172A; margin-bottom: 8px;">📈 This Week at a Glance</div>
                <div style="background: #F8FAFC; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
                  <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #334155;"><span>Page Views</span><span style="font-weight: 700; color: #0F172A;">${viewCount || 0}</span></div>
                  <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #334155;"><span>Products Live</span><span style="font-weight: 700; color: #0F172A;">${productCount || 0}</span></div>
                  <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #334155;"><span>Customer Inquiries</span><span style="font-weight: 700; color: #0F172A;">${leadsText}</span></div>
                  <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #334155;"><span>Social Media</span><span style="font-weight: 700; color: ${hasSocial ? '#00aa55' : '#94A3B8'};">${socialText}</span></div>
                </div>

                <div style="font-size: 12px; font-weight: 700; color: #0F172A; margin-bottom: 8px;">🎯 Your Next Best Action</div>
                <div style="background: #FFF7ED; border-radius: 10px; padding: 16px; margin-bottom: 22px;">
                  <div style="font-size: 14px; color: #1a1a2e; font-weight: 700; margin-bottom: 6px;">${oneAction.task}</div>
                  <div style="font-size: 12px; color: #7C4A12; line-height: 1.5;">${oneAction.why}</div>
                </div>

                <a href="https://cloutinet.online${oneAction.link}" style="display: block; text-align: center; background: #0F172A; color: #fff; padding: 13px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 700; margin-bottom: 18px;">
                  👉 Complete This Week's Action
                </a>

                <p style="text-align: center; font-size: 13px; color: #475569; font-weight: 600;">Keep building your visibility.</p>
              </div>
              <div style="background: #F8FAFC; padding: 20px 24px; text-align: center; border-top: 1px solid #E2E8F0;">
                <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">Cloutinet</div>
                <div style="font-size: 11px; color: #94A3B8;">Helping businesses become more discoverable, connected, and ready to grow.</div>
              </div>
            </div>
          </body>
        </html>
      `

      const emailResponse = await fetch('https://api.resend.com/emails', {
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

      if (emailResponse.ok) {
        sentCount++
      } else {
        const errorBody = await emailResponse.text()
        failures.push({ email: profile.email, error: `${emailResponse.status}: ${errorBody}` })
      }

      await supabaseAdmin
        .from('profiles')
        .update({ last_visibility_score: score, last_score_check: new Date().toISOString() })
        .eq('id', profile.id)
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failures.length,
      failures,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
