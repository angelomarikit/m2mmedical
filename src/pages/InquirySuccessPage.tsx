import { Link, useSearchParams } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { PageMeta } from '@/components/seo/PageMeta'

export function InquirySuccessPage() {
  const [params] = useSearchParams()
  const ref = params.get('ref')

  return (
    <>
      <PageMeta title="Inquiry Received" path="/inquiry/success" noIndex />
      <Container className="max-w-lg py-20 text-center">
        <h1 className="text-3xl font-bold">Thank you</h1>
        <p className="mt-4 text-text-muted">
          Your inquiry has been received. Our team will review your request and contact you.
        </p>
        {ref && (
          <p className="mt-6 rounded-lg bg-surface-alt px-4 py-3 font-mono text-sm">
            Reference: <strong>{ref}</strong>
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/products" className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-medium text-white">
            Continue browsing
          </Link>
          <Link to="/contact" className="inline-flex h-11 items-center justify-center rounded-md border border-border px-5 text-sm font-medium">
            Contact us
          </Link>
        </div>
      </Container>
    </>
  )
}
