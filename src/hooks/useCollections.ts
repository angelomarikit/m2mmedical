import { useQuery } from '@tanstack/react-query'
import { loadLocalCatalog, shouldUseLocalCatalog } from '@/lib/localCatalog'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type { Collection } from '@/types/database'

async function fetchPublishedCollections(): Promise<Collection[]> {
  if (shouldUseLocalCatalog()) {
    const cat = await loadLocalCatalog()
    return cat?.collections ?? []
  }
  if (!isSupabaseConfigured) {
    const cat = await loadLocalCatalog()
    return cat?.collections ?? []
  }
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  if ((data ?? []).length === 0) {
    const cat = await loadLocalCatalog()
    return cat?.collections ?? []
  }
  return (data ?? []) as Collection[]
}

export function useCollections() {
  return useQuery({
    queryKey: ['collections', shouldUseLocalCatalog()],
    queryFn: fetchPublishedCollections,
  })
}

export function useRootCollections() {
  return useQuery({
    queryKey: ['collections', 'root', shouldUseLocalCatalog()],
    queryFn: async () => {
      const all = await fetchPublishedCollections()
      return all.filter((c) => !c.parent_id)
    },
  })
}

export function useCollection(slug: string | undefined) {
  return useQuery({
    queryKey: ['collection', slug, shouldUseLocalCatalog()],
    enabled: Boolean(slug),
    queryFn: async () => {
      if (!slug) return null
      const all = await fetchPublishedCollections()
      return all.find((c) => c.slug === slug) ?? null
    },
  })
}
