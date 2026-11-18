-- Admin-editable photo for the Ask F.A assistant. Run after 006_accounts_reviews.sql.
alter table public.site_settings add column if not exists agent_url text not null default '';
