# M2M Medical — cPanel deployment (m2mmedical.com)

## Project type

| | |
|---|---|
| **Stack** | React 19 + Vite 6 + TypeScript + React Router (SPA) |
| **Backend** | Supabase (cloud) — not hosted on cPanel |
| **Live runtime on cPanel** | **Static files only** (HTML/JS/CSS) |
| **Node on server** | Optional — only if cPanel builds on deploy; **recommended: use `cpanel-release` branch** |

---

## Why the site may not work today

Common causes on this account:

1. **Wrong folder** — Source or old zips under `public_html/m2mmedical-main` or `public_html/m2mmedical.com` while the **domain document root** points elsewhere.
2. **Source deployed** instead of **`dist/`** (Vite build output).
3. **Publish never reached `public_html`** — cPanel runs **each** `.cpanel.yml` line in a **new shell**, so a separate `export DEPLOYPATH=...` line does **not** apply to the next line. The publish script must run in **one** `/bin/sh -c '...'` task with the full path inline (fixed in this repo).
4. **Stale `public_html/assets/`** — Old files from 2017 can remain beside new hashed Vite bundles; if **`public_html/index.html` was not updated**, the browser still loads broken JS. After a good deploy, **`index.html` and `assets/*.js` dates should match today’s deploy** (see `DEPLOY_MANIFEST.json` in `public_html`).
5. **Missing `.htaccess`** — refresh on `/admin` or `/products/...` returns 404.
6. **Supabase keys** not baked into the build (`VITE_*` missing at build time).

**Do not deploy into `m2mmedical-main`** unless that path is confirmed as the document root for https://m2mmedical.com.

---

## Exact deploy paths (confirmed)

| | Path |
|---|---|
| **Git clone (cPanel)** | `/home/mmmedica/repositories/m2mmedical` |
| **Branch to track** | **`cpanel-release`** (built static site at repo root) |
| **Deploy source (after Git pull)** | `/home/mmmedica/repositories/m2mmedical/` → `index.html`, `assets/`, `.htaccess`, `cpanel-publish.sh` |
| **Deploy target (document root)** | `/home/mmmedica/public_html/` |
| **Not the live site root** | `public_html/m2mmedical-main/`, `public_html/m2mmedical.com/` (unless Domains says otherwise) |

### Files overwritten at target (merge only)

Deploy **copies** these paths into `public_html/` (same relative path). It does **not** delete other folders (e.g. old `m2mmedical-main`).

| Overwritten | Notes |
|-------------|--------|
| `index.html` | Must reference `/assets/*.js` that exist after copy |
| `.htaccess` | SPA + `/admin` refresh |
| `assets/*` | New Vite hashed files merged in; **old unused JS/CSS in `assets/` may remain** until you remove them manually |
| `favicon.png`, `logo.png`, `robots.txt`, `sitemap.xml`, `catalog/`, `data/`, etc. | From Vite `public/` |
| `DEPLOY_MANIFEST.json` | Build audit (optional) |

**Approval:** Overwriting the rows above is required for the site to work. Removing unrelated directories is **optional** and manual only.

---

## Step 1 — Confirm document root (required)

In cPanel → **Domains** → **m2mmedical.com** → note **Document Root**.

Examples (only one is correct for your account):

- `/home/mmmedica/public_html`
- `/home/mmmedica/public_html/m2mmedical.com`
- `/home/mmmedica/domains/m2mmedical.com/public_html`

**Confirmed for this project:** `/home/mmmedica/public_html/` (see `deploy/DEPLOYPATH`).

Deploy writes **directly to that folder root** (`index.html` at `/home/mmmedica/public_html/index.html`), not into `m2mmedical-main` or other subfolders. Unrelated files in `public_html` are **not deleted** — only matching paths are overwritten.

---

## Step 2 — Choose deployment mode

### Recommended: branch `cpanel-release` (no Node on cPanel)

1. GitHub → repo **Settings → Secrets and variables → Actions**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`  
   (publishable/anon key only — **never** service role)

2. Push to **`main`** → workflow **cPanel production build** runs → updates branch **`cpanel-release`** with compiled files + `.htaccess` + `.cpanel.yml`.

3. cPanel → **Git Version Control** → clone/pull **`cpanel-release`** (not `main`) for the site repo, or change tracked branch to `cpanel-release`.

4. **Deploy HEAD Commit** — copies built files to `DEPLOYPATH`.

### Alternative: branch `main` (build on server)

If cPanel has Node 18+ in PATH when Git deploy runs:

- Track branch **`main`**
- `.env.production` in **`/home/mmmedica/repositories/m2mmedical`** (never in `public_html`)
- Deploy runs `npm run build` then `cp dist/. → DEPLOYPATH`

If Node is **not** available, deploy will fail with a clear message — use **`cpanel-release`**.

---

## Directory layout

```
/home/mmmedica/
├── repositories/m2mmedical/     ← Git clone (source OR cpanel-release checkout)
├── public_html/                 ← often primary document root (confirm!)
├── public_html/m2mmedical.com/  ← addon domain root (maybe)
└── public_html/m2mmedical-main/ ← old source dump — NOT a production target unless confirmed
```

**Deploy target** = document root from Step 1 only.

---

## Apache / React Router

`public/.htaccess` is copied to `dist/.htaccess` on build. It rewrites non-file requests to `index.html` so `/admin`, `/products`, etc. work on refresh.

---

## Supabase production

- Keys are embedded at **`npm run build`** via `VITE_*`.
- Configure Supabase **Authentication → URL configuration**:
  - Site URL: `https://m2mmedical.com`
  - Redirect URLs: `https://m2mmedical.com/**`, `https://www.m2mmedical.com/**`
- Edge Functions stay on Supabase (`docs/SUPABASE_SETUP.md`).

---

## Local verification

```bash
cp .env.production.example .env.production
# fill VITE_* 
npm ci
npm run build:verify
```

---

## cPanel clicks (required — Cursor cannot run these)

1. **Git Version Control** → repository `m2mmedical`.
2. **Repository Path** must be `/home/mmmedica/repositories/m2mmedical`.
3. **Branch:** set to **`cpanel-release`** (not `main` unless Node build on server is confirmed).
4. Click **Update from Remote** — wait until it finishes without error.
5. Confirm in **File Manager** → `repositories/m2mmedical/index.html` exists and **`assets/`** contains files named like `index-*.js` (not only 2017-era names).
6. Click **Deploy HEAD Commit** — read the deploy log; it must include:
   - `M2M publish: ... -> /home/mmmedica/public_html/`
   - `OK: Published to /home/mmmedica/public_html/`
7. **File Manager** → `public_html/index.html` — check **Last Modified** is today.
8. **File Manager** → `public_html/assets/` — confirm **new** `index-*.js` / `AdminApp-*.js` with today’s date.
9. Browser: https://m2mmedical.com/ and hard-refresh https://m2mmedical.com/admin/login (Ctrl+F5).

If deploy log shows success but `public_html/index.html` is still old, the tracked branch is wrong or `.cpanel.yml` on the server is outdated — repeat step 4–6 after GitHub Actions updates `cpanel-release`.

---

## Safety

- Deploy copies **only** built files (`dist/` or `cpanel-release` root) — not `src/`, `node_modules`, or `.env`.
- `cp` does not delete unrelated files already in `public_html`; clean old mistakes manually after backup if needed.

Repository: https://github.com/angelomarikit/m2mmedical.git
