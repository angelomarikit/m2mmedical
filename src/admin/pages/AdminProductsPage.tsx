import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

export function AdminProductsPage() {
  const qc = useQueryClient()
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('updated_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const duplicate = useMutation({
    mutationFn: async (productId: string) => {
      const { data: p, error } = await supabase.from('products').select('*').eq('id', productId).single()
      if (error) throw error
      const slug = `${p.slug}-copy-${Date.now()}`
      const { id: _id, created_at: _c, updated_at: _u, ...rest } = p
      const { data: created, error: cErr } = await supabase
        .from('products')
        .insert({ ...rest, slug, name: `${p.name} (Copy)`, status: 'draft' })
        .select('id')
        .single()
      if (cErr) throw cErr
      return created.id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  })

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={async () => {
          const slug = `new-product-${Date.now()}`
          const { data } = await supabase.from('products').insert({
            name: 'New product',
            slug,
            status: 'draft',
          }).select('id').single()
          if (data) window.location.href = `/admin/products/${data.id}`
        }}>
          New product
        </Button>
      </div>
      {isLoading && <p className="mt-4 text-sm text-text-muted">Loading…</p>}
      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-surface-alt text-left text-xs uppercase text-text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link to={`/admin/products/${p.id}`} className="font-medium text-brand hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3">{p.is_featured ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3">
                  <button type="button" className="text-xs text-brand hover:underline" onClick={() => duplicate.mutate(p.id)}>
                    Duplicate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
