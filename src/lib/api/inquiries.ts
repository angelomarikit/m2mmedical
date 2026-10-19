import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type { ProductInquiryForm } from '@/lib/inquirySchemas'
import type { z } from 'zod'
import type { contactSchema, serviceInquirySchema } from '@/lib/inquirySchemas'

export async function submitProductInquiry(payload: ProductInquiryForm) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.')
  }
  const { data, error } = await supabase.functions.invoke('submit-product-inquiry', {
    body: payload,
  })
  if (error) throw error
  return data as { public_reference: string }
}

export async function submitContact(payload: z.infer<typeof contactSchema>) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.functions.invoke('submit-contact', { body: payload })
  if (error) throw error
  return data as { id: string }
}

export async function submitServiceInquiry(payload: z.infer<typeof serviceInquirySchema>) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.functions.invoke('submit-service-inquiry', { body: payload })
  if (error) throw error
  return data as { id: string }
}
