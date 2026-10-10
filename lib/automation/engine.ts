import { supabaseAdmin } from '@/lib/supabase-admin'

type Json = Record<string, unknown>

type Operator =
  | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'contains' | 'starts_with' | 'in' | 'not_in' | 'exists' | 'empty'

type Leaf = { field: string; op: Operator; value?: unknown }

// Conditions can be nested: all (AND), any (OR), not
export type Condition =
  | Leaf
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }

type RuleRow = {
  id: string
  owner_id: string
  name: string
  event_type: string
  conditions: unknown
  action_type: string
  action_config: Json
  requires_approval: boolean
  enabled: boolean
  cooldown_minutes: number
}

type EventRow = { id: string; owner_id: string; event_type: string; payload: Json }

type RunRow = {
  id: string
  owner_id: string
  rule_id: string
  event_id: string
  attempts: number
  max_attempts: number
}

// Errors that retrying cannot fix (missing rule, bad settings)
class NonRetryableError extends Error {}

const RUN_TIMEOUT_MS = 15000
const MAX_CHAIN_DEPTH = 3 // how many automations may trigger each other
const MAX_CONDITION_DEPTH = 5
const MAX_EVENTS_PER_HOUR = 1000 // per business, stops runaway loops
const MAX_RUNS_PER_DAY = 2000 // per business
const MAX_DELAY_MINUTES = 10080 // 7 days

// Actions listed here ALWAYS wait for owner approval, whatever the rule says.
// Add money, permission and delete actions here when they are built.
const SENSITIVE_ACTIONS = new Set<string>([])

function log(event: string, data: Json = {}) {
  console.log(JSON.stringify({ scope: 'automation', event, ...data }))
}

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Json)[key]
    return undefined
  }, obj)
}

// Fills {{customer.name}} style placeholders from the event data
function render(template: unknown, payload: Json, max = 300): string {
  const text = typeof template === 'string' ? template : ''
  return text
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, path: string) => {
      const v = getPath(payload, path)
      return v === undefined || v === null ? '' : String(v)
    })
    .slice(0, max)
}

function safeLink(link: unknown): string | null {
  return typeof link === 'string' && link.startsWith('/') && !link.startsWith('//')
    ? link.slice(0, 200)
    : null
}

// ---------- Conditions ----------
function num(v: unknown): number {
  if (v === null || v === undefined || v === '') return NaN
  return Number(v)
}

function evalLeaf(c: Leaf, payload: Json): boolean {
  const actual = getPath(payload, c.field)
  const v = c.value
  switch (c.op) {
    case 'eq': return String(actual) === String(v)
    case 'neq': return String(actual) !== String(v)
    case 'gt': return num(actual) > num(v)
    case 'gte': return num(actual) >= num(v)
    case 'lt': return num(actual) < num(v)
    case 'lte': return num(actual) <= num(v)
    case 'contains':
      return String(actual ?? '').toLowerCase().includes(String(v ?? '').toLowerCase())
    case 'starts_with':
      return String(actual ?? '').toLowerCase().startsWith(String(v ?? '').toLowerCase())
    case 'in': return Array.isArray(v) && v.map(String).includes(String(actual))
    case 'not_in': return Array.isArray(v) && !v.map(String).includes(String(actual))
    case 'exists': return actual !== undefined && actual !== null
    case 'empty':
      return (
        actual === undefined || actual === null || actual === '' ||
        (Array.isArray(actual) && actual.length === 0)
      )
    default: return false
  }
}

function evalCondition(c: Condition, payload: Json, depth = 0): boolean {
  if (depth > MAX_CONDITION_DEPTH || !c || typeof c !== 'object') return false
  if ('all' in c) {
    return Array.isArray(c.all) && c.all.every((x) => evalCondition(x, payload, depth + 1))
  }
  if ('any' in c) {
    return Array.isArray(c.any) && c.any.some((x) => evalCondition(x, payload, depth + 1))
  }
  if ('not' in c) return !evalCondition(c.not, payload, depth + 1)
  return evalLeaf(c as Leaf, payload)
}

// A rule's top-level conditions list works as AND. An empty list always matches.
export function conditionsMatch(conditions: unknown, payload: Json): boolean {
  if (conditions === null || conditions === undefined) return true
  if (!Array.isArray(conditions)) return false
  return conditions.every((c) => evalCondition(c as Condition, payload))
}

// ---------- 1. Record an event and queue matching rules ----------
// Never throws, so it can't break the feature that calls it.
export async function emitEvent(
  ownerId: string,
  eventType: string,
  payload: Json = {},
  dedupeKey?: string
): Promise<{ ok: boolean; duplicate: boolean; runsCreated: number; reason?: string }> {
  try {
    const depth = Number(payload._depth ?? 0)
    if (depth > MAX_CHAIN_DEPTH) {
      log('chain_too_deep', { ownerId, eventType })
      return { ok: false, duplicate: false, runsCreated: 0, reason: 'chain_too_deep' }
    }

    // Per-business hourly event limit
    const sinceHour = new Date(Date.now() - 3600000).toISOString()
    const { count: recentEvents } = await supabaseAdmin
      .from('automation_events')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', ownerId)
      .gte('created_at', sinceHour)
    if ((recentEvents ?? 0) >= MAX_EVENTS_PER_HOUR) {
      log('event_rate_limited', { ownerId })
      return { ok: false, duplicate: false, runsCreated: 0, reason: 'rate_limited' }
    }

    const { data: event, error } = await supabaseAdmin
      .from('automation_events')
      .insert({
        owner_id: ownerId,
        event_type: eventType,
        payload,
        dedupe_key: dedupeKey ?? null,
      })
      .select('id')
      .single()

    if (error || !event) {
      // 23505 = same event already recorded, so do nothing (no duplicate actions)
      if (error?.code === '23505') return { ok: true, duplicate: true, runsCreated: 0 }
      return { ok: false, duplicate: false, runsCreated: 0, reason: 'insert_failed' }
    }

    const { data: rules } = await supabaseAdmin
      .from('automation_rules')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('event_type', eventType)
      .eq('enabled', true)

    // Per-business daily run limit
    const sinceDay = new Date(Date.now() - 86400000).toISOString()
    const { count: runsToday } = await supabaseAdmin
      .from('automation_runs')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', ownerId)
      .gte('created_at', sinceDay)
    let budget = MAX_RUNS_PER_DAY - (runsToday ?? 0)

    let runsCreated = 0
    for (const rule of (rules ?? []) as RuleRow[]) {
      if (budget <= 0) {
        log('daily_run_cap_reached', { ownerId })
        break
      }
      if (!conditionsMatch(rule.conditions, payload)) continue

      // Cooldown: skip if this rule already ran recently
      if (rule.cooldown_minutes > 0) {
        const since = new Date(Date.now() - rule.cooldown_minutes * 60000).toISOString()
        const { count: recentRuns } = await supabaseAdmin
          .from('automation_runs')
          .select('id', { count: 'exact', head: true })
          .eq('rule_id', rule.id)
          .gte('created_at', since)
          .neq('status', 'rejected')
        if ((recentRuns ?? 0) > 0) continue
      }

      const needsApproval = rule.requires_approval || SENSITIVE_ACTIONS.has(rule.action_type)
      const delayMin = Math.min(
        Math.max(Number(rule.action_config?.delay_minutes ?? 0) || 0, 0),
        MAX_DELAY_MINUTES
      )

      const { error: runError } = await supabaseAdmin.from('automation_runs').insert({
        owner_id: ownerId,
        rule_id: rule.id,
        event_id: event.id,
        status: needsApproval ? 'awaiting_approval' : 'pending',
        next_attempt_at: new Date(Date.now() + delayMin * 60000).toISOString(),
      })
      if (!runError) {
        runsCreated++
        budget--
      }
    }

    return { ok: true, duplicate: false, runsCreated }
  } catch {
    return { ok: false, duplicate: false, runsCreated: 0, reason: 'unexpected_error' }
  }
}

// ---------- 2. The actions the engine can perform ----------
type Handler = (ctx: { run: RunRow; rule: RuleRow; event: EventRow }) => Promise<Json>

// Works out who should be notified: 'owner' (default), 'managers' or 'team'
async function resolveRecipients(ownerId: string, audience: unknown): Promise<string[]> {
  const ids = new Set<string>([ownerId])
  if (audience === 'managers' || audience === 'team') {
    const { data, error } = await supabaseAdmin
      .from('employees')
      .select('user_id, role')
      .eq('owner_id', ownerId)
      .eq('status', 'active')
      .limit(200)
    if (error) throw new Error('Could not load team members')
    for (const e of data ?? []) {
      if (!e.user_id) continue
      if (audience === 'team' || e.role === 'manager') ids.add(e.user_id as string)
    }
  }
  return Array.from(ids)
}

const HANDLERS: Record<string, Handler> = {
  // In-dashboard notification to the owner, managers or the whole team
  notify: async ({ run, rule, event }) => {
    const cfg = rule.action_config || {}
    const recipients = await resolveRecipients(rule.owner_id, cfg.recipients)
    const title = render(cfg.title, event.payload, 120) || rule.name
    const body = render(cfg.body, event.payload, 500) || null
    const link = safeLink(cfg.link)

    const rows = recipients.map((userId) => ({
      owner_id: rule.owner_id,
      user_id: userId,
      run_id: run.id,
      kind: 'action',
      title,
      body,
      link,
    }))

    // Safe to retry: the same run can never notify the same person twice
    const { error } = await supabaseAdmin
      .from('automation_notifications')
      .upsert(rows, { onConflict: 'run_id,user_id,kind', ignoreDuplicates: true })
    if (error) throw new Error('Could not create notifications')
    return { notified: recipients.length }
  },

  // Writes a line in the activity log
  log_activity: async ({ rule, event }) => {
    const cfg = rule.action_config || {}
    const { error } = await supabaseAdmin.from('activity_log').insert({
      owner_id: rule.owner_id,
      actor_user_id: null,
      actor_name: 'Automation',
      action: render(cfg.action, event.payload, 100) || rule.name,
      object_type: render(cfg.object_type, event.payload, 50) || 'automation',
      object_label: render(cfg.object_label, event.payload, 200) || null,
    })
    if (error) throw new Error('Could not write activity log')
    return { logged: true }
  },

  // Triggers another event, so automations can chain (limited depth)
  emit_event: async ({ run, rule, event }) => {
    const cfg = rule.action_config || {}
    const nextType = typeof cfg.event_type === 'string' ? cfg.event_type.trim().slice(0, 80) : ''
    if (!/^[a-z0-9_.:-]+$/i.test(nextType)) {
      throw new NonRetryableError('Invalid event_type in rule settings')
    }

    const depth = Number(event.payload?._depth ?? 0) + 1
    if (depth > MAX_CHAIN_DEPTH) throw new NonRetryableError('Automation chain is too deep')

    const extra =
      cfg.payload && typeof cfg.payload === 'object' ? (cfg.payload as Json) : {}
    const rendered: Json = {}
    for (const [k, v] of Object.entries(extra)) {
      rendered[k.slice(0, 50)] = typeof v === 'string' ? render(v, event.payload, 300) : v
    }

    // chain:<run id> makes this safe to retry without duplicating the follow-up
    const res = await emitEvent(
      rule.owner_id,
      nextType,
      { ...rendered, _depth: depth, _source_run: run.id },
      `chain:${run.id}`
    )
    if (!res.ok) throw new Error(`Follow-up event rejected (${res.reason ?? 'unknown'})`)
    return { emitted: nextType, runsCreated: res.runsCreated, duplicate: res.duplicate }
  },
}

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Action timed out')), RUN_TIMEOUT_MS)
    promise.then(
      (v) => { clearTimeout(timer); resolve(v) },
      (e) => { clearTimeout(timer); reject(e) }
    )
  })
}

// Tells the owner when an automation has permanently failed
async function notifyFailure(run: RunRow, message: string) {
  try {
    const { data: rule } = await supabaseAdmin
      .from('automation_rules')
      .select('name')
      .eq('id', run.rule_id)
      .maybeSingle()
    await supabaseAdmin.from('automation_notifications').upsert(
      {
        owner_id: run.owner_id,
        user_id: run.owner_id,
        run_id: run.id,
        kind: 'failure',
        title: `Automation failed: ${rule?.name ?? 'Unknown rule'}`.slice(0, 120),
        body: message,
        link: '/dashboard',
      },
      { onConflict: 'run_id,user_id,kind', ignoreDuplicates: true }
    )
  } catch {
    // never let a notification problem hide the real failure
  }
}

// ---------- 3. Run one queued action (with retries) ----------
async function executeRun(run: RunRow): Promise<'succeeded' | 'retried' | 'failed'> {
  try {
    const [{ data: rule }, { data: event }] = await Promise.all([
      supabaseAdmin
        .from('automation_rules')
        .select('*')
        .eq('id', run.rule_id)
        .eq('owner_id', run.owner_id)
        .maybeSingle(),
      supabaseAdmin
        .from('automation_events')
        .select('*')
        .eq('id', run.event_id)
        .eq('owner_id', run.owner_id)
        .maybeSingle(),
    ])

    if (!rule || !event) throw new NonRetryableError('Rule or event no longer exists')
    if (!rule.enabled) throw new NonRetryableError('Rule is disabled')

    const handler = HANDLERS[rule.action_type]
    if (!handler) throw new NonRetryableError('Unknown action type')

    const result = await withTimeout(handler({ run, rule, event }))

    await supabaseAdmin
      .from('automation_runs')
      .update({
        status: 'succeeded',
        result,
        error: null,
        finished_at: new Date().toISOString(),
      })
      .eq('id', run.id)
      .eq('status', 'running')

    log('run_succeeded', { runId: run.id, action: rule.action_type })
    return 'succeeded'
  } catch (e) {
    const message = (e instanceof Error ? e.message : 'Unknown error').slice(0, 300)
    const isFinal = e instanceof NonRetryableError || run.attempts >= run.max_attempts

    if (isFinal) {
      await supabaseAdmin
        .from('automation_runs')
        .update({ status: 'failed', error: message, finished_at: new Date().toISOString() })
        .eq('id', run.id)
        .eq('status', 'running')
      await notifyFailure(run, message)
      log('run_failed', { runId: run.id, attempts: run.attempts, message })
      return 'failed'
    }

    // Try again later: about 2 min, then about 4 min, with a little randomness
    const delayMs = Math.pow(2, run.attempts) * 60000 + Math.floor(Math.random() * 15000)
    await supabaseAdmin
      .from('automation_runs')
      .update({
        status: 'pending',
        error: message,
        next_attempt_at: new Date(Date.now() + delayMs).toISOString(),
      })
      .eq('id', run.id)
      .eq('status', 'running')
    log('run_retry_scheduled', { runId: run.id, attempts: run.attempts, message })
    return 'retried'
  }
}

// ---------- 4. Process the queue (called by the scheduled job in Step 3) ----------
export async function processRuns(batchSize = 10) {
  const summary = { claimed: 0, succeeded: 0, retried: 0, failed: 0 }

  const { data: claimed, error } = await supabaseAdmin.rpc('claim_automation_runs', {
    batch_size: batchSize,
  })
  if (error || !claimed) {
    if (error) log('claim_failed', { message: error.message })
    return summary
  }

  for (const run of claimed as RunRow[]) {
    summary.claimed++
    const outcome = await executeRun(run)
    summary[outcome]++
  }
  return summary
}

// ---------- 5. Approve or reject an action that is waiting ----------
// IMPORTANT: the route that calls this must first confirm the logged-in
// user is the business owner.
export async function decideRun(
  runId: string,
  ownerId: string,
  deciderId: string,
  approve: boolean,
  deciderName = 'Owner'
): Promise<boolean> {
  const now = new Date().toISOString()
  const { data, error } = await supabaseAdmin
    .from('automation_runs')
    .update({
      status: approve ? 'pending' : 'rejected',
      approved_by: deciderId,
      next_attempt_at: now,
      finished_at: approve ? null : now,
    })
    .eq('id', runId)
    .eq('owner_id', ownerId)
    .eq('status', 'awaiting_approval')
    .select('id, rule_id')

  if (error || !data || data.length !== 1) return false

  // Audit trail
  try {
    const { data: rule } = await supabaseAdmin
      .from('automation_rules')
      .select('name')
      .eq('id', data[0].rule_id)
      .maybeSingle()
    await supabaseAdmin.from('activity_log').insert({
      owner_id: ownerId,
      actor_user_id: deciderId,
      actor_name: deciderName,
      action: approve ? 'Approved automation' : 'Rejected automation',
      object_type: 'automation',
      object_label: rule?.name ?? null,
    })
  } catch {
    // the decision itself already succeeded
  }
  return true
}

// ---------- 6. Retry a failed action by hand ----------
export async function retryRun(runId: string, ownerId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('automation_runs')
    .update({
      status: 'pending',
      attempts: 0,
      error: null,
      finished_at: null,
      next_attempt_at: new Date().toISOString(),
    })
    .eq('id', runId)
    .eq('owner_id', ownerId)
    .eq('status', 'failed')
    .select('id')
  return !error && !!data && data.length === 1
}

// ---------- 7. Health numbers for a dashboard (last 7 days) ----------
export async function getEngineHealth(ownerId: string) {
  const since = new Date(Date.now() - 7 * 86400000).toISOString()
  const statuses = [
    'pending', 'running', 'succeeded', 'failed', 'awaiting_approval', 'rejected',
  ] as const

  const results = await Promise.all(
    statuses.map((s) =>
      supabaseAdmin
        .from('automation_runs')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', ownerId)
        .eq('status', s)
        .gte('created_at', since)
    )
  )

  const counts: Record<string, number> = {}
  statuses.forEach((s, i) => {
    counts[s] = results[i].count ?? 0
  })
  return counts
}
