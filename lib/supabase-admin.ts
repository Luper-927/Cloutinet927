// lib/supabase-admin.ts — SERVER-ONLY. Never import this from a 'use client' file
// or any code that runs in the browser. It uses the service-role key, which
// bypasses Row Level Security entirely.
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
