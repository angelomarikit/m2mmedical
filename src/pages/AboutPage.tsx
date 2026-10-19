import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { PageMeta } from '@/components/seo/PageMeta'
import { useCompanyInfo } from '@/hooks/useSiteSettings'
import { usePartnersClients } from '@/hooks/usePartnersClients'
import { getStoragePublicUrl } from '@/lib/supabase'

const values = ['Loyalty', 'Integrity', 'Humility', 'Family Oriented']

export function AboutPage() {
  const company = useCompanyInfo()
  const { data: partners = [] } = usePartnersClients('partner')
  const { data: clients = [] } = usePartnersClients('client')

  return (
    <>
      <PageMeta title="About Us" path="/about" />
      <section className="border-b border-border bg-surface-alt py-14">
        <Container className="max-w-3xl">
          <h1 className="text-4xl font-bold">About {company.name}</h1>
          <p className="mt-4 text-lg text-text-muted">{company.tagline}</p>
        </Container>
      </section>
      <Container className="max-w-3xl py-14 space-y-12">
        <section>
          <h2 className="text-2xl font-bold">Our story</h2>
          <p className="mt-4 leading-relaxed text-text-muted">
            M2M Medical Trading was founded on July 21, 2009 as a provider of reusable accessories of medical
            equipment of any brand. The company was incorporated on April 4, 2016. Today, {company.name}{' '}
            provides quality medical equipment, accessories, reusable healthcare products, and disposable supplies
            for hospitals and clinics, working with evaluated business partners to deliver products competitive in
            quality and price.
          </p>
        </section>
        <section className="grid gap-8 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-6">
            <h3 className="font-bold text-brand">Mission</h3>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              To help the Filipino people by providing quality and economical medical equipment and accessories to
              the hospital healthcare partners who use them effectively and equitably as possible through our
              dedicated and passionate employees.
            </p>
          </div>
          <div className="rounded-lg border border-border p-6">
            <h3 className="font-bold text-brand">Vision</h3>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              To be the first choice of hospital clients in providing their healthcare needs, be it medical
              equipment or accessories.
            </p>
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-bold">Core values</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {values.map((v) => (
              <li key={v} className="border-l-2 border-brand pl-4 font-medium">
                {v}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-bold">Milestones</h2>
          <ul className="mt-6 space-y-4 border-l border-border pl-6">
            <li>
              <span className="font-semibold">2009</span>
              <p className="text-sm text-text-muted">Company founded — July 21, 2009</p>
            </li>
            <li>
              <span className="font-semibold">2016</span>
              <p className="text-sm text-text-muted">Incorporated — April 4, 2016</p>
            </li>
          </ul>
        </section>
        {partners.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold">Business partners</h2>
            <div className="mt-6 flex flex-wrap gap-4">
              {partners.map((p) => (
                <div key={p.id} className="flex h-20 w-36 items-center justify-center rounded-md border border-border bg-white p-3">
                  {p.logo_path && (
                    <img src={getStoragePublicUrl('partner-client-logos', p.logo_path)} alt={p.name} className="max-h-12 max-w-full object-contain" />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        {clients.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold">Clients</h2>
            <div className="mt-6 flex flex-wrap gap-4">
              {clients.map((c) => (
                <div key={c.id} className="flex h-20 w-36 items-center justify-center rounded-md border border-border bg-white p-3">
                  {c.logo_path && (
                    <img src={getStoragePublicUrl('partner-client-logos', c.logo_path)} alt={c.name} className="max-h-12 max-w-full object-contain" />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        <Link to="/contact" className="inline-flex h-11 items-center rounded-md bg-brand px-5 text-sm font-medium text-white hover:bg-brand-hover">
          Contact our team
        </Link>
      </Container>
    </>
  )
}
