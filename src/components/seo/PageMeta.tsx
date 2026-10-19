import { Helmet } from 'react-helmet-async'
import { useCompanyInfo, useLogoUrl, useSeoDefaults } from '@/hooks/useSiteSettings'

interface PageMetaProps {
  title?: string
  description?: string
  path?: string
  image?: string
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
  noIndex?: boolean
}

export function PageMeta({
  title,
  description,
  path = '',
  image,
  jsonLd,
  noIndex,
}: PageMetaProps) {
  const company = useCompanyInfo()
  const seo = useSeoDefaults()
  const logoUrl = useLogoUrl()
  const metaDescription = description ?? seo.defaultDescription
  const fullTitle = title ? `${title} | ${company.name}` : seo.defaultTitle
  const canonical = `${company.website}${path.startsWith('/') ? path : `/${path}`}`
  const ogImage = image ?? logoUrl
  const ld = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${company.website}${ogImage}`} />
      <meta name="twitter:card" content="summary_large_image" />
      {ld.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  )
}
