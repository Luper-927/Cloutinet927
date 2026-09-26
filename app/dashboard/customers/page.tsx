'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { getBusinessTier } from '../../../lib/tiers'
import { getActingContext } from '../../../lib/permissions'
import Link from 'next/link'

type Customer = {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  tags: string[] | null
  last_contacted_at: string | null
  created_at: string
}

const FOLLOW_UP_DAYS = 30

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(true)
  const [noPermission, setNoPermission] = useState(false)
  const [hasAdvanced, setHasAdvanced] = useState(false)
  const [hasMarketing, setHasMarketing] = useState(false)
  const [tierName, setTierName] = useState('Free')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [scopedLocationName, setScopedLocationName] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const context = await getActingContext(userData.user.id)
    if (!context) { window.location.href = '/onboarding'; return }

    if (!context.permissions.customers) {
      setNoPermission(true)
      setLoading(false)
      return
    }

    const { limits } = await getBusinessTier(context.ownerId)
    setTierName(limits.name)
    setHasAdvanced(limits.advancedCustomers)
    setHasMarketing(limits.marketingAutomation)

    if (!limits.customerRecords) {
      setHasAccess(false)
      setLoading(false)
      return
    }

    let query = supabase
      .from('customers')
      .select('id, name, phone, email, address, notes, tags, last_contacted_at, created_at')
      .eq('user_id', context.ownerId)
      .order('created_at', { ascending: false })

    // An employee scoped to one location only sees that branch's
    // customers. Owners and unscoped employees see everything —
    // this line is simply skipped for them since locationId is null.
    if (context.locationId) {
      query = query.eq('location_id', context.locationId)
    }

    const { data } = await query
    setCustomers(data || [])

    if (context.locationId) {
      const { data: loc } = await supabase
        .from('locations')
        .select('business_name,
