'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function WhatsAppLinkGenerator() {
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [productName, setProductName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)

  function generateLink() {
    if (!phone.trim()) return
    let cleanPhone = phone.replace(/[^0-9]/g, '')
    if (cleanPhone.startsWith('0')) cleanPhone = '234' + cleanPhone.slice(1)

    const finalMessage = productName && businessName
      ? `Hello, I saw your listing for ${productName} on Cloutinet and I want to buy it. Is it still available?`
      : message || `Hello, I found your business on Cloutinet (cloutinet.online) and would like to know more.`

    const link = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(finalMessage)}`
    setGeneratedLink(link)
  }

  function copyLink() {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', background: '#fff', color: '#1a1a2e', minHeight: '100vh' }}>

      <nav style={{ padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', background: '#6B21A8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '14px' }}>C</div>
          <span style={{ fontSize: '16px', fontWeight: 900, color: '#6B21A8' }}>Cloutinet</span>
        </Link>
        <Link href="/auth" style={{ background: '#6B21A8', color: '#fff', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>Get Started Free</Link>
      </nav>

      <section style={{ background: 'linear-gradient(135deg, #6B21A8, #9333EA)', padding: '40px 20px', textAlign: 'center', color: '#fff' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>💬 WhatsApp Link Generator</h1>
        <p style={{ fontSize: '14px', opacity: 0.85, maxWidth: '380px', margin: '0 auto' }}>Generate a free WhatsApp link for your business. Customers tap it and go straight to your WhatsApp chat.</p>
      </section>

      <section style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>

        <div style={{ background: '#f9f5ff', border: '1px solid #e5d5ff', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <label style={labelStyle}>Your Phone / WhatsApp Number *</label>
          <input placeholder="e.g. 08012345678" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>Product Name (optional)</label>
          <input placeholder="e.g. Rice 50kg Bag" value={productName} onChange={e => setProductName(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>Business Name (optional)</label>
          <input placeholder="e.g. Mary's Foodstuff Store" value={businessName} onChange={e => setBusinessName(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>Custom Message (optional)</label>
          <textarea placeholder="Leave blank for default message" value={message} onChange={e => setMessage(e.target.value)} style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} />

          <button onClick={generateLink} disabled={!phone.trim()} style={{
            width: '100%', background: '#6B21A8', color: '#fff',
            border: 'none', borderRadius: '10px', padding: '12px',
            cursor: 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: 'inherit'
          }}>Generate WhatsApp Link →</button>
        </div>

        {generatedLink && (
          <div style={{ background: '#f0fff4', border: '1px solid #00e676', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#00aa55', marginBottom: '10px' }}>✅ Your WhatsApp Link is Ready!</div>
            <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#444', wordBreak: 'break-all', marginBottom: '10px', fontFamily: 'monospace' }}>{generatedLink}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={copyLink} style={{
                flex: 1, background: copied ? '#00aa55' : '#6B21A8', color: '#fff',
                border: 'none', borderRadius: '8px', padding: '10px',
                cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'inherit'
              }}>{copied ? '✅ Copied!' : '📋 Copy Link'}</button>
              <a href={generatedLink} target="_blank" rel="noopener noreferrer" style={{
                flex: 1, background: '#25D366', color: '#fff',
                border: 'none', borderRadius: '8px', padding: '10px',
                cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>💬 Test Link</a>
            </div>
          </div>
        )}

        <div style={{ background: '#fafafa', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>💡 How to use your WhatsApp link</h2>
          {[
            'Copy the link and add it to your Instagram bio',
            'Share it on your WhatsApp Status',
            'Add it to your Facebook page',
            'Put it on your business flyers and cards',
            'Share in WhatsApp groups',
          ].map(tip => (
            <div key={tip} style={{ fontSize: '13px', color: '#666', padding: '4px 0' }}>• {tip}</div>
          ))}
        </div>

        <div style={{ background: '#f9f5ff', border: '1px solid #e5d5ff', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>Want more than just a link?</div>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>Create a free Google-searchable business page with Cloutinet. Customers find you on Google and contact you on WhatsApp.</p>
          <Link href="/auth" style={{ background: '#6B21A8', color: '#fff', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>Create Your Free Business Page →</Link>
        </div>
      </section>

      <footer style={{ background: '#f9f5ff', padding: '24px', textAlign: 'center', borderTop: '1px solid #e5d5ff' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#6B21A8' }}>⚡ Cloutinet — Nigeria's Free Business Visibility Platform</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
          <Link href="/checker" style={{ color: '#6B21A8', fontSize: '12px', textDecoration: 'none' }}>Visibility Checker</Link>
          <Link href="/businesses" style={{ color: '#6B21A8', fontSize: '12px', textDecoration: 'none' }}>Business Directory</Link>
          <Link href="/auth" style={{ color: '#6B21A8', fontSize: '12px', textDecoration: 'none' }}>Get Started Free</Link>
        </div>
      </footer>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#555', fontSize: '11px',
  fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase'
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#fff', border: '1px solid #e5d5ff',
  borderRadius: '8px', padding: '10px 12px', color: '#1a1a2e',
  fontSize: '14px', marginBottom: '12px', outline: 'none', fontFamily: 'inherit'
}
