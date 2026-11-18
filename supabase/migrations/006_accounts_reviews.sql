-- Customer accounts (sign-up is done from /account), purchase history links and
-- verified product ratings. Run in the Supabase SQL editor after 005_product_images.sql.

-- Orders placed while signed in are linked to the buyer; older guest orders stay unlinked.
alter table public.orders add column if not exists user_id uuid references auth.users (id) on delete set null;
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  order_ref text not null,
  rating smallint not null check (rating between 1 and 5),
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  unique (order_ref, product_slug)
);

create index if not exists reviews_slug_idx on public.reviews (product_slug, created_at desc);

alter table public.reviews enable row level security;
-- The shop reads only visible ratings with the publishable key; writes and hiding use the service role.
create policy "public read visible reviews" on public.reviews for select using (hidden = false);
