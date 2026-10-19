import fs from 'node:fs/promises'
import path from 'node:path'
import {
  brandDefs,
  catalogProducts,
  clientDefs,
  collectAssetPaths,
  collectionsTree,
  partnerDefs,
} from './catalog-data'
import { normalizeStoragePath } from './lib/storage-path'

const ROOT = path.resolve(import.meta.dirname, '..')

async function copyAsset(relativePath: string, bucket: string) {
  const src = path.join(ROOT, relativePath)
  const storagePath = normalizeStoragePath(relativePath)
  const dest = path.join(ROOT, 'public', 'catalog', bucket, storagePath)
  await fs.mkdir(path.dirname(dest), { recursive: true })
  await fs.copyFile(src, dest)
  return storagePath
}

async function main() {
  const paths = collectAssetPaths()
  let copied = 0
  for (const { path: rel, bucket } of paths) {
    try {
      await copyAsset(rel, bucket)
      copied++
    } catch (e) {
      console.warn('Skip missing file:', rel, e instanceof Error ? e.message : e)
    }
  }

  // Build catalog JSON for the SPA (works without Supabase)
  const brands = brandDefs.map((b) => ({
    id: b.slug,
    slug: b.slug,
    name: b.name,
    logo_path: b.logo_path ? normalizeStoragePath(b.logo_path) : null,
    is_active: true,
  }))

  const collections: Array<Record<string, unknown>> = []
  let sort = 0
  for (const root of collectionsTree) {
    collections.push({
      id: root.slug,
      parent_id: null,
      slug: root.slug,
      name: root.name,
      description: root.description ?? null,
      sort_order: sort++,
      is_published: true,
    })
    for (const child of ('children' in root ? root.children : []) ?? []) {
      collections.push({
        id: child.slug,
        parent_id: root.slug,
        slug: child.slug,
        name: child.name,
        description: null,
        sort_order: sort++,
        is_published: true,
      })
    }
  }

  const products = catalogProducts
    .filter((p) => p.status === 'published')
    .map((p) => ({
      id: p.slug,
      slug: p.slug,
      name: p.name,
      model_number: p.model_number ?? null,
      brand_id: p.brand ?? null,
      short_description: p.short_description ?? null,
      product_type: p.product_type ?? null,
      status: p.status,
      is_featured: p.is_featured ?? false,
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      brand: p.brand ? brands.find((b) => b.slug === p.brand) : null,
      collections: p.collections.map((slug) => collections.find((c) => c.slug === slug)).filter(Boolean),
      images: [
        {
          id: `${p.slug}-img`,
          product_id: p.slug,
          storage_path: normalizeStoragePath(p.image_path),
          alt_text: p.name,
          sort_order: 0,
          is_primary: true,
        },
      ],
    }))

  const partners_clients = [
    ...partnerDefs.map((p, i) => ({
      id: `partner-${i}`,
      type: 'partner' as const,
      name: p.name,
      logo_path: normalizeStoragePath(p.file),
      sort_order: i,
      is_published: true,
    })),
    ...clientDefs.map((c) => ({
      id: `client-${c.sort_order}`,
      type: 'client' as const,
      name: c.name,
      logo_path: normalizeStoragePath(c.file),
      sort_order: c.sort_order,
      is_published: c.is_published,
    })),
  ]

  const outDir = path.join(ROOT, 'public', 'data')
  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(
    path.join(outDir, 'catalog.json'),
    JSON.stringify({ brands, collections, products, partners_clients }, null, 2),
  )

  console.log(`Copied ${copied} asset files to public/catalog/ and wrote public/data/catalog.json`)
  console.log(`Published products in catalog: ${products.length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
