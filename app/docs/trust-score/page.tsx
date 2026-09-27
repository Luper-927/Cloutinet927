import Link from 'next/link'

export const metadata = {
  title: 'Trust Score API | Cloutinet',
  description: "Query a Cloutinet business's visibility score via API.",
}

const codeBlockStyle: React.CSSProperties = {
  background: '#0F172A', color: '#E2E8F0', borderRadius: '8px',
  padding: '16px', fontSize: '12.5px', fontFamily: 'Consolas, Monaco, monospace',
  overflowX: 'auto', lineHeight: 1.6, whiteSpace: 'pre' as const,
}
const sectionStyle: React.CSSProperties = { maxWidth: '700px', margin: '0 auto 28px', padding: '0 16px' }
const headingStyle: React.CSSProperties = { fontSize: '16px', fontWeight: 700, marginBottom: '10px', color: '#0F172A' }
const textStyle: React.CSSProperties = { fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '10px' }
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' as const, fontSize: '13px' }
const thStyle: React.CSSProperties = { textAlign: 'left' as const, padding: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#0F172A' }
const tdStyle: React.CSSProperties = { padding: '8px', border: '1px solid #E2E8F0', color: '#475569' }

export default function TrustScoreDocsPage() {
  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', background: '#fff', color: '#0F172A' }}>
      <nav style={{ padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', background: '#0F172A', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>C</div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Cloutinet</span>
        </Link>
        <Link href="/dashboard/integrations" style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textDecoration: 'none', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '5px 10px' }}>
          Get an API Key →
        </Link>
      </nav>

      <section style={{ background: '#0F172A', padding: '40px 20px', color: '#fff', textAlign: 'center' as const }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>Trust Score API</h1>
        <p style={{ fontSize: '13px', color: '#94A3B8' }}>Query a business's Cloutinet visibility score programmatically.</p>
      </section>

      <div style={{ padding: '32px 0' }}>
        <section style={sectionStyle}>
          <h2 style={headingStyle}>Authentication</h2>
          <p style={textStyle}>
            Every request requires an API key, generated from your Cloutinet dashboard under Integrations
            (available on the Advanced plan). Pass it as a Bearer token in the Authorization header.
          </p>
          <div style={codeBlockStyle}>{`Authorization: Bearer YOUR_API_KEY`}</div>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Endpoint</h2>
          <div style={codeBlockStyle}>{`GET https://cloutinet.online/api/v1/trust-score?business_id=BUSINESS_ID`}</div>
          <p style={{ ...textStyle, marginTop: '10px' }}>
            <strong>business_id</strong> is the short public business ID shown on the business's Cloutinet dashboard
            (not the same as the store page URL slug).
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Example Request</h2>
          <div style={codeBlockStyle}>{`curl "https://cloutinet.online/api/v1/trust-score?business_id=CLT-1029" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</div>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Example Response</h2>
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
          <h2 style={headingStyle}>Rate Limits</h2>
          <p style={textStyle}>
            Each API key is limited to 500 requests per day. The response includes an
            <code style={{ background: '#F8FAFC', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}> X-RateLimit-Remaining </code>
            header showing how many requests remain for the current day.
          </p>
        </section>
      </div>

      <footer style={{ background: '#0F172A', padding: '32px 20px', textAlign: 'center' as const }}>
        <p style={{ fontSize: '13px', color: '#94A3B8' }}>Questions? Contact cloutinet.hello@gmail.com</p>
      </footer>
    </div>
  )
}
