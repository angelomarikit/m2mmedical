import type { CompanyInfo } from '@/hooks/useSiteSettings'

export function organizationJsonLd(company: CompanyInfo) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: company.name,
    url: company.website,
    telephone: company.phone,
    email: company.email,
    slogan: company.tagline,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.addressLines.join(' '),
      addressLocality: 'Cainta',
      addressRegion: 'Rizal',
      addressCountry: 'PH',
    },
  }
}
