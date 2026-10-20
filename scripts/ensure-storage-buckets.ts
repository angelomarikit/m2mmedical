import './load-env'
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

const BUCKETS = [
  'product-images',
  'website-assets',
  'brand-logos',
  'partner-client-logos',
  'product-documents',
] as const

async function main() {
  for (const id of BUCKETS) {
    const { data: existing } = await supabase.storage.getBucket(id)
    if (existing) {
      console.log('OK (exists):', id)
      continue
    }
    const { error } = await supabase.storage.createBucket(id, {
      public: true,
      fileSizeLimit: 52_428_800,
    })
    if (error) {
      console.error('Failed:', id, error.message)
    } else {
      console.log('Created:', id)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
