-- A product is a sample until someone confirms its price and stock.
-- Everything with verified = false shows example prices in the shop.
alter table public.products add column if not exists verified boolean not null default false;
