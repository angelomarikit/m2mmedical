# Deployment — Vercel

## Build settings

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Install command:** `npm install`

## Environment variables

| Name | Scope |
|------|--------|
| `VITE_SUPABASE_URL` | Production, Preview |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Production, Preview |

## Routing

`vercel.json` rewrites all non-asset paths to `index.html` for client-side routing (including `/admin` and product URLs).

## Custom domain

Point `www.m2mmedical.com` to Vercel and enable HTTPS.

Update `public/sitemap.xml` and canonical base in `src/lib/constants.ts` if the production domain differs.

## Post-deploy catalog updates

1. Publish products in Supabase / Admin CMS.
2. Run `npm run prerender:routes` in CI (optional) to refresh slug list.
3. Regenerate sitemap or add a Supabase Edge Function for dynamic `sitemap.xml` (future).
4. Trigger a redeploy for best static SEO coverage.

## CI checklist

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Optional: `npm run test:e2e` against preview URL with env configured.
