-- Up to five photos per product, main image first. `image` stays the main image
-- so cards, feeds and order documents keep working without changes.
alter table public.products add column if not exists images text[] not null default '{}';
