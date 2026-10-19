import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

export function AdminBrandsPage() {
  const qc = useQueryClient()
  const { data: brands = [] } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const { data, error } = await supabase.from('brands').select('*').order('sort_order')
      if (error) throw error
      return data
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Brands</h1>
        <Button onClick={async () => {
          await supabase.from('brands').insert({ name: 'New brand', slug: `brand-${Date.now()}`, is_active: true })
          qc.invalidateQueries({ queryKey: ['admin-brands'] })
        }}>Add brand</Button>
      </div>
      <ul className="mt-6 space-y-2">
        {brands.map((b) => (
          <li key={b.id} className="rounded-md border border-border bg-white px-4 py-3 text-sm">
            {b.name} <span className="text-text-muted">({b.slug})</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
