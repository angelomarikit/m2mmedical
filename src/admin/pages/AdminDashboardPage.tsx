import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

async function countTable(table: string, filter?: { col: string; val: string }) {
  let q = supabase.from(table).select('*', { count: 'exact', head: true })
  if (filter) q = q.eq(filter.col, filter.val)
  const { count, error } = await q
  if (error) throw error
  return count ?? 0
}

export function AdminDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => ({
      published: await countTable('products', { col: 'status', val: 'published' }),
      drafts: await countTable('products', { col: 'status', val: 'draft' }),
      collections: await countTable('collections'),
      inquiries: await countTable('inquiries', { col: 'status', val: 'new' }),
      contact: await countTable('contact_messages', { col: 'status', val: 'new' }),
      service: await countTable('service_inquiries', { col: 'status', val: 'new' }),
    }),
  })

  const cards = [
    ['Published products', stats?.published],
    ['Draft products', stats?.drafts],
    ['Collections', stats?.collections],
    ['New inquiries', stats?.inquiries],
    ['New contact messages', stats?.contact],
    ['New service inquiries', stats?.service],
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="rounded-lg border border-border bg-white p-6">
            <p className="text-sm text-text-muted">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value ?? '—'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
