-- Run once in Supabase → SQL Editor (fixes "permission denied for table orders")

grant usage on schema public to anon, authenticated;

grant select on table public.products to anon, authenticated;

grant select, insert on table public.orders to authenticated;
grant select, insert on table public.order_items to authenticated;

-- Keep existing RLS policies; these grants let authenticated users use them.
