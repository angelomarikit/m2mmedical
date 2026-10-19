import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Container } from '@/components/ui/Container'
import { PageMeta } from '@/components/seo/PageMeta'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { serviceInquirySchema } from '@/lib/inquirySchemas'
import { submitServiceInquiry } from '@/lib/api/inquiries'
import { useState } from 'react'
import { useCompanyInfo } from '@/hooks/useSiteSettings'
import type { z } from 'zod'

type ServiceForm = z.infer<typeof serviceInquirySchema>

export function ServicesPage() {
  const company = useCompanyInfo()
  const [done, setDone] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ServiceForm>({
    resolver: zodResolver(serviceInquirySchema),
    defaultValues: { requested_service: 'repair', preferred_contact: 'email' },
  })

  return (
    <>
      <PageMeta
        title="Biomedical Services"
        description="Medical equipment repairs and preventive maintenance from M2M Biomedical Services."
        path="/services"
      />
      <section className="border-b border-border bg-surface-alt py-14">
        <Container className="max-w-3xl">
          <h1 className="text-4xl font-bold">Biomedical Services</h1>
          <p className="mt-4 text-lg text-text-muted">
            Responsible pricing and service intended to improve patient care — repairs and preventive maintenance
            for a wide variety of medical equipment.
          </p>
          <a href={company.biomedUrl} className="mt-4 inline-block text-sm text-brand hover:underline" target="_blank" rel="noopener noreferrer">
            {company.biomedUrl}
          </a>
        </Container>
      </section>
      <Container className="grid gap-12 py-14 lg:grid-cols-2">
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold">Equipment repairs</h2>
            <p className="mt-3 text-text-muted">
              M2M Biomedical Services offers medical equipment repairs performed by experienced technicians focused
              on timely support for hospitals and clinics.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold">Preventive maintenance</h2>
            <p className="mt-3 text-text-muted">
              Inspections and preventive maintenance for a wide variety of medical equipment through our service team.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold">Service process</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-text-muted">
              <li>Submit a service inquiry with equipment details</li>
              <li>Our team reviews requirements and contacts you</li>
              <li>Scheduling of assessment, repair, or maintenance</li>
            </ol>
          </section>
        </div>
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Service inquiry</h2>
          {done ? (
            <p className="mt-4 text-sm text-text-muted">Thank you. Our biomedical services team will contact you.</p>
          ) : (
            <form
              className="mt-6 space-y-4"
              onSubmit={handleSubmit(async (data) => {
                setErr(null)
                try {
                  await submitServiceInquiry(data)
                  setDone(true)
                } catch (e) {
                  setErr(e instanceof Error ? e.message : 'Failed to submit')
                }
              })}
            >
              <input type="text" className="hidden" tabIndex={-1} {...register('website')} />
              <Input placeholder="Full name *" {...register('full_name')} />
              <Input placeholder="Organization *" {...register('company_name')} />
              <Input type="email" placeholder="Email *" {...register('email')} />
              <Input placeholder="Phone *" {...register('phone')} />
              <Input placeholder="Equipment type *" {...register('equipment_type')} />
              <Input placeholder="Brand / model" {...register('equipment_model')} />
              <select className="h-11 w-full rounded-md border border-border px-3 text-sm" {...register('requested_service')}>
                <option value="repair">Repair</option>
                <option value="preventive_maintenance">Preventive maintenance</option>
                <option value="other">Other</option>
              </select>
              <Textarea placeholder="Issue description *" {...register('issue_description')} />
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1" {...register('privacy_consent')} />
                Privacy consent *
              </label>
              {errors.privacy_consent && <p className="text-xs text-brand">{errors.privacy_consent.message}</p>}
              {err && <p className="text-sm text-brand">{err}</p>}
              <Button type="submit" disabled={isSubmitting} className="w-full">
                Submit service inquiry
              </Button>
            </form>
          )}
        </div>
      </Container>
    </>
  )
}
