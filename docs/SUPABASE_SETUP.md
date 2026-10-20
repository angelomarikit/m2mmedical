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

## Step 5 — Storage buckets (SQL Editor — no CLI required)

Admin product photos and logo uploads use **Supabase Storage** from the browser. You only need buckets + policies in the database.

1. Open **Supabase Dashboard → SQL Editor → New query**.
2. Paste the full contents of **`docs/SUPABASE_STORAGE.sql`** and click **Run**.
3. Confirm under **Storage** that these buckets exist (public):  
   `product-images`, `website-assets`, `brand-logos`, `partner-client-logos`, `product-documents`.

If `insert into storage.buckets` fails in SQL Editor, create the same five buckets manually in **Storage → New bucket** (public), then run only the **policy** section of `SUPABASE_STORAGE.sql`.

You must be signed in to the admin as **approved** staff (`profiles.approval_status = 'approved'`, role owner/admin/editor) for uploads to succeed.

Optional CLI alternative: `npm run storage:ensure` (uses service role locally; not required if you use SQL).

## Step 6 — Deploy Edge Functions

```bash
npx supabase functions deploy submit-product-inquiry
npx supabase functions deploy submit-contact
npx supabase functions deploy submit-service-inquiry
npx supabase functions deploy admin-users
npx supabase functions deploy register-staff
```

Optional: `staff-upload` Edge Function (only if you use CLI deploy for uploads; **not required** when using SQL storage policies + browser upload).
```

In **Authentication → Providers → Email**, turn **Confirm email** off if you want instant sign-in after admin approval (registration uses server-side confirm).

Staff self-register at `/admin/register`; owners/admins approve under **Users & access**.

Apply migrations after pulling updates (e.g. staff delete on inquiries):

```bash
npx supabase db push
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
set BOOTSTRAP_ADMIN_EMAIL=admin@m2mmedical.com
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
