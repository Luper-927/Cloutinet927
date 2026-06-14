import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', background: '#fff', color: '#1a1a2e' }}>

      <nav style={{
        padding: '0 20px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', background: '#6B21A8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '16px' }}>C</div>
          <span style={{ fontSize: '18px', fontWeight: 900, color: '#6B21A8' }}>Cloutinet</span>
        </div>
        <Link href="/auth" style={{
          background: '#6B21A8', color: '#fff',
          padding: '10px 18px', borderRadius: '8px',
          textDecoration: 'none', fontSize: '13px', fontWeight: 700
        }}>Get Started</Link>
      </nav>

      <section style={{ padding: '50px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 900, lineHeight: 1.25, marginBottom: '16px' }}>
          Get Found on Google.<br />
          <span style={{ color: '#6B21A8' }}>Get More Customers.</span>
        </h1>
        <p style={{ fontSize: '15px', color: '#666', marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px', lineHeight: 1.6 }}>
          List your products and services for free. Cloutinet creates a Google-searchable page for your business so customers can find and contact you.
        </p>
        <Link href="/auth" style={{
          display: 'inline-block', background: '#6B21A8', color: '#fff',
          padding: '14px 28px', borderRadius: '10px',
          textDecoration: 'none', fontSize: '15px', fontWeight: 700
        }}>Create Your Free Page →</Link>
      </section>

      <section style={{ background: '#fafafa', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '320px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { num: '1', title: 'Add Your Business', desc: 'Name, location, phone number — takes 2 minutes' },
            { num: '2', title: 'List Your Products', desc: 'Add photos, prices and descriptions' },
            { num: '3', title: 'Get Found on Google', desc: 'Your page becomes searchable instantly' },
          ].map(s => (
            <div key={s.num} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', textAlign: 'left' }}>
              <div style={{ width: '32px', height: '32px', background: '#6B21A8', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>{s.num}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{s.title}</div>
                <div style={{ color: '#888', fontSize: '12px' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: 'linear-gradient(135deg, #6B21A8, #9333EA)', padding: '50px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>Start growing your business today</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginBottom: '20px' }}>100% free to get started. No credit card required.</p>
        <Link href="/auth" style={{
          display: 'inline-block', background: '#fff', color: '#6B21A8',
          padding: '12px 28px', borderRadius: '10px',
          textDecoration: 'none', fontSize: '14px', fontWeight: 800
        }}>Get Started Free →</Link>
      </section>

      <footer style={{ padding: '24px 20px', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ fontSize: '14px', fontWeight: 900, color: '#6B21A8' }}>⚡ Cloutinet</div>
        <p style={{ color: '#888', fontSize: '11px', marginTop: '6px' }}>© 2026 Cloutinet. Create. Share. Grow.</p>
      </footer>

    </div>
  )
}
