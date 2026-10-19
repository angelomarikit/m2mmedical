import { z } from 'zod'

export const inquiryItemSchema = z.object({
  product_id: z.string().uuid(),
  product_name_snapshot: z.string().min(1).max(500),
  model_snapshot: z.string().max(200).nullable(),
  quantity: z.number().int().min(1).max(9999),
})

export const productInquirySchema = z.object({
  full_name: z.string().min(2).max(200),
  company_name: z.string().min(2).max(300),
  email: z.string().email().max(320),
  phone: z.string().min(7).max(40),
  location: z.string().max(300).optional(),
  inquiry_type: z.enum(['quotation', 'product_information', 'bulk_order', 'availability']),
  message: z.string().max(5000).optional(),
  requested_delivery_date: z.string().optional(),
  privacy_consent: z.boolean().refine((v) => v === true, { message: 'Privacy consent is required' }),
  website: z.string().max(0).optional(),
  items: z.array(inquiryItemSchema).min(1),
})

export type ProductInquiryForm = z.infer<typeof productInquirySchema>

export const contactSchema = z.object({
  full_name: z.string().min(2).max(200),
  company_name: z.string().min(2).max(300),
  email: z.string().email().max(320),
  phone: z.string().min(7).max(40),
  subject: z.string().min(2).max(300),
  message: z.string().min(10).max(5000),
  privacy_consent: z.boolean().refine((v) => v === true, { message: 'Privacy consent is required' }),
  website: z.string().max(0).optional(),
})

export const serviceInquirySchema = z.object({
  full_name: z.string().min(2).max(200),
  company_name: z.string().min(2).max(300),
  email: z.string().email().max(320),
  phone: z.string().min(7).max(40),
  equipment_type: z.string().min(2).max(300),
  equipment_model: z.string().max(300).optional(),
  requested_service: z.enum(['repair', 'preventive_maintenance', 'other']),
  issue_description: z.string().min(10).max(5000),
  preferred_contact: z.enum(['email', 'phone']).optional(),
  privacy_consent: z.boolean().refine((v) => v === true, { message: 'Privacy consent is required' }),
  website: z.string().max(0).optional(),
})
