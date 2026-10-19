import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { getStoragePublicUrl } from '@/lib/supabase'
import { getPrimaryImage } from '@/hooks/useProducts'
import type { Product } from '@/types/database'
import { useQuoteBasket } from '@/stores/quoteBasket'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useQuoteBasket((s) => s.addItem)
  const primary = getPrimaryImage(product.images)
  const imageUrl = primary
    ? getStoragePublicUrl('product-images', primary.storage_path)
    : '/placeholder-product.svg'
  const category = product.collections?.[0]?.name

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-white transition-shadow hover:shadow-md">
      <Link
        to={`/products/${product.slug}`}
        className="flex aspect-[4/3] items-center justify-center bg-surface-alt p-4"
      >
        <img
          src={imageUrl}
          alt={primary?.alt_text ?? product.name}
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        {product.brand?.name && (
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{product.brand.name}</p>
        )}
        <Link to={`/products/${product.slug}`} className="mt-1 line-clamp-2 font-semibold text-text hover:text-brand">
          {product.name}
        </Link>
        {category && <p className="mt-1 text-xs text-text-muted">{category}</p>}
        {product.model_number && (
          <p className="mt-0.5 text-xs text-text-muted">Model: {product.model_number}</p>
        )}
        <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row">
          <Link
            to={`/products/${product.slug}`}
            className="inline-flex h-9 flex-1 items-center justify-center rounded-md border border-border bg-white px-3 text-sm font-medium text-text hover:border-brand hover:text-brand"
          >
            View Details
          </Link>
          <Button
            size="sm"
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
            Add to Quote
          </Button>
        </div>
      </div>
    </article>
  )
}
