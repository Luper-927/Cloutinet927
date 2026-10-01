import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase-admin'

const ADMIN_EMAIL = 'luperabenga8@gmail.com'

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token)
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  if (userData.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const [
    { count: bizCount },
    { count: prodCount },
    { count: viewCount },
    { count: leadCount },
    { count: feedCount },
    { data: bizData },
    { data: prodData },
    { data: feedData },
    { data: leadData },
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).not('business_name', 'is', null),
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'page_view'),
    supabaseAdmin.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'whatsapp_click'),
    supabaseAdmin.from('feedback').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('*').not('business_name', 'is', null).order('created_at', { ascending: false }),
    supabaseAdmin.from('products').select('*').order('created_at', { ascending: false }).limit(50),
    supabaseAdmin.from('feedback').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('analytics_events').select('*').eq('event_type', 'whatsapp_click').order('created_at', { ascending: false }).limit(200),
  ])

  return NextResponse.json({
    stats: {
      businesses: bizCount || 0,
      products: prodCount || 0,
      views: viewCount || 0,
      leads: leadCount || 0,
      feedback: feedCount || 0,
    },
    businesses: bizData || [],
    products: prodData || [],
    feedbacks: feedData || [],
    leads: leadData || [],
  })
}
