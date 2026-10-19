import './load-env'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { collectAssetPaths } from './catalog-data'
import { normalizeStoragePath } from './lib/storage-path'

const ROOT = path.resolve(import.meta.dirname, '..')
const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error(
    'Missing Supabase credentials in .env (project root).\n' +
      '  Required for upload: VITE_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY\n' +
      '  Note: Node scripts do not read .env unless loaded — this script loads it automatically.\n' +
      '  The service role key must NOT use the VITE_ prefix.',
  )
  process.exit(1)
}

const supabase = createClient(url, key)

async function main() {
  const items = collectAssetPaths()
  let ok = 0
  for (const { path: rel, bucket } of items) {
    const filePath = path.join(ROOT, rel)
    const buf = await fs.readFile(filePath)
    const storagePath = normalizeStoragePath(rel)
    const { error } = await supabase.storage.from(bucket).upload(storagePath, buf, {
      contentType: 'image/png',
      upsert: true,
    })
    if (error) {
      console.warn('Upload failed:', bucket, storagePath, error.message)
      continue
    }
    ok++
  }
  console.log(`Uploaded ${ok}/${items.length} files to Supabase Storage.`)
  console.log('Run: npm run db:seed')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
