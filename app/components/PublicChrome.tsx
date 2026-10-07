import Link from 'next/link'

export function PublicNav() {
  return (
    <header style={{ background: '#0A0E27', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.01em', color: '#fff', textDecoration: 'none' }}>
          Cloutinet
        </Link>
        <Link href="/auth" style={{ background: '#2563EB', color: '#fff', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
          Start Free
        </Link>
      </div>
    </header>
  )
}

export function PublicFooter() {
  const links: [string, string][] = [
    ['About', '/about'],
    ['Feedback', '/feedback'],
    ['Privacy Policy', '/privacy'],
    ['Terms', '/terms'],
  ]
  return (
    <footer style={{ background: '#0A0E27', padding: '32px 20px', textAlign: 'center' }}>
      <Link href="/" style={{ fontSize: '18px', fontWeight: 900, color: '#fff', textDecoration: 'none' }}>Cloutinet</Link>
      <p style={{ color: '#64748B', fontSize: '13px', margin: '8px 0 0' }}>The Business Operating System</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '16px', flexWrap: 'wrap' }}>
        {links.map(([label, href]) => (
          <Link key={href} href={href} style={{ color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>{label}</Link>
        ))}
      </div>
      <p style={{ color: '#64748B', fontSize: '12px', margin: '16px 0 0' }}>
        © {new Date().getFullYear()} Cloutinet. All rights reserved.
      </p>
    </footer>
  )
}

export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string
  updated: string
  sections: { title: string; body: string }[]
}) {
  return (
    <div style={{ fontFamily: 'inherit', background: '#fff', color: '#0F172A', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNav />

      <section style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 20px', flex: 1, width: '100%', boxSizing: 'border-box' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 6px', color: '#0F172A', lineHeight: 1.15 }}>{title}</h1>
        <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 32px' }}>Last updated: {updated}</p>

        {sections.map(section => (
          <div key={section.title} style={{ marginBottom: '26px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px', color: '#0F172A' }}>{section.title}</h2>
            <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>{section.body}</p>
          </div>
        ))}

        <div style={{ marginTop: '36px', textAlign: 'center' }}>
          <Link href="/" style={{ color: '#2563EB', fontSize: '14px', textDecoration: 'none', fontWeight: 600 }}>Back to Cloutinet</Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
