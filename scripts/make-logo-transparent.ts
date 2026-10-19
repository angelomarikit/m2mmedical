import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const SOURCE_CANDIDATES = [
  path.join(ROOT, 'our logo.png'),
  path.join(ROOT, 'public', 'logo.png'),
  path.join(ROOT, 'public', 'favicon.png'),
]

function isRedLogoPixel(r: number, g: number, b: number): boolean {
  return r > 130 && r > g + 22 && r > b + 22
}

function isDarkInk(r: number, g: number, b: number): boolean {
  return (r + g + b) / 3 < 115
}

function isBackgroundPixel(r: number, g: number, b: number, bg: { r: number; g: number; b: number }): boolean {
  if (isRedLogoPixel(r, g, b) || isDarkInk(r, g, b)) return false
  const dr = Math.abs(r - bg.r)
  const dg = Math.abs(g - bg.g)
  const db = Math.abs(b - bg.b)
  if (dr + dg + db < 45) return true

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lightness = (r + g + b) / 3
  const saturation = max - min
  if (lightness > 248 && saturation < 20) return true
  if (lightness > 200 && saturation < 35) return true
  return false
}

function sampleBackground(data: Buffer, width: number, height: number) {
  const points = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [Math.floor(width / 2), 0],
    [0, Math.floor(height / 2)],
  ]
  let r = 0
  let g = 0
  let b = 0
  for (const [x, y] of points) {
    const i = (y * width + x) * 4
    r += data[i]!
    g += data[i + 1]!
    b += data[i + 2]!
  }
  const n = points.length
  return { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) }
}

function removeBackground(data: Buffer, width: number, height: number) {
  const bg = sampleBackground(data, width, height)
  const visited = new Uint8Array(width * height)
  const queue: number[] = []

  const tryEnqueue = (x: number, y: number) => {
    const idx = y * width + x
    if (visited[idx]) return
    const i = idx * 4
    const r = data[i]!
    const g = data[i + 1]!
    const b = data[i + 2]!
    if (!isBackgroundPixel(r, g, b, bg)) return
    visited[idx] = 1
    queue.push(idx)
  }

  for (let x = 0; x < width; x++) {
    tryEnqueue(x, 0)
    tryEnqueue(x, height - 1)
  }
  for (let y = 0; y < height; y++) {
    tryEnqueue(0, y)
    tryEnqueue(width - 1, y)
  }

  while (queue.length > 0) {
    const idx = queue.pop()!
    const i = idx * 4
    data[i + 3] = 0
    const x = idx % width
    const y = (idx - x) / width
    if (x > 0) tryEnqueue(x - 1, y)
    if (x < width - 1) tryEnqueue(x + 1, y)
    if (y > 0) tryEnqueue(x, y - 1)
    if (y < height - 1) tryEnqueue(x, y + 1)
  }

  // Remove leftover white matte fringes (anti-aliased edges from export)
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!
    const g = data[i + 1]!
    const b = data[i + 2]!
    if (data[i + 3]! === 0) continue
    if (isRedLogoPixel(r, g, b) || isDarkInk(r, g, b)) continue
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const lightness = (r + g + b) / 3
    const saturation = max - min
    if (lightness > 185 && saturation < 45) {
      data[i + 3] = 0
    }
  }
}

async function processLogo(inputPath: string, outputPath: string) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  removeBackground(data, info.width, info.height)

  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(outputPath)
}

async function resolveSource(): Promise<string> {
  for (const candidate of SOURCE_CANDIDATES) {
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      /* try next */
    }
  }
  throw new Error('No logo source found (our logo.png or public/logo.png)')
}

async function main() {
  const src = await resolveSource()
  const outPublic = path.join(ROOT, 'public', 'logo.png')
  const outFavicon = path.join(ROOT, 'public', 'favicon.png')
  const outCatalog = path.join(ROOT, 'public', 'catalog', 'website-assets', 'our-logo.png')

  await processLogo(src, outPublic)
  await sharp(outPublic)
    .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
    .png()
    .toFile(outFavicon)
  await fs.mkdir(path.dirname(outCatalog), { recursive: true })
  await fs.copyFile(outPublic, outCatalog)

  console.log(`Transparent logo from ${path.basename(src)} →`)
  console.log('  public/logo.png')
  console.log('  public/favicon.png')
  console.log('  public/catalog/website-assets/our-logo.png')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
