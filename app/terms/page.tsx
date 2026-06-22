import Link from 'next/link'

export default function TermsPage() {
  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', background: '#fff', color: '#0F172A' }}>
      <nav style={{ padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', background: '#0F172A', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>C</div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Cloutinet</span>
        </Link>
      </nav>

      <section style={{ maxWidth: '580px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px', color: '#0F172A' }}>Terms of Service</h1>
        <p style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '32px' }}>Last updated: June 2026</p>

        {[
          { title: '1. Acceptance of Terms', body: 'By creating an account and using Cloutinet, you agree to these Terms of Service. If you do not agree, please do not use the platform.' },
          { title: '2. What Cloutinet Provides', body: 'Cloutinet provides a free platform for small business owners to create public business pages, list products and services, and receive customer inquiries via WhatsApp. We do not process payments or guarantee any level of sales or customer inquiries.' },
          { title: '3. Your Responsibilities', body: 'You are responsible for ensuring all information you provide is accurate and truthful. You must not list illegal products or services. You must not impersonate another business or person. You are responsible for all activity on your account.' },
          { title: '4. Content Ownership', body: 'You own all content you upload to Cloutinet, including product images and descriptions. By uploading content, you grant Cloutinet a license to display that content on your public store page and in search engine results.' },
          { title: '5. Free Plan', body: 'The free plan of Cloutinet is provided at no cost. We reserve the right to introduce paid features in the future. We will notify existing users before making any previously free features paid.' },
          { title: '6. Account Termination', body: 'We reserve the right to suspend or terminate accounts that violate these terms, post illegal content, or engage in fraudulent activity. You may delete your account at any time from your dashboard settings.' },
          { title: '7. Limitation of Liability', body: 'Cloutinet is provided "as is" without warranties of any kind. We are not liable for any loss of business, revenue, or data resulting from use of the platform. We do not guarantee that your pages will appear in Google search results.' },
          { title: '8. Changes to Terms', body: 'We may update these terms from time to time. Continued use of Cloutinet after changes constitutes acceptance of the new terms. We will notify users of significant changes via email.' },
          { title: '9. Contact', body: 'For any questions about these terms, contact us through the feedback form at cloutinet.online/feedback.' },
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
          <Link href="/privacy" style={{ color: '#475569', fontSize: '12px', textDecoration: 'none' }}>Privacy Policy</Link>
        </div>
      </footer>
    </div>
  )
}
