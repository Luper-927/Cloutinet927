import { supabase } from './supabase'

// Single source of truth for what each tier includes.
// Change limits here — never hardcode a number like "20" anywhere else in the app again.
export const TIER_LIMITS = {
  free: {
    name: 'Free',
    productLimit: 5,
    aiGenerationsPerMonth: 10,
    customerRecords: false,
    advancedCustomers: false,
    marketingAutomation: false,
    employees: false,
    documentsModule: false,
    advancedAI: false,
    integrations: false,
    prioritySupport: false,
  },
  essential: {
    name: 'Essential',
    productLimit: 45,
    aiGenerationsPerMonth: 70,
    customerRecords: true,
    advancedCustomers: false,
    marketingAutomation: false,
    employees: false,
    documentsModule: false,
    advancedAI: false,
    integrations: false,
    prioritySupport: false,
  },
  growth: {
    name: 'Growth',
    productLimit: 90,
    aiGenerationsPerMonth: 180,
    customerRecords: true,
    advancedCustomers: true,
    marketingAutomation: true,
    employees: false,
    documentsModule: false,
    advancedAI: false,
    integrations: false,
    prioritySupport: false,
  },
  business: {
    name: 'Business',
    productLimit: 300,
    aiGenerationsPerMonth: 600,
    customerRecords: true,
    advancedCustomers: true,
    marketingAutomation: true,
    employees: true,
    documentsModule: true,
    advancedAI: true,
    integrations: false,
    prioritySupport: false,
  },
  advanced: {
    name: 'Advanced',
    productLimit: 999,
    aiGenerationsPerMonth: 2999,
    customerRecords: true,
    advancedCustomers: true,
    marketingAutomation: true,
    employees: true,
    documentsModule: true,
    advancedAI: true,
    integrations: true,
    prioritySupport: true,
  },
} as const

export type TierKey = keyof typeof TIER_LIMITS

// Maps your `plans` table id -> a TierKey above.
// Confirmed against the live `plans` table: free, essential, growth, business, advanced.
const PLAN_ID_TO_TIER: Record<string, TierKey> = {
  free: 'free',
  essential: 'essential',
  growth: 'growth',
  business: 'business',
  advanced: 'advanced',
}

/**
 * Gets a business's current tier + full limit object in ONE query
 * (joins subscriptions -> plans), instead of separate round trips.
 * Falls back to 'free' if there's no active subscription row —
 * this is correct today since `subscriptions` starts empty for
 * every business until they actually pay.
 */
export async function getBusinessTier(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, plan_id, current_period_end, plans(id)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (error || !data) {
    return { tierKey: 'free' as TierKey, limits: TIER_LIMITS.free }
  }

  // Treat an expired period as no longer active, even if the row
  // wasn't updated yet — safe default, never trust the client on this.
  if (data.current_period_end && new Date(data.current_period_end) < new Date()) {
    return { tierKey: 'free' as TierKey, limits: TIER_LIMITS.free }
  }

  const tierKey = PLAN_ID_TO_TIER[data.plan_id] || 'free'
  return { tierKey, limits: TIER_LIMITS[tierKey] }
}
