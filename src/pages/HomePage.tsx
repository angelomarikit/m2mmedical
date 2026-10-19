import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { PageMeta } from '@/components/seo/PageMeta'
import { organizationJsonLd } from '@/lib/organizationJsonLd'
import { useCompanyInfo } from '@/hooks/useSiteSettings'
import { ProductCard } from '@/components/products/ProductCard'
import { useRootCollections } from '@/hooks/useCollections'
import { useFeaturedProducts } from '@/hooks/useProducts'
import { usePartnersClients } from '@/hooks/usePartnersClients'
import { usePageSections, getSectionContent } from '@/hooks/usePageSections'
import { getStoragePublicUrl } from '@/lib/supabase'
import useEmblaCarousel from 'embla-carousel-react'
import { HeroBannerVisual } from '@/components/home/HeroBannerVisual'

export function HomePage() {
  const company = useCompanyInfo()
  const { data: sections } = usePageSections('home')
  const hero = getSectionContent(sections, 'hero', {
    heading: 'Medical Equipment & Healthcare Solutions',
    subheading: 'Quality Medical Products for Hospitals and Healthcare Professionals.',
    primaryCta: 'Browse Products',
    primaryHref: '/products',
    secondaryCta: 'Request Quotation',
    secondaryHref: '/products',
  })
  const { data: collections = [] } = useRootCollections()
  const { data: featured = [], isLoading } = useFeaturedProducts(8)
  const { data: partners = [] } = usePartnersClients('partner')
  const { data: clients = [] } = usePartnersClients('client')

  return (
    <>
      <PageMeta jsonLd={organizationJsonLd(company)} />
      <section className="border-b border-border bg-white">
        <Container className="grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">{company.tagline}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-text sm:text-4xl lg:text-5xl">
              {hero.heading}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-text-muted">{hero.subheading}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={hero.primaryHref} className="inline-flex h-11 items-center rounded-md bg-brand px-5 text-sm font-medium text-white hover:bg-brand-hover">
                {hero.primaryCta}
              </Link>
              <Link
                to={hero.secondaryHref}
                className="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-medium hover:border-brand hover:text-brand"
              >
                {hero.secondaryCta}
              </Link>
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <HeroBannerVisual />
          </div>
        </Container>
      </section>

      <section className="bg-surface-alt py-14">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-text">Shop by Collection</h2>
              <p className="mt-2 text-text-muted">Explore categories tailored for hospital and clinic needs.</p>
            </div>
            <Link to="/products" className="hidden text-sm font-medium text-brand hover:underline sm:block">
              View all
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(collections.length ? collections.slice(0, 8) : defaultCollections).map((c) => (
              <Link
                key={c.slug}
                to={`/collections/${c.slug}`}
                className="group rounded-lg border border-border bg-white p-5 transition-shadow hover:shadow-md"
              >
                <h3 className="font-semibold text-text group-hover:text-brand">{c.name}</h3>
                <p className="mt-2 text-sm text-brand">View collection →</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          <h2 className="text-2xl font-bold text-text">Featured Products</h2>
          {isLoading && <p className="mt-6 text-text-muted">Loading products…</p>}
          {!isLoading && featured.length === 0 && (
            <p className="mt-6 text-text-muted">
              Featured products will appear here once your catalog is published in Supabase.
            </p>
          )}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-border bg-surface-alt py-14">
        <Container className="grid gap-6 md:grid-cols-2">
          <Link
            to="/collections/disposable-accessories"
            className="rounded-lg bg-white p-8 shadow-sm transition hover:shadow-md"
          >
            <h3 className="text-xl font-bold">Disposable Accessories</h3>
            <p className="mt-2 text-text-muted">Single-use supplies for monitoring, respiratory, and clinical workflows.</p>
          </Link>
          <Link
            to="/collections/reusable-accessories"
            className="rounded-lg bg-white p-8 shadow-sm transition hover:shadow-md"
          >
            <h3 className="text-xl font-bold">Reusable Accessories</h3>
            <p className="mt-2 text-text-muted">Durable accessories designed for repeated hospital use.</p>
          </Link>
        </Container>
      </section>

      <section className="py-14">
        <Container className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">Our Biomedical Services</h2>
            <p className="mt-4 text-text-muted">
              M2M Biomedical Services offers medical equipment repairs and preventive maintenance through an
              experienced service team focused on timely, responsible support.
            </p>
            <Link to="/services" className="mt-6 inline-flex h-11 items-center rounded-md bg-brand px-5 text-sm font-medium text-white hover:bg-brand-hover">
              View Services
            </Link>
          </div>
          <div className="rounded-lg border border-border bg-surface-alt p-8">
            <ul className="space-y-3 text-sm text-text">
              <li>Equipment repairs</li>
              <li>Preventive maintenance inspections</li>
              <li>Service inquiries for hospitals and clinics</li>
            </ul>
          </div>
        </Container>
      </section>

      <section className="bg-surface-dark py-14 text-white">
        <Container className="max-w-3xl">
          <h2 className="text-2xl font-bold">About M2M</h2>
          <p className="mt-4 leading-relaxed text-white/80">
            M2M Medical Trading was founded on July 21, 2009 as a provider of reusable accessories of medical
            equipment of any brand. The company was incorporated on April 4, 2016. We provide quality medical
            equipment, accessories, and supplies for hospitals and clinics across the Philippines.
          </p>
          <Link to="/about" className="mt-6 inline-block font-medium text-brand hover:underline">
            Learn more about us
          </Link>
        </Container>
      </section>

      {partners.length > 0 && <LogoSection title="Our Business Partners" items={partners} bucket="partner-client-logos" />}
      {clients.length > 0 && <LogoSection title="Our Clients" items={clients} bucket="partner-client-logos" />}

      <section className="py-14">
        <Container className="rounded-xl border border-border bg-surface-alt px-8 py-10 text-center">
          <h2 className="text-2xl font-bold">Ready to request a quotation?</h2>
          <p className="mx-auto mt-3 max-w-lg text-text-muted">
            Browse our catalog or contact our team for product information and hospital pricing.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/products" className="inline-flex h-11 items-center rounded-md bg-brand px-5 text-sm font-medium text-white hover:bg-brand-hover">
              Browse Products
            </Link>
            <Link to="/contact" className="inline-flex h-11 items-center rounded-md border border-border bg-white px-5 text-sm font-medium">
              Contact Us
            </Link>
          </div>
        </Container>
      </section>
    </>
  )
}

function LogoSection({
  title,
  items,
  bucket,
}: {
  title: string
  items: { id: string; name: string; logo_path: string | null }[]
  bucket: string
}) {
  const [emblaRef] = useEmblaCarousel({ align: 'start', dragFree: true })
  return (
    <section className="border-t border-border py-12">
      <Container>
        <h2 className="text-center text-xl font-bold">{title}</h2>
        <div className="mt-8 overflow-hidden" ref={emblaRef}>
          <div className="flex gap-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex h-20 min-w-[140px] flex-[0_0_auto] items-center justify-center rounded-md border border-border bg-white px-4"
              >
                {item.logo_path ? (
                  <img
                    src={getStoragePublicUrl(bucket, item.logo_path)}
                    alt={item.name}
                    className="max-h-12 max-w-[120px] object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-xs text-text-muted">{item.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

const defaultCollections = [
  { slug: 'medical-accessories', name: 'Medical Accessories' },
  { slug: 'patient-monitoring-cardiology', name: 'Patient Monitoring & Cardiology' },
  { slug: 'infant-care', name: 'Infant Care' },
  { slug: 'radiology-imaging', name: 'Radiology & Imaging' },
]
