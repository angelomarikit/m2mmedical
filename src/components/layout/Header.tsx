import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, Search, ShoppingBag, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { useQuoteBasket } from '@/stores/quoteBasket'
import { useRootCollections } from '@/hooks/useCollections'
import { useCompanyInfo, useLogoUrl } from '@/hooks/useSiteSettings'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm font-medium transition-colors hover:text-brand',
    isActive ? 'text-brand' : 'text-text',
  )

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const basketCount = useQuoteBasket((s) => s.totalCount())
  const { data: collections = [] } = useRootCollections()
  const company = useCompanyInfo()
  const logoUrl = useLogoUrl()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-transparent bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90',
        scrolled && 'border-border shadow-sm',
      )}
    >
      <Container>
        <div className="flex min-h-[5.75rem] items-center justify-between gap-3 py-2 sm:min-h-[6.5rem] lg:min-h-[7.25rem] lg:gap-4 lg:py-3">
          <Link to="/" className="shrink-0 py-1" aria-label={`${company.name} home`}>
            <img
              src={logoUrl}
              alt={company.name}
              className="h-[3.75rem] w-auto max-w-[min(16rem,52vw)] object-contain object-left sm:h-[4.5rem] sm:max-w-[19rem] lg:h-[5.75rem] lg:max-w-[22rem]"
            />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            <div
              className="relative"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <NavLink to="/products" className={navLinkClass}>
                Products
              </NavLink>
              <AnimatePresence>
                {megaOpen && collections.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 top-full z-50 mt-2 w-[min(90vw,36rem)] -translate-x-1/2 rounded-lg border border-border bg-white p-4 shadow-lg"
                  >
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Shop by collection
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {collections.slice(0, 8).map((c) => (
                        <Link
                          key={c.id}
                          to={`/collections/${c.slug}`}
                          className="rounded-md px-3 py-2 text-sm text-text hover:bg-surface-alt hover:text-brand"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </div>
                    <Link
                      to="/products"
                      className="mt-3 block text-sm font-medium text-brand hover:underline"
                    >
                      View all products
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <NavLink to="/about" className={navLinkClass}>
              About Us
            </NavLink>
            <NavLink to="/services" className={navLinkClass}>
              Biomedical Services
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              Contact
            </NavLink>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              className="rounded-md p-2 text-text hover:bg-surface-alt lg:hidden"
              aria-label="Search products"
              onClick={() => navigate('/products')}
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="hidden rounded-md p-2 text-text hover:bg-surface-alt lg:inline-flex"
              aria-label="Search products"
              onClick={() => navigate('/products?q=')}
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              to="/products"
              className="relative rounded-md p-2 text-text hover:bg-surface-alt"
              aria-label={`Quote basket, ${basketCount} items`}
            >
              <ShoppingBag className="h-5 w-5" />
              {basketCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                  {basketCount > 99 ? '99+' : basketCount}
                </span>
              )}
            </Link>
            <Button
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => navigate('/products')}
            >
              Request Quotation
            </Button>
            <button
              type="button"
              className="rounded-md p-2 text-text hover:bg-surface-alt lg:hidden"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </Container>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border bg-white lg:hidden"
          >
            <Container className="space-y-1 py-4">
              {[
                ['/', 'Home'],
                ['/products', 'Products'],
                ['/about', 'About Us'],
                ['/services', 'Biomedical Services'],
                ['/contact', 'Contact'],
              ].map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  className="block rounded-md px-3 py-3 text-base font-medium text-text hover:bg-surface-alt"
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              ))}
              {collections.length > 0 && (
                <div className="border-t border-border pt-3">
                  <p className="px-3 pb-2 text-xs font-semibold uppercase text-text-muted">
                    Collections
                  </p>
                  {collections.map((c) => (
                    <Link
                      key={c.id}
                      to={`/collections/${c.slug}`}
                      className="block rounded-md px-3 py-2 text-sm text-text-muted hover:bg-surface-alt hover:text-brand"
                      onClick={() => setMobileOpen(false)}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
              <Button className="mt-4 w-full" onClick={() => { setMobileOpen(false); navigate('/products') }}>
                Request Quotation
              </Button>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
