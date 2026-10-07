'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { logActivity } from '../../../lib/permissions'
import { useDashboard } from '../../components/DashboardShell'

type Document = {
  id: string
  name: string
  category: string
  file_url: string
  file_path: string | null
  file_type: string | null
  file_size_bytes: number | null
  uploaded_by_name: string
  created_at: string
}

const CATEGORIES = ['all', 'invoices', 'receipts', 'contracts', 'business', 'employees', 'customers', 'other']
const MAX_BYTES = 10 * 1024 * 1024

function formatSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function DocumentsPage() {
  const { context, tierLimits, locationName } = useDashboard()

  const ownerId = context.ownerId
  const actorName = context.employeeName || 'Owner'
  const locationId = context.locationId

  const noPermission = !context.permissions.documents
  const hasAccess = !!tierLimits?.documentsModule
  const tierName = tierLimits?.name || 'Free'

  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingCategory, setPendingCategory] = useState('other')

  useEffect(() => { load() }, [])

  async function load() {
    if (noPermission || !hasAccess) { setLoading(false); return }

    let docsQuery = supabase
      .from('documents')
      .select('id, name, category, file_url, file_path, file_type, file_size_bytes, uploaded_by_name, created_at')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    if (locationId) docsQuery = docsQuery.eq('location_id', locationId)

    const { data } = await docsQuery
    setDocuments(data || [])
    setLoading(false)
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')

    if (file.size > MAX_BYTES) {
      setError('That file is larger than 10 MB. Please choose a smaller file.')
      if (fileRef.current) fileRef.current.value = ''
      return
    }

    setUploading(true)

    // Folder = ownerId. This is the convention the storage security rules check.
    const filePath = ownerId + '/' + Date.now() + '-' + file.name

    const { error: uploadError } = await supabase.storage
      .from('business-documents')
      .upload(filePath, file)

    if (uploadError) {
      setUploading(false)
      setError('Upload failed: ' + uploadError.message)
      return
    }

    const { error: saveError } = await supabase.from('documents').insert({
      owner_id: ownerId,
      location_id: locationId,
      name: file.name,
      category: pendingCategory,
      file_url: filePath,
      file_path: filePath,
      file_type: file.type,
      file_size_bytes: file.size,
      uploaded_by_name: actorName,
    })

    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
    if (saveError) { setError(saveError.message); return }

    await logActivity(ownerId, actorName, 'uploaded', 'document', file.name)
    load()
  }

  async function handleView(doc: Document) {
    if (!doc.file_path) {
      window.open(doc.file_url, '_blank')
      return
    }

    setViewingId(doc.id)
    const { data, error } = await supabase.storage
      .from('business-documents')
      .createSignedUrl(doc.file_path, 60)
    setViewingId(null)

    if (error || !data?.signedUrl) {
      setError('Could not open document. Please try again.')
      return
    }

    window.open(data.signedUrl, '_blank')
  }

  async function handleDelete(doc: Document) {
    const confirmed = confirm('Delete "' + doc.name + '"? This cannot be undone.')
    if (!confirmed) return

    await supabase.from('documents').delete().eq('id', doc.id)
    await logActivity(ownerId, actorName, 'deleted', 'document', doc.name)
    load()
  }

  if (loading) return <div className="ui-wrap"><p className="ui-sub">Loading...</p></div>

  if (noPermission) {
    return <div className="ui-wrap"><p className="ui-sub">You don&rsquo;t have permission to view documents.</p></div>
  }

  if (!hasAccess) {
    return (
      <div className="ui-wrap">
        <h1 className="ui-title">Documents</h1>
        <div className="ui-upgrade">
          <h2>Documents are not included in your plan</h2>
          <p>You&rsquo;re currently on the {tierName} plan. Upgrade to store invoices, contracts, and business documents in one place.</p>
          <Link href="/dashboard/billing" className="ui-btn">View plans</Link>
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
    <div className="ui-wrap">
      <h1 className="ui-title">Documents</h1>

      {locationName && <div className="ui-banner">Showing documents for {locationName} only</div>}

      <input className="ui-input tight" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} />

      <div className="ui-pills">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={'ui-pill' + (activeCategory === cat ? ' is-on' : '')}>
            {cat}
          </button>
        ))}
      </div>

      <div className="ui-card" style={{ marginBottom: '20px' }}>
        <select className="ui-input tight" value={pendingCategory} onChange={e => setPendingCategory(e.target.value)}>
          {CATEGORIES.filter(c => c !== 'all').map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="ui-btn ui-block">
          {uploading ? 'Uploading...' : '+ Upload document'}
        </button>
        <input ref={fileRef} type="file" onChange={handleFileSelect} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,image/*" />
        <p className="ui-meta" style={{ margin: '8px 0 0' }}>PDF, Word, Excel, CSV, or images. Max 10 MB.</p>
      </div>

      {error && <div className="ui-error"><p>{error}</p></div>}

      {filtered.length === 0 ? (
        <div className="ui-empty">No documents found.</div>
      ) : (
        <div className="ui-list">
          {filtered.map(doc => (
            <div key={doc.id} className="ui-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="ui-name" style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                <div className="ui-meta" style={{ textTransform: 'capitalize' }}>
                  {doc.category} · {formatSize(doc.file_size_bytes)} · {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => handleView(doc)} disabled={viewingId === doc.id} className="ui-btn ui-btn-sm">
                  {viewingId === doc.id ? '...' : 'View'}
                </button>
                <button onClick={() => handleDelete(doc)} className="ui-btn ui-btn-danger ui-btn-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
