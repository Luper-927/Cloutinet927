'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { getBusinessTier } from '../../../lib/tiers'
import { getActingContext, logActivity } from '../../../lib/permissions'
import Link from 'next/link'

const currencies = ['NGN', 'USD', 'GBP', 'EUR', 'GHS']

export default function NewProductPage() {
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('NGN')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const savingLock = useRef(false)

  const [productCount, setProductCount] = useState<number | null>(null)
  const [productLimit, setProductLimit] = useState<number>(5)
  const [tierName, setTierName] = useState<string>('Free')
  const [checkingLimit, setCheckingLimit] = useState(true)
  const [ownerId, setOwnerId] = useState<string>('')
  const [actorName, setActorName] = useState<string>('')
  const [locationId, setLocationId] = useState<string | null>(null)
  const [noAccess, setNoAccess] = useState(false)

  useEffect(() => {
    checkProductCount()
  }, [])

  async function checkProductCount() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const context = await getActingContext(userData.user.id)
    if (!context) { window.location.href = '/onboarding'; return }

    if (!context.permissions.products) {
      setNoAccess(true)
      setCheckingLimit(false)
      return
    }

    setOwnerId(context.ownerId)
    setActorName(context.employeeName || 'Owner')
    setLocationId(context.locationId)

    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', context.ownerId)

    const { limits } = await getBusinessTier(context.ownerId)
    setProductLimit(limits.productLimit)
    setTierName(limits.name)

    setProductCount(count ?? 0)
    setCheckingLimit(false)
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    try {
      const compressed = await compressImage(file)
      setImageFile(compressed)
      setImagePreview(URL.createObjectURL(compressed))
    } catch {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  async function compressImage(file: File): Promise<File> {
    const MAX_DIMENSION = 1200
    const QUALITY = 0.8

    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob: Blob | null = await new Promise(resolve =>
      canvas.toBlob(resolve, 'image/jpeg', QUALITY)
    )
    if (!blob) return file

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], newName, { type: 'image/jpeg' })
  }

  async function generateDescription() {
    if (!name.trim()) {
      setError('Please enter product name first')
      return
    }
    setGenerating(true)
    setError('')
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_name, business_category, location, phone')
        .eq('id', ownerId)
        .single()

      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      const response = await fetch('/api
