import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { useRootCollections } from '@/hooks/useCollections'
import { useCompanyInfo, useLogoUrl } from '@/hooks/useSiteSettings'

export function Footer() {
  const company = useCompanyInfo()
  const logoUrl = useLogoUrl()
  const { data: collections = [] } = useRootCollections()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-surface-dark text-white">
      <Container className="py-14 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <img
              src={logoUrl}
              alt={company.name}
              className="h-20 w-auto max-w-[280px] object-contain sm:h-24 sm:max-w-[320px]"
            />
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              {company.name} provides quality medical equipment, accessories, reusable healthcare
              products, and disposable supplies for hospitals and clinics.
            </p>
            <p className="mt-2 text-sm font-medium text-brand">&ldquo;{company.tagline}&rdquo;</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">Quick links</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li><Link to="/products" className="hover:text-white">Products</Link></li>
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/services" className="hover:text-white">Biomedical Services</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">Collections</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              {collections.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link to={`/collections/${c.slug}`} className="hover:text-white">
                    {c.name}
                  </Link>
                </li>
              ))}
              {collections.length === 0 && (
                <li><Link to="/products" className="hover:text-white">Browse catalog</Link></li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li>
                <a href={`tel:${company.phoneTel}`} className="hover:text-white">
                  {company.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.email}`} className="hover:text-white">
                  {company.email}
                </a>
              </li>
              <li>
                {company.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-8 text-sm text-white/60 sm:flex-row sm:justify-between">
          <p>&copy; {year} {company.name}. All rights reserved.</p>
          <p>
            <a href={company.website} className="hover:text-white" target="_blank" rel="noopener noreferrer">
              {company.website.replace('https://', '')}
            </a>
          </p>
        </div>
      </Container>
    </footer>
  )
}
