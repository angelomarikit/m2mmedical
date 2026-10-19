import { Container } from '@/components/ui/Container'
import { PageMeta } from '@/components/seo/PageMeta'
import { useCompanyInfo } from '@/hooks/useSiteSettings'

export function PrivacyPage() {
  const company = useCompanyInfo()
  return (
    <>
      <PageMeta title="Privacy Policy" path="/privacy" />
      <Container className="max-w-3xl py-14 prose prose-neutral">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-4 text-text-muted">
          {company.name} respects your privacy. This policy describes how we collect and use information submitted
          through our website inquiry and contact forms.
        </p>
        <h2 className="mt-8 text-xl font-bold">Information we collect</h2>
        <p className="text-text-muted">
          When you request a quotation, contact us, or submit a service inquiry, we collect the details you provide
          such as your name, organization, email, phone number, and message content. We do not request clinical
          patient data, government IDs, or payment card information through this website.
        </p>
        <h2 className="mt-8 text-xl font-bold">How we use information</h2>
        <p className="text-text-muted">
          We use submitted information to respond to product, quotation, and service requests and to communicate with
          hospital and clinic representatives about {company.name} products and services.
        </p>
        <h2 className="mt-8 text-xl font-bold">Contact</h2>
        <p className="text-text-muted">
          Questions about this policy may be sent to{' '}
          <a href={`mailto:${company.email}`} className="text-brand">
            {company.email}
          </a>
          .
        </p>
      </Container>
    </>
  )
}
