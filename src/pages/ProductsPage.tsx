import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { PageMeta } from '@/components/seo/PageMeta'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { ProductCard } from '@/components/products/ProductCard'
import { useProducts } from '@/hooks/useProducts'
import { useCollections } from '@/hooks/useCollections'
import { SlidersHorizontal } from 'lucide-react'

export function ProductsPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const collectionSlug = params.get('collection') ?? undefined
  const productType = params.get('type') ?? undefined
  const sort = (params.get('sort') as 'name' | 'newest' | 'featured') ?? 'name'
  const [mobileFilters, setMobileFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(q)
  const [page, setPage] = useState(1)

  const filters = useMemo(
    () => ({ q, collectionSlug, productType, sort, page, pageSize: 24 }),
    [q, collectionSlug, productType, sort, page],
  )
  const { data, isLoading, isError } = useProducts(filters)
  const { data: collections = [] } = useCollections()

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
    setPage(1)
  }

  const sidebar = (
    <aside className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase text-text-muted">Collection</h3>
        <ul className="mt-2 space-y-1 text-sm">
          <li>
            <button type="button" className={!collectionSlug ? 'text-brand' : 'hover:text-brand'} onClick={() => updateParam('collection', null)}>
              All collections
            </button>
          </li>
          {collections.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={collectionSlug === c.slug ? 'text-brand' : 'hover:text-brand'}
                onClick={() => updateParam('collection', c.slug)}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold uppercase text-text-muted">Product type</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {[
            ['', 'All types'],
            ['disposable', 'Disposable'],
            ['reusable', 'Reusable'],
            ['equipment', 'Equipment'],
          ].map(([val, label]) => (
            <li key={label}>
              <button
                type="button"
                className={productType === val || (!productType && !val) ? 'text-brand' : 'hover:text-brand'}
                onClick={() => updateParam('type', val || null)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )

  return (
    <>
      <PageMeta title="Products" path="/products" />
      <Container className="py-8 lg:py-12">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Products' }]} />
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">Product Catalog</h1>
            <p className="mt-2 max-w-2xl text-text-muted">
              Browse medical equipment, accessories, and healthcare supplies. Request a quotation for pricing
              tailored to your hospital or clinic.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <form
            className="flex flex-1 gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              updateParam('q', searchInput || null)
            }}
          >
            <input
              className="h-11 flex-1 rounded-md border border-border px-3 text-sm"
              placeholder="Search products…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="h-11 rounded-md bg-brand px-4 text-sm font-medium text-white">
              Search
            </button>
          </form>
          <select
            className="h-11 rounded-md border border-border px-3 text-sm"
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
          >
            <option value="name">Sort: Name</option>
            <option value="featured">Sort: Featured</option>
            <option value="newest">Sort: Newest</option>
          </select>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm lg:hidden"
            onClick={() => setMobileFilters(true)}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <div className="hidden lg:block">{sidebar}</div>
          <div>
            <p className="text-sm text-text-muted">
              {isLoading ? 'Loading…' : `${data?.total ?? 0} result(s)`}
            </p>
            {isError && (
              <p className="mt-6 rounded-md border border-brand/30 bg-brand/5 p-4 text-sm">
                Unable to load products. Check Supabase configuration and migrations.
              </p>
            )}
            {!isLoading && !data?.products.length && (
              <div className="mt-8 rounded-lg border border-dashed border-border p-12 text-center">
                <p className="font-medium">No products found</p>
                <p className="mt-2 text-sm text-text-muted">Try adjusting filters or run the seed import.</p>
              </div>
            )}
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {data?.products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {(data?.total ?? 0) > 24 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  className="rounded-md border border-border px-4 py-2 text-sm disabled:opacity-40"
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={(data?.products.length ?? 0) < 24}
                  className="rounded-md border border-border px-4 py-2 text-sm disabled:opacity-40"
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setMobileFilters(false)}>
          <div className="absolute bottom-0 max-h-[80vh] w-full overflow-auto rounded-t-xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold">Filters</h2>
            <div className="mt-4">{sidebar}</div>
            <button type="button" className="mt-6 w-full rounded-md bg-brand py-3 text-white" onClick={() => setMobileFilters(false)}>
              Apply
            </button>
          </div>
        </div>
      )}
    </>
  )
}
