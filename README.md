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
  cart/              cart + WhatsApp checkout (also records the order when Supabase is on)
  admin/             sign in + dashboard: products, CSV import, orders, promotions
  services/ software/ courses/
  about/ contact/ quote/ import/ repair/ faq/
  policies/          shipping, returns, privacy, terms, cookies
  feed.xml/          product feed for Google Merchant Center / Facebook catalogues
  sitemap.ts robots.ts not-found.tsx icon.png
components/          header, footer, cards, buy box, forms, icons, policy shell
lib/site.ts          business details, WhatsApp helper, GHS formatter
lib/catalogue.ts     5 categories + fallback sample products
lib/products.ts      product reads (Supabase, falling back to the sample file)
lib/admin/           server-only admin queries + product/CSV validation
lib/promos.ts        cached banner read (used by the site header)
lib/cart.ts          localStorage cart (key: fa_cart)
lib/supabase/        server-only Supabase clients (read, cookie, service-role)
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
- Images can be a path (`/images/p-ac.webp`) or an uploaded photo's public URL;
  the dashboard uploads to the `product-images` bucket in Supabase Storage.
- Home, product pages and the sitemap revalidate every 60 seconds; `/shop`
  reads on each request.

The catalogue is **sample data**. Replace prices, stock claims and images with
verified information before launch, and remove the "Sample" badges in
`components/product-card.tsx` and `app/product/[slug]/page.tsx` when you do.

## Using the dashboard

Sign in at `/admin`, then:

- **Products → Add product / edit.** One form for everything: price in cedis,
  specs one per line (`Label: Value`), and a photo file up to 5 MB. Saving a
  photo stores it in Supabase and replaces the image path. Slug is fixed for
  edits, so existing links keep working.
- **Import.** Download `public/products-import-template.csv`, fill it, then
  upload or paste it. The preview shows which rows are valid before anything is
  written; valid rows are upserted on slug, bad rows are listed and skipped.
- **Orders.** A cart sent from WhatsApp is also saved here, priced from the
  catalogue (not from the browser). Set New → Confirmed → Delivered, and print
  an **Invoice** (for the customer to pay) or a **Receipt** (payment received).
  Print with the button, or use the browser's own print dialog. Receipts say
  "payment not confirmed" until the order is Confirmed or Delivered.
- **Promotions.** The newest active message becomes a gold banner across the
  site (updates within a minute). Deactivate to remove it; old ones stay for
  reference.
- **Feed.** `/feed.xml` lists active products in Google Merchant format.

The header of the dashboard shows the same public pages as customers see; use
the links in the black bar to move between sections.

## Admin setup

`/admin` is not linked from the site and is excluded from search engines. To
make it work:

1. Create a project at supabase.com (free tier is enough to start).
2. In the SQL editor, run `supabase/migrations/001_init.sql`, then
   `supabase/migrations/002_admin.sql`, then `supabase/seed.sql`. The second file
   adds orders, promotions and the `product-images` storage bucket.
3. Authentication → Users → Add user: the admin's email and a strong password,
   auto-confirm the user.
4. In Project Settings → API, copy the project URL, the publishable (anon) key
   and the **service_role** key. Put all three in `.env.local` (local) and in
   Vercel's environment variables:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`.
5. Rebuild (`npm run dev` locally, or redeploy) and sign in at `/admin`.

The publishable key is safe to ship in the browser bundle: row-level security
only allows it to read active products and active promotions. Every write
(product edits, photo uploads, orders, promotions) goes through the server-only
service-role key, which must never be named with a `NEXT_PUBLIC_` prefix or
committed. The dashboard still checks the signed-in user on each action, so the
key is not reachable by a visitor.

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
- **Storage.** The 5 MB upload limit keeps photos inside Supabase's 1 GB free
  storage for a long time at shop-sized catalogues; compress before uploading if
  a batch of phone photos gets close.

## Orders and enquiries

Enquiries (`components/enquiry-form.tsx` and the quote/repair/import forms) build
a formatted message and open `https://wa.me/<number>` with it pre-filled, so the
customer sends it from their own WhatsApp. Phone, email and map links are plain
`tel:`, `mailto:` and Google Maps links. If WhatsApp is blocked, the pages show a
fallback link.

With Supabase configured, the cart also saves the order before opening WhatsApp:
the server re-prices every line from the `products` table, so a tampered browser
cannot change what is recorded. If saving fails the customer still gets the
WhatsApp message and a local reference — nothing blocks the sale. Mark the order
Confirmed on WhatsApp when payment is agreed, then Delivered when handed over.
The reference (`FA-YYMM-NNNN`) is shown to the customer and on the invoice.

Order records are only visible to signed-in admins; the public key cannot read
them. To change numbers or email, edit `BUSINESS` in `lib/site.ts`.

## Deploy (when you are ready)

1. Push the `fatech` folder to GitHub.
2. Import the repo in Vercel, framework preset **Next.js**, no build tweaks needed.
3. Add `NEXT_PUBLIC_SITE_URL=https://your-domain` plus the three Supabase
   variables (see Admin setup) in Vercel → Settings → Environment Variables.
4. Deploy, then point the domain at Vercel.

Nothing needs Supabase for the site to run; without it the sample catalogue is used.

## Before launch — must do

- Replace sample products, prices and photos with real ones.
- Have the business review every policy page (`app/policies/*`) — they are marked
  "Draft policy" and are not legal advice.
- Confirm the shop address, opening hours and delivery areas.

## Not built yet

Online payment, customer accounts, stock counting, email notifications, reviews.
Receipts and invoices print from the browser (no PDF server), so print from the
deployed site or a local production build — `next dev` is not a reliable place to
print from.
