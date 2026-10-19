import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function AdminPartnersPage() {
  const qc = useQueryClient()
  const { data: rows = [] } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: async () => {
      const { data, error } = await supabase.from('partners_clients').select('*').order('sort_order')
      if (error) throw error
      return data
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Partners & clients</h1>
      <ul className="mt-6 space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between rounded-md border border-border bg-white px-4 py-3 text-sm">
            <span>{r.name} <span className="text-text-muted">({r.type})</span></span>
            <button
              type="button"
              className="text-brand hover:underline"
              onClick={async () => {
                await supabase.from('partners_clients').update({ is_published: !r.is_published }).eq('id', r.id)
                qc.invalidateQueries({ queryKey: ['admin-partners'] })
              }}
            >
              {r.is_published ? 'Unpublish' : 'Publish'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
