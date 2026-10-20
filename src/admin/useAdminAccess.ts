import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { UserRole } from '@/types/database'
import { useAdminSession } from './useAdminSession'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

const CMS_ROLES: UserRole[] = ['owner', 'admin', 'editor']

export function useAdminAccess() {
  const { session, loading: sessionLoading } = useAdminSession()
  const userId = session?.user?.id

  const profileQuery = useQuery({
    queryKey: ['admin-access', userId],
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
        approval_status: data.approval_status as ApprovalStatus,
        email: session?.user?.email ?? '',
      }
    },
  })

  const profile = profileQuery.data
  const loading = sessionLoading || (!!userId && profileQuery.isLoading)

  const canAccessCms =
    !!session &&
    profile?.approval_status === 'approved' &&
    CMS_ROLES.includes(profile.role)

  return {
    session,
    profile,
    loading,
    canAccessCms,
    isPending: profile?.approval_status === 'pending',
    isRejected: profile?.approval_status === 'rejected',
  }
}
