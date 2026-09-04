import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

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

    const { name } = await req.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Missing key name' }, { status: 400 })
    }

    // Only the business owner can create keys — matches the RLS policy,
    // but checked explicitly here too since we're about to generate a secret.
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', userData.user.id).maybeSingle()
    if (!profile) {
      return NextResponse.json({ error: 'Only the business owner can create API keys' }, { status: 403 })
    }

    const rawKey = 'clt_' + crypto.randomBytes(24).toString('hex')
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
    const keyPrefix = rawKey.slice(0, 12)

    const { error: insertError } = await supabase.from('api_keys').insert({
      owner_id: userData.user.id,
      name,
      key_hash: keyHash,
      key_prefix: keyPrefix,
    })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ key: rawKey })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
