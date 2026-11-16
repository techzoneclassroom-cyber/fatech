-- Admin writes, order records and promotions. Run after 001_init.sql.
-- Writes go through the service-role key on the server, never the publishable key.

create sequence if not exists public.order_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  ref text unique not null
    default ('FA-' || to_char(now(), 'YYMM') || '-' || lpad(nextval('public.order_seq')::text, 4, '0')),
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 20),
  town text not null check (char_length(town) between 2 and 120),
  notes text not null default '',
  items jsonb not null default '[]'::jsonb,
  total_pesewas integer not null check (total_pesewas >= 0),
  status text not null default 'new' check (status in ('new', 'confirmed', 'delivered', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_created_idx on public.orders (created_at desc);
alter table public.orders enable row level security;
-- No policies on purpose: only the service-role key (server) may read or write orders.

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  message text not null check (char_length(message) between 2 and 200),
  href text not null default '/shop' check (href like '/%'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.promotions enable row level security;
create policy "public read active promotions" on public.promotions for select using (active = true);

-- Public bucket for product photos. Uploads use the service-role key; public reads use the
-- public object URL, so no storage policy is needed for reading.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
