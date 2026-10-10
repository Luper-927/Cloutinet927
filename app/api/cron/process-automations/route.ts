import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { processRuns } from '@/lib/automation/engine'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Cron is not configured' }, { status: 500 })
  }

  // Only the scheduler (which knows the secret) may run this
  const given = Buffer.from(req.headers.get('authorization') || '')
  const expected = Buffer.from(`Bearer ${secret}`)
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const summary = await processRuns(5)
  return NextResponse.json({ ok: true, ...summary })
}
