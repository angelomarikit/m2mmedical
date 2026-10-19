import './load-env'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY

const staticRoutes = ['/', '/products', '/about', '/services', '/contact', '/privacy']

async function main() {
  const routes = [...staticRoutes]
  if (url && key) {
    const supabase = createClient(url, key)
    const { data: products } = await supabase.from('products').select('slug').eq('status', 'published')
    const { data: collections } = await supabase.from('collections').select('slug').eq('is_published', true)
    products?.forEach((p) => routes.push(`/products/${p.slug}`))
    collections?.forEach((c) => routes.push(`/collections/${c.slug}`))
  }
  const out = path.resolve(import.meta.dirname, '..', 'scripts', 'output', 'prerender-routes.json')
  await fs.mkdir(path.dirname(out), { recursive: true })
  await fs.writeFile(out, JSON.stringify(routes, null, 2))
  console.log(`Wrote ${routes.length} routes to ${out}`)
}

main()
