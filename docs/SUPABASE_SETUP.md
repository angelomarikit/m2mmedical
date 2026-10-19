# Supabase setup — M2M Medical Trading

## Step 1 — Create Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Choose a region close to the Philippines if available.
3. Save the database password securely.

## Step 2 — Obtain credentials

From **Project Settings → API**:

- **Project URL** → `VITE_SUPABASE_URL`
- **Publishable (anon) key** → `VITE_SUPABASE_PUBLISHABLE_KEY`

For local scripts and Edge Functions only (never in Vite):

- **Service role key** → `SUPABASE_SERVICE_ROLE_KEY`

## Step 3 — Environment variables

Create `.env` in the **project root** (same folder as `package.json`) from `.env.example`:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...   # or legacy anon JWT (eyJ...)
SUPABASE_SERVICE_ROLE_KEY=eyJ...                   # server/scripts ONLY — no VITE_ prefix
```

**Important**

- **`npm run dev`** (Vite) reads `VITE_*` variables automatically — restart the dev server after editing `.env`.
- **`npm run db:seed`**, **`catalog:upload`**, etc. are Node scripts; they load `.env` via `scripts/load-env.ts`. If you still see “missing credentials”, confirm the file is named `.env` (not `.env.txt`) and lives next to `package.json`.
- The **browser** needs `VITE_SUPABASE_PUBLISHABLE_KEY` (anon/publishable). The **service role key alone is not enough** for the public site — never put the service role key in a `VITE_` variable.

## Step 4 — Run migrations

Using Supabase CLI (recommended):

```bash
npx supabase link --project-ref YOUR_REF
npx supabase db push
```

Or paste the SQL from `supabase/migrations/20260320000000_initial_schema.sql` into the SQL Editor and run.

## Step 5 — Storage buckets

The migration creates buckets: `product-images`, `website-assets`, `brand-logos`, `partner-client-logos`, `product-documents`.

Verify in **Storage** that they exist and policies are applied.

## Step 6 — Deploy Edge Functions

```bash
npx supabase functions deploy submit-product-inquiry
npx supabase functions deploy submit-contact
npx supabase functions deploy submit-service-inquiry
```

Functions use `SUPABASE_SERVICE_ROLE_KEY` automatically in the hosted environment.

## Step 7 — Seed data

```bash
npm run db:seed
```

This creates collections, brands, verified products (published), accessory placeholders (draft), partners, homepage sections, and company settings.

## Step 8 — Import assets

```bash
npm run assets:scan
npm run assets:import
npm run db:seed
```

Re-run seed after import so `product_images.storage_path` matches uploaded objects.

## Step 9 — First admin user

No public registration. Locally:

```bash
set BOOTSTRAP_ADMIN_EMAIL=you@company.com
set BOOTSTRAP_ADMIN_PASSWORD=your-secure-password
npm run bootstrap-admin
```

Then sign in at `/admin/login`.

Promote roles in **Admin → Users** (owner-only via RLS).

## Step 10 — Test RLS

| Test | Expected |
|------|----------|
| Anonymous `select` on published `products` | Allowed |
| Anonymous `select` on `inquiries` | Denied |
| Anonymous direct `insert` on `inquiries` | Denied |
| Edge Function product inquiry | Inserts inquiry + items |
| Staff login | CRUD per role |

## Step 11 — Vercel

Set the same `VITE_*` variables in Vercel project settings. Do **not** add the service role key to Vercel frontend env unless running server-side scripts in CI only (use protected env vars).
