import { useQuery } from '@tanstack/react-query'
import { loadLocalCatalog, shouldUseLocalCatalog } from '@/lib/localCatalog'
import { supabase } from '@/lib/supabase'
import type { Product, ProductImage } from '@/types/database'

export interface ProductFilters {
  q?: string
  collectionSlug?: string
  brandSlug?: string
  productType?: string
  sort?: 'name' | 'newest' | 'featured'
  page?: number
  pageSize?: number
}

const PRODUCT_SELECT = `
  *,
  brand:brands(*),
  images:product_images(*),
  product_collections(
    collection:collections(*)
  )
`

function mapProduct(row: Record<string, unknown>): Product {
  const pc = row.product_collections as { collection: unknown }[] | undefined
  return {
    ...(row as unknown as Product),
    collections: pc?.map((x) => x.collection).filter(Boolean) as Product['collections'],
  }
}

function filterLocalProducts(products: Product[], filters: ProductFilters): Product[] {
  let list = [...products]
  if (filters.q) {
    const q = filters.q.toLowerCase()
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.model_number?.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q),
    )
  }
  if (filters.productType) {
    list = list.filter((p) => p.product_type === filters.productType)
  }
  if (filters.brandSlug) {
    list = list.filter((p) => p.brand?.slug === filters.brandSlug)
  }
  if (filters.collectionSlug) {
    list = list.filter((p) => p.collections?.some((c) => c.slug === filters.collectionSlug))
  }
  if (filters.sort === 'featured') {
    list.sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.name.localeCompare(b.name))
  } else if (filters.sort === 'newest') {
    list.sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
  } else {
    list.sort((a, b) => a.name.localeCompare(b.name))
  }
  return list
}

async function fetchLocalProducts(filters: ProductFilters) {
  const cat = await loadLocalCatalog()
  if (!cat) return { products: [] as Product[], total: 0 }
  const filtered = filterLocalProducts(cat.products, filters)
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 24
  const start = (page - 1) * pageSize
  return {
    products: filtered.slice(start, start + pageSize),
    total: filtered.length,
  }
}

export async function fetchProducts(filters: ProductFilters = {}) {
  if (shouldUseLocalCatalog()) {
    return fetchLocalProducts(filters)
  }

  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 24
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT, { count: 'exact' })
    .eq('status', 'published')

  if (filters.q) {
    query = query.or(
      `name.ilike.%${filters.q}%,model_number.ilike.%${filters.q}%,short_description.ilike.%${filters.q}%`,
    )
  }

  if (filters.productType) {
    query = query.eq('product_type', filters.productType)
  }

  if (filters.sort === 'featured') {
    query = query.order('is_featured', { ascending: false }).order('sort_order')
  } else if (filters.sort === 'newest') {
    query = query.order('created_at', { ascending: false })
  } else {
    query = query.order('name', { ascending: true })
  }

  query = query.range(from, to)

  if (filters.collectionSlug) {
    const { data: coll, error: collError } = await supabase
      .from('collections')
      .select('id')
      .eq('slug', filters.collectionSlug)
      .maybeSingle()
    if (collError) throw collError
    if (coll?.id) {
      const { data: links, error: linkError } = await supabase
        .from('product_collections')
        .select('product_id')
        .eq('collection_id', coll.id)
      if (linkError) throw linkError
      const ids = (links ?? []).map((l) => l.product_id)
      if (ids.length === 0) return { products: [], total: 0 }
      query = query.in('id', ids)
    }
  }

  const { data, error, count } = await query
  if (error) throw error

  const products = (data ?? []).map((r) => mapProduct(r as Record<string, unknown>))
  if (products.length === 0) {
    return fetchLocalProducts(filters)
  }

  return { products, total: count ?? products.length }
}

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters, shouldUseLocalCatalog()],
    queryFn: () => fetchProducts(filters),
  })
}

export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: ['products', 'featured', limit, shouldUseLocalCatalog()],
    queryFn: async () => {
      if (shouldUseLocalCatalog()) {
        const cat = await loadLocalCatalog()
        return (cat?.products.filter((p) => p.is_featured) ?? []).slice(0, limit)
      }
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('sort_order')
        .limit(limit)
      if (error) throw error
      const mapped = (data ?? []).map((r) => mapProduct(r as Record<string, unknown>))
      if (mapped.length === 0) {
        const cat = await loadLocalCatalog()
        return (cat?.products.filter((p) => p.is_featured) ?? []).slice(0, limit)
      }
      return mapped
    },
  })
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug, shouldUseLocalCatalog()],
    enabled: Boolean(slug),
    queryFn: async () => {
      if (!slug) return null
      if (shouldUseLocalCatalog()) {
        const cat = await loadLocalCatalog()
        return cat?.products.find((p) => p.slug === slug) ?? null
      }
      const { data, error } = await supabase
        .from('products')
        .select(`${PRODUCT_SELECT}, specifications:product_specifications(*)`)
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle()
      if (error) throw error
      if (!data) {
        const cat = await loadLocalCatalog()
        return cat?.products.find((p) => p.slug === slug) ?? null
      }
      return mapProduct(data as Record<string, unknown>)
    },
  })
}

export function getPrimaryImage(images?: ProductImage[]): ProductImage | undefined {
  if (!images?.length) return undefined
  return images.find((i) => i.is_primary) ?? [...images].sort((a, b) => a.sort_order - b.sort_order)[0]
}
