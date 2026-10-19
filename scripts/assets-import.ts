import './load-env'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ROOT = path.resolve(import.meta.dirname, '..')
const MANIFEST = path.join(ROOT, 'scripts', 'output', 'asset-manifest.json')

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Set SUPABASE_URL/VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key)

function bucketFor(entry: { asset_type: string }): string {
  if (entry.asset_type === 'company_logo') return 'website-assets'
  if (entry.asset_type === 'partner_logo' || entry.asset_type === 'client_logo') return 'partner-client-logos'
  if (entry.asset_type === 'brand_logo') return 'brand-logos'
  return 'product-images'
}

async function main() {
  const raw = JSON.parse(await fs.readFile(MANIFEST, 'utf8')) as {
    entries: Array<{
      source_path: string
      asset_type: string
      selected_variant: boolean
      review_required: boolean
      filename?: string
    }>
  }

  const selected = raw.entries.filter((e) => e.selected_variant)
  let uploaded = 0

  for (const entry of selected) {
    const filePath = path.join(ROOT, entry.source_path)
    const buf = await fs.readFile(filePath)
    const bucket = bucketFor(entry)
    const storagePath = entry.source_path.replace(/\\/g, '/').replace(/\s+/g, '-').toLowerCase()

    const { error: upErr } = await supabase.storage.from(bucket).upload(storagePath, buf, {
      contentType: 'image/png',
      upsert: true,
    })
    if (upErr) {
      console.warn('Upload failed:', storagePath, upErr.message)
      continue
    }

    const { data: existing } = await supabase
      .from('media_assets')
      .select('id')
      .eq('storage_path', storagePath)
      .maybeSingle()
    if (!existing) {
      await supabase.from('media_assets').insert({
        storage_path: storagePath,
        filename: path.basename(entry.source_path),
        mime_type: 'image/png',
        asset_category: entry.asset_type,
        alt_text: path.basename(entry.source_path, '.png'),
      })
    }

    uploaded++
  }

  console.log(`Uploaded ${uploaded} assets (selected_variant only). Run db:seed to link products.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
