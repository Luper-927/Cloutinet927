import { supabase } from './supabase'

export type PermissionKey =
  | 'products' | 'customers' | 'orders' | 'analytics'
  | 'marketing' | 'payments' | 'documents' | 'employees'

export type ActingContext = {
  // The business whose data this session should operate on —
  // the owner's user id, whether the logged-in person IS the owner
  // or an employee acting on the owner's behalf.
  ownerId: string
  isOwner: boolean
  employeeName: string | null
  role: 'owner' | 'manager' | 'staff' | null
  permissions: Record<PermissionKey, boolean>
}

const OWNER_PERMISSIONS: Record<PermissionKey, boolean> = {
  products: true, customers: true, orders: true, analytics: true,
  marketing: true, payments: true, documents: true, employees: true,
}

/**
 * Figures out who the logged-in user is acting as: the business owner
 * themselves, or an employee acting on an owner's behalf. Every gated
 * page should call this ONCE and use the returned ownerId for all
 * data queries — never assume the logged-in user's own id is the
 * business id, since employees log in with their OWN account.
 */
export async function getActingContext(userId: string): Promise<ActingContext | null> {
  // First check: does this user own a business themselves?
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (profile) {
    return {
      ownerId: userId,
      isOwner: true,
      employeeName: null,
      role: 'owner',
      permissions: OWNER_PERMISSIONS,
    }
  }

  // Not an owner — check if they're an active employee of a business.
  const { data: employee } = await supabase
    .from('employees')
    .select('owner_id, name, role, permissions, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (employee) {
    return {
      ownerId: employee.owner_id,
      isOwner: false,
      employeeName: employee.name,
      role: employee.role as 'manager' | 'staff',
      permissions: employee.permissions as Record<PermissionKey, boolean>,
    }
  }

  return null
}

/**
 * Writes one row to the activity log. Never blocks the calling action
 * if this fails — logging is best-effort, not load-bearing.
 */
export async function logActivity(
  ownerId: string,
  actorName: string,
  action: string,
  objectType: string,
  objectLabel: string
) {
  try {
    await supabase.from('activity_log').insert({
      owner_id: ownerId,
      actor_name: actorName,
      action,
      object_type: objectType,
      object_label: objectLabel,
    })
  } catch {
    // Silent — a logging failure should never break the actual action.
  }
}
