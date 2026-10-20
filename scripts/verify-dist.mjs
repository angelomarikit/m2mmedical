import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..', 'dist')

function mustExist(rel) {
  const p = path.join(root, rel)
  if (!fs.existsSync(p)) {
    console.error(`Missing required file: dist/${rel}`)
    process.exit(1)
  }
}

mustExist('index.html')
mustExist('.htaccess')

const assets = path.join(root, 'assets')
if (!fs.existsSync(assets)) {
  console.error('Missing dist/assets/')
  process.exit(1)
}

const js = fs.readdirSync(assets).filter((f) => f.endsWith('.js'))
if (js.length === 0) {
  console.error('No JS bundles in dist/assets/')
  process.exit(1)
}

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
if (!html.includes('/assets/')) {
  console.error('index.html does not reference /assets/ — check Vite base path')
  process.exit(1)
}

console.log('dist/ OK:', { jsBundles: js.length, htaccess: true })
