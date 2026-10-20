import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { UserRole } from '@/types/database'
import { useAdminSession } from './useAdminSession'

export function useAdminProfile() {
  const { session } = useAdminSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['admin-profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, role, approval_status')
        .eq('id', userId!)
        .single()
      if (error) throw error
      return {
        full_name: data.full_name as string | null,
        role: data.role as UserRole,
        email: session?.user?.email ?? '',
      }
    },
  })
}
