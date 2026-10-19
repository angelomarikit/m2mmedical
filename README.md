# M2M Medical Trading Inc. — Website & CMS

Production-ready B2B medical equipment catalog with Supabase backend, quotation inquiries (no checkout), and `/admin` CMS.

## Stack

- Vite + React 19 + TypeScript (strict)
- React Router 7, Tailwind CSS 4, TanStack Query
- Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- React Hook Form + Zod, Framer Motion, Embla Carousel

## Quick start

```bash
npm install
cp .env.example .env
# Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

Copy the company logo for the header:

```powershell
Copy-Item "our logo.png" "public/logo.png"
Copy-Item "our logo.png" "public/favicon.png"
```

Optional hero image (example product):

```powershell
Copy-Item "Patient Monitoring  ECG  Defibrillators/03_life_scope_g5_cardiac_monitor_hd_transparent.png" "public/hero-equipment.png"
```

## Supabase setup

See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) for migrations, storage, Edge Functions, seed, and first admin.

## Catalog from local product folders

Sync folder images into the site (works immediately without Supabase):

```bash
npm run catalog:sync
npm run dev
```

This copies PNGs to `public/catalog/` and builds `public/data/catalog.json` with **38 published products** across Medical Accessories, Patient Monitoring, Infant Care, Anesthesia, Ultrasound, and Radiology collections, plus partner and client logos.

Upload the same catalog to Supabase (requires `.env` with service role):

```bash
npm run catalog:publish
```

## Asset pipeline (full inventory scan)

```bash
npm run assets:scan
npm run assets:import
npm run db:seed
```

Original PNG folders in the repo root are never deleted; import reads them and uploads selected variants to Storage.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright smoke tests |
| `npm run bootstrap-admin` | One-time owner user (service role) |

## SEO approach

Public pages use `react-helmet-async` for titles, descriptions, canonical URLs, Open Graph, and JSON-LD. Static `public/sitemap.xml` covers core URLs; run `npm run prerender:routes` before deploy to refresh slug lists from Supabase.

**Trade-off:** Full HTML prerender for every product URL requires a CI deploy (or Vercel deploy hook) after catalog changes. Google and modern crawlers that execute JavaScript still receive client-rendered metadata until then.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Project layout

- `src/` — Public site + lazy-loaded admin
- `supabase/migrations/` — SQL schema & RLS
- `supabase/functions/` — Secure form submissions
- `scripts/` — Asset scan/import, seed, admin bootstrap
