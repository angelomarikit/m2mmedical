import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Container } from '@/components/ui/Container'
import { PageMeta } from '@/components/seo/PageMeta'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { contactSchema } from '@/lib/inquirySchemas'
import { submitContact } from '@/lib/api/inquiries'
import { useCompanyInfo } from '@/hooks/useSiteSettings'
import { useState } from 'react'
import type { z } from 'zod'

type ContactForm = z.infer<typeof contactSchema>

export function ContactPage() {
  const company = useCompanyInfo()
  const [done, setDone] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  })

  const mapsQuery = encodeURIComponent(company.addressLines.join(', '))

  return (
    <>
      <PageMeta title="Contact Us" path="/contact" />
      <Container className="py-12 lg:py-16">
        <h1 className="text-4xl font-bold">Contact Us</h1>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="space-y-6 text-sm">
            <div>
              <h2 className="font-semibold text-text">{company.name}</h2>
            </div>
            <div>
              <p className="font-medium">Phone</p>
              <a href={`tel:${company.phoneTel}`} className="text-brand hover:underline">
                {company.phone}
              </a>
            </div>
            <div>
              <p className="font-medium">Email</p>
              <a href={`mailto:${company.email}`} className="text-brand hover:underline">
                {company.email}
              </a>
            </div>
            <div>
              <p className="font-medium">Address</p>
              {company.addressLines.map((l) => (
                <p key={l} className="text-text-muted">
                  {l}
                </p>
              ))}
            </div>
            <div>
              <p className="font-medium">Website</p>
              <a href={company.website} className="text-brand hover:underline" target="_blank" rel="noopener noreferrer">
                {company.website}
              </a>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-medium text-brand hover:underline"
            >
              Open in Google Maps
            </a>
          </div>
          <div className="rounded-xl border border-border p-6">
            <h2 className="text-lg font-bold">Send a message</h2>
            {done ? (
              <p className="mt-4 text-sm text-text-muted">Thank you for contacting us. We will respond shortly.</p>
            ) : (
              <form
                className="mt-6 space-y-4"
                onSubmit={handleSubmit(async (data) => {
                  setErr(null)
                  try {
                    await submitContact(data)
                    setDone(true)
                  } catch (e) {
                    setErr(e instanceof Error ? e.message : 'Failed to send')
                  }
                })}
              >
                <input type="text" className="hidden" tabIndex={-1} {...register('website')} />
                <Input placeholder="Full name *" {...register('full_name')} />
                <Input placeholder="Company *" {...register('company_name')} />
                <Input type="email" placeholder="Email *" {...register('email')} />
                <Input placeholder="Phone *" {...register('phone')} />
                <Input placeholder="Subject *" {...register('subject')} />
                <Textarea placeholder="Message *" {...register('message')} />
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-1" {...register('privacy_consent')} />
                  Privacy consent *
                </label>
                {errors.privacy_consent && <p className="text-xs text-brand">{errors.privacy_consent.message}</p>}
                {err && <p className="text-sm text-brand">{err}</p>}
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  Send message
                </Button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </>
  )
}
