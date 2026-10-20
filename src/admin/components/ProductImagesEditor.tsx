import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, getStoragePublicUrl, isSupabaseConfigured } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { AdminCard } from './AdminCard'
import { AdminDeleteButton } from './AdminDeleteButton'
import { deleteProductImageFile, uploadProductImageFile } from '../lib/uploads'

type ProductImage = {
  id: string
  product_id: string
  storage_path: string
  alt_text: string | null
  sort_order: number
  is_primary: boolean
}

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message)
  return 'Something went wrong'
}

export function ProductImagesEditor({ productId, productName }: { productId: string; productName: string }) {
  const qc = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadOk, setUploadOk] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('')

  const {
    data: images = [],
    isError: imagesLoadError,
    error: imagesError,
  } = useQuery({
    queryKey: ['admin-product-images', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order')
      if (error) throw error
      return (data ?? []) as ProductImage[]
    },
  })

  const refresh = () => qc.invalidateQueries({ queryKey: ['admin-product-images', productId] })

  const upload = useMutation({
    mutationFn: async (files: File[]) => {
      if (files.length === 0) throw new Error('No file selected. Try choosing the image again.')
      if (!isSupabaseConfigured) {
        throw new Error('Supabase URL/key missing in .env (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY).')
      }
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        throw new Error('Not signed in. Open /admin/login and sign in again.')
      }

      const { count, error: countErr } = await supabase
        .from('product_images')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId)
      if (countErr) throw new Error(`Cannot read photos: ${countErr.message}`)

      let sortOrder = count ?? 0
      let first = sortOrder === 0
      let saved = 0

      for (const file of files) {
        const path = await uploadProductImageFile(productId, file)
        const { data: row, error } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            storage_path: path,
            alt_text: productName,
            sort_order: sortOrder,
            is_primary: first,
          })
          .select('id')
          .single()
        if (error) {
          throw new Error(
            `${error.message} — Run docs/FIX_PRODUCT_PHOTO_UPLOAD.sql in Supabase SQL Editor, then refresh this page.`,
          )
        }
        if (!row?.id) {
          throw new Error('Photo saved to storage but database blocked the row (RLS). Run FIX_PRODUCT_PHOTO_UPLOAD.sql.')
        }
        sortOrder += 1
        first = false
        saved += 1
      }
      return saved
    },
    onSuccess: (saved) => {
      setUploadError(null)
      setUploadOk(saved === 1 ? 'Photo saved.' : `${saved} photos saved.`)
      refresh()
    },
    onError: (e) => {
      setUploadOk(null)
      setUploadError(errMsg(e))
    },
  })

  const addUrl = useMutation({
    mutationFn: async (url: string) => {
      const trimmed = url.trim()
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        throw new Error('Paste a full image link starting with https://')
      }
      const { count, error: countErr } = await supabase
        .from('product_images')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId)
      if (countErr) throw countErr
      const sortOrder = count ?? 0
      const first = sortOrder === 0
      const { data: row, error } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          storage_path: trimmed,
          alt_text: productName,
          sort_order: sortOrder,
          is_primary: first,
        })
        .select('id')
        .single()
      if (error) throw error
      if (!row?.id) throw new Error('Could not save link (database RLS). Run FIX_PRODUCT_PHOTO_UPLOAD.sql.')
    },
    onSuccess: () => {
      setUploadError(null)
      setUploadOk('Photo link saved.')
      setImageUrl('')
      refresh()
    },
    onError: (e) => {
      setUploadOk(null)
      setUploadError(errMsg(e))
    },
  })

  const setPrimary = useMutation({
    mutationFn: async (imageId: string) => {
      await supabase.from('product_images').update({ is_primary: false }).eq('product_id', productId)
      const { error } = await supabase.from('product_images').update({ is_primary: true }).eq('id', imageId)
      if (error) throw error
    },
    onSuccess: refresh,
  })

  const remove = useMutation({
    mutationFn: async (row: ProductImage) => {
      const { error } = await supabase.from('product_images').delete().eq('id', row.id)
      if (error) throw error
      if (!row.storage_path.startsWith('http')) {
        try {
          await deleteProductImageFile(row.storage_path)
        } catch {
          /* storage file may already be missing */
        }
      }
      if (row.is_primary) {
        const { data: next } = await supabase
          .from('product_images')
          .select('id')
          .eq('product_id', productId)
          .order('sort_order')
          .limit(1)
          .maybeSingle()
        if (next?.id) {
          await supabase.from('product_images').update({ is_primary: true }).eq('id', next.id)
        }
      }
    },
    onSuccess: refresh,
  })

  return (
    <AdminCard title="Product photos" description="Upload PNG or JPG, or paste an image link.">
      {!isSupabaseConfigured && (
        <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          Supabase is not configured in this build. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then redeploy.
        </p>
      )}
      {imagesLoadError && (
        <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          Cannot load photos: {errMsg(imagesError)}. Run docs/FIX_PRODUCT_PHOTO_UPLOAD.sql in Supabase SQL Editor.
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => {
          const picked = e.target.files ? Array.from(e.target.files) : []
          e.target.value = ''
          if (picked.length === 0) return
          setUploadOk(null)
          setUploadError(null)
          upload.mutate(picked)
        }}
      />
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" disabled={upload.isPending} onClick={() => inputRef.current?.click()}>
          {upload.isPending ? 'Uploading…' : 'Upload photos'}
        </Button>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/photo.jpg"
          className="min-w-0 flex-1 rounded-md border border-border bg-white px-3 py-2 text-sm"
        />
        <Button
          type="button"
          variant="outline"
          disabled={addUrl.isPending || !imageUrl.trim()}
          onClick={() => addUrl.mutate(imageUrl)}
        >
          {addUrl.isPending ? 'Adding…' : 'Add from link'}
        </Button>
      </div>
      {uploadError && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {uploadError}
        </p>
      )}
      {uploadOk && (
        <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800" role="status">
          {uploadOk}
        </p>
      )}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {images.map((img) => (
          <div key={img.id} className="rounded-lg border border-border p-2">
            <div className="flex aspect-square items-center justify-center bg-surface-alt p-2">
              <img
                src={getStoragePublicUrl('product-images', img.storage_path)}
                alt={img.alt_text ?? productName}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              {img.is_primary ? (
                <span className="font-medium text-brand">Primary</span>
              ) : (
                <button
                  type="button"
                  className="text-text-muted hover:text-brand"
                  onClick={() => setPrimary.mutate(img.id)}
                >
                  Set primary
                </button>
              )}
              <AdminDeleteButton
                confirmMessage="Remove this product photo?"
                onDelete={async () => {
                  await remove.mutateAsync(img)
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {images.length === 0 && !imagesLoadError && (
        <p className="mt-4 text-sm text-text-muted">No photos yet.</p>
      )}
    </AdminCard>
  )
}
