import { LegalPage } from '../components/PublicChrome'

export const metadata = {
  title: 'Privacy Policy | Cloutinet',
}

const SECTIONS = [
  { title: '1. Information We Collect', body: 'When you create an account on Cloutinet, we collect your email address and password. When you set up your business profile, we collect your business name, phone number, location, and any other information you choose to provide. When you add products, we collect product names, descriptions, prices, and images you upload.' },
  { title: '2. How We Use Your Information', body: 'We use your information to create and display your public business page, allow customers to find and contact your business on Google, send you important updates about your account, and improve the Cloutinet platform. We do not sell your personal information to any third party.' },
  { title: '3. Public Information', body: 'Your business name, location, phone number, products, and services are displayed publicly on your Cloutinet store page and may be indexed by Google and other search engines. Do not add any information you do not want to be publicly visible.' },
  { title: '4. Data Storage', body: 'Your data is stored securely using Supabase, a trusted cloud database provider. Product images are stored in secure cloud storage. We take reasonable measures to protect your information from unauthorized access.' },
  { title: '5. WhatsApp', body: 'Cloutinet generates WhatsApp contact links for your business. When a customer clicks your WhatsApp link, they are redirected to WhatsApp directly. Cloutinet does not have access to your WhatsApp messages or conversations.' },
  { title: '6. Analytics', body: 'We track page views and WhatsApp link clicks on your store page to show you how many people are finding and engaging with your business. This data is only visible to you in your dashboard.' },
  { title: '7. Your Rights', body: 'You can update or delete your business profile and products at any time from your dashboard. You can delete your account by contacting us. Upon account deletion, your public store page will be removed.' },
  { title: '8. Contact', body: 'If you have any questions about this Privacy Policy, please contact us through the feedback form at cloutinet.online/feedback.' },
]

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" updated="June 2026" sections={SECTIONS} />
}
