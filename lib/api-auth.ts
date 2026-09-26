import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface ApiAuthResult {
  ok: boolean
  ownerId?: string
  keyId?: string
  error?: string
  status?: number
}

function hashKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex')
}

/**
 * Validates a raw API key from the Authorization header against
 * api_keys.key_hash, rejects revoked keys, and updates last_used_at.
 * Mirrors the pattern /api/v1/products already uses — if that route's
 * actual hashing differs from sha256, this needs to be reconciled to
 * match it exactly rather than run as a second, divergent scheme.
 */
export async function validateApiKey(req: Request): Promise<ApiAuthResult> {
  const authHeader = req.headers.get('authorization') || ''
  const rawKey = authHeader.replace('Bearer ', '').trim()

  if (!rawKey) {
    return { ok: false, error: 'Missing API key', status: 401 }
  }

  const hash = hashKey(rawKey)

  const { data: keyRow, error } = await supabase
    .from('api_keys')
    .select('id, owner_id, revoked')
    .eq('key_hash', hash)
    .maybeSingle()

  if (error || !keyRow) {
    return { ok: false, error: 'Invalid API key', status: 401 }
  }
  if (keyRow.revoked) {
    return { ok: false, error: 'This API key has been revoked', status: 401 }
  }

  // Fire-and-forget — never block the request on this write.
  supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', keyRow.id).then(() => {}, () => {})

  return { ok: true, ownerId: keyRow.owner_id, keyId: keyRow.id }
}

const DAILY_LIMIT = 500 // requests/day per key — change here only, nowhere else

/**
 * Checks and increments today's usage count for a key against
 * api_key_usage_log (key_id, day, count). Returns ok:false once the
 * key has hit DAILY_LIMIT for today (UTC date).
 */
export async function checkAndIncrementRateLimit(keyId: string): Promise<{ ok: boolean; remaining: number }> {
  const today = new Date().toISOString().slice(0, 10)

  const { data: existing } = await supabase
    .from('api_key_usage_log')
    .select('count')
    .eq('key_id', keyId)
    .eq('day', today)
    .maybeSingle()

  const currentCount = existing?.count || 0
  if (currentCount >= DAILY_LIMIT) {
    return { ok: false, remaining: 0 }
  }

  if (existing) {
    await supabase.from('api_key_usage_log').update({ count: currentCount + 1 }).eq('key_id', keyId).eq('day', today)
  } else {
    await supabase.from('api_key_usage_log').insert({ key_id: keyId, day: today, count: 1 })
  }

  return { ok: true, remaining: DAILY_LIMIT - currentCount - 1 }
}
