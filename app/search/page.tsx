'use client'

import { useState } from 'react'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  description: string | null
  price: number | null
  currency: string
  image_url: string | null
  slug: string
  profiles: { business_slug: string; business_name: string; location: string | null }
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [mode, setMode] = useState<'broad' | 'specific' | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)

    const res = await fetch('/api/search-products?q=' + encodeURIComponent(query))
    const data = await res.json()

    setResults(data.results || [])
    setMode(data.mode || null)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ background: '#0F172A', padding: '14px 20px' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Find a Business</div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 20px' }}>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px', textAlign: 'center' as const }}>
          Try something specific, like &ldquo;non-stick pot&rdquo; or &ldquo;Samsung phone in Lagos&rdquo;
        </p>

        <input
          placeholder="What are you looking for?"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          style={{
            width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0',
            borderRadius: '10px', padding: '14px 16px', color: '#0F172A',
            fontSize: '15px', marginBottom: '12px', outline: 'none', fontFamily: 'inherit',
            boxSizing: 'border-box' as const
          }}
        />

        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            width: '100%', background: '#0F172A', color: '#fff', border: 'none',
            borderRadius: '10px', padding: '14px', cursor: 'pointer',
            fontSize: '15px', fontWeight: 700, fontFamily: 'inherit', marginBottom: '24px',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>

        {searched && !loading && results.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: '20px' }}>
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '8px' }}>
              No exact matches found for &ldquo;{query}&rdquo;.
            </p>
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>
              Try a more specific or differently worded term.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <>
            {mode === 'broad' && (
              <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '12px' }}>
                Showing all results in this category
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {results.map(p => (
                <Link
                  key={p.id}
                  href={'/store/' + p.profiles.business_slug + '/' + p.slug}
                  style={{
                    display: 'flex', gap: '12px', border: '1px solid #E2E8F0', borderRadius: '12px',
                    padding: '12px', textDecoration: 'none', color: '#0F172A'
                  }}
                >
                  {p.image_url && (
                    <img src={p.image_url} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' as const, flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{p.profiles.business_name}</div>
                    {p.price && <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{p.currency} {Number(p.price).toLocaleString()}</div>}
                    {p.profiles.location && <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>📍 {p.profiles.location}</div>}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
