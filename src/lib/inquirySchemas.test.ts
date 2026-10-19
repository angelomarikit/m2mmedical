import { describe, expect, it } from 'vitest'
import { productInquirySchema, contactSchema } from './inquirySchemas'

describe('productInquirySchema', () => {
  it('accepts valid payload', () => {
    const result = productInquirySchema.safeParse({
      full_name: 'Jane Doe',
      company_name: 'Sample Hospital',
      email: 'jane@hospital.ph',
      phone: '+639171234567',
      inquiry_type: 'quotation',
      privacy_consent: true,
      items: [
        {
          product_id: '550e8400-e29b-41d4-a716-446655440000',
          product_name_snapshot: 'Life Scope G5',
          model_snapshot: 'G5',
          quantity: 2,
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rejects honeypot field when filled', () => {
    const result = productInquirySchema.safeParse({
      full_name: 'Jane',
      company_name: 'Hospital',
      email: 'a@b.co',
      phone: '1234567',
      inquiry_type: 'quotation',
      privacy_consent: true,
      website: 'spam',
      items: [
        {
          product_id: '550e8400-e29b-41d4-a716-446655440000',
          product_name_snapshot: 'X',
          model_snapshot: null,
          quantity: 1,
        },
      ],
    })
    expect(result.success).toBe(false)
  })
})

describe('contactSchema', () => {
  it('requires privacy consent', () => {
    const result = contactSchema.safeParse({
      full_name: 'A',
      company_name: 'B',
      email: 'a@b.co',
      phone: '1234567890',
      subject: 'Hi',
      message: 'Hello world test',
      privacy_consent: false,
    })
    expect(result.success).toBe(false)
  })
})
