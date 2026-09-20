-- Run once in Supabase → SQL Editor (same project as VITE_SUPABASE_URL)
-- Orders are created by the Vercel API with the service role key.
-- Authenticated clients only need to read their own orders (RLS still applies).

grant usage on schema public to anon, authenticated, service_role;

grant select on table public.products to anon, authenticated, service_role;

grant all on table public.orders to service_role;
grant all on table public.order_items to service_role;

revoke insert, update, delete on table public.orders from authenticated;
revoke insert, update, delete on table public.order_items from authenticated;

grant select on table public.orders to authenticated;
grant select on table public.order_items to authenticated;
