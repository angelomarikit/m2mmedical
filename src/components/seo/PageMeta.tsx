import { Helmet } from 'react-helmet-async'
import { useCompanyInfo, useSeoDefaults } from '@/hooks/useSiteSettings'
import {
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
} from '@/lib/seo'

interface PageMetaProps {
  title?: string
  description?: string
  path?: string
  /** Override OG image path or full URL; defaults to branded social banner */
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
  const metaDescription = description ?? seo.defaultDescription
  const fullTitle = title ? `${title} | ${company.name}` : seo.defaultTitle
  const canonical = absoluteUrl(company.website, path.startsWith('/') ? path : `/${path}`)
  const ogImagePath = image ?? DEFAULT_OG_IMAGE
  const ogImageUrl = absoluteUrl(company.website, ogImagePath)
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
      <meta property="og:site_name" content={company.name} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:secure_url" content={ogImageUrl} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content={String(DEFAULT_OG_IMAGE_WIDTH)} />
      <meta property="og:image:height" content={String(DEFAULT_OG_IMAGE_HEIGHT)} />
      <meta property="og:image:alt" content={`${company.name} — ${company.tagline}`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImageUrl} />
      <meta name="twitter:image:alt" content={`${company.name} — ${company.tagline}`} />
      {ld.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  )
}
