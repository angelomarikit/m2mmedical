import { useParams, Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { PageMeta } from '@/components/seo/PageMeta'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { ProductCard } from '@/components/products/ProductCard'
import { useCollection } from '@/hooks/useCollections'
import { useProducts } from '@/hooks/useProducts'

export function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: collection, isLoading } = useCollection(slug)
  const { data: productData } = useProducts({ collectionSlug: slug, pageSize: 48 })

  if (isLoading) {
    return (
      <Container className="py-12">
        <p className="text-text-muted">Loading collection…</p>
      </Container>
    )
  }

  if (!collection) {
    return (
      <Container className="py-12">
        <h1 className="text-2xl font-bold">Collection not found</h1>
        <Link to="/products" className="mt-4 inline-block text-brand hover:underline">
          Browse all products
        </Link>
      </Container>
    )
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.name,
    description: collection.description,
    url: `https://www.m2mmedical.com/collections/${collection.slug}`,
  }

  return (
    <>
      <PageMeta
        title={collection.seo_title ?? collection.name}
        description={collection.seo_description ?? collection.description ?? undefined}
        path={`/collections/${collection.slug}`}
        jsonLd={jsonLd}
      />
      <section className="border-b border-border bg-surface-alt py-10">
        <Container>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Products', href: '/products' },
              { label: collection.name },
            ]}
          />
          <h1 className="mt-4 text-3xl font-bold">{collection.name}</h1>
          {collection.description && (
            <p className="mt-3 max-w-3xl text-text-muted">{collection.description}</p>
          )}
          <p className="mt-2 text-sm text-text-muted">{productData?.total ?? 0} products</p>
        </Container>
      </section>
      <Container className="py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productData?.products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {!productData?.products.length && (
          <p className="text-text-muted">No published products in this collection yet.</p>
        )}
      </Container>
    </>
  )
}
