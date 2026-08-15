'use client'

export default function WhatsAppButton({
  href,
  businessSlug,
  label,
}: {
  href: string
  businessSlug: string
  label: string
}) {
  function handleClick() {
    fetch('/api/track-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_slug: businessSlug,
        source: 'store_page',
      }),
    }).catch(() => {})
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: '#16A34A', color: '#fff', padding: '13px 28px',
        borderRadius: '8px', textDecoration: 'none', fontSize: '15px', fontWeight: 700
      }}
    >
      {label}
    </a>
  )
}
