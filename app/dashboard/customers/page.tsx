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

    const selectFields = 'id, name, phone, email, address, notes, tags, last_contacted_at, created_at'

    let query = supabase
      .from('customers')
      .select(selectFields)
      .eq('user_id', context.ownerId)
      .order('created_at', { ascending: false })

    if (context.locationId) {
      query = query.eq('location_id', context.locationId)
    }

    const { data } = await query
    setCustomers(data || [])

    if (context.locationId) {
      const locationFields = 'business_name, address'
      const { data: loc } = await supabase
        .from('locations')
        .select(locationFields)
        .eq('id', context.locationId)
        .maybeSingle()
      setScopedLocationName(loc?.business_name || loc?.address || null)
    }

    setLoading(false)
  }

  async function markContacted(id: string) {
    setUpdatingId(id)
    await supabase
      .from('customers')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('id', id)
    await load()
    setUpdatingId(null)
  }

  function needsFollowUp(c: Customer) {
    if (!hasAdvanced) return false
    if (!c.last_contacted_at) return true
    const daysSince = (Date.now() - new Date
