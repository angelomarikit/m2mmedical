import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const sources = [path.join(ROOT, 'public', 'logo.png'), path.join(ROOT, 'our logo.png')]

async function processLogo(inputPath: string, outputPath: string) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!
    const g = data[i + 1]!
    const b = data[i + 2]!
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const lightness = (r + g + b) / 3
    // Remove white / near-white matte (preserve red EKG and dark text)
    const isBackground = lightness > 232 && max - min < 30
    const isPureWhite = r > 250 && g > 250 && b > 250
    if (isBackground || isPureWhite) {
      data[i + 3] = 0
    }
  }

  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(outputPath)
}

async function main() {
  let src = sources[0]
  try {
    await fs.access(src)
  } catch {
    src = sources[1]!
  }

  const outPublic = path.join(ROOT, 'public', 'logo.png')
  const outRoot = path.join(ROOT, 'our logo.png')

  await processLogo(src, outPublic)
  await processLogo(src, outRoot)
  console.log('Wrote transparent PNG to public/logo.png and our logo.png')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
