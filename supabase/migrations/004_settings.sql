-- One row of business details the admin edits from /admin/settings.
-- The shop shows these instead of the hard-coded defaults in lib/contact.ts.
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  phone text not null default '054 257 5486',
  whatsapp1 text not null default '054 257 5486',
  whatsapp2 text not null default '059 243 0443',
  email text not null default 'f.a.enterprisegh@gmail.com',
  location text not null default 'Kumasi–Kwadaso, Ghana',
  signatory text not null default '',
  signature_url text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values (1) on conflict do nothing;

alter table public.site_settings enable row level security;
drop policy if exists "settings are public" on public.site_settings;
create policy "settings are public" on public.site_settings for select using (true);
