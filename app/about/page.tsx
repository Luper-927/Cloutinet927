import Link from 'next/link'

export default function AboutPage() {
  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', background: '#fff', color: '#1a1a2e' }}>

      <nav style={{ padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', background: '#6B21A8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '14px' }}>C</div>
          <span style={{ fontSize: '16px', fontWeight: 900, color: '#6B21A8' }}>Cloutinet</span>
        </Link>
        <Link href="/auth" style={{ background: '#6B21A8', color: '#fff', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>Get Started Free</Link>
      </nav>

      <section style={{ maxWidth: '580px', margin: '0 auto', padding: '40px 20px' }}>

        <div style={{ color: '#6B21A8', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', marginBottom: '10px' }}>OUR STORY</div>
        <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '16px', lineHeight: 1.2 }}>Built for the Business Owner on the Street Corner</h1>
        <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
          My name is Luper. I grew up watching hardworking people — farmers, traders, artisans — build real businesses with their hands, their skill, and their sweat. People like my family in Benue State who grow food that feeds thousands, but struggle to reach customers beyond their immediate community.
        </p>
        <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
          I built Cloutinet because I believe every small business owner deserves the same visibility that big companies pay millions to achieve. A woman selling rice in Port Harcourt should be able to type her business name into Google and see her own page — with her products, her prices, and a direct WhatsApp link for customers to reach her.
        </p>
        <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>
          No agency. No web developer. No monthly subscription to get started. Just a free tool that works — built entirely on an Android phone, by someone who understands what it means to build from nothing.
        </p>

        <div style={{ background: '#f9f5ff', border: '1px solid #e5d5ff', borderRadius: '14px', padding: '24px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#6B21A8', marginBottom: '16px' }}>What Cloutinet Does</h2>
          {[
            { icon: '🌐', text: 'Creates a free Google-searchable page for your business' },
            { icon: '📦', text: 'Lists your products and services with photos and prices' },
            { icon: '💬', text: 'Connects customers directly to you via WhatsApp' },
            { icon: '📊', text: 'Tracks how many people view your page and contact you' },
            { icon: '🇳🇬', text: 'Built specifically for African small businesses, with global reach' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ color: '#444', fontSize: '14px', lineHeight: 1.5 }}>{item.text}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#07070f', borderRadius: '14px', padding: '24px', marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#8888aa', marginBottom: '6px' }}>BUILT BY</div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#f0f0ff', marginBottom: '4px' }}>Luper David</div>
          <div style={{ fontSize: '13px', color: '#8888aa', marginBottom: '4px' }}>Port Harcourt, Nigeria 🇳🇬</div>
          <div style={{ fontSize: '12px', color: '#6B21A8', marginTop: '8px' }}>Tiv • Entrepreneur • Builder</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Ready to grow your business?</h3>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>Join business owners already getting found on Google with Cloutinet.</p>
          <Link href="/auth" style={{
            display: 'inline-block', background: '#6B21A8', color: '#fff',
            padding: '12px 28px', borderRadius: '10px',
            textDecoration: 'none', fontSize: '14px', fontWeight: 700
          }}>Create Your Free Page →</Link>
        </div>

      </section>

      <footer style={{ padding: '24px 20px', textAlign: 'center', borderTop: '1px solid #f0f0f0', marginTop: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: 900, color: '#6B21A8' }}>⚡ Cloutinet</div>
        <p style={{ color: '#888', fontSize: '11px', marginTop: '6px' }}>© 2026 Cloutinet. Create. Share. Grow.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
          <Link href="/feedback" style={{ color: '#6B21A8', fontSize: '12px', textDecoration: 'none' }}>Feedback</Link>
          <Link href="/privacy" style={{ color: '#6B21A8', fontSize: '12px', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: '#6B21A8', fontSize: '12px', textDecoration: 'none' }}>Terms</Link>
        </div>
      </footer>

    </div>
  )
}
