import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export type StaffUploadBucket =
  | 'product-images'
  | 'website-assets'
  | 'brand-logos'
  | 'partner-client-logos'
  | 'product-documents'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Could not read file'))
        return
      }
      const base64 = result.includes(',') ? result.split(',')[1]! : result
      resolve(base64)
    }
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

function formatUploadError(data: unknown, fallback: string): string {
  if (data && typeof data === 'object' && 'error' in data && data.error) {
    return String(data.error)
  }
  return fallback
}

export async function staffUploadFile(bucket: StaffUploadBucket, path: string, file: File) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.')
  }
  const file_base64 = await fileToBase64(file)
  const { data, error } = await supabase.functions.invoke('staff-upload', {
    body: {
      action: 'upload',
      bucket,
      path,
      file_base64,
      content_type: file.type || 'application/octet-stream',
    },
  })
  if (error) throw error
  if (data?.error) throw new Error(formatUploadError(data, 'Upload failed'))
  return data as { ok: true; path: string; public_url: string }
}

export async function staffDeleteStorageObject(bucket: StaffUploadBucket, path: string) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.functions.invoke('staff-upload', {
    body: { action: 'delete', bucket, path },
  })
  if (error) throw error
  if (data?.error) throw new Error(formatUploadError(data, 'Delete failed'))
}
