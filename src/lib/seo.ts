/** Default Open Graph / social preview (public/og-image.jpg) */
export const DEFAULT_OG_IMAGE = '/og-image.jpg'
export const DEFAULT_OG_IMAGE_WIDTH = 1024
export const DEFAULT_OG_IMAGE_HEIGHT = 537

export function absoluteUrl(siteOrigin: string, pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  const base = siteOrigin.replace(/\/$/, '')
  return `${base}${path}`
}
