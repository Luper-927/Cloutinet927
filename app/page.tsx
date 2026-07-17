import Link from 'next/link'
import { supabase } from '../lib/supabase'

async function getFeaturedBusinesses() {
  const { data } = await supabase
    .from('profiles')
    .select('business_name, business_slug, business_category, location, tagline')
    .not('business_name', 'is', null)
    .not('business_slug', 'is', null)
    .limit(6)
    .order('created_at', { ascending: false })
  return data || []
}

export default async function HomePage() {
  const featuredBusinesses = await getFeaturedBusinesses()

  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', background: '#fff', color: '#0F172A' }}>

      <nav style={{
        padding: '0 20px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, background: '#fff', zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', background: '#0F172A', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '16px' }}>C</div>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>Cloutinet</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/checker" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>Check Score</Link>
          <Link href="/auth" style={{ background: '#0F172A', color: '#fff', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: '#0F172A', padding: '60px 20px', textAlign: 'center', color: '#fff' }}>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', color: '#fff', fontWeight: 600, marginBottom: '20px' }}>
          Built for Nigerian Businesses
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px', color: '#fff' }}>
          Get Found on Google.<br />Get More Customers.
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', marginBottom: '28px', maxWidth: '440px', margin: '0 auto 28px', lineHeight: 1.6 }}>
          List your products and services for free. Cloutinet creates a Google-searchable page for your business so customers can find and contact you on WhatsApp.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
          <Link href="/auth" style={{ display: 'inline-block', background: '#fff', color: '#0F172A', padding: '14px 28px', borderRadius: '6px', textDecoration: 'none', fontSize: '15px', fontWeight: 700 }}>Create Your Free Page</Link>
          <Link href="/checker" style={{ display: 'inline-block', background: 'transparent', color: '#fff', padding: '14px 28px', borderRadius: '6px', textDecoration: 'none', fontSize: '15px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.4)' }}>Check Your Score</Link>
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Free forever — No credit card required — Setup in 5 minutes</p>
      </section>

      {/* VISIBILITY CHECKER BANNER */}
      <section style={{ background: '#1E293B', padding: '32px 20px', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Is Your Business Visible on Google?</h2>
        <p style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '16px' }}>Check your free visibility score in seconds — no signup needed</p>
        <Link href="/checker" style={{ display: 'inline-block', background: '#fff', color: '#0F172A', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>Check My Business Score</Link>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: '#F8FAFC', padding: '50px 20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '32px', textAlign: 'center', color: '#0F172A' }}>How Cloutinet Works</h2>
        <div style={{ maxWidth: '340px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {[
            { num: '01', title: 'Add Your Business', desc: 'Name, location, phone number — takes 2 minutes' },
            { num: '02', title: 'List Your Products', desc: 'Add photos, prices and descriptions for each product' },
            { num: '03', title: 'Get Found on Google', desc: 'Your page becomes searchable and customers contact you on WhatsApp' },
          ].map(s => (
            <div key={s.num} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#94A3B8', flexShrink: 0, paddingTop: '2px' }}>{s.num}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px', color: '#0F172A' }}>{s.title}</div>
                <div style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '50px 20px' }}>
        <div style={{ color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', marginBottom: '10px', textAlign: 'center', textTransform: 'uppercase' as const }}>Create. Share. Grow.</div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '28px', textAlign: 'center', color: '#0F172A' }}>Everything You Need to Promote Your Business</h2>
        <div style={{ maxWidth: '420px', margin: '0 auto' }}>
          {[
            { title: 'Get Found on Google', desc: 'Every product you add becomes a searchable page on Google — automatically.' },
            { title: 'WhatsApp Leads', desc: 'Customers contact you directly via WhatsApp from your page.' },
            { title: 'Free Business Page', desc: 'Get your own page at cloutinet.online/store/yourbusiness.' },
            { title: 'Track Your Growth', desc: 'See how many people view your products and contact you.' },
            { title: 'Visibility Score', desc: 'Check how visible your business is on Google and improve it.' },
            { title: 'WhatsApp Status Ready', desc: 'Share your store link on WhatsApp Status — shows a rich preview card.' },
          ].map(f => (
            <div key={f.title} style={{ display: 'flex', gap: '14px', marginBottom: '20px', alignItems: 'flex-start' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#0F172A', marginTop: '9px', flexShrink: 0 }}></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px', color: '#0F172A' }}>{f.title}</div>
                <div style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED BUSINESSES */}
      {featuredBusinesses.length > 0 && (
        <section style={{ background: '#F8FAFC', padding: '50px 20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', textAlign: 'center', color: '#0F172A' }}>Businesses Already Growing With Cloutinet</h2>
          <p style={{ color: '#64748B', fontSize: '13px', textAlign: 'center', marginBottom: '28px' }}>Real Nigerian businesses getting found on Google every day</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '500px', margin: '0 auto' }}>
            {featuredBusinesses.map((b: any) => (
              <Link key={b.business_slug} href={'/store/' + b.business_slug} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px',
                padding: '14px 16px', textDecoration: 'none', color: '#0F172A'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{b.business_name}</div>
                  {b.business_category && <div style={{ fontSize: '11px', color: '#475569', marginBottom: '2px' }}>{b.business_category}</div>}
                  {b.location && <div style={{ fontSize: '11px', color: '#94A3B8' }}>{b.location}</div>}
                </div>
                <div style={{ color: '#0F172A', fontSize: '16px', fontWeight: 700 }}>→</div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link href="/businesses" style={{ color: '#0F172A', fontSize: '13px', textDecoration: 'none', fontWeight: 700 }}>Browse All Businesses →</Link>
          </div>
        </section>
      )}

      {/* CATEGORIES */}
      <section style={{ padding: '50px 20px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: '#0F172A' }}>Perfect for Every Type of Business</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', maxWidth: '480px', margin: '0 auto' }}>
          {['Shops', 'Restaurants', 'Salons', 'Churches', 'Real Estate', 'Fashion', 'Pharmacy', 'Automotive'].map(cat => (
            <div key={cat} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>{cat}</div>
          ))}
        </div>
        <Link href="/businesses" style={{ display: 'inline-block', marginTop: '20px', color: '#0F172A', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>Browse All Businesses →</Link>
      </section>

      {/* PRICING */}
      <section style={{ background: '#F8FAFC', padding: '50px 20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', textAlign: 'center', color: '#0F172A' }}>Simple Pricing</h2>
        <p style={{ color: '#64748B', marginBottom: '28px', textAlign: 'center', fontSize: '13px' }}>Start free. Upgrade for more visibility.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '340px', margin: '0 auto' }}>
          {[
            { name: 'Free', price: '₦0', period: 'forever', featured: false, features: ['Business profile page', 'Add unlimited products', 'WhatsApp contact button', 'Google visibility score'] },
            { name: 'Growth', price: '₦4,999', period: '/month', featured: true, features: ['Everything in Free', 'Google indexed pages', 'Lead tracking & analytics', 'Priority support'] },
          ].map(plan => (
            <div key={plan.name} style={{
              background: '#fff', border: `1px solid ${plan.featured ? '#0F172A' : '#E2E8F0'}`,
              borderRadius: '10px', padding: '24px', position: 'relative'
            }}>
              {plan.featured && (
                <div style={{
                  position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                  background: '#0F172A', color: '#fff', fontSize: '10px', fontWeight: 700,
                  padding: '3px 12px', borderRadius: '4px'
                }}>MOST POPULAR</div>
              )}
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: '#0F172A' }}>{plan.name}</h3>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>{plan.price}</span>
                <span style={{ color: '#94A3B8', fontSize: '12px' }}>{plan.period}</span>
              </div>
              {plan.features.map(f => (
                <div key={f} style={{ display: 'flex', gap: '8px', padding: '5px 0', fontSize: '12px', color: '#475569' }}>
                  <span style={{ color: '#0F172A', fontWeight: 700 }}>✓</span> {f}
                </div>
              ))}
              <Link href="/auth" style={{
                display: 'block', textAlign: 'center', marginTop: '16px',
                background: plan.featured ? '#0F172A' : '#fff',
                color: plan.featured ? '#fff' : '#0F172A',
                border: '1px solid #0F172A', padding: '10px', borderRadius: '6px',
                textDecoration: 'none', fontSize: '13px', fontWeight: 600
              }}>{plan.name === 'Free' ? 'Get Started Free' : 'Start Growth'}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#0F172A', padding: '50px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Start Growing Your Business Today</h2>
        <p style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '20px' }}>Join business owners already getting found on Google with Cloutinet.</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth" style={{ display: 'inline-block', background: '#fff', color: '#0F172A', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>Get Started Free</Link>
          <Link href="/checker" style={{ display: 'inline-block', background: 'transparent', color: '#fff', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 600, border: '1px solid #475569' }}>Check My Score</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '28px 20px', textAlign: 'center', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Cloutinet</div>
        <p style={{ color: '#94A3B8', fontSize: '11px', marginTop: '6px' }}>© 2026 Cloutinet. Create. Share. Grow.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
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
