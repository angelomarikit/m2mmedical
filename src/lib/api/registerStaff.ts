import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export async function registerStaffAccount(payload: {
  email: string
  password: string
  full_name: string
}) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.')
  }
  const { data, error } = await supabase.functions.invoke('register-staff', { body: payload })
  if (error) throw error
  if (data?.error) throw new Error(String(data.error))
  return data as { ok: boolean; message: string }
}
