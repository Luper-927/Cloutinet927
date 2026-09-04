import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getBusinessTier } from '../../../../lib/tiers'
import crypto from 'crypto'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const DAILY_RATE_LIMIT = 2000

async function authenticateKey(req: NextRequest) {
  const rawKey = req.headers.get('x-api-key')
  if (!rawKey) return { error: 'Missing X-API-Key header', status: 401 }

  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
  const supabase = getServiceClient()

  const { data: keyRow } = await supabase
    .from('api_keys')
    .select('id, owner_id, revoked')
    .eq('key_hash', keyHash)
    .maybeSingle()

  if (!keyRow || keyRow.revoked) return { error: 'Invalid or revoked API key', status: 401 }

  const { limits } = await getBusinessTier(keyRow.owner_id)
  if (!limits.integrations) return { error: 'API access requires the Advanced plan', status: 403 }

  // Simple daily rate limit, atomic upsert — mirrors the AI usage pattern.
  const today = new Date().toISOString().slice(0, 10)
  const { data: usage } = await supabase
    .from('api_key_usage_log')
    .select('count')
    .eq('key_id', keyRow.id)
    .eq('day', today)
    .maybeSingle()

  if (usage && usage.count >= DAILY_RATE_LIMIT) {
    return { error: 'Daily rate limit reached (' + DAILY_RATE_LIMIT + ' requests)', status: 429 }
  }

  await supabase.from('api_key_usage_log').upsert(
    { key_id: keyRow.id, day: today, count: (usage?.count || 0) + 1 },
    { onConflict: 'key_id,day' }
  )
  await supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', keyRow.id)

  return { ownerId: keyRow.owner_id, limits }
}

export async function GET(req: NextRequest) {
  const auth = await authenticateKey(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price, currency, image_url, slug, is_published, created_at')
    .eq('user_id', auth.ownerId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ products: data })
}

export async function POST(req: NextRequest) {
  const auth = await authenticateKey(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = getServiceClient()

  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', auth.ownerId)

  if ((count ?? 0) >= auth.limits.productLimit) {
    return NextResponse.json({ error: 'Product limit reached (' + auth.limits.productLimit + ')' }, { status: 403 })
  }

  const body = await req.json()
  if (!body.name) {
    return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 })
  }

  const slug = body.name.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-5)

  const { data, error } = await supabase.from('products').insert({
    user_id: auth.ownerId,
    name: body.name,
    slug,
    description: body.description || null,
    price: body.price || null,
    currency: body.currency || 'NGN',
    image_url: body.image_url || null,
    is_published: body.is_published !== false,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product: data })
}
