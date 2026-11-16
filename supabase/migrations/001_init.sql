-- F.A TECHNOLOGIES catalogue. Run this once in the Supabase SQL editor.
-- Money is integer pesewas (GHS 1,250.00 = 125000).
-- Category ids match lib/catalogue.ts; adding a category is a code change too.

create extension if not exists pgcrypto;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 120),
  category text not null,
  brand text not null default '',
  price_pesewas integer not null check (price_pesewas >= 0),
  compare_at_pesewas integer check (compare_at_pesewas is null or compare_at_pesewas >= 0),
  condition text not null default 'new' check (condition in ('new', 'refurbished', 'used')),
  warranty text not null default '',
  short text not null default '',
  specs jsonb not null default '[]'::jsonb check (jsonb_typeof(specs) = 'array'),
  image text not null,
  featured boolean not null default false,
  active boolean not null default true,
  sort integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- The shop reads active products with the publishable key. No write policy exists,
-- so the public key cannot change anything; admin writes will use the service role.
create policy "public read active products"
  on public.products for select
  using (active = true);
