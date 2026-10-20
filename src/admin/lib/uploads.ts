import { supabase } from '@/lib/supabase'

function safeFilename(name: string) {
  return name.replace(/[^\w.-]+/g, '-').toLowerCase()
}

function storageErrorMessage(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('bucket not found')) {
    return 'Bucket “product-images” missing — run docs/FIX_PRODUCT_PHOTO_UPLOAD.sql in Supabase SQL Editor.'
  }
  if (lower.includes('row-level security') || lower.includes('policy') || lower.includes('denied')) {
    return 'Permission denied — run docs/FIX_PRODUCT_PHOTO_UPLOAD.sql in Supabase SQL Editor, then try again while logged into admin.'
  }
  return message
}

async function uploadToBucket(bucket: string, path: string, file: File) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type || 'application/octet-stream',
  })
  if (error) throw new Error(storageErrorMessage(error.message))
}

export async function uploadProductImageFile(productId: string, file: File) {
  const path = `${productId}/${Date.now()}-${safeFilename(file.name)}`
  await uploadToBucket('product-images', path, file)
  return path
}

export async function deleteProductImageFile(storagePath: string) {
  if (!storagePath) return
  const { error } = await supabase.storage.from('product-images').remove([storagePath])
  if (error) throw new Error(storageErrorMessage(error.message))
}

export async function uploadWebsiteAssetFile(file: File, fixedName?: string) {
  const finalPath = fixedName ?? `uploads/${Date.now()}-${safeFilename(file.name)}`
  await uploadToBucket('website-assets', finalPath, file)
  return finalPath
}
