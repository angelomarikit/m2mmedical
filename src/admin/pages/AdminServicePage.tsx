import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function AdminServicePage() {
  const { data: rows = [] } = useQuery({
    queryKey: ['admin-service'],
    queryFn: async () => {
      const { data, error } = await supabase.from('service_inquiries').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Service inquiries</h1>
      <div className="mt-6 space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-white p-4 text-sm">
            <p className="font-semibold">{r.equipment_type} — {r.requested_service}</p>
            <p className="text-text-muted">{r.full_name} · {r.company_name}</p>
            <p className="mt-2 whitespace-pre-wrap">{r.issue_description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
