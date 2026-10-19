import fs from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'scripts', 'output', 'asset-manifest.json')

type Confidence = 'high' | 'medium' | 'low'

interface ManifestEntry {
  source_path: string
  asset_type: string
  proposed_collection: string | null
  proposed_product: string | null
  image_width: number | null
  image_height: number | null
  mime_type: string
  alpha_transparency: boolean
  selected_variant: boolean
  confidence: Confidence
  review_required: boolean
  import_status: 'pending'
}

function classify(file: string): Partial<ManifestEntry> {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/')
  const base = path.basename(file).toLowerCase()

  if (rel === 'our logo.png') {
    return { asset_type: 'company_logo', proposed_collection: null, proposed_product: 'M2M Logo', confidence: 'high', review_required: false }
  }
  if (rel.startsWith('Business Partner Logos/')) {
    return { asset_type: 'partner_logo', proposed_collection: 'partners', proposed_product: base, confidence: 'high', review_required: false }
  }
  if (rel.startsWith('Client Logos/')) {
    const review = base.includes('logo_14') || base.includes('14_hospital')
    return { asset_type: 'client_logo', proposed_collection: 'clients', proposed_product: base, confidence: review ? 'medium' : 'high', review_required: review }
  }
  if (rel.startsWith('Medical Accessories/')) {
    return { asset_type: 'product_image', proposed_collection: 'medical-accessories', proposed_product: base, confidence: 'low', review_required: true }
  }
  if (rel.includes('Patient Monitoring')) {
    if (base.includes('logo')) return { asset_type: 'brand_logo', proposed_collection: 'patient-monitoring-cardiology', confidence: 'high', review_required: false }
    return { asset_type: 'product_image', proposed_collection: 'patient-monitoring-cardiology', proposed_product: base, confidence: 'high', review_required: false }
  }
  if (rel.includes('Infant Care')) {
    if (base.includes('logo')) return { asset_type: 'brand_logo', proposed_collection: null, confidence: 'high', review_required: false }
    if (rel.includes('01_Infant_Care')) return { asset_type: 'product_image', proposed_collection: 'infant-care', confidence: 'high', review_required: false }
    if (rel.includes('02_Anesthesia')) return { asset_type: 'product_image', proposed_collection: 'anesthesia', confidence: 'high', review_required: false }
    if (rel.includes('03_Fetal')) return { asset_type: 'product_image', proposed_collection: 'ultrasound-fetal-monitoring', confidence: 'high', review_required: false }
    if (rel.includes('04_Ultrasound')) return { asset_type: 'product_image', proposed_collection: 'ultrasound-fetal-monitoring', confidence: 'high', review_required: false }
    if (rel.includes('06_Product_Labels')) return { asset_type: 'label', proposed_collection: 'ultrasound-fetal-monitoring', confidence: 'low', review_required: true }
  }
  if (rel.includes('Radiology')) {
    if (base.includes('product_label')) return { asset_type: 'label', proposed_collection: 'radiology-imaging', confidence: 'low', review_required: true }
    if (base.includes('logo')) return { asset_type: 'brand_logo', proposed_collection: 'radiology-imaging', confidence: 'high', review_required: false }
    return { asset_type: 'product_image', proposed_collection: 'radiology-imaging', proposed_product: base, confidence: 'high', review_required: false }
  }
  return { asset_type: 'unknown', proposed_collection: null, proposed_product: base, confidence: 'low', review_required: true }
}

function preferOriginal(rel: string): boolean {
  const r = rel.replace(/\\/g, '/').toLowerCase()
  if (r.includes('original_quality') || r.includes('original_transparent')) return true
  if (r.includes('hd_4x') || r.includes('enhanced_4x') || r.includes('_hd_transparent')) return false
  if (r.includes('medical_accessories')) return true
  if (r === 'our logo.png') return true
  return !r.includes('hd_transparent/') || r.includes('patient monitoring')
}

async function main() {
  const files = await fg(['**/*.{png,PNG}'], { cwd: ROOT, absolute: true, ignore: ['node_modules/**', 'dist/**', 'scripts/output/**'] })
  const entries: ManifestEntry[] = []

  for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/')
    const meta = await sharp(file).metadata()
    const cls = classify(file)
    entries.push({
      source_path: rel,
      asset_type: cls.asset_type ?? 'unknown',
      proposed_collection: cls.proposed_collection ?? null,
      proposed_product: cls.proposed_product ?? path.basename(file),
      image_width: meta.width ?? null,
      image_height: meta.height ?? null,
      mime_type: 'image/png',
      alpha_transparency: meta.hasAlpha ?? false,
      selected_variant: preferOriginal(rel),
      confidence: cls.confidence ?? 'low',
      review_required: cls.review_required ?? true,
      import_status: 'pending',
    })
  }

  await fs.mkdir(path.dirname(OUT), { recursive: true })
  await fs.writeFile(OUT, JSON.stringify({ generated_at: new Date().toISOString(), entries }, null, 2))
  console.log(`Wrote ${entries.length} entries to ${OUT}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
