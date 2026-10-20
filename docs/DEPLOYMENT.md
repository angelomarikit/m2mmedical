# Deployment — Vercel

## Git branch (important)

| Branch | Use on Vercel? | Why |
|--------|----------------|-----|
| **`main`** | **Yes** (recommended) | Full source; run `npm run build` → `dist/` |
| **`cpanel-release`** | Only with static config | Prebuilt static files for **cPanel** — no `package.json`, no Vite. If Vercel builds this branch without overrides you get `vite: command not found`. |

**Production on cPanel (m2mmedical.com):** deploy branch **`cpanel-release`** in cPanel Git only — see `docs/DEPLOY_CPANEL.md`.

**Vercel:** set **Production Branch** to **`main`**, or keep `cpanel-release` only if the branch includes `vercel.json` with empty build (GitHub Actions copies `deploy/vercel-cpanel-release.json` into `cpanel-release`).

## Build settings (branch `main`)

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

Update `public/sitemap.xml`, canonical base in admin **Settings** (website URL), and the static `og:image` URLs in `index.html` if the production domain differs.

Default social preview image: `public/og-image.jpg` (Open Graph / Twitter / link shares).

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
