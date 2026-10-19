import type { Brand, Collection, PartnerClient, Product } from '@/types/database'

export interface LocalCatalogPayload {
  brands: Brand[]
  collections: Array<Collection & { parent_id: string | null }>
  products: Product[]
  partners_clients: PartnerClient[]
}

let cache: LocalCatalogPayload | null = null

export async function loadLocalCatalog(): Promise<LocalCatalogPayload | null> {
  if (cache) return cache
  try {
    const res = await fetch('/data/catalog.json')
    if (!res.ok) return null
    const data = (await res.json()) as LocalCatalogPayload
    // Resolve parent_id slugs to ids for nested collections
    const collections = data.collections.map((c) => ({
      ...c,
      parent_id:
        c.parent_id && typeof c.parent_id === 'string'
          ? (data.collections.find((p) => p.slug === c.parent_id)?.id ?? null)
          : c.parent_id,
    })) as Collection[]
    cache = { ...data, collections }
    return cache
  } catch {
    return null
  }
}

export function shouldUseLocalCatalog(): boolean {
  if (import.meta.env.VITE_USE_LOCAL_CATALOG === 'true') return true
  return !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
}
