'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { getBusinessTier } from '../../../lib/tiers'
import { getActingContext, logActivity } from '../../../lib/permissions'
import Link from 'next/link'

type PaymentRecord = {
  id: string
  customer_name: string
  amount: number
  currency: string
  status: string
  method: string | null
  reference: string | null
  note: string | null
  created_at: string
}

export default function PaymentsPage() {
  const [records, setRecords] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(true)
  const [noPermission, setNoPermission] = useState(false)
  const [tierName, setTierName] = useState('Free')
  const [ownerId, setOwnerId] = useState('')
  const [actorName, setActorName] = useState('')
  const [locationId, setLocationId] = useState<string | null>(null)
  const [scopedLocationName, setScopedLocationName] = useState<string | null>(null)

  const [customerName, setCustomerName] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<'paid' | 'pending' | 'partial' | 'failed' | 'refunded' | 'cancelled'>('paid')
  const [method, setMethod] = useState('')
  const [reference, setReference] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const context = await getActingContext(userData.user.id)
    if (!context) { window.location.href = '/onboarding'; return }

    if (!context.permissions.payments) {
      setNoPermission(true)
      setLoading(false)
      return
    }

    setOwnerId(context.ownerId)
    setActorName(context.employeeName || 'Owner')
    setLocationId(context.locationId)

    const { limits } = await getBusinessTier(context.ownerId)
    setTierName(limits.name)

    if (!limits.paymentsModule) {
      setHasAccess(false)
      setLoading(false)
      return
    }

    let recordsQuery = supabase
      .from('payment_records')
      .select('id, customer_name, amount, currency, status, method, reference, note, created_at')
      .eq('owner_id', context.ownerId)
      .order('created_at', { ascending: false })

    if (context.locationId) {
      recordsQuery = recordsQuery.eq('location_id', context.locationId)
    }

    const { data } = await recordsQuery
    setRecords(data || [])

    if (context.locationId) {
      const locFields = 'business_name, address'
      const { data: loc } = await supabase
        .from('locations')
        .select(locFields)
        .eq('id', context.locationId)
        .maybeSingle()
      const locName = loc?.business_name || loc?.address
      setScopedLocationName(locName || null)
    }

    setLoading(false)
  }

  async function handleAdd() {
    if (!customerName.trim() || !amount.trim()) {
      setError('Customer name and amount are required')
      return
    }
    setSaving(true)
    setError('')

    const { error: saveError } = await supabase.from('payment_records').insert({
      owner_id: ownerId,
      location_id: locationId,
      customer_name: customerName,
      amount: parseFloat(amount),
      status,
      method: method || null,
      reference: reference || null,
      note: note || null,
    })

    setSaving(false)
    if (saveError) { setError(saveError.message); return }

    await logActivity(ownerId, actorName, 'recorded', 'payment', customerName + ' - ' + amount)

    setCustomerName(''); setAmount(''); setMethod(''); setReference(''); setNote(''); setStatus('paid')
    setShowForm(false)
    load()
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>Loading...</p>
      </div>
    )
  }

  if (noPermission) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif', textAlign: 'center' as const }}>You don&rsquo;t have permission to view payments.</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
        <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Payments</div>
