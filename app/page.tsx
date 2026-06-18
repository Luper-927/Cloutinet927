import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', background: '#fff', color: '#1a1a2e' }}>

      <nav style={{
        padding: '0 20px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, background: '#fff', zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', background: '#6B21A8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '16px' }}>C</div>
          <span style={{ fontSize: '18px', fontWeight: 900, color: '#6B21A8' }}>Cloutinet</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/checker" style={{ color: '#6B21A8', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>Check Score</Link>
          <Link href="/auth" style={{ background: '#6B21A8', color: '#fff', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '50px 20px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#f9f5ff', border: '1px solid #e5d5ff', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', color: '#6B21A8', fontWeight: 700, marginBottom: '16px' }}>
          🇳🇬 Built for Nigerian Businesses
        </div>
        <h1 style={{ fontSize: '30px', fontWeight: 900, lineHeight: 1.25, marginBottom: '16px' }}>
          Get Found on Google.<br />
          <span style={{ color: '#6B21A8' }}>Get More Customers.</span>
        </h1>
        <p style={{ fontSize: '15px', color: '#666', marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px', lineHeight: 1.6 }}>
          List your products and services for free. Cloutinet creates a Google-searchable page for your business so customers can find and contact you on WhatsApp.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
          <Link href="/auth" style={{
            display: 'inline-block', background: '#6B21A8', color: '#fff',
            padding: '14px 28px', borderRadius: '10px',
            textDecoration: 'none', fontSize: '15px', fontWeight: 700
          }}>Create Your Free Page →</Link>
          <Link href="/checker" style={{
            display: 'inline-block', background: '#f9f5ff', color: '#6B21A8',
            padding: '14px 28px', borderRadius: '10px',
            textDecoration: 'none', fontSize: '15px', fontWeight: 700,
            border: '1px solid #e5d5ff'
          }}>🔍 Check Your Score</Link>
        </div>
        <p style={{ fontSize: '12px', color: '#888' }}>Free forever · No credit card · Setup in 5 minutes</p>
      </section>

      {/* VISIBILITY CHECKER BANNER */}
      <section style={{ background: 'linear-gradient(135deg, #1a1a2e, #07070f)', padding: '32px 20px', margin: '0 16px', borderRadius: '16px', textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
        <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Is Your Business Visible on Google?</h2>
        <p style={{ color: '#8888aa', fontSize: '13px', marginBottom: '16px' }}>Check your free visibility score in seconds — no signup needed</p>
        <Link href="/checker" style={{
          display: 'inline-block', background: 'linear-gradient(135deg, #FF6B35, #E91E8C)',
          color: '#fff', padding: '12px 28px', borderRadius: '10px',
          textDecoration: 'none', fontSize: '14px', fontWeight: 700
        }}>Check My Business Score Free →</Link>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: '#fafafa', padding: '40px 20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '28px', textAlign: 'center' }}>How Cloutinet Works</h2>
        <div style={{ maxWidth: '320px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { num: '1', title: 'Add Your Business', desc: 'Name, location, phone number — takes 2 minutes' },
            { num: '2', title: 'List Your Products', desc: 'Add photos, prices and descriptions for each product' },
            { num: '3', title: 'Get Found on Google', desc: 'Your page becomes searchable and customers contact you on WhatsApp' },
          ].map(s => (
            <div key={s.num} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', background: '#6B21A8', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>{s.num}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{s.title}</div>
                <div style={{ color: '#888', fontSize: '12px' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '40px 20px' }}>
        <div style={{ color: '#6B21A8', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', marginBottom: '8px', textAlign: 'center' }}>CREATE. SHARE. GROW.</div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>Everything You Need to Promote Your Business</h2>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          {[
            { icon: '🌐', title: 'Get Found on Google', desc: 'Every product you add becomes a searchable page on Google — automatically.' },
            { icon: '💬', title: 'WhatsApp Leads', desc: 'Customers contact you directly via WhatsApp from your page.' },
            { icon: '🏷️', title: 'Free Business Page', desc: 'Get your own page at cloutinet.online/store/yourbusiness.' },
            { icon: '📊', title: 'Track Your Growth', desc: 'See how many people view your products and contact you.' },
            { icon: '🔍', title: 'Visibility Score', desc: 'Check how visible your business is on Google and improve it.' },
            { icon: '📱', title: 'WhatsApp Status Ready', desc: 'Share your store link on WhatsApp Status — shows a rich preview card.' },
          ].map(f => (
            <div key={f.title} style={{ display: 'flex', gap: '14px', marginBottom: '20px', alignItems: 'flex-start' }}>
              <div style={{ width: '38px', height: '38px', flexShrink: 0, background: '#f3e8ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{f.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px' }}>{f.title}</div>
                <div style={{ color: '#888', fontSize: '13px', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ background: '#fafafa', padding: '40px 20px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Perfect for Every Type of Business</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', maxWidth: '400px', margin: '0 auto' }}>
          {[
            { icon: '🛍️', label: 'Shops' },
            { icon: '🍽️', label: 'Restaurants' },
            { icon: '✂️', label: 'Salons' },
            { icon: '⛪', label: 'Churches' },
            { icon: '🏠', label: 'Real Estate' },
            { icon: '👗', label: 'Fashion' },
            { icon: '💊', label: 'Pharmacy' },
            { icon: '🚗', label: 'Automotive' },
          ].map(cat => (
            <div key={cat.label} style={{ textAlign: 'center', minWidth: '60px' }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{cat.icon}</div>
              <div style={{ fontSize: '11px', color: '#666', fontWeight: 500 }}>{cat.label}</div>
            </div>
          ))}
        </div>
        <Link href="/businesses" style={{ display: 'inline-block', marginTop: '20px', color: '#6B21A8', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>Browse All Businesses →</Link>
      </section>

      {/* PRICING */}
      <section style={{ padding: '40px 20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', textAlign: 'center' }}>Simple Pricing</h2>
        <p style={{ color: '#888', marginBottom: '24px', textAlign: 'center', fontSize: '13px' }}>Start free. Upgrade for more visibility.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '320px', margin: '0 auto' }}>
          {[
            { name: 'Free', price: '₦0', period: 'forever', featured: false, features: ['Business profile page', 'Add unlimited products', 'WhatsApp contact button', 'Google visibility score'] },
            { name: 'Growth', price: '₦4,999', period: '/month', featured: true, features: ['Everything in Free', 'Google indexed pages', 'Lead tracking & analytics', 'Priority support'] },
          ].map(plan => (
            <div key={plan.name} style={{
              background: '#fff', border: `2px solid ${plan.featured ? '#6B21A8' : '#e5e7eb'}`,
              borderRadius: '14px', padding: '20px', position: 'relative'
            }}>
              {plan.featured && (
                <div style={{
                  position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                  background: '#6B21A8', color: '#fff', fontSize: '10px', fontWeight: 700,
                  padding: '3px 12px', borderRadius: '20px'
                }}>MOST POPULAR</div>
              )}
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>{plan.name}</h3>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '28px', fontWeight: 900, color: '#6B21A8' }}>{plan.price}</span>
                <span style={{ color: '#888', fontSize: '12px' }}>{plan.period}</span>
              </div>
              {plan.features.map(f => (
                <div key={f} style={{ display: 'flex', gap: '8px', padding: '5px 0', fontSize: '12px', color: '#444' }}>
                  <span style={{ color: '#6B21A8', fontWeight: 700 }}>✓</span> {f}
                </div>
              ))}
              <Link href="/auth" style={{
                display: 'block', textAlign: 'center', marginTop: '14px',
                background: plan.featured ? '#6B21A8' : '#fff',
                color: plan.featured ? '#fff' : '#6B21A8',
                border: '2px solid #6B21A8', padding: '10px', borderRadius: '8px',
                textDecoration: 'none', fontSize: '13px', fontWeight: 700
              }}>{plan.name === 'Free' ? 'Get Started Free' : 'Start Growth'}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #6B21A8, #9333EA)', padding: '50px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>Start Growing Your Business Today</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginBottom: '20px' }}>Join business owners already getting found on Google with Cloutinet.</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth" style={{
            display: 'inline-block', background: '#fff', color: '#6B21A8',
            padding: '12px 28px', borderRadius: '10px',
            textDecoration: 'none', fontSize: '14px', fontWeight: 800
          }}>Get Started Free →</Link>
          <Link href="/checker" style={{
            display: 'inline-block', background: 'transparent', color: '#fff',
            padding: '12px 28px', borderRadius: '10px',
            textDecoration: 'none', fontSize: '14px', fontWeight: 700,
            border: '2px solid rgba(255,255,255,0.5)'
          }}>🔍 Check My Score</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '24px 20px', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ fontSize: '14px', fontWeight: 900, color: '#6B21A8' }}>⚡ Cloutinet</div>
        <p style={{ color: '#888', fontSize: '11px', marginTop: '6px' }}>© 2026 Cloutinet. Create. Share. Grow.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
          <Link href="/about" style={{ color: '#6B21A8', fontSize: '12px', textDecoration: 'none' }}>About</Link>
          <Link href="/businesses" style={{ color: '#6B21A8', fontSize: '12px', textDecoration: 'none' }}>Businesses</Link>
          <Link href="/checker" style={{ color: '#6B21A8', fontSize: '12px', textDecoration: 'none' }}>Visibility Checker</Link>
          <Link href="/data" style={{ color: '#6B21A8', fontSize: '12px', textDecoration: 'none' }}>Research</Link>
          <Link href="/feedback" style={{ color: '#6B21A8', fontSize: '12px', textDecoration: 'none' }}>Feedback</Link>
          <Link href="/privacy" style={{ color: '#6B21A8', fontSize: '12px', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/terms" style={{ color: '#6B21A8', fontSize: '12px', textDecoration: 'none' }}>Terms</Link>
        </div>
      </footer>

    </div>
  )
}
