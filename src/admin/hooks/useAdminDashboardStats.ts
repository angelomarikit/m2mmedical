import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

async function countTable(table: string, filter?: { col: string; val: string }) {
  let q = supabase.from(table).select('*', { count: 'exact', head: true })
  if (filter) q = q.eq(filter.col, filter.val)
  const { count, error } = await q
  if (error) throw error
  return count ?? 0
}

function tallyStatus(rows: { status: string }[] | null) {
  const map = new Map<string, number>()
  for (const row of rows ?? []) {
    map.set(row.status, (map.get(row.status) ?? 0) + 1)
  }
  return map
}

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const [
        published,
        drafts,
        archived,
        collections,
        brands,
        inquiriesNew,
        contactNew,
        serviceNew,
        pendingStaff,
        inquiryRows,
        recentInquiries,
        recentContact,
        activity,
      ] = await Promise.all([
        countTable('products', { col: 'status', val: 'published' }),
        countTable('products', { col: 'status', val: 'draft' }),
        countTable('products', { col: 'status', val: 'archived' }),
        countTable('collections'),
        countTable('brands'),
        countTable('inquiries', { col: 'status', val: 'new' }),
        countTable('contact_messages', { col: 'status', val: 'new' }),
        countTable('service_inquiries', { col: 'status', val: 'new' }),
        countTable('profiles', { col: 'approval_status', val: 'pending' }),
        supabase.from('inquiries').select('status'),
        supabase
          .from('inquiries')
          .select('id, public_reference, full_name, company_name, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('contact_messages')
          .select('id, subject, full_name, email, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('activity_logs')
          .select('action, resource_type, created_at')
          .order('created_at', { ascending: false })
          .limit(6),
      ])

      if (inquiryRows.error) throw inquiryRows.error

      const inquiryTally = tallyStatus(inquiryRows.data as { status: string }[])

      return {
        published,
        drafts,
        archived,
        collections,
        brands,
        inquiriesNew,
        contactNew,
        serviceNew,
        pendingStaff,
        messagesNew: inquiriesNew + contactNew + serviceNew,
        inquiryTally,
        recentInquiries: recentInquiries.data ?? [],
        recentContact: recentContact.data ?? [],
        activity: activity.error ? [] : (activity.data ?? []),
      }
    },
  })
}
