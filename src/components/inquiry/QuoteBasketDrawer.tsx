import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuoteBasket } from '@/stores/quoteBasket'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { getStoragePublicUrl } from '@/lib/supabase'
import { productInquirySchema, type ProductInquiryForm } from '@/lib/inquirySchemas'
import { submitProductInquiry } from '@/lib/api/inquiries'

export function QuoteBasketDrawer() {
  const [open, setOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const items = useQuoteBasket((s) => s.items)
  const removeItem = useQuoteBasket((s) => s.removeItem)
  const setQuantity = useQuoteBasket((s) => s.setQuantity)
  const clear = useQuoteBasket((s) => s.clear)
  const totalCount = useQuoteBasket((s) => s.totalCount())
  const navigate = useNavigate()

  if (totalCount === 0 && !open) return null

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
        <Button
          size="lg"
          className="shadow-lg"
          onClick={() => setOpen(true)}
          aria-label="Open quote basket"
        >
          <ShoppingBag className="h-5 w-5" />
          Quote ({totalCount})
        </Button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Quote basket" className="max-w-xl">
        {items.length === 0 ? (
          <p className="text-sm text-text-muted">Your quote basket is empty.</p>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-3 border-b border-border pb-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-surface-alt p-1">
                  <img
                    src={
                      item.imagePath
                        ? getStoragePublicUrl('product-images', item.imagePath)
                        : '/placeholder-product.svg'
                    }
                    alt=""
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text">{item.name}</p>
                  {item.modelNumber && <p className="text-xs text-text-muted">{item.modelNumber}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      className="h-9 w-20"
                      value={item.quantity}
                      onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                    />
                    <button
                      type="button"
                      className="text-sm text-brand hover:underline"
                      onClick={() => removeItem(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {items.length > 0 && (
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={clear}>
              Clear
            </Button>
            <Button className="flex-1" onClick={() => { setOpen(false); setCheckoutOpen(true) }}>
              Submit quote request
            </Button>
          </div>
        )}
      </Modal>

      <BasketCheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={(ref) => {
          clear()
          setCheckoutOpen(false)
          navigate(`/inquiry/success?ref=${encodeURIComponent(ref)}`)
        }}
      />
    </>
  )
}

function BasketCheckoutModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: (ref: string) => void
}) {
  const items = useQuoteBasket((s) => s.items)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ProductInquiryForm>({
    resolver: zodResolver(productInquirySchema),
    defaultValues: {
      inquiry_type: 'quotation',
      privacy_consent: undefined,
      items: items.map((i) => ({
        product_id: i.productId,
        product_name_snapshot: i.name,
        model_snapshot: i.modelNumber,
        quantity: i.quantity,
      })),
    },
  })

  return (
    <Modal open={open} onClose={onClose} title="Submit quote request">
      <form
        onSubmit={handleSubmit(async (data) => {
          setError(null)
          try {
            const res = await submitProductInquiry({
              ...data,
              items: items.map((i) => ({
                product_id: i.productId,
                product_name_snapshot: i.name,
                model_snapshot: i.modelNumber,
                quantity: i.quantity,
              })),
            })
            onSuccess(res.public_reference)
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Submission failed')
          }
        })}
        className="space-y-3"
      >
        <input type="text" className="hidden" tabIndex={-1} {...register('website')} />
        <p className="text-sm text-text-muted">{items.length} product(s) in this request.</p>
        <Input placeholder="Full name *" {...register('full_name')} />
        {errors.full_name && <p className="text-xs text-brand">{errors.full_name.message}</p>}
        <Input placeholder="Hospital / Company *" {...register('company_name')} />
        <Input type="email" placeholder="Email *" {...register('email')} />
        <Input placeholder="Phone *" {...register('phone')} />
        <Textarea placeholder="Additional requirements" {...register('message')} rows={3} />
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" {...register('privacy_consent')} />
          Privacy consent *
        </label>
        {error && <p className="text-sm text-brand">{error}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Submit'}
        </Button>
      </form>
    </Modal>
  )
}
