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

Everything for the shop lives in this one folder. Two sub-folders are working
material, not part of the deployed site: `artwork/` holds the original PNGs the
web images were made from, and `docs/screenshots/` holds phone-width captures
taken during review. Both are git-ignored, so they never reach Vercel.

```
app/                 pages (App Router)
  page.tsx           home
  shop/              catalogue with search + category filter
  product/[slug]/    product detail (revalidated every 60s)
  cart/              cart + WhatsApp checkout (also records the order when Supabase is on)
  account/           optional customer sign in: order history, one-tap reorder, post-delivery ratings
  admin/             sign in + dashboard: products, CSV import, orders, ratings, promotions, team, settings
  services/ software/ courses/
  about/ contact/ quote/ import/ repair/ faq/
  policies/          shipping, returns, privacy, terms, cookies
  feed.xml/          product feed for Google Merchant Center / Facebook catalogues
  api/assistant/     chat replies for the Ask F.A button
  sitemap.ts robots.ts not-found.tsx icon.png
components/          header, footer, cards, buy box, forms, icons, policy shell, product gallery, assistant
lib/site.ts          business details, WhatsApp helper, GHS formatter
lib/catalogue.ts     5 categories + fallback sample products
lib/products.ts      product reads (Supabase, falling back to the sample file)
lib/assistant.ts     assistant rules: products, categories, policies, order status
lib/admin/           server-only admin queries + product/CSV validation
lib/promos.ts        cached banner read (used by the site header)
lib/reviews.ts       visible rating summary per product (used by the product page)
lib/cart.ts          localStorage cart (key: fa_cart)
lib/supabase/        server-only Supabase clients (read, cookie, service-role, roles/permissions)
middleware.ts        gates /admin and the /account page, refreshes the session
supabase/            schema + seed SQL (run once in the dashboard)
public/              logo, flyer, generated images (images/*.webp)
artwork/             PNG originals behind public/images/*.webp (local only)
docs/screenshots/    phone-width review captures (local only)
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
  A product can carry up to **five photos**: the first is the main image on
  cards and feeds, the rest show as thumbnails on the product page.
- Home, product pages and the sitemap revalidate every 60 seconds; `/shop`
  reads on each request.

The catalogue is **sample data**. Each product has a `verified` flag (admin
checkbox **Real price and stock**). While it is false, the shop labels the item
"Sample", shows the price as an "Example price", hides any comparison discount,
and sends buyers to "Check price & availability" instead of a firm add-to-cart.
Tick the box only once the price and stock are real. Prices, stock claims and
images should still be checked before launch.

## Using the dashboard

Sign in at `/admin`, then:

- **Products → Add product / edit.** One form for everything: price in cedis,
  specs one per line (`Label: Value`), and up to five photos (max 5 MB each).
  When editing, the current photos show as thumbnails: untick one to delete it
  (the stored file is removed too), or add new files to keep it and append.
  Leave the main image blank to use the first photo. Slug is fixed for edits, so
  existing links keep working. Leave **Real price and stock** unticked while the
  price is an example.
- **Import.** Download `public/products-import-template.csv`, fill it, then
  upload or paste it. The preview shows which rows are valid before anything is
  written; valid rows are upserted on slug, bad rows are listed and skipped.
- **Orders.** A cart sent from WhatsApp is also saved here, priced from the
  catalogue (not from the browser). Set New → Confirmed → Delivered, and print
  an **Invoice** (for the customer to pay) or a **Receipt** (payment received).
  Print with the button, or use the browser's own print dialog. Receipts say
  "payment not confirmed" until the order is Confirmed or Delivered. Both
  documents carry the shop logo, the contact details from **Settings**, and the
  signature block (signature image and signatory name when set).
- **Settings** (admins only). Change the phone, both WhatsApp numbers, email and
  address shown across the site, plus the signatory name and an optional
  signature image for invoices and receipts. Changes apply immediately. The
  logo is `public/logo.png` — replace that file to change it.
- **Promotions.** The newest active message becomes a gold banner across the
  site (updates within a minute). Deactivate to remove it; old ones stay for
  reference. The banner does not change any price — state the eligible products,
  end date and terms in the message, and only activate offers you can honour.
- **Team** (admins only). Create an account for a coworker with a temporary
  password, pick **Staff** or **Admin**, and tick the dashboard areas a Staff
  account may use: products, orders, promotions, shop settings. Admins hold all
  areas plus account management. You cannot change your own role, so an admin
  can never lock themselves out by accident.
- **Feed.** `/feed.xml` lists active products in Google Merchant format.

Roles live in the user's `app_metadata.role` (`admin` or `staff`) and, for
staff, the allowed areas in `app_metadata.perms`. Only the server can write
them — a signed-in user cannot promote themselves. Staff accounts created before
permissions existed keep products, orders and promotions. Public sign-ups are
turned off, so the only way in is an admin-created account; a signed-in account
with no role sees a "No access" card instead of the shop.

The header of the dashboard shows the same public pages as customers see; use
the links in the black bar to move between sections.

## Shop assistant

Every public page has an **Ask F.A** button. It answers from the live catalogue
and shop settings: a product's price and warranty by name, a category list,
delivery, payment, returns, location, and order status. For an order it needs
the order number **and** the phone used — refs are guessable, so the phone must
match before anything is shown.

It asks which language to use the first time it opens — English, Twi, French or
Spanish — and answers in that language from then on (the small language button
in its header changes it). Canned answers, link labels, order statuses, the
greeting and the suggestion buttons are translated; product names, specs and the
short descriptions stored in the database stay as entered. The chat header and
WhatsApp link are English. Each answer has a **Listen** link that reads it aloud
at a calm pace in the chosen language. English, French and Spanish are played by
Google's free text-to-speech through `/api/tts` (same-origin only, limited to 40
plays a minute per IP), so the voice is native even on phones that have no such
voice installed; long answers are split into short parts. Google has no Twi voice,
so Twi falls back to the device's speech synthesis (Akan voice when the phone has
one). If the voice route fails, every language falls back to the device voice
too. A round microphone button (shown only where the browser can listen) turns
the customer's speech into the question and reads the answer back automatically;
typed questions stay silent unless Listen is tapped. The assistant's picture is
`public/agent.webp` — replace that file to change it.

Unmatched questions go to Google Gemini (free tier) only when `GEMINI_API_KEY`
is set in the environment; without a key the assistant still answers the common
questions and points to WhatsApp. Order lookups never go to Google, the route is
same-origin only and limited to 20 messages a minute per IP, and the widget is
hidden inside `/admin` and on printed invoices.

## Admin setup

`/admin` is not linked from the site and is excluded from search engines. To
make it work:

1. Create a project at supabase.com (free tier is enough to start).
2. In the SQL editor, run `supabase/migrations/001_init.sql`, then
   `supabase/migrations/002_admin.sql`, then `supabase/migrations/003_verified.sql`,
   `supabase/migrations/004_settings.sql`, `supabase/migrations/005_product_images.sql`
   and `supabase/migrations/006_accounts_reviews.sql`, then `supabase/seed.sql`.
   The second file adds orders, promotions and the `product-images` storage
   bucket; the third adds the `verified` column; the fourth adds the editable
   shop settings row; the fifth adds the product photo list (up to five); the
   sixth adds customer accounts (orders linked to a user) and product ratings.
3. Authentication → Users → Add user: the admin's email and a strong password,
   auto-confirm the user. Then edit that user's **App metadata** (raw JSON) to
   `{"role": "admin"}`. Keep **Allow new users to sign up** on (shoppers need it
   for optional accounts); a role check keeps anyone without app metadata out of
   the dashboard. Email confirmation is optional — see “Customer accounts”.
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
Free tier below for the fixes. A coworker who forgets their password is reset
from Supabase → Authentication → Users (there is no self-service reset, because
the shop has no mail service on the free tier).

## Customer accounts and ratings

Accounts are optional: anyone can still order as a guest, and the cart lives in
the browser either way. Signing in (`/account`) adds a purchase history for
orders sent while signed in, a one-tap reorder button, and the ability to rate a
product once its order is marked **delivered** in the dashboard.

To switch it on:

1. Run `supabase/migrations/006_accounts_reviews.sql` (after 001–005).
2. Authentication → Providers → Email: keep **Allow new users to sign up** on.
   Confirm email can be **off** — without a paid mail service, Supabase's free
   sender is rate-limited, so instant sign-up is smoother. With it on, the
   customer must open the emailed link before signing in.
3. Nothing else: ratings are written server-side after the order is checked
   (signed-in buyer, delivered, product on that order), one per product per order.

The product page shows the average of **visible** ratings and refreshes within a
minute. In `/admin/reviews` (the Ratings tab, permission `reviews`) an admin can
hide or show each rating; hidden ones stay on record but drop out of the shop.

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
them. Phone, WhatsApp numbers, email, address and the document signatory are
edited in **Admin → Settings** (admins only).

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

Online payment, stock counting, email notifications.
Receipts and invoices print from the browser (no PDF server), so print from the
deployed site or a local production build — `next dev` is not a reliable place to
print from.
