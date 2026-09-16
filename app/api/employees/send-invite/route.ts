import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: userData, error: authError } = await supabase.auth.getUser(token)
    if (authError || !userData?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { name, email, inviteLink, businessName, role } = await req.json()
    if (!name || !email || !inviteLink) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const roleLabel = role === 'manager' ? 'Manager' : 'Staff'

    const emailHtml = `
      <html>
        <body style="font-family: Segoe UI, system-ui, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <div style="background: #0F172A; padding: 28px 24px; text-align: center;">
              <div style="font-size: 22px; font-weight: 800; color: #fff;">Cloutinet</div>
              <div style="color: #94A3B8; font-size: 12px; margin-top: 4px;">You've been invited to join a team</div>
            </div>
            <div style="padding: 28px 24px;">
              <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">Hi ${name},</h2>
              <p style="color: #64748B; font-size: 13px; margin-bottom: 18px; line-height: 1.6;">
                <strong>${businessName}</strong> has invited you to join their team on Cloutinet as a <strong>${roleLabel}</strong>.
                Cloutinet is a platform businesses use to manage their online presence, products, and customers.
              </p>
              <a href="${inviteLink}" style="display: block; text-align: center; background: #0F172A; color: #fff; padding: 13px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 700; margin-bottom: 18px;">
                Accept Invitation
              </a>
              <p style="text-align: center; font-size: 12px; color: #94A3B8;">
                If you don't have a Cloutinet account yet, you'll be able to create one to accept.
              </p>
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
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Cloutinet <noreply@cloutinet.online>',
        to: [email],
        subject: `${businessName} invited you to join their team on Cloutinet`,
        html: emailHtml,
      }),
    })

    if (!emailResponse.ok) {
      const errorBody = await emailResponse.text()
      return NextResponse.json({ error: 'Could not send email: ' + errorBody }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
