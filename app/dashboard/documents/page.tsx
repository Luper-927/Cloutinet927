'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { getBusinessTier } from '../../../lib/tiers'
import { getActingContext, logActivity } from '../../../lib/permissions'
import Link from 'next/link'

type Document = {
  id: string
  name: string
  category: string
  file_url: string
  file_type: string | null
  file_size_bytes: number | null
  uploaded_by_name: string
  created_at: string
}

const CATEGORIES = ['all', 'invoices', 'receipts', 'contracts', 'business', 'employees', 'customers', 'other']

function formatSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(true)
  const [noPermission, setNoPermission] = useState(false)
  const [tierName, setTierName] = useState('Free')
  const [ownerId, setOwnerId] = useState('')
  const [actorName, setActorName] = useState('')

  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingCategory, setPendingCategory] = useState('other')

  useEffect(() => { load() }, [])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { window.location.href = '/auth'; return }

    const context = await getActingContext(userData.user.id)
    if (!context) { window.location.href = '/onboarding'; return }

    if (!context.permissions.documents) {
      setNoPermission(true)
      setLoading(false)
      return
    }

    setOwnerId(context.ownerId)
    setActorName(context.employeeName || 'Owner')

    const { limits } = await getBusinessTier(context.ownerId)
    setTierName(limits.name)

    if (!limits.documentsModule) {
      setHasAccess(false)
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('documents')
      .select('id, name, category, file_url, file_type, file_size_bytes, uploaded_by_name, created_at')
      .eq('owner_id', context.ownerId)
      .order('created_at', { ascending: false })

    setDocuments(data || [])
    setLoading(false)
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setUploading(true)

    // Folder = ownerId — this is the exact convention the storage RLS
    // policies check against, so getting this right matters for security,
    // not just organization.
    const filePath = ownerId + '/' + Date.now() + '-' + file.name

    const { error: uploadError } = await supabase.storage
      .from('business-documents')
      .upload(filePath, file)

    if (uploadError) {
      setUploading(false)
      setError('Upload failed: ' + uploadError.message)
      return
    }

    const { data: urlData } = await supabase.storage
      .from('business-documents')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365)

    const { error: saveError } = await supabase.from('documents').insert({
      owner_id: ownerId,
      name: file.name,
      category: pendingCategory,
      file_url: urlData?.signedUrl || filePath,
      file_type: file.type,
      file_size_bytes: file.size,
      uploaded_by_name: actorName,
    })

    setUploading(false)
    if (saveError) { setError(saveError.message); return }

    await logActivity(ownerId, actorName, 'uploaded', 'document', file.name)
    load()
  }

  async function handleDelete(doc: Document) {
    const confirmed = confirm('Delete "' + doc.name + '"? This cannot be undone.')
    if (!confirmed) return

    await supabase.from('documents').delete().eq('id', doc.id)
    await logActivity(ownerId, actorName, 'deleted', 'document', doc.name)
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
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Segoe UI, system-ui, sans-serif', textAlign: 'center' as const }}>You don&rsquo;t have permission to view documents.</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
        <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Documents</div>
          <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</Link>
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📁</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            Documents needs Business or higher
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
            You&rsquo;re currently on the {tierName} plan. Upgrade to store invoices, contracts, and business documents in one place.
          </p>
          <Link href="/dashboard/billing" style={{
            display: 'inline-block', background: '#0F172A', color: '#fff',
            borderRadius: '8px', padding: '12px 24px', fontSize: '14px',
            fontWeight: 700, textDecoration: 'none'
          }}>
            View Plans
          </Link>
        </div>
      </div>
    )
  }

  const filtered = documents.filter(d => {
    const matchesCategory = activeCategory === 'all' || d.category === activeCategory
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ background: '#0F172A', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Documents</div>
        <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>Back</Link>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
        <input
          placeholder="Search documents..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, marginBottom: '12px' }}
        />

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: '16px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                border: '1px solid ' + (activeCategory === cat ? '#0F172A' : '#E2E8F0'),
                background: activeCategory === cat ? '#0F172A' : '#fff',
                color: activeCategory === cat ? '#fff' : '#0F172A', cursor: 'pointer', fontFamily: 'inherit',
                textTransform: 'capitalize' as const
              }}
            >{cat}</button>
          ))}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <select value={pendingCategory} onChange={e => setPendingCategory(e.target.value)} style={{ ...inputStyle, marginBottom: '8px' }}>
            {CATEGORIES.filter(c => c !== 'all').map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              width: '100%', background: '#0F172A', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '12px', cursor: 'pointer',
              fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', opacity: uploading ? 0.7 : 1
            }}
          >
            {uploading ? 'Uploading...' : '+ Upload Document'}
          </button>
          <input ref={fileRef} type="file" onChange={handleFileSelect} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,image/*" />
          <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>PDF, Word, Excel, CSV, or images. Max 10MB.</p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
            <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>{error}</p>
          </div>
        )}

        {filtered.length === 0 ? (
          <p style={{ color: '#64748B', fontSize: '13px', textAlign: 'center' as const, padding: '20px' }}>No documents found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(doc => (
              <div key={doc.id} style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' as const }}>{doc.name}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'capitalize' as const }}>
                    {doc.category} · {formatSize(doc.file_size_bytes)} · {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginLeft: '8px' }}>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px', background: '#0F172A', color: '#fff', textDecoration: 'none' }}>View</a>
                  <button onClick={() => handleDelete(doc)} style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px', background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0',
  borderRadius: '8px', padding: '10px 12px', color: '#0F172A',
  fontSize: '13px', outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box'
}
