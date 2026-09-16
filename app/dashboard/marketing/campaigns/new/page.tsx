'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../../lib/supabase'
import Link from 'next/link'

const OBJECTIVES = [
  'Get more enquiries',
  'Promote a product',
  'Increase WhatsApp conversations',
  'Increase page visits',
  'Promote an offer',
  'Build awareness',
]

export default function NewCampaignPage() {
  const [name, setName] = useState('')
  const [objective, setObjective] = useState(OBJECTIVES[0])
  const [destinationType, setDestinationType] = useState<'product' | 'business'>('business')
  const [productId, setProductId] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [body, setBody] = useState('')
  const [cta, setCta] = useState('Message us on WhatsApp')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const [{ data: profileData }, { data: productsData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userData.user.id).single(),
      supabase.from('products').select('id, name, price, currency, description').eq('user_id', userData.user.id).eq('is_published', true),
    ])
    setProfile(profileData)
    setProducts(productsData || [])
  }

  async function generateCopy() {
    if (!name.trim()) { setError('Give your campaign a name first'); return }
    setGenerating(true)
    setError('')

    const selectedProduct = products.find(p => p.id === productId)

    try {
      const response = await fetch('/api/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'campaign_copy',
          businessName: profile?.business_name,
          category: profile?.business_category,
          location: profile?.location,
          campaignName: name,
          objective,
          productName: selectedProduct?.name,
          price: selectedProduct?.price,
          currency: selectedProduct?.currency,
        }),
      })
      const data = await response.json()
      if (data.result) setBody(data.result)
      else setError(data.error || 'Could not generate copy. Try again.')
    } catch (e) {
      setError('Could not generate copy. Please try again.')
    }
    setGenerating(false)
  }

  async function handleSave(status: 'draft' | 'active') {
    if (!name.trim()) { setError('Campaign name is required'); return }
    setSaving(true)
    setError('')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const { data: campaign, error: campaignError } = await supabase.from('campaigns').insert({
      user_id: userData.user.id,
      name,
      objective,
      status,
      destination_type: destinationType,
      destination_id: destinationType === 'product' ? productId : null,
    }).select().single()

    if (campaignError || !campaign) {
      setSaving(false)
      setError(campaignError?.message || 'Could not save campaign')
      return
    }

    await supabase.from('campaign_content').insert({
      campaign_id: campaign.id,
      content_type: 'promotional_post',
      title: name,
      body,
      cta,
    })

    setSaving(false)
    window.location.href = '/dashboard/marketing'
  }

  return (
