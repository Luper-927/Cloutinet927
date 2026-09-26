'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { getBusinessTier } from '../../../../lib/tiers'
import { getActingContext, logActivity } from '../../../../lib/permissions'

export default function NewCustomerPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [checkingAccess, setCheckingAccess] = useState(true)
  const [hasAccess, setHasAccess] = useState(true)
  const [noPermission, setNoPermission] = useState(false)
  const [hasTags, setHasTags] = useState(false)
  const [tierName, setTierName] = useState('Free')
  const [ownerId, setOwnerId] = useState('')
  const [actorName, setActorName] = useState('')
  const [locationId, setLocationId] = useState<string | null>(null)

  useEffect(() => {
    checkAccess()
  }, [])

  async function checkAccess() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const context = await getActingContext(userData.user.id)
    if (!context) { window.location.href = '/onboarding'; return }

    if (!context.permissions.customers) {
      setNoPermission(true)
      setCheckingAccess(false)
      return
    }

    setOwnerId(context.ownerId)
    setActorName(context.employeeName || 'Owner')
    // A scoped employee's new customers automatically belong to their
    // assigned branch — same silent behavior as owner_id, no extra UI.
    setLocationId(context.locationId)

    const { limits } = await getBusinessTier(context.ownerId)
    setTierName(limits.name)
    setHasAccess(limits.customerRecords)
    setHasTags(limits.advancedCustomers)
    setCheckingAccess(false)
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Customer name is required')
      return
    }
    setSaving(true)
    setError('')

    const { limits } = await getBusinessTier(ownerId)
    if (!limits.customerRecords) {
      setSaving(false)
      setHasAccess(false)
      setTierName(limits.name)
      return
    }

    const tags = limits.advancedCustomers
      ? tagsInput.split(',').map(t => t.trim()).filter(Bo
