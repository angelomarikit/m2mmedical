import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { PageMeta } from '@/components/seo/PageMeta'

export function NotFoundPage() {
  return (
    <>
      <PageMeta title="Page Not Found" noIndex />
      <Container className="py-24 text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-4 text-text-muted">The page you are looking for could not be found.</p>
        <Link to="/" className="mt-8 inline-block text-brand hover:underline">
          Return home
        </Link>
      </Container>
    </>
  )
}
