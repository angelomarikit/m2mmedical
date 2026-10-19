import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { productInquirySchema, type ProductInquiryForm } from '@/lib/inquirySchemas'
import { submitProductInquiry } from '@/lib/api/inquiries'
import { useState } from 'react'
import type { Product } from '@/types/database'

interface ProductInquiryModalProps {
  open: boolean
  onClose: () => void
  product: Product
}

export function ProductInquiryModal({ open, onClose, product }: ProductInquiryModalProps) {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductInquiryForm>({
    resolver: zodResolver(productInquirySchema),
    defaultValues: {
      inquiry_type: 'quotation',
      privacy_consent: undefined,
      items: [
        {
          product_id: product.id,
          product_name_snapshot: product.name,
          model_snapshot: product.model_number,
          quantity: 1,
        },
      ],
    },
  })

  const onSubmit = async (data: ProductInquiryForm) => {
    setSubmitError(null)
    try {
      const result = await submitProductInquiry(data)
      onClose()
      navigate(`/inquiry/success?ref=${encodeURIComponent(result.public_reference)}`)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Submission failed. Please try again.')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Request Quotation">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register('website')} />
        <div className="rounded-md bg-surface-alt p-3 text-sm">
          <p className="font-medium text-text">{product.name}</p>
          {product.model_number && <p className="text-text-muted">Model: {product.model_number}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Full name *</label>
            <Input {...register('full_name')} />
            {errors.full_name && <p className="mt-1 text-xs text-brand">{errors.full_name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Hospital / Company *</label>
            <Input {...register('company_name')} />
            {errors.company_name && <p className="mt-1 text-xs text-brand">{errors.company_name.message}</p>}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Email *</label>
            <Input type="email" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-brand">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Contact number *</label>
            <Input {...register('phone')} />
            {errors.phone && <p className="mt-1 text-xs text-brand">{errors.phone.message}</p>}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Location (optional)</label>
          <Input {...register('location')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Inquiry type</label>
            <select
              className="flex h-11 w-full rounded-md border border-border px-3 text-sm"
              {...register('inquiry_type')}
            >
              <option value="quotation">Quotation</option>
              <option value="product_information">Product Information</option>
              <option value="bulk_order">Bulk Order</option>
              <option value="availability">Availability</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Quantity *</label>
            <Input
              type="number"
              min={1}
              {...register('items.0.quantity', { valueAsNumber: true })}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Message</label>
          <Textarea {...register('message')} rows={4} />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" {...register('privacy_consent')} />
          <span>I agree to the processing of my information for this inquiry. *</span>
        </label>
        {errors.privacy_consent && <p className="text-xs text-brand">{errors.privacy_consent.message}</p>}
        {submitError && <p className="text-sm text-brand">{submitError}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting…' : 'Submit inquiry'}
        </Button>
      </form>
    </Modal>
  )
}
