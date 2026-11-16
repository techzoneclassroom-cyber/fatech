# F.A TECHNOLOGIES website

Marketing site and sample shop for F.A TECHNOLOGIES — Kumasi–Kwadaso, Ghana.
Next.js 15 (App Router) + React 19 + TypeScript. Orders and enquiries are composed
on the device and sent through WhatsApp. Products come from Supabase when it is
configured, otherwise from the built-in sample catalogue in `lib/catalogue.ts`.

Tagline: **Digital, Secure and Reliable.**

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # production
```

Optional: copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL`
to the live domain so canonical links, sitemap and Robots use it. The Supabase
variables are covered under Admin setup and are not needed to run the shop.

## What is in here

```
app/                 pages (App Router)
  page.tsx           home
  shop/              catalogue with search + category filter
  product/[slug]/    product detail (revalidated every 60s)
  cart/              cart + WhatsApp checkout
  admin/             sign in + protected dashboard (see Admin setup)
  services/ software/ courses/
  about/ contact/ quote/ import/ repair/ faq/
  policies/          shipping, returns, privacy, terms, cookies
  sitemap.ts robots.ts not-found.tsx icon.png
components/          header, footer, cards, buy box, forms, icons, policy shell
lib/site.ts          business details, WhatsApp helper, GHS formatter
lib/catalogue.ts     5 categories + fallback sample products
lib/products.ts      product reads (Supabase, falling back to the sample file)
lib/cart.ts          localStorage cart (key: fa_cart)
lib/supabase/        server-only Supabase clients
middleware.ts        gates /admin, refreshes the admin session
supabase/            schema + seed SQL (run once in the dashboard)
public/              logo, flyer, generated images (images/*.webp)
```

## Editing the shop

Products are read from the `products` table when Supabase is configured. Until
then the shop uses `PRODUCTS` in `lib/catalogue.ts` (the same 18 sample items).

- DB columns mirror the code: `price_pesewas` and `compare_at_pesewas` are
  integers (450000 = GH₵4,500.00), `specs` is a JSON array of `[label, value]`
  pairs, `active = false` hides an item, `featured` puts it on the homepage,
  `sort` controls order.
- Categories stay in code (`CATEGORIES` in `lib/catalogue.ts`); a product's
  `category` must match one of their slugs.
- Images live in `public/images/` and are stored as paths (`/images/p-ac.webp`).
  Photo uploads from the dashboard are a later phase.
- Home, product pages and the sitemap revalidate every 60 seconds; `/shop`
  reads on each request.

The catalogue is **sample data**. Replace prices, stock claims and images with
verified information before launch, and remove the "Sample" badges in
`components/product-card.tsx` and `app/product/[slug]/page.tsx` when you do.

## Admin setup

`/admin` is not linked from the site and is excluded from search engines. To
make it work:

1. Create a project at supabase.com (free tier is enough to start).
2. In the SQL editor, run `supabase/migrations/001_init.sql`, then `supabase/seed.sql`.
3. Authentication → Users → Add user: the admin's email and a strong password,
   auto-confirm the user.
4. In Project Settings → API, copy the project URL and the publishable (anon) key
   into `.env.local` and into Vercel's environment variables:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
5. Rebuild (`npm run dev` locally, or redeploy) and sign in at `/admin`.

The publishable key is safe to ship in the browser bundle: row-level security
only allows it to *read* active products. Writes will be added later through a
server-only service-role key — never expose that key with a `NEXT_PUBLIC_` name.

Notes: the free tier pauses a project after a week of low activity (data is kept;
resume it from the dashboard within a year) and keeps no scheduled backups. See
Free tier below for the fixes. Passwords are reset from the Supabase dashboard,
not from the site.

## Free tier

Everything built so far runs on free plans; no paid feature is used.

- **Keeping Supabase awake.** `/api/health` runs one small query. `vercel.json`
  schedules it daily at 06:00 UTC, which is enough to stop the 7-day pause
  (Vercel's free plan allows one cron run per day). Hosting elsewhere? Point a
  free cron service such as cron-job.org at `https://your-domain/api/health` once
  a day. Normal shop traffic also counts.
- **Backups.** Free Supabase has no scheduled backups, so
  `.github/workflows/backup.yml` dumps the `public` schema every Sunday and keeps
  the file as a workflow artifact for 90 days (about 13 rolling copies). Setup:
  add a repository secret `SUPABASE_DB_URL` — Supabase → Connect → **Session
  pooler**, port 5432, path `/postgres`, password URL-encoded. Restore with
  `pg_restore --no-owner -d "<that url>" fatech.dump`. Keep the repository
  **private**; artifacts contain real order data once there is any. Admin logins
  live in Supabase Auth and are not in the dump — re-add them from the dashboard.
  GitHub pauses scheduled workflows after 60 days with no repository activity; a
  push, or a manual run from the Actions tab (workflow_dispatch), restarts it.
  Move to Pro (about $25/month) if you want longer than 90 days of history.
- **Hosting licence.** Vercel's Hobby plan is for personal, non-commercial use; a
  shop is commercial, so Vercel wants Pro (about $20/month). Netlify's free plan
  allows commercial sites within its credit limits, and supports Next.js 15 —
  that is the zero-cost option if you do not want to pay Vercel.
- **Storage.** Photo uploads (next phase) fit in Supabase's 1 GB free storage at
  the current 900px WebP sizes; there is no need for paid storage at this size.

## Orders and enquiries

No server or database is used. `components/enquiry-form.tsx` and `app/cart/page.tsx`
build a formatted message and open `https://wa.me/<number>` with it pre-filled,
so the customer sends it from their own WhatsApp. Phone, email and map links are
plain `tel:`, `mailto:` and Google Maps links. If WhatsApp is blocked, the pages
show a fallback link.

To change numbers or email, edit `BUSINESS` in `lib/site.ts`.

## Deploy (when you are ready)

1. Push the `fatech` folder to GitHub.
2. Import the repo in Vercel, framework preset **Next.js**, no build tweaks needed.
3. Add `NEXT_PUBLIC_SITE_URL=https://your-domain` plus the two Supabase variables
   (see Admin setup) in Vercel → Settings → Environment Variables.
4. Deploy, then point the domain at Vercel.

Nothing needs Supabase for the site to run; without it the sample catalogue is used.

## Before launch — must do

- Replace sample products, prices and photos with real ones.
- Have the business review every policy page (`app/policies/*`) — they are marked
  "Draft policy" and are not legal advice.
- Confirm the shop address, opening hours and delivery areas.

## Not built yet

Admin product editing and photo uploads, CSV import, order records with printable
receipts/invoices, promotions, online payment, customer accounts, stock
management, email notifications, reviews.
