import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, Plus, FileEdit, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { AdminCard } from '../components/AdminCard'
import { AdminDeleteButton } from '../components/AdminDeleteButton'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { AdminStatCard } from '../components/AdminStatCard'
import { AdminStatusBadge } from '../components/AdminStatusBadge'

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

  const counts = useMemo(() => {
    let published = 0
    let draft = 0
    for (const p of products) {
      if (p.status === 'published') published += 1
      else if (p.status === 'draft') draft += 1
    }
    return { published, draft, total: products.length }
  }, [products])

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

  const remove = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase.from('products').delete().eq('id', productId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  })

  async function createProduct() {
    const slug = `new-product-${Date.now()}`
    const { data, error } = await supabase
      .from('products')
      .insert({ name: 'New product', slug, status: 'draft' })
      .select('id')
      .single()
    if (error) {
      window.alert(error.message)
      return
    }
    if (data) window.location.href = `/admin/products/${data.id}`
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Products"
        description="Manage catalog items, photos, and publish status."
        actions={
          <Button type="button" onClick={() => void createProduct()}>
            <Plus className="h-4 w-4" /> Add product
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Total products" value={isLoading ? '—' : counts.total} icon={Package} accent="slate" />
        <AdminStatCard label="Published" value={isLoading ? '—' : counts.published} icon={CheckCircle2} accent="emerald" />
        <AdminStatCard label="Drafts" value={isLoading ? '—' : counts.draft} icon={FileEdit} accent="amber" />
      </div>

      <AdminCard title="Catalog" description={isLoading ? 'Loading…' : `${products.length} product(s)`}>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-alt text-left text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Featured</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {products.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-surface-alt/50">
                  <td className="px-4 py-3">
                    <Link to={`/admin/products/${p.id}`} className="font-medium text-text hover:text-brand hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <AdminStatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-text-muted">{p.is_featured ? 'Yes' : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link to={`/admin/products/${p.id}`} className="text-xs font-medium text-text hover:text-brand">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="text-xs font-medium text-text hover:text-brand"
                        onClick={() => duplicate.mutate(p.id)}
                      >
                        Duplicate
                      </button>
                      <AdminDeleteButton
                        variant="button"
                        confirmMessage={`Delete “${p.name}”? This cannot be undone.`}
                        onDelete={async () => {
                          await remove.mutateAsync(p.id)
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && products.length === 0 && (
            <p className="px-4 py-12 text-center text-sm text-text-muted">No products yet. Add your first product above.</p>
          )}
        </div>
      </AdminCard>
    </div>
  )
}
