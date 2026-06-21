import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', background: '#fff', color: '#1a1a2e' }}>

      <nav style={{
        padding: '0 20px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', background: '#fff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A', fontWeight: 700, fontSize: '16px' }}>C</div>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>Cloutinet</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/checker" style={{ color: '#fff', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>Check Score</Link>
          <Link href="/auth" style={{ background: '#fff', color: '#0F172A', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>Get Started</Link>
        </div>
      </nav>

      {/* DRAMATIC HERO */}
      <section style={{
        position: 'relative', minHeight: '600px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', overflow: 'hidden'
      }}>
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80"
          alt="Business technology"
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover', zIndex: 0
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(15,23,42,0.7), rgba(15,23,42,0.92))',
          zIndex: 1
        }}></div>

        <div style={{ position: 'relative', zIndex: 2, padding: '100px 20px 60px', maxWidth: '600px' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', color: '#fff', fontWeight: 600, marginBottom: '24px', backdropFilter: 'blur(4px)' }}>
            Built for Nigerian Businesses
          </div>
          <h1 style={{ fontSize: '40px', fontWeight: 800, lineHeight: 1.15, marginBottom: '20px', color: '#fff', letterSpacing: '-0.5px' }}>
            Get Found on Google.<br />Get More Customers.
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.75)', marginBottom: '32px', lineHeight: 1.6 }}>
            List your products and services for free. Cloutinet creates a Google-searchable page for your business so customers can find and contact you on WhatsApp.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
            <Link href="/auth" style={{
              display: 'inline-block', background: '#fff', color: '#0F172A',
              padding: '15px 32px', borderRadius: '6px',
              textDecoration: 'none', fontSize: '15px', fontWeight: 700
            }}>Create Your Free Page</Link>
            <Link href="/checker" style={{
              display: 'inline-block', background: 'transparent', color: '#fff',
              padding: '15px 32px', borderRadius: '6px',
              textDecoration: 'none', fontSize: '15px', fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.4)'
            }}>Check Your Score</Link>
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Free forever — No credit card required — Setup in 5 minutes</p>
        </div>
      </section>

      {/* VISIBILITY CHECKER BANNER */}
      <section style={{ background: '#0F172A', padding: '40px 20px', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Is Your Business Visible on Google?</h2>
        <p style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '20px' }}>Check your free visibility score in seconds — no signup needed</p>
        <Link href="/checker" style={{
          display: 'inline-block', background: '#fff',
          color: '#0F172A', padding: '13px 30px', borderRadius: '6px',
          textDecoration: 'none', fontSize: '14px', fontWeight: 700
        }}>Check My Business Score</Link>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: '#F8FAFC', padding: '60px 20px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '36px', textAlign: 'center', color: '#0F172A' }}>How Cloutinet Works</h2>
        <div style={{ maxWidth: '340px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {[
            { num: '01', title: 'Add Your Business', desc: 'Name, location, phone number — takes 2 minutes' },
            { num: '02', title: 'List Your Products', desc: 'Add photos, prices and descriptions for each product' },
            { num: '03', title: 'Get Found on Google', desc: 'Your page becomes searchable and customers contact you on WhatsApp' },
          ].map(s => (
            <div key={s.num} style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#94A3B8', flexShrink: 0, paddingTop: '2px' }}>{s.num}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px', color: '#0F172A' }}>{s.title}</div>
                <div style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', marginBottom: '10px', textAlign: 'center', textTransform: 'uppercase' }}>Create. Share. Grow.</div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '32px', textAlign: 'center', color: '#0F172A' }}>Everything You Need to Promote Your Business</h2>
        <div style={{ maxWidth: '420px', margin: '0 auto' }}>
          {[
            { title: 'Get Found on Google', desc: 'Every product you add becomes a searchable page on Google — automatically.' },
            { title: 'WhatsApp Leads', desc: 'Customers contact you directly via WhatsApp from your page.' },
            { title: 'Free Business Page', desc: 'Get your own page at cloutinet.online/store/yourbusiness.' },
            { title: 'Track Your Growth', desc: 'See how many people view your products and contact you.' },
            { title: 'Visibility Score', desc: 'Check how visible your business is on Google and improve it.' },
            { title: 'WhatsApp Status Ready', desc: 'Share your store link on WhatsApp Status — shows a rich preview card.' },
          ].map(f => (
            <div key={f.title} style={{ display: 'flex', gap: '14px', marginBottom: '24px', alignItems: 'flex-start' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#0F172A', marginTop: '9px', flexShrink: 0 }}></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px', color: '#0F172A' }}>{f.title}</div>
                <div style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ background: '#F8FAFC', padding: '60px 20px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: '#0F172A' }}>Perfect for Every Type of Business</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', maxWidth: '480px', margin: '0 auto' }}>
          {['Shops', 'Restaurants', 'Salons', 'Churches', 'Real Estate', 'Fashion', 'Pharmacy', 'Automotive'].map(cat => (
            <div key={cat} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '10px 16px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>{cat}</div>
          ))}
        </div>
        <Link href="/businesses" style={{ display: 'inline-block', marginTop: '24px', color: '#0F172A', fontSize: '13px', textDecoration: 'none', fontWeight: 700 }}>Browse All Businesses →</Link>
      </section>

      {/* PRICING */}
      <section style={{ padding: '60px 20px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px', textAlign: 'center', color: '#0F172A' }}>Simple Pricing</h2>
        <p style={{ color: '#64748B', marginBottom: '32px', textAlign: 'center', fontSize: '13px' }}>Start free. Upgrade for more visibility.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '340px', margin: '0 auto' }}>
          {[
            { name: 'Free', price: '₦0', period: 'forever', featured: false, features: ['Business profile page', 'Add unlimited products', 'WhatsApp contact button', 'Google visibility score'] },
            { name: 'Growth', price: '₦4,999', period: '/month', featured: true, features: ['Everything in Free', 'Google indexed pages', 'Lead tracking & analytics', 'Priority support'] },
          ].map(plan => (
            <div key={plan.name} style={{
              background: '#fff', border: `1px solid ${plan.featured ? '#0F172A' : '#E2E8F0'}`,
              borderRadius: '10px', padding: '28px', position: 'relative'
            }}>
              {plan.featured && (
                <div style={{
                  position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                  background: '#0F172A', color: '#fff', fontSize: '10px', fontWeight: 700,
                  padding: '3px 12px', borderRadius: '4px'
                }}>MOST POPULAR</div>
              )}
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px', color: '#0F172A' }}>{plan.name}</h3>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A' }}>{plan.price}</span>
                <span style={{ color: '#94A3B8', fontSize: '12px' }}>{plan.period}</span>
              </div>
              {plan.features.map(f => (
                <div key={f} style={{ display: 'flex', gap: '8px', padding: '5px 0', fontSize: '12px', color: '#475569' }}>
                  <span style={{ color: '#0F172A', fontWeight: 700 }}>✓</span> {f}
                </div>
              ))}
              <Link href="/auth" style={{
                display: 'block', textAlign: 'center', marginTop: '18px',
                background: plan.featured ? '#0F172A' : '#fff',
                color: plan.featured ? '#fff' : '#0F172A',
                border: '1px solid #0F172A', padding: '11px', borderRadius: '6px',
                textDecoration: 'none', fontSize: '13px', fontWeight: 700
              }}>{plan.name === 'Free' ? 'Get Started Free' : 'Start Growth'}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#0F172A', padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>Start Growing Your Business Today</h2>
        <p style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '24px' }}>Join business owners already getting found on Google with Cloutinet.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth" style={{
            display: 'inline-block', background: '#fff', color: '#0F172A',
            padding: '13px 30px', borderRadius: '6px',
            textDecoration: 'none', fontSize: '14px', fontWeight: 700
          }}>Get Started Free</Link>
          <Link href="/checker" style={{
            display: 'inline-block', background: 'transparent', color: '#fff',
            padding: '13px 30px', borderRadius: '6px',
            textDecoration: 'none', fontSize: '14px', fontWeight: 600,
            border: '1px solid #475569'
          }}>Check My Score</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 20px', textAlign: 'center', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Cloutinet</div>
        <p style={{ color: '#94A3B8', fontSize: '11px', marginTop: '6px' }}>© 2026 Cloutinet. Create. Share. Grow.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
          <Link href="/about" style={{ color: '#475569', fontSize: '12px', textDecoration: 'none' }}>About</Link>
          <Link href="/businesses" style={{ color: '#475569', fontSize: '12px', textDecoration: 'none' }}>Businesses</Link>
          <Link href="/checker" style={{ color: '#475569', fontSize: '12px', textDecoration: 'none' }}>Visibility Checker</Link>
          <Link href="/data" style={{ color: '#475569', fontSize: '12px', textDecoration: 'none' }}>Research</Link>
          <Link href="/feedback" style={{ color: '#475569', fontSize: '12px', textDecoration: 'none' }}>Feedback</Link>
          <Link href="/privacy" style={{ color: '#475569', fontSize: '12px', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/terms" style={{ color: '#475569', fontSize: '12px', textDecoration: 'none' }}>Terms</Link>
        </div>
      </footer>

    </div>
  )
}
