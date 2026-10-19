import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import { Container } from '@/components/ui/Container'
import { PageMeta } from '@/components/seo/PageMeta'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { useProduct, getPrimaryImage } from '@/hooks/useProducts'
import { getStoragePublicUrl } from '@/lib/supabase'
import { useQuoteBasket } from '@/stores/quoteBasket'
import { ProductInquiryModal } from '@/components/inquiry/ProductInquiryModal'

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading } = useProduct(slug)
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const addItem = useQuoteBasket((s) => s.addItem)
  const [emblaRef, emblaApi] = useEmblaCarousel()
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (isLoading) {
    return (
      <Container className="py-12">
        <p className="text-text-muted">Loading product…</p>
      </Container>
    )
  }

  if (!product) {
    return (
      <Container className="py-12">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link to="/products" className="mt-4 text-brand hover:underline">
          Back to catalog
        </Link>
      </Container>
    )
  }

  const images = [...(product.images ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  const primary = getPrimaryImage(product.images)
  const verifiedSpecs = product.specifications?.filter((s) => s.verification_status === 'verified') ?? []

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description ?? product.description,
    sku: product.sku,
    model: product.model_number,
    brand: product.brand?.name
      ? { '@type': 'Brand', name: product.brand.name }
      : undefined,
    image: images.map((i) => getStoragePublicUrl('product-images', i.storage_path)),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.m2mmedical.com/' },
      { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://www.m2mmedical.com/products' },
      { '@type': 'ListItem', position: 3, name: product.name },
    ],
  }

  return (
    <>
      <PageMeta
        title={product.seo_title ?? product.name}
        description={product.seo_description ?? product.short_description ?? undefined}
        path={`/products/${product.slug}`}
        jsonLd={[productJsonLd, breadcrumbJsonLd]}
      />
      <Container className="py-8 lg:py-12">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: product.name },
          ]}
        />
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-lg border border-border bg-surface-alt" ref={emblaRef}>
              <div className="flex">
                {(images.length ? images : [{ id: 'ph', storage_path: '', alt_text: product.name, product_id: product.id, sort_order: 0, is_primary: true }]).map((img) => (
                  <div key={img.id} className="min-w-0 flex-[0_0_100%] p-8">
                    <img
                      src={
                        img.storage_path
                          ? getStoragePublicUrl('product-images', img.storage_path)
                          : '/placeholder-product.svg'
                      }
                      alt={img.alt_text ?? product.name}
                      className="mx-auto max-h-[420px] w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    className={`h-16 w-16 shrink-0 rounded border p-1 ${selectedIndex === idx ? 'border-brand' : 'border-border'}`}
                    onClick={() => {
                      setSelectedIndex(idx)
                      emblaApi?.scrollTo(idx)
                    }}
                  >
                    <img
                      src={getStoragePublicUrl('product-images', img.storage_path)}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.brand?.name && (
              <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">{product.brand.name}</p>
            )}
            <h1 className="mt-2 text-3xl font-bold text-text">{product.name}</h1>
            {product.model_number && (
              <p className="mt-2 text-sm text-text-muted">Model: {product.model_number}</p>
            )}
            {product.collections?.[0] && (
              <Link
                to={`/collections/${product.collections[0].slug}`}
                className="mt-2 inline-block text-sm text-brand hover:underline"
              >
                {product.collections[0].name}
              </Link>
            )}
            {product.short_description && (
              <p className="mt-6 text-text-muted">{product.short_description}</p>
            )}
            {product.publicly_displayed_price != null && (
              <p className="mt-4 text-lg font-semibold">
                {product.currency ?? 'PHP'} {product.publicly_displayed_price.toLocaleString()}
              </p>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="flex-1" onClick={() => setInquiryOpen(true)}>
                Request Quotation
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={() =>
                  addItem({
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    modelNumber: product.model_number,
                    imagePath: primary?.storage_path ?? null,
                  })
                }
              >
                Add to Quote Basket
              </Button>
            </div>
            {product.description && (
              <div className="prose prose-sm mt-10 max-w-none text-text-muted">
                <h2 className="text-lg font-semibold text-text">Description</h2>
                <p className="whitespace-pre-wrap">{product.description}</p>
              </div>
            )}
            {verifiedSpecs.length > 0 && (
              <div className="mt-10">
                <h2 className="text-lg font-semibold">Specifications</h2>
                <table className="mt-4 w-full text-sm">
                  <tbody>
                    {verifiedSpecs.map((s) => (
                      <tr key={s.id} className="border-b border-border">
                        <th className="py-2 pr-4 text-left font-medium text-text">{s.label}</th>
                        <td className="py-2 text-text-muted">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Container>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-white p-3 lg:hidden">
        <Button className="w-full" onClick={() => setInquiryOpen(true)}>
          Request Quotation
        </Button>
      </div>

      <ProductInquiryModal open={inquiryOpen} onClose={() => setInquiryOpen(false)} product={product} />
    </>
  )
}
