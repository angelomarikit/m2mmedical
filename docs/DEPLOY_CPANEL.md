# Deploy M2M Medical to cPanel (Git Version Control)

## What this project is

| Item | Detail |
|------|--------|
| **Framework** | **Vite 6** + **React 19** + TypeScript |
| **Routing** | **React Router** (`BrowserRouter`) — client-side SPA |
| **Backend** | **Supabase** (Postgres, Auth, Storage, Edge Functions) — hosted on Supabase, not on cPanel |
| **NOT** | Next.js, Remix, or any Node SSR/API server in this repo |

### Do you need Node.js on the hosting account?

| Phase | Node required? |
|-------|----------------|
| **Visitors browsing the site** | **No** — Apache/nginx serves static HTML/JS/CSS from `dist/` |
| **cPanel Git deploy (this `.cpanel.yml`)** | **Yes** — `npm run build` runs on the server in the **Git repo folder** |
| **Supabase Edge Functions** (`admin-users`, `register-staff`, inquiries) | **No on cPanel** — deploy with Supabase CLI to your Supabase project |

There are **no API routes** in this repository. Forms and admin call Supabase from the browser using the **publishable (anon) key** only.

---

## Verify document root (do this first)

1. cPanel → **Domains** (or **Domain Setup**).
2. Find **m2mmedical.com** (or your primary domain).
3. Note **Document Root** — commonly:
   - `/home/mmmedica/public_html`
   - or `/home/mmmedica/domains/m2mmedical.com/public_html`

4. Open `.cpanel.yml` and set `CPANEL_DOCROOT` to that **exact** path.

**Do not deploy until this path is correct.** Wrong path = files in the wrong folder or deploy failure.

---

## What goes where

```
/home/mmmedica/
├── repositories/m2m-medical/   ← Git clone (source, node_modules, .env.production) — PRIVATE
│   ├── .cpanel.yml
│   ├── .env.production         ← build-time only, NEVER in public_html
│   ├── npm run build → dist/
│   └── ...
└── public_html/                ← DOCUMENT ROOT — only built static files
    ├── index.html
    ├── assets/
    ├── .htaccess
    └── ...
```

**Never** copy to `public_html`:

- `node_modules/`, `src/`, `supabase/`, `scripts/`
- `.env`, `.env.production`, `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY` (anywhere in the public site)

---

## Environment variables (Supabase)

Vite **embeds** `VITE_*` variables **at build time** into the JS bundle.

On the **server**, in the **Git repository directory** (not `public_html`):

```bash
cp .env.production.example .env.production
# Edit .env.production:
#   VITE_SUPABASE_URL=https://xxxx.supabase.co
#   VITE_SUPABASE_PUBLISHABLE_KEY=eyJ... or sb_publishable_...
```

Then run deploy (or push to trigger `.cpanel.yml`).

**Safe for production static site:**

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (anon / publishable — designed for browsers)

**Never use in Vite / never in public_html:**

- `SUPABASE_SERVICE_ROLE_KEY`

After deploy, configure in **Supabase Dashboard**:

- **Authentication → URL configuration**: Site URL `https://www.m2mmedical.com` (or your domain)
- **Redirect URLs**: `https://www.m2mmedical.com/admin/**`, `https://m2mmedical.com/admin/**`
- **Edge Functions** remain deployed to Supabase (`npx supabase functions deploy ...`)

---

## SPA routing (Apache)

`public/.htaccess` is copied into `dist/` on build. It rewrites unknown paths to `index.html` so `/admin`, `/products/...`, etc. work on shared hosting.

Requires **mod_rewrite** (standard on cPanel Apache).

---

## cPanel Git Version Control setup

1. Push this repo to GitHub/GitLab (or use cPanel’s remote).
2. cPanel → **Git Version Control** → **Create** → clone into e.g. `/home/mmmedica/repositories/m2m-medical`.
3. Ensure `.cpanel.yml` is on the branch you deploy (usually `main`).
4. Create `.env.production` on the server in that clone (SSH or File Manager — **outside** `public_html`).
5. **Backup** existing `public_html` if the live site is not empty.
6. **Deploy** (Pull or Deploy HEAD). cPanel runs `.cpanel.yml` tasks.

First deploy uses **non-destructive** copy (`rsync -a` without `--delete`). After you confirm the site looks correct, you may add `rsync -a --delete` in `.cpanel.yml` to remove stale files from old sites — **only with your approval**.

---

## Commands reference

**Local (development):**

```bash
npm install
npm run dev
```

**Production build (same as cPanel):**

```bash
cp .env.production.example .env.production
# fill in VITE_* values
npm ci
npm run build
# Output: dist/
```

**Manual publish (SSH) — if not using Git deploy:**

```bash
npm run build
rsync -a dist/ /home/mmmedica/public_html/
```

---

## Node.js on shared cPanel

If deploy fails with `node not in PATH`:

1. cPanel → **Setup Node.js App** → create app pointing at the **repository** folder (not public_html), Node **18+**.
2. Or enable **Terminal** and ensure `node`/`npm` from Node selector are in PATH for deployment tasks.

If your host **disallows** Node in Git deployment tasks, use **Option B**:

- Build on your PC or GitHub Actions.
- Deploy **only** the contents of `dist/` to `public_html` (FTP/rsync), not the full repo.

---

## Checklist after deploy

- [ ] Homepage loads, assets return 200 (no 404 on `/assets/*.js`)
- [ ] Direct URL works: `/products`, `/admin/login` (refresh page — tests `.htaccess`)
- [ ] Supabase: products load, admin login works
- [ ] No `.env` files under `public_html` (File Manager search)
- [ ] HTTPS enforced (cPanel **Force HTTPS Redirect**)

---

## Related docs

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) — database, storage, Edge Functions
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Vercel-oriented notes (optional prerender)
