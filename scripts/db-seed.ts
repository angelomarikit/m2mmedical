import './load-env'
import { createClient } from '@supabase/supabase-js'
import {
  brandDefs,
  catalogProducts,
  clientDefs,
  collectionsTree,
  partnerDefs,
} from './catalog-data'
import { normalizeStoragePath } from './lib/storage-path'

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
const supabase = createClient(url, key)

async function upsertCollection(c: {
  slug: string
  name: string
  description?: string
  parent_id?: string | null
  sort: number
}) {
  const { data, error } = await supabase
    .from('collections')
    .upsert(
      {
        slug: c.slug,
        name: c.name,
        parent_id: c.parent_id ?? null,
        sort_order: c.sort,
        is_published: true,
        description: c.description ?? `${c.name} — M2M Medical Trading catalog category.`,
      },
      { onConflict: 'slug' },
    )
    .select('id, slug')
    .single()
  if (error) throw error
  return data
}

async function main() {
  await supabase.from('site_settings').upsert({
    key: 'company',
    value_json: {
      name: 'M2M Medical Trading Inc.',
      tagline: 'Your Healthcare Partner',
      phone: '+632-8639-5622',
      email: 'customercare@m2mmedical.com',
    },
  })

  const brandIds = new Map<string, string>()
  for (const b of brandDefs) {
    const { data, error } = await supabase
      .from('brands')
      .upsert(
        {
          slug: b.slug,
          name: b.name,
          logo_path: b.logo_path ? normalizeStoragePath(b.logo_path) : null,
          is_active: true,
        },
        { onConflict: 'slug' },
      )
      .select('id, slug')
      .single()
    if (error) throw error
    brandIds.set(b.slug, data.id)
  }

  const collIds = new Map<string, string>()
  let sort = 0
  for (const root of collectionsTree) {
    const row = await upsertCollection({
      slug: root.slug,
      name: root.name,
      description: root.description,
      sort: sort++,
    })
    collIds.set(root.slug, row.id)
    for (const child of ('children' in root ? root.children : []) ?? []) {
      const childRow = await upsertCollection({
        slug: child.slug,
        name: child.name,
        parent_id: row.id,
        sort: sort++,
      })
      collIds.set(child.slug, childRow.id)
    }
  }

  for (const p of catalogProducts) {
    const { data: prod, error } = await supabase
      .from('products')
      .upsert(
        {
          slug: p.slug,
          name: p.name,
          model_number: p.model_number ?? null,
          brand_id: p.brand ? brandIds.get(p.brand) : null,
          short_description: p.short_description ?? null,
          product_type: p.product_type ?? null,
          status: p.status,
          is_featured: p.is_featured ?? false,
        },
        { onConflict: 'slug' },
      )
      .select('id')
      .single()
    if (error) throw error

    await supabase.from('product_collections').delete().eq('product_id', prod.id)
    for (const cSlug of p.collections) {
      const cid = collIds.get(cSlug)
      if (cid) {
        await supabase.from('product_collections').insert({ product_id: prod.id, collection_id: cid })
      }
    }

    const storagePath = normalizeStoragePath(p.image_path)
    await supabase.from('product_images').delete().eq('product_id', prod.id)
    await supabase.from('product_images').insert({
      product_id: prod.id,
      storage_path: storagePath,
      alt_text: p.name,
      is_primary: true,
      sort_order: 0,
    })
  }

  for (let i = 0; i < partnerDefs.length; i++) {
    const p = partnerDefs[i]
    const logo_path = normalizeStoragePath(p.file)
    const { data: existing } = await supabase
      .from('partners_clients')
      .select('id')
      .eq('type', 'partner')
      .eq('name', p.name)
      .maybeSingle()
    if (existing) {
      await supabase
        .from('partners_clients')
        .update({ logo_path, sort_order: i, is_published: true })
        .eq('id', existing.id)
    } else {
      await supabase.from('partners_clients').insert({
        type: 'partner',
        name: p.name,
        logo_path,
        sort_order: i,
        is_published: true,
      })
    }
  }

  for (const c of clientDefs) {
    const logo_path = normalizeStoragePath(c.file)
    const { data: existing } = await supabase
      .from('partners_clients')
      .select('id')
      .eq('type', 'client')
      .eq('name', c.name)
      .maybeSingle()
    const payload = {
      type: 'client' as const,
      name: c.name,
      logo_path,
      sort_order: c.sort_order,
      is_published: c.is_published,
    }
    if (existing) {
      await supabase.from('partners_clients').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('partners_clients').insert(payload)
    }
  }

  const { data: homePage } = await supabase
    .from('pages')
    .upsert({ slug: 'home', title: 'Home', status: 'published' }, { onConflict: 'slug' })
    .select('id')
    .single()
  if (homePage) {
    await supabase.from('page_sections').upsert(
      {
        page_id: homePage.id,
        section_key: 'hero',
        section_type: 'hero',
        content_json: {
          heading: 'Medical Equipment & Healthcare Solutions',
          subheading: 'Quality Medical Products for Hospitals and Healthcare Professionals.',
          primaryCta: 'Browse Products',
          primaryHref: '/products',
          secondaryCta: 'Request Quotation',
          secondaryHref: '/products',
        },
        sort_order: 0,
        is_visible: true,
      },
      { onConflict: 'page_id,section_key' },
    )
  }

  console.log(
    `Seed complete: ${catalogProducts.length} products, ${collectionsTree.length} top-level collections, partners & clients.`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
