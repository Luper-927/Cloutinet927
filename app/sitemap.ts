// app/sitemap.ts
import { MetadataRoute } from 'next'
import { supabase } from '../lib/supabase'

const baseUrl = 'https://cloutinet.online'
const staticLastModified = new Date('2026-08-01')

const categoryMap: Record<string, string> = {
  'retail-chains-supermarkets': 'Retail Chains & Supermarkets',
  'fmcg-distribution': 'FMCG Distribution',
  'franchise-operations': 'Franchise Operations',
  'logistics-distribution': 'Logistics & Distribution',
  'warehousing-supply-chain': 'Warehousing & Supply Chain',
  'freight-courier': 'Freight & Courier Services',
  'import-export-trade': 'Import/Export & Trade',
  'manufacturing-industrial': 'Manufacturing & Industrial',
  'construction-engineering': 'Construction & Engineering',
  'oil-gas-services': 'Oil & Gas Services',
  'power-energy': 'Power & Energy',
  'real-estate-property-management': 'Real Estate & Property Management',
  'hospitality-hotel-groups': 'Hospitality & Hotel Groups',
  'facilities-management': 'Facilities Management',
  'financial-services-banking': 'Financial Services & Banking',
  'insurance': 'Insurance',
  'accounting-audit-firms': 'Accounting & Audit Firms',
  'legal-services': 'Legal Services',
  'consulting-firms': 'Consulting Firms',
  'hr-recruitment-agencies': 'HR & Recruitment Agencies',
  'hospital-clinic-groups': 'Hospital & Clinic Groups',
  'pharmaceutical-distribution': 'Pharmaceutical Distribution',
  'agribusiness-agro-processing': 'Agribusiness & Agro-processing',
  'technology-software': 'Technology & Software Companies',
  'telecommunications': 'Telecommunications',
  'media-broadcasting': 'Media & Broadcasting',
  'marketing-advertising-agencies': 'Marketing & Advertising Agencies',
  'education-groups-school-chains': 'Education Groups & School Chains',
  'automotive-dealerships-fleet': 'Automotive Dealerships & Fleet Services',
  'security-services': 'Security Services',
}

function getStaticPages(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, lastModified: staticLastModified, changeFrequency: 'daily', priority: 1 },
    { url: baseUrl + '/businesses', lastModified: staticLastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: baseUrl + '/checker', lastModified: staticLastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: baseUrl + '/tools/whatsapp-link', lastModified: staticLastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: baseUrl + '/data', lastModified: staticLastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: baseUrl + '/data/nigerian-enterprise-report', lastModified: staticLastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: baseUrl + '/data/whatsapp-business-nigeria', lastModified: staticLastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: baseUrl + '/data/how-cloutinet-works', lastModified: staticLastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: baseUrl + '/data/nigerian-cities-business-data', lastModified: staticLastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: baseUrl + '/about', lastModified: staticLastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: baseUrl + '/contact', lastModified: staticLastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: baseUrl + '/feedback', lastModified: staticLastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: baseUrl + '/privacy', lastModified: staticLastModified, changeFrequency: 'monthly', priority: 0.4 },
    { url: baseUrl + '/terms', lastModified: staticLastModified, changeFrequency: 'monthly', priority: 0.4 },
    { url: baseUrl + '/auth', lastModified: staticLastModified, changeFrequency: 'monthly', priority: 0.5 },
  ]
}

function getCategoryPages(): MetadataRoute.Sitemap {
  return Object.keys(categoryMap).map((slug) => ({
    url: baseUrl + '/businesses/' + slug,
    lastModified: staticLastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
}

async function getDynamicPages(): Promise<MetadataRoute.Sitemap> {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('business_slug, created_at')
    .not('business_slug', 'is', null)

  const storePages: MetadataRoute.Sitemap = (profiles || []).map((p: any) => ({
    url: baseUrl + '/store/' + p.business_slug,
    lastModified: p.created_at ? new Date(p.created_at) : staticLastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const { data: products } = await supabase
    .from('products')
    .select('slug, created_at, profiles(business_slug)')
    .eq('is_published', true)

  const productPages: MetadataRoute.Sitemap = (products || [])
    .filter((p: any) => p.profiles?.business_slug)
    .map((p: any) => ({
      url: baseUrl + '/store/' + p.profiles.business_slug + '/' + p.slug,
      lastModified: p.created_at ? new Date(p.created_at) : staticLastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  return [...storePages, ...productPages]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicPages = await getDynamicPages()
  return [...getStaticPages(), ...getCategoryPages(), ...dynamicPages]
}
