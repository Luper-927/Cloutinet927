import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', background: '#fff', color: '#1a1a2e' }}>

      <nav style={{ padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', background: '#6B21A8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '14px' }}>C</div>
          <span style={{ fontSize: '16px', fontWeight: 900, color: '#6B21A8' }}>Cloutinet</span>
        </Link>
      </nav>

      <section style={{ maxWidth: '580px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '6px' }}>Privacy Policy</h1>
        <p style={{ color: '#888', fontSize: '12px', marginBottom: '32px' }}>Last updated: June 2026</p>

        {[
          {
            title: '1. Information We Collect',
            body: 'When you create an account on Cloutinet, we collect your email address and password. When you set up your business profile, we collect your business name, phone number, location, and any other information you choose to provide. When you add products, we collect product names, descriptions, prices, and images you upload.'
          },
          {
            title: '2. How We Use Your Information',
            body: 'We use your information to create and display your public business page, allow customers to find and contact your business on Google, send you important updates about your account, and improve the Cloutinet platform. We do not sell your personal information to any third party.'
          },
          {
            title: '3. Public Information',
            body: 'Your business name, location, phone number, products, and services are displayed publicly on your Cloutinet store page and may be indexed by Google and other search engines. Do not add any information you do not want to be publicly visible.'
          },
          {
            title: '4. Data Storage',
            body: 'Your data is stored securely using Supabase, a trusted cloud database provider. Product images are stored in secure cloud storage. We take reasonable measures to protect your information from unauthorized access.'
          },
          {
            title: '5. WhatsApp',
            body: 'Cloutinet generates WhatsApp contact links for your business. When a customer clicks your WhatsApp link, they are redirected to WhatsApp directly. Cloutinet does not have access to your WhatsApp messages or conversations.'
          },
          {
            title: '6. Analytics',
            body: 'We track page views and WhatsApp link clicks on your store page to show you how many people are finding and engaging with your business. This data is only visible to you in your dashboard.'
          },
          {
            title: '7. Your Rights',
            body: 'You can update or delete your business profile and products at any time from your dashboard. You can delete your account by contacting us. Upon account deletion, your public store page will be removed.'
          },
          {
            title: '8. Contact',
            body: 'If you have any questions about this Privacy Policy, please contact us through the feedback form at cloutinet.online/feedback.'
          },
        ].map(section => (
          <div key={section.title} style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '8px', color: '#1a1a2e' }}>{section.title}</h2>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.7 }}>{section.body}</p>
          </div>
        ))}

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <Link href="/" style={{ color: '#6B21A8', fontSize: '13px', textDecoration: 'none' }}>← Back to Cloutinet</Link>
        </div>
      </section>

      <footer style={{ padding: '24px 20px', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ fontSize: '14px', fontWeight: 900, color: '#6B21A8' }}>⚡ Cloutinet</div>
        <p style={{ color: '#888', fontSize: '11px', marginTop: '6px' }}>© 2026 Cloutinet. Create. Share. Grow.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
          <Link href="/about" style={{ color: '#6B21A8', fontSize: '12px', textDecoration: 'none' }}>About</Link>
          <Link href="/feedback" style={{ color: '#6B21A8', fontSize: '12px', textDecoration: 'none' }}>Feedback</Link>
          <Link href="/terms" style={{ color: '#6B21A8', fontSize: '12px', textDecoration: 'none' }}>Terms</Link>
        </div>
      </footer>

    </div>
  )
}
