import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', background: '#fff', color: '#0F172A' }}>
      <nav style={{ padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', background: '#0F172A', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>C</div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Cloutinet</span>
        </Link>
      </nav>

      <section style={{ maxWidth: '580px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px', color: '#0F172A' }}>Privacy Policy</h1>
        <p style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '32px' }}>Last updated: June 2026</p>

        {[
          { title: '1. Information We Collect', body: 'When you create an account on Cloutinet, we collect your email address and password. When you set up your business profile, we collect your business name, phone number, location, and any other information you choose to provide. When you add products, we collect product names, descriptions, prices, and images you upload.' },
          { title: '2. How We Use Your Information', body: 'We use your information to create and display your public business page, allow customers to find and contact your business on Google, send you important updates about your account, and improve the Cloutinet platform. We do not sell your personal information to any third party.' },
          { title: '3. Public Information', body: 'Your business name, location, phone number, products, and services are displayed publicly on your Cloutinet store page and may be indexed by Google and other search engines. Do not add any information you do not want to be publicly visible.' },
          { title: '4. Data Storage', body: 'Your data is stored securely using Supabase, a trusted cloud database provider. Product images are stored in secure cloud storage. We take reasonable measures to protect your information from unauthorized access.' },
          { title: '5. WhatsApp', body: 'Cloutinet generates WhatsApp contact links for your business. When a customer clicks your WhatsApp link, they are redirected to WhatsApp directly. Cloutinet does not have access to your WhatsApp messages or conversations.' },
          { title: '6. Analytics', body: 'We track page views and WhatsApp link clicks on your store page to show you how many people are finding and engaging with your business. This data is only visible to you in your dashboard.' },
          { title: '7. Your Rights', body: 'You can update or delete your business profile and products at any time from your dashboard. You can delete your account by contacting us. Upon account deletion, your public store page will be removed.' },
          { title: '8. Contact', body: 'If you have any questions about this Privacy Policy, please contact us through the feedback form at cloutinet.online/feedback.' },
        ].map(section => (
          <div key={section.title} style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: '#0F172A' }}>{section.title}</h2>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.7 }}>{section.body}</p>
          </div>
        ))}

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <Link href="/" style={{ color: '#0F172A', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>← Back to Cloutinet</Link>
        </div>
      </section>

      <footer style={{ padding: '24px 20px', textAlign: 'center', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Cloutinet</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '10px' }}>
          <Link href="/about" style={{ color: '#475569', fontSize: '12px', textDecoration: 'none' }}>About</Link>
          <Link href="/feedback" style={{ color: '#475569', fontSize: '12px', textDecoration: 'none' }}>Feedback</Link>
          <Link href="/terms" style={{ color: '#475569', fontSize: '12px', textDecoration: 'none' }}>Terms</Link>
        </div>
      </footer>
    </div>
  )
}
