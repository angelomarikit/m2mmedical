import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)

export const isSupabaseConfigured = Boolean(url && key)

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(url!, key!)
  : (createClient('https://placeholder.supabase.co', 'placeholder-key') as SupabaseClient)

export function getStoragePublicUrl(bucket: string, path: string): string {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('/')) return path
  if (!isSupabaseConfigured) {
    return `/catalog/${bucket}/${path}`
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
