import Link from 'next/link'

export default function AboutPage() {
  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', background: '#fff', color: '#0F172A' }}>

      <nav style={{ padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', background: '#0F172A', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>C</div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Cloutinet</span>
        </Link>
        <Link href="/auth" style={{ background: '#0F172A', color: '#fff', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>Get Started Free</Link>
      </nav>

      <section style={{ maxWidth: '580px', margin: '0 auto', padding: '40px 20px' }}>

        <div style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', marginBottom: '10px', textTransform: 'uppercase' }}>Our Story</div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2, color: '#0F172A' }}>Built for the Business Owner on the Street Corner</h1>
        <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
          My name is Luper. I grew up watching hardworking people — farmers, traders, artisans — build real businesses with their hands, their skill, and their sweat. People like my family in Benue State who grow food that feeds thousands, but struggle to reach customers beyond their immediate community.
        </p>
        <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
          I built Cloutinet because I believe every small business owner deserves the same visibility that big companies pay millions to achieve. A woman selling rice in Port Harcourt should be able to type her business name into Google and see her own page — with her products, her prices, and a direct WhatsApp link for customers to reach her.
        </p>
        <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>
          No agency. No web developer. No monthly subscription to get started. Just a free tool that works.
        </p>

        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>What Cloutinet Does</h2>
          {[
            'Creates a free Google-searchable page for your business',
            'Lists your products and services with photos and prices',
            'Connects customers directly to you via WhatsApp',
            'Tracks how many people view your page and contact you',
            'Built specifically for African small businesses, with global reach',
          ].map(item => (
            <div key={item} style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#0F172A', marginTop: '9px', flexShrink: 0 }}></div>
              <span style={{ color: '#475569', fontSize: '14px', lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#0F172A', borderRadius: '12px', padding: '24px', marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '6px' }}>BUILT BY</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>Luper David</div>
          <div style={{ fontSize: '13px', color: '#94A3B8' }}>Port Harcourt, Nigeria</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#0F172A' }}>Ready to grow your business?</h3>
          <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '16px' }}>Join business owners already getting found on Google with Cloutinet.</p>
          <Link href="/auth" style={{ display: 'inline-block', background: '#0F172A', color: '#fff', padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>Create Your Free Page →</Link>
        </div>

      </section>

      <footer style={{ padding: '24px 20px', textAlign: 'center', borderTop: '1px solid #E2E8F0', marginTop: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Cloutinet</div>
        <p style={{ color: '#94A3B8', fontSize: '11px', marginTop: '6px' }}>© 2026 Cloutinet. Create. Share. Grow.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
          <Link href="/feedback" style={{ color: '#475569', fontSize: '12px', textDecoration: 'none' }}>Feedback</Link>
          <Link href="/privacy" style={{ color: '#475569', fontSize: '12px', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: '#475569', fontSize: '12px', textDecoration: 'none' }}>Terms</Link>
        </div>
      </footer>

    </div>
  )
}
