import Link from 'next/link'

export const metadata = {
  title: 'Trust Score API | Cloutinet',
  description: "Query a Cloutinet business's visibility score via API.",
}

const codeBlockStyle: React.CSSProperties = {
  background: '#0A0E27', color: '#E2E8F0', borderRadius: '12px',
  padding: '16px', fontSize: '12.5px', fontFamily: 'Consolas, Monaco, monospace',
  overflowX: 'auto', lineHeight: 1.6, whiteSpace: 'pre' as const,
}
const sectionStyle: React.CSSProperties = { maxWidth: '700px', margin: '0 auto 32px', padding: '0 16px' }
const headingStyle: React.CSSProperties = { fontSize: '17px', fontWeight: 700, marginBottom: '10px', color: '#0F172A', letterSpacing: '-0.01em' }
const textStyle: React.CSSProperties = { fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '10px' }
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' as const, fontSize: '14px' }
const thStyle: React.CSSProperties = { textAlign: 'left' as const, padding: '10px', background: '#F5F7FB', border: '1px solid #E2E8F0', color: '#0F172A' }
const tdStyle: React.CSSProperties = { padding: '10px', border: '1px solid #E2E8F0', color: '#475569' }
const inlineCodeStyle: React.CSSProperties = { background: '#F5F7FB', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }

export default function TrustScoreDocsPage() {
  return (
    <div style={{ fontFamily: 'inherit', background: '#fff', color: '#0F172A' }}>
      <nav style={{ padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0A0E27', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/" style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.01em', color: '#fff', textDecoration: 'none' }}>
          Cloutinet
        </Link>
        <Link href="/dashboard/api-keys" style={{ fontSize: '13px', fontWeight: 600, color: '#fff', background: '#2563EB', textDecoration: 'none', borderRadius: '8px', padding: '8px 14px' }}>
          Get an API key
        </Link>
      </nav>

      <section
        style={{
          background: '#0A0E27',
          backgroundImage:
            'radial-gradient(ellipse 700px 500px at 10% -10%, rgba(29,78,216,0.35), transparent 70%), radial-gradient(ellipse 600px 600px at 100% 0%, rgba(37,99,235,0.28), transparent 70%)',
          padding: '48px 20px 52px',
          color: '#fff',
          textAlign: 'center' as const,
        }}
      >
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 8px', lineHeight: 1.1 }}>Trust Score API</h1>
        <p style={{ fontSize: '15px', color: '#94A3B8', margin: 0 }}>Query a business&apos;s Cloutinet visibility score programmatically.</p>
      </section>

      <div style={{ padding: '36px 0' }}>
        <section style={sectionStyle}>
          <h2 style={headingStyle}>Authentication</h2>
          <p style={textStyle}>
            Every request requires an API key, generated from your Cloutinet dashboard under Developer and API
            (available as a pay-as-you-go add-on on the Startup plan and above). Pass it as a Bearer token in the Authorization header.
          </p>
          <div style={codeBlockStyle}>{`Authorization: Bearer YOUR_API_KEY`}</div>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Pricing</h2>
          <table style={tableStyle}>
            <thead>
              <tr><th style={thStyle}>Volume</th><th style={thStyle}>Price</th></tr>
            </thead>
            <tbody>
              <tr><td style={tdStyle}>0 – 1,000 calls / month</td><td style={tdStyle}>₦15 per call</td></tr>
              <tr><td style={tdStyle}>1,001 – 10,000 calls / month</td><td style={tdStyle}>₦10 per call</td></tr>
              <tr><td style={tdStyle}>10,001+ calls / month</td><td style={tdStyle}>₦6 per call, or contact sales</td></tr>
            </tbody>
          </table>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Endpoint</h2>
          <div style={codeBlockStyle}>{`GET https://cloutinet.online/api/v1/trust-score?business_id=BUSINESS_ID`}</div>
          <p style={{ ...textStyle, marginTop: '10px' }}>
            <strong>business_id</strong> is the short public business ID shown on the business&apos;s Cloutinet dashboard
            (not the same as the store page URL slug).
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Example request</h2>
          <div style={codeBlockStyle}>{`curl "https://cloutinet.online/api/v1/trust-score?business_id=CLT-1029" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</div>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Example response</h2>
          <div style={codeBlockStyle}>{`{
  "business_id": "CLT-1029",
  "business_name": "Damilare Furniture",
  "trust_score": 75,
  "max_score": 100
}`}</div>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Errors</h2>
          <table style={tableStyle}>
            <thead>
              <tr><th style={thStyle}>Status</th><th style={thStyle}>Meaning</th></tr>
            </thead>
            <tbody>
              <tr><td style={tdStyle}>401</td><td style={tdStyle}>Missing, invalid, or revoked API key</td></tr>
              <tr><td style={tdStyle}>400</td><td style={tdStyle}>business_id query parameter missing</td></tr>
              <tr><td style={tdStyle}>404</td><td style={tdStyle}>No business found for that business_id</td></tr>
              <tr><td style={tdStyle}>429</td><td style={tdStyle}>Daily rate limit exceeded (500 requests/day per key)</td></tr>
            </tbody>
          </table>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Rate limits</h2>
          <p style={textStyle}>
            Each API key is limited to 500 requests per day. The response includes an
            <code style={inlineCodeStyle}> X-RateLimit-Remaining </code>
            header showing how many requests remain for the current day.
          </p>
        </section>
      </div>

      <footer style={{ background: '#0A0E27', padding: '32px 20px', textAlign: 'center' as const }}>
        <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0 }}>Questions? Contact cloutinet.hello@gmail.com</p>
      </footer>
    </div>
  )
}
