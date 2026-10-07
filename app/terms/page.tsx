import { LegalPage } from '../components/PublicChrome'

export const metadata = {
  title: 'Terms of Service | Cloutinet',
}

const SECTIONS = [
  { title: '1. Acceptance of Terms', body: 'By creating an account and using Cloutinet, you agree to these Terms of Service. If you do not agree, please do not use the platform.' },
  { title: '2. What Cloutinet Provides', body: 'Cloutinet provides a free platform for small business owners to create public business pages, list products and services, and receive customer inquiries via WhatsApp. We do not process payments or guarantee any level of sales or customer inquiries.' },
  { title: '3. Your Responsibilities', body: 'You are responsible for ensuring all information you provide is accurate and truthful. You must not list illegal products or services. You must not impersonate another business or person. You are responsible for all activity on your account.' },
  { title: '4. Content Ownership', body: 'You own all content you upload to Cloutinet, including product images and descriptions. By uploading content, you grant Cloutinet a license to display that content on your public store page and in search engine results.' },
  { title: '5. Free Plan', body: 'The free plan of Cloutinet is provided at no cost. We reserve the right to introduce paid features in the future. We will notify existing users before making any previously free features paid.' },
  { title: '6. Account Termination', body: 'We reserve the right to suspend or terminate accounts that violate these terms, post illegal content, or engage in fraudulent activity. You may delete your account at any time from your dashboard settings.' },
  { title: '7. Limitation of Liability', body: 'Cloutinet is provided "as is" without warranties of any kind. We are not liable for any loss of business, revenue, or data resulting from use of the platform. We do not guarantee that your pages will appear in Google search results.' },
  { title: '8. Changes to Terms', body: 'We may update these terms from time to time. Continued use of Cloutinet after changes constitutes acceptance of the new terms. We will notify users of significant changes via email.' },
  { title: '9. Contact', body: 'For any questions about these terms, contact us through the feedback form at cloutinet.online/feedback.' },
]

export default function TermsPage() {
  return <LegalPage title="Terms of Service" updated="June 2026" sections={SECTIONS} />
}
