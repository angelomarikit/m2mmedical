import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'

export function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const { data: product, isLoading } = useQuery({
    queryKey: ['admin-product', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('id', id!).single()
      if (error) throw error
      return data
    },
  })

  const { register, handleSubmit, reset } = useForm<Record<string, unknown>>()

  useEffect(() => {
    if (product) reset(product as Record<string, unknown>)
  }, [product, reset])

  const save = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const { error } = await supabase.from('products').update(values).eq('id', id!)
      if (error) throw error
      await supabase.from('activity_logs').insert({
        action: 'product.update',
        resource_type: 'product',
        resource_id: id,
        metadata: { fields: Object.keys(values) },
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-product', id] }),
  })

  if (isLoading || !product) return <p>Loading product…</p>

  return (
    <div className="max-w-3xl">
      <Link to="/admin/products" className="text-sm text-brand hover:underline">← Products</Link>
      <h1 className="mt-2 text-2xl font-bold">Edit product</h1>
      <form
        className="mt-6 space-y-4 rounded-lg border border-border bg-white p-6"
        onSubmit={handleSubmit((values) => save.mutate(values))}
      >
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input defaultValue={product.name} {...register('name')} />
        </div>
        <div>
          <label className="text-sm font-medium">Slug</label>
          <Input defaultValue={product.slug} {...register('slug')} />
        </div>
        <div>
          <label className="text-sm font-medium">Model number</label>
          <Input defaultValue={product.model_number ?? ''} {...register('model_number')} />
        </div>
        <div>
          <label className="text-sm font-medium">Short description</label>
          <Textarea defaultValue={product.short_description ?? ''} {...register('short_description')} />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea defaultValue={product.description ?? ''} {...register('description')} rows={6} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Status</label>
            <select defaultValue={product.status} className="h-11 w-full rounded-md border border-border px-3 text-sm" {...register('status')}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Product type</label>
            <select defaultValue={product.product_type ?? ''} className="h-11 w-full rounded-md border border-border px-3 text-sm" {...register('product_type')}>
              <option value="">—</option>
              <option value="disposable">Disposable</option>
              <option value="reusable">Reusable</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked={product.is_featured} {...register('is_featured')} />
          Featured on homepage
        </label>
        <Button type="submit" disabled={save.isPending}>Save changes</Button>
        {save.isSuccess && <p className="text-sm text-green-700">Saved.</p>}
      </form>
    </div>
  )
}
