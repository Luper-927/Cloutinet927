import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'Plus Jakarta Sans, Segoe UI, system-ui, sans-serif', background: '#fff', color: '#1E293B' }}>

      {/* NAV */}
      <nav style={{ background: '#0A0F1E', padding: '0 5%', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Cloutinet <span style={{ width: '8px', height: '8px', background: '#00E676', borderRadius: '50%', display: 'inline-block' }}></span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/checker" style={{ padding: '9px 18px', border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Check Score</Link>
          <Link href="/auth" style={{ padding: '9px 18px', background: '#2563EB', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: '#0A0F1E', padding: '80px 5% 100px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', color: '#00E676', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, marginBottom: '24px' }}>
            <span style={{ width: '6px', height: '6px', background: '#00E676', borderRadius: '50%', display: 'inline-block' }}></span>
            Proudly built for Nigerian Businesses
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-1px', marginBottom: '20px' }}>
            Get Found on Google.<br />
            <span style={{ color: '#00E676' }}>Get More Customers.</span>
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', marginBottom: '32px', maxWidth: '480px', lineHeight: 1.7 }}>
            List your products and services for free. Cloutinet creates a Google-searchable page for your business so customers can find and contact you directly on WhatsApp.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
            <Link href="/auth" style={{ padding: '14px 28px', background: '#2563EB', color: '#fff', borderRadius: '10px', fontSize: '15px', fontWeight: 700, textDecoration: 'none' }}>Create Your Free Page →</Link>
            <Link href="/checker" style={{ padding: '14px 24px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', fontSize: '15px', fontWeight: 600, textDecoration: 'none' }}>Check Your Score</Link>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {['100% Free to Start', 'No Credit Card', 'Setup in 5 Minutes'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
                <span style={{ color: '#00E676' }}>✓</span> {t}
              </div>
            ))}
          </div>
        </div>

        {/* HERO VISUAL */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '260px', background: '#1a1a2e', borderRadius: '36px', padding: '12px', border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', position: 'relative', zIndex: 2 }}>
            <div style={{ background: '#fff', borderRadius: '26px', padding: '16px' }}>
              <div style={{ fontSize: '10px', color: '#5F6368', background: '#F1F3F4', borderRadius: '20px', padding: '6px 12px', marginBottom: '12px' }}>cakes in Port Harcourt 🔍</div>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px', marginBottom: '8px' }}>
                <div style={{ fontSize: '9px', color: '#34A853', marginBottom: '2px' }}>cloutinet.online/store/sweet-cravings</div>
                <div style={{ fontSize: '11px', color: '#1A0DAB', fontWeight: 600, marginBottom: '3px' }}>Sweet Cravings Cakes — Port Harcourt</div>
                <div style={{ fontSize: '9px', color: '#4D5156', lineHeight: 1.4, marginBottom: '4px' }}>Custom cakes for all occasions. Order on WhatsApp. Fast delivery in PH.</div>
                <div style={{ fontSize: '9px', color: '#F5A623', marginBottom: '6px' }}>★★★★★ 4.9 (128 reviews)</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['📍 Directions', '📞 Call', '💬 WhatsApp'].map(b => (
                    <span key={b} style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '8px', fontWeight: 600, border: '1px solid #E2E8F0', background: b.includes('WhatsApp') ? '#25D366' : '#fff', color: b.includes('WhatsApp') ? '#fff' : '#1A73E8' }}>{b}</span>
                  ))}
                </div>
              </div>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px', opacity: 0.5 }}>
                <div style={{ fontSize: '9px', color: '#34A853' }}>cloutinet.online/store/ph-cakes</div>
                <div style={{ fontSize: '11px', color: '#1A0DAB', fontWeight: 600 }}>PH Cakes & Pastries</div>
              </div>
            </div>
          </div>

          {/* SCORE CARD */}
          <div style={{ position: 'absolute', top: '20px', right: '-20px', background: '#fff', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', zIndex: 3, minWidth: '150px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Visibility Score</div>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'conic-gradient(#00E676 85%, #E2E8F0 0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
              <div style={{ width: '48px', height: '48px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', lineHeight: 1 }}>85</div>
                <div style={{ fontSize: '8px', color: '#64748B' }}>/ 100</div>
              </div>
            </div>
            <div style={{ fontSize: '10px', color: '#00E676', fontWeight: 700 }}>● Excellent</div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '80px 5%', background: '#fff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.5px', lineHeight: 1.2 }}>Everything You Need to Get Discovered & Grow</h2>
          <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.7 }}>Cloutinet gives Nigerian businesses a complete digital presence — from Google visibility to WhatsApp leads — all in one free platform built for how you actually do business.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[
            { icon: '🔍', bg: '#F0FDF4', title: 'Google-Searchable Page', desc: 'Your business gets a professionally designed page indexed by Google. When customers search, they find you.' },
            { icon: '💬', bg: '#F0FDF4', title: 'WhatsApp Integration', desc: 'Every page includes a direct WhatsApp button. Customers tap once and land in your chat with a pre-filled message.' },
            { icon: '📦', bg: '#F5F3FF', title: 'Products & Services', desc: 'List unlimited products with photos, prices, and AI-generated SEO descriptions that help you rank higher.' },
            { icon: '⭐', bg: '#FFFBEB', title: 'Customer Reviews', desc: 'Build trust with genuine customer reviews displayed on your page, making new customers confident to reach out.' },
            { icon: '📊', bg: '#FFF1F2', title: 'Visibility Score', desc: 'Know exactly how visible your business is with a 0-100 score and personalized tips to improve your ranking.' },
            { icon: '📈', bg: '#EFF6FF', title: 'Analytics Dashboard', desc: 'Track page views, WhatsApp clicks, and weekly performance reports sent directly to your email every Monday.' },
          ].map(f => (
            <div key={f.title} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '28px 24px', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '80px 5%', background: '#F8FAFC' }}>
        <div style={{ background: '#0A0F1E', borderRadius: '24px', padding: '64px 5%' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'inline-block', background: 'rgba(0,230,118,0.15)', color: '#00E676', padding: '6px 16px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px' }}>TRUSTED BY 2,000+ BUSINESSES</div>
            <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', marginBottom: '8px', letterSpacing: '-0.5px' }}>Loved by Nigerian Businesses</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <span style={{ color: '#FBBF24', fontSize: '18px' }}>★★★★★</span>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>4.9/5 from 500+ reviews</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
            {[
              { review: 'Since joining Cloutinet, customers now find my fashion store on Google without me spending a kobo on ads. I got 3 orders last week from people I had never met before.', name: 'Amaka Okafor', role: 'Fashion Designer, Lagos', initial: 'A', color: 'linear-gradient(135deg, #6366F1, #8B5CF6)' },
              { review: 'Setting up took me only 4 minutes. My phone accessories shop now appears when people search in Abuja. The visibility score showed me exactly what to fix. Highly recommended.', name: 'Kabiru Musa', role: 'Phone Accessories, Abuja', initial: 'K', color: 'linear-gradient(135deg, #F59E0B, #EF4444)' },
              { review: 'The weekly reports keep me motivated. I can see my page views growing every week. My cake business now gets enquiries from customers who found me on Google.', name: 'Chioma Eze', role: 'Cakes & Pastries, Port Harcourt', initial: 'C', color: 'linear-gradient(135deg, #10B981, #059669)' },
            ].map(t => (
              <div key={t.name} style={{ background: '#fff', borderRadius: '16px', padding: '24px' }}>
                <div style={{ fontSize: '32px', color: '#2563EB', lineHeight: 1, marginBottom: '12px', fontFamily: 'Georgia, serif' }}>"</div>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.7, marginBottom: '20px' }}>{t.review}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{t.initial}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>{t.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '8px', borderRadius: '4px', background: '#00E676' }}></div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }}></div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }}></div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '80px 5%', background: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>EASY 3-STEP PROCESS</div>
        <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#1E293B', marginBottom: '48px', letterSpacing: '-0.5px' }}>Get Started in 3 Simple Steps</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { num: '1', icon: '📋', title: 'Create Your Page', desc: 'Sign up free and fill in your business details — name, location, WhatsApp number, and category. Takes under 5 minutes with no technical skills needed.' },
            { num: '2', icon: '🌐', title: 'Get Discovered', desc: 'Add your products and services with photos and prices. Cloutinet automatically creates Google-indexed pages for each one so customers can find you in search.' },
            { num: '3', icon: '🚀', title: 'Get More Customers', desc: 'When customers find your page, they tap your WhatsApp button and land directly in your chat. No middleman. No commission. Just direct leads to your phone.' },
          ].map(s => (
            <div key={s.num} style={{ padding: '32px 24px' }}>
              <div style={{ width: '48px', height: '48px', background: '#0A0F1E', color: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, margin: '0 auto 20px' }}>{s.num}</div>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{s.icon}</div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1E293B', marginBottom: '10px' }}>{s.title}</h3>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 5%', background: '#F8FAFC' }}>
        <div style={{ background: '#0A0F1E', borderRadius: '24px', padding: '64px 5%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '40px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: '12px', lineHeight: 1.2 }}>Ready to Get More Customers?</h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', marginBottom: '28px', lineHeight: 1.7 }}>Join thousands of Nigerian businesses already getting found on Google and receiving WhatsApp leads through Cloutinet — completely free.</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <Link href="/auth" style={{ padding: '14px 28px', background: '#2563EB', color: '#fff', borderRadius: '10px', fontSize: '15px', fontWeight: 700, textDecoration: 'none' }}>Create Your Free Page →</Link>
              <Link href="/checker" style={{ padding: '14px 24px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', fontSize: '15px', fontWeight: 600, textDecoration: 'none' }}>Check Your Score Free</Link>
            </div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {['No Credit Card', 'Free Forever', 'Setup in 5 Minutes'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                  <span style={{ color: '#00E676' }}>✓</span> {t}
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <div style={{ background: '#fff', borderRadius: '20px', padding: '24px 28px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', minWidth: '200px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '12px' }}>Your Visibility Score</div>
              <div style={{ fontSize: '48px', fontWeight: 800, color: '#00E676', lineHeight: 1, marginBottom: '4px' }}>85%</div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>Excellent — Keep growing!</div>
              <div style={{ background: '#E2E8F0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: '#00E676', height: '100%', width: '85%', borderRadius: '4px' }}></div>
              </div>
            </div>
            <div style={{ position: 'absolute', top: '-20px', right: '-10px', background: '#25D366', color: '#fff', borderRadius: '12px', padding: '10px 14px', fontSize: '11px', fontWeight: 700, boxShadow: '0 8px 24px rgba(37,211,102,0.4)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%', display: 'inline-block' }}></span>
              New WhatsApp Messages 💬
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0A0F1E', padding: '40px 5%', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Cloutinet <span style={{ color: '#00E676' }}>·</span></div>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Nigeria's free business visibility platform — cloutinet.online</p>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>© 2026 Cloutinet. Create. Share. Grow.</p>
      </footer>

    </div>
  )
}
