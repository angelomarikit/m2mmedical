import { useQuery } from '@tanstack/react-query'
import { loadLocalCatalog, shouldUseLocalCatalog } from '@/lib/localCatalog'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type { PartnerClient } from '@/types/database'

export function usePartnersClients(type: 'partner' | 'client') {
  return useQuery({
    queryKey: ['partners-clients', type, shouldUseLocalCatalog()],
    queryFn: async () => {
      if (shouldUseLocalCatalog()) {
        const cat = await loadLocalCatalog()
        return (cat?.partners_clients.filter((p) => p.type === type && p.is_published) ??
          []) as PartnerClient[]
      }
      if (!isSupabaseConfigured) {
        const cat = await loadLocalCatalog()
        return (cat?.partners_clients.filter((p) => p.type === type && p.is_published) ??
          []) as PartnerClient[]
      }
      const { data, error } = await supabase
        .from('partners_clients')
        .select('*')
        .eq('type', type)
        .eq('is_published', true)
        .order('sort_order')
      if (error) throw error
      if ((data ?? []).length === 0) {
        const cat = await loadLocalCatalog()
        return (cat?.partners_clients.filter((p) => p.type === type && p.is_published) ??
          []) as PartnerClient[]
      }
      return (data ?? []) as PartnerClient[]
    },
  })
}
