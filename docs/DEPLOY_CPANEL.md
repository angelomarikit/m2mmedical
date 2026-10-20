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
3. **Missing `.htaccess`** — refresh on `/admin` or `/products/...` returns 404.
4. **Supabase keys** not baked into the build (`VITE_*` missing at build time).

**Do not deploy into `m2mmedical-main`** unless that path is confirmed as the document root for https://m2mmedical.com.

---

## Step 1 — Confirm document root (required)

In cPanel → **Domains** → **m2mmedical.com** → note **Document Root**.

Examples (only one is correct for your account):

- `/home/mmmedica/public_html`
- `/home/mmmedica/public_html/m2mmedical.com`
- `/home/mmmedica/domains/m2mmedical.com/public_html`

Edit **`deploy/DEPLOYPATH`** in Git (single line, trailing slash OK) to that path, commit, push.

We **cannot** verify this from the repository alone.

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

## cPanel clicks

1. **Git Version Control** → repository `m2mmedical` → **Update from Remote**
2. Branch: **`cpanel-release`** (recommended) or **`main`**
3. **Deploy HEAD Commit**
4. Open https://m2mmedical.com/ and https://m2mmedical.com/admin/login

---

## Safety

- Deploy copies **only** built files (`dist/` or `cpanel-release` root) — not `src/`, `node_modules`, or `.env`.
- `cp` does not delete unrelated files already in `public_html`; clean old mistakes manually after backup if needed.

Repository: https://github.com/angelomarikit/m2mmedical.git
