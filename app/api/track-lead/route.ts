import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { business_slug, product_id, source } = body

    const { error } = await supabase.from('analytics_events').insert({
      event_type: 'whatsapp_click',
      business_slug: business_slug,
      product_id: product_id || null,
      source: source || 'unknown',
    })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
