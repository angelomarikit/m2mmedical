import { useQuery } from '@tanstack/react-query'
import { COMPANY } from '@/lib/constants'
import { getStoragePublicUrl, isSupabaseConfigured, supabase } from '@/lib/supabase'

export type CompanyInfo = {
  name: string
  tagline: string
  phone: string
  phoneTel: string
  email: string
  website: string
  biomedUrl: string
  addressLines: string[]
  founded: number
  incorporated: number
}

export type SeoDefaults = {
  defaultTitle: string
  defaultDescription: string
}

type SiteSettingsBundle = {
  company: CompanyInfo
  seo: SeoDefaults
  logoUrl: string
}

function companyFromJson(v: Record<string, unknown>): CompanyInfo {
  const addressLines = Array.isArray(v.addressLines)
    ? (v.addressLines as string[])
    : [...COMPANY.addressLines]
  const phone = String(v.phone ?? COMPANY.phone)
  const phoneTel = String(v.phoneTel ?? COMPANY.phoneTel)
  return {
    name: String(v.name ?? COMPANY.name),
    tagline: String(v.tagline ?? COMPANY.tagline),
    phone,
    phoneTel: phoneTel || phone.replace(/[^\d+]/g, ''),
    email: String(v.email ?? COMPANY.email),
    website: String(v.website ?? COMPANY.website),
    biomedUrl: String(v.biomedUrl ?? COMPANY.biomedUrl),
    addressLines,
    founded: COMPANY.founded,
    incorporated: COMPANY.incorporated,
  }
}

const defaultSeo: SeoDefaults = {
  defaultTitle: `${COMPANY.name} | ${COMPANY.tagline}`,
  defaultDescription:
    'Quality medical equipment, accessories, and healthcare supplies for hospitals and clinics.',
}

function bundleFromRows(
  rows: { key: string; value_json: Record<string, unknown> }[] | null | undefined,
): SiteSettingsBundle {
  const byKey = new Map((rows ?? []).map((r) => [r.key, r.value_json ?? {}]))
  const branding = byKey.get('branding') ?? {}
  const logoPath = String((branding as Record<string, unknown>).logo_storage_path ?? '')
  const logoUrl =
    logoPath && isSupabaseConfigured ? getStoragePublicUrl('website-assets', logoPath) : '/logo.png'

  const seoRaw = byKey.get('seo') ?? {}
  return {
    company: companyFromJson(byKey.get('company') ?? {}),
    seo: {
      defaultTitle: String((seoRaw as Record<string, unknown>).defaultTitle ?? defaultSeo.defaultTitle),
      defaultDescription: String(
        (seoRaw as Record<string, unknown>).defaultDescription ?? defaultSeo.defaultDescription,
      ),
    },
    logoUrl,
  }
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async (): Promise<SiteSettingsBundle> => {
      if (!isSupabaseConfigured) {
        return bundleFromRows(null)
      }
      const { data, error } = await supabase.from('site_settings').select('key, value_json')
      if (error) throw error
      return bundleFromRows(data as { key: string; value_json: Record<string, unknown> }[])
    },
  })
}

export function useCompanyInfo(): CompanyInfo {
  const { data } = useSiteSettings()
  return data?.company ?? companyFromJson({})
}

export function useLogoUrl(): string {
  const { data } = useSiteSettings()
  return data?.logoUrl ?? '/logo.png'
}

export function useSeoDefaults(): SeoDefaults {
  const { data } = useSiteSettings()
  return data?.seo ?? defaultSeo
}
