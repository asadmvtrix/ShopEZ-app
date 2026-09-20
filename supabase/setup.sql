-- ShopEZ Stage 2 schema + seed
-- Run once in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id bigint primary key,
  name text not null,
  category text not null,
  price numeric(10,2) not null check (price >= 0),
  image text not null,
  description text not null default '',
  stock integer not null default 50 check (stock >= 0),
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Anyone can read products" on public.products;
create policy "Anyone can read products"
  on public.products for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'paid_sandbox',
  subtotal numeric(10,2) not null check (subtotal >= 0),
  shipping numeric(10,2) not null default 0 check (shipping >= 0),
  tax numeric(10,2) not null default 0 check (tax >= 0),
  total numeric(10,2) not null check (total >= 0),
  payment_reference text,
  payment_brand text,
  payment_last4 text,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);

alter table public.orders enable row level security;

drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users create own orders" on public.orders;
create policy "Users create own orders"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = user_id);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id bigint references public.products (id) on delete set null,
  product_name text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(10,2) not null check (line_total >= 0)
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.order_items enable row level security;

drop policy if exists "Users read own order items" on public.order_items;
create policy "Users read own order items"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "Users insert own order items" on public.order_items;
create policy "Users insert own order items"
  on public.order_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

grant usage on schema public to anon, authenticated, service_role;
grant select on table public.products to anon, authenticated, service_role;
grant all on table public.orders to service_role;
grant all on table public.order_items to service_role;
grant select on table public.orders to authenticated;
grant select on table public.order_items to authenticated;

-- ---------------------------------------------------------------------------
-- Account deletion (used by the Account page)
-- ---------------------------------------------------------------------------
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;

-- ---------------------------------------------------------------------------
-- Seed catalogue (idempotent upsert)
-- ---------------------------------------------------------------------------
insert into public.products (id, name, category, price, image, description, stock)
values
  (1, 'SteelSeries Arctis Nova 7 Wireless Headset', 'Audio', 179.99, 'https://images.unsplash.com/photo-1677086813101-496781a0f327?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Z2FtaW5nJTIwaGVhZHNldHxlbnwwfHwwfHx8Mg%3D%3D', 'Wireless gaming headset with multi-platform support, retractable ClearCast mic, and up to 38-hour battery life. Lightweight steel headband with AirWeave ear cushions.', 50),
  (2, 'Samsung Galaxy Watch 6 Classic 47mm', 'Wearables', 329.99, 'https://images.unsplash.com/photo-1637160151663-a410315e4e75?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c21hcnQlMjB3YXRjaHxlbnwwfHwwfHx8Mg%3D%3D', 'Rotating bezel smartwatch with advanced health monitoring, BIA sensor, and sapphire crystal glass. Runs Wear OS with Samsung''s One UI Watch interface.', 50),
  (3, 'NVIDIA GeForce RTX 4070 Ti SUPER', 'PC Components', 799.99, 'https://static.webx.pk/files/87161/Images/czone-20260221064155-87161-0-210226064201883.webp', '16GB GDDR6X memory with Ada Lovelace architecture. DLSS 3, ray tracing cores, and AV1 encoding. Excellent 1440p and 4K gaming performance.', 50),
  (4, 'Keychron Q1 Max Wireless Mechanical Keyboard', 'Peripherals', 199.00, 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWVjaGFuaWNhbCUyMGtleWJvYXJkfGVufDB8fDB8fHwy', 'Triple-mode wireless mechanical keyboard with hot-swappable Gateron Jupiter switches, CNC aluminum case, and south-facing RGB. Supports Bluetooth, 2.4GHz, and USB-C.', 50),
  (5, 'Dell WD22TB4 Thunderbolt 4 Dock', 'Networking', 269.00, 'https://images.unsplash.com/photo-1760376789487-994070337c76?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNiJTIwaHVifGVufDB8fDB8fHwy', 'Thunderbolt 4 docking station with 180W power delivery, dual 4K display support, 2.5GbE ethernet, and multiple USB-A/C ports for streamlined workspace connectivity.', 50),
  (6, 'Fractal Design Torrent Compact Case', 'PC Components', 139.99, 'https://static.webx.pk/files/87161/Images/czone.com.pk-62-1540-19914-041225115920-87161-2509264-231225065423.webp', 'High-airflow ATX mid-tower with two pre-installed 180mm Dynamic X2 fans, open grille front panel, and optimized internal layout for serious cooling performance.', 50),
  (7, 'LG 27GP950-B UltraGear 27" 4K 160Hz Monitor', 'Displays', 649.99, 'https://images.unsplash.com/photo-1666771410140-0573b232426e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8OGslMjBNb25pdG9yJTIwd2hpdGV8ZW58MHx8MHx8fDI%3D', 'Nano IPS 4K UHD panel with 160Hz refresh rate, 1ms GtG response time, HDMI 2.1, and 98% DCI-P3 color coverage. G-SYNC Compatible and AMD FreeSync Premium Pro.', 50),
  (8, 'Elgato Facecam Pro 4K60 Webcam', 'Peripherals', 299.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHpuPkB1UY7BLt4J_FjDo7bbn5NkBVClhf2iNR-qJ20tBMGA9Aruau1sD9&s=10', '4K60fps streaming webcam with Sony STARVIS sensor, uncompressed video output via USB-C, adjustable FOV, and built-in privacy shutter. Works with Elgato Camera Hub software.', 50),
  (9, 'Corsair Vengeance DDR5 32GB 6000MHz', 'PC Components', 109.99, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop&q=60', '32GB (2x16GB) DDR5 memory kit rated at 6000MHz with XMP 3.0 support. Optimized for Intel and AMD platforms with aluminum heat spreader for thermal management.', 50),
  (10, 'Logitech MX Master 3S Mouse', 'Peripherals', 99.99, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60', 'Ergonomic wireless mouse with 8000 DPI sensor, MagSpeed scroll wheel, quiet clicks, and Flow cross-computer control. Connects via Bluetooth or Bolt receiver.', 50),
  (11, 'Samsung 990 Pro 2TB NVMe SSD', 'Storage', 179.99, 'https://banner2.cleanpng.com/20180814/srk/bba86bbbb9d9b20a4df43e8680c4329f.webp', 'PCIe Gen 4 NVMe M.2 SSD with sequential read speeds up to 7,450 MB/s and write speeds up to 6,900 MB/s. Samsung V-NAND technology with nickel-coated controller.', 50),
  (12, 'Corsair RM850x 850W 80+ Gold PSU', 'PC Components', 139.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTfDaRxLfhD6YgR-PLaWN4HegQVvyakEE33zoCHkwJvZx5eGDO5iIdAs4&s=10', 'Fully modular ATX power supply with 80 PLUS Gold efficiency, 135mm fan with zero-RPM mode, and fully sleeved cables. Ten-year warranty for long-term reliability.', 50),
  (13, 'Arctic Liquid Freezer II 360 AIO Cooler', 'PC Components', 109.99, 'https://www.arctic.de/media/f4/45/b2/1658395878/Liquid-Freezer-II-360-g06.jpg', '360mm all-in-one liquid CPU cooler with MX-6 thermal paste pre-applied, efficient pump design, and three P12 PWM fans. Compatible with Intel LGA1700 and AMD AM5.', 50),
  (14, 'LG C4 55" OLED evo 4K TV', 'Displays', 1299.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKZPonVrezUgZEOAp905Ox0oUvCylWwHmDOqT_x0Zzni5Fs-G-Nd0x56ou&s=10', '55-inch OLED evo panel with α9 Gen7 AI processor, Dolby Vision and Atmos, four HDMI 2.1 ports, 144Hz gaming mode, and webOS smart TV platform.', 50),
  (15, 'Anker 737 Power Bank 24000mAh', 'Power', 109.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRREamPcs1f2O7RCsfGy5b2TFlsj7agc2M8ICoggyBrZaxv_wEQFbtsjV2I&s=10', '24,000mAh portable charger with 140W max output via USB-C, smart digital display, and bi-directional fast charging. Can fully charge a MacBook Pro in under an hour.', 50),
  (16, 'Razer DeathAdder V3 HyperSpeed Mouse', 'Peripherals', 99.99, 'https://computerlounge.co.nz/cdn/shop/files/65625_productphoto1_1.png?v=1785295788&width=1200', 'Lightweight wireless gaming mouse at 63g with Focus Pro 35K optical sensor, Gen-3 optical switches rated for 90 million clicks, and HyperSpeed wireless connectivity.', 50),
  (17, 'JBL Quantum 910 Wireless Gaming Headset', 'Audio', 249.99, 'https://images.unsplash.com/photo-1599669454699-248893623440?w=500&auto=format&fit=crop&q=60', 'Wireless gaming headset with JBL QuantumSPATIAL 360, active noise cancelling, head-tracking, and up to 43-hour battery life. Compatible with PC, PlayStation, and Switch.', 50),
  (18, 'Crucial T705 4TB PCIe Gen5 NVMe SSD', 'Storage', 399.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqRIegbSs3ZVYo8UB7SDAdINxsFqgn_VUX8Ra37cB62A&s=10', 'PCIe Gen5 NVMe M.2 SSD delivering sequential read speeds up to 12,400 MB/s and write speeds up to 11,800 MB/s. Includes optional heatsink for sustained thermal performance.', 50),
  (19, 'ASUS ROG Strix B650E-F Gaming WiFi Motherboard', 'PC Components', 279.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTwQmyBrC9X0S8-nntXWfVclopurtqCDm6dNtf_rLewg&s=10', 'AMD B650E chipset motherboard with DDR5 support, PCIe 5.0 x16 slot, WiFi 6E, 2.5Gb Ethernet, and AI-powered cooling and networking. Robust VRM design for Ryzen 7000/9000 series.', 50),
  (20, 'BenQ ScreenBar Plus Monitor Light', 'Peripherals', 109.99, 'https://image.benq.com/is/image/benqco/01-screenbar-plus-controller-front45-1?$ResponsivePreset$', 'Asymmetric LED monitor light bar with auto-dimming sensor, wired controller, and USB-C power. Reduces screen glare while illuminating your desk evenly.', 50),
  (21, 'Western Digital WD_BLACK SN850X 2TB', 'Storage', 149.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGhYodvX0WbTJAa0UFclyyy907bJdh_7reev3nrIzC4cdyvjL16XV09ss&s=10', 'PCIe Gen4 NVMe SSD with up to 7,300 MB/s read speeds, Game Mode 2.0 optimization, and WD BLACK Dashboard software. Built for PC and PlayStation 5.', 50),
  (22, 'HyperX Cloud III Wireless Headset', 'Audio', 169.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjL-UFzlu0Z2atIiuEdJqlnpVRZoBU8v_EgzgU9ul1Sc416XSMa2g1tUA9&s=10', 'Wireless gaming headset with angled 53mm drivers, DTS Headphone:X spatial audio, and up to 120-hour battery life. Memory foam ear cushions with premium leatherette.', 50),
  (23, 'ASUS ProArt PA278QV 27" WQHD Monitor', 'Displays', 319.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBxJnzQTq4oS7i1a3nv-lMjNAket18Lq5xdf0bjJKNog&s=10', '27-inch WQHD IPS monitor with 100% sRGB, Calman Verified factory calibration, USB-C connectivity, and ergonomic stand with height/tilt/swivel/pivot adjustment.', 50),
  (24, 'Logitech G PRO X Superlight 2 Mouse', 'Peripherals', 159.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmNm5ZfqI97J85aE7j_WC2R99DZVeiFXfNBzhrZ8XM5Q&s', '60g wireless gaming mouse with HERO 2 sensor at 32,000 DPI, LIGHTSPEED wireless, and 95-hour battery. PTFE feet and zero-additive design for unobstructed glide.', 50),
  (25, 'Seasonic Focus GX-1000 1000W 80+ Gold PSU', 'PC Components', 189.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSsZ_wxCc-CQNpNDzd5s7QRArz6IEa3bZr4k_tBFYikJR2Eb6-7kATxgmh&s=10', 'Fully modular 1000W power supply with 80 PLUS Gold, hybrid fan control, and premium Japanese capacitors. ATX 3.0 ready with native 12VHPWR connector.', 50),
  (26, 'Noctua NH-D15 chromax.black CPU Cooler', 'PC Components', 109.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMA3pegNc8hYnpAegI5Vb7ZFLdB-qWI3alp26uQYbCpA&s', 'Dual-tower air cooler with two NF-A15 PWM fans, chromax.black coating, and SecuFirm2 mounting system. Near-silent operation with up to 246W TDP cooling capacity.', 50),
  (27, 'TP-Link Archer BE900 WiFi 7 Router', 'Networking', 599.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRGzNJOobWKUlnZE0eV3JCTWR93tGkQa6N9gPfe16Oh8MZgjKZTIVygxb1&s=10', 'Quad-band WiFi 7 router with speeds up to 24 Gbps, two 10G ports, 12-stream MLO, and HomeShield security. AI-driven mesh for whole-home coverage.', 50),
  (28, 'Glorious Model O 2 Wireless Mouse', 'Peripherals', 79.99, 'https://www.gloriousgaming.com/cdn/shop/files/GLO-MS-OV2-MW_Web_Gallery_Front_c3e70b0f-514e-422b-aa2c-8088675c9b02.webp?v=1720630358&width=800', 'Ultralight wireless gaming mouse at 57g with BAMF 2.0 optical sensor at 26,000 DPI, honeycomb shell, and 2.4GHz/Bluetooth dual connectivity.', 50),
  (29, 'NZXT Kraken Elite 360 RGB AIO', 'PC Components', 299.99, 'https://www.pakbyte.pk/cdn/shop/files/NZXT-Kraken-Elite-RGB-360-RL-KR36E-B1-360mm-AIO-CPU-Liquid-Cooler-Black-PakByte-Computers-25873436082243.jpg?v=1753672499', '360mm AIO liquid cooler with 2.1-inch LCD display on pump cap, customizable RGB, and three F120Q fans. CAM software integration for real-time system monitoring.', 50),
  (30, 'Sonos Era 300 Smart Speaker', 'Audio', 449.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbciTqvtq4GZ6jUMldvyZQSD759c4i7S9w0FaihiSD-VmNRvOP1hhUhDw&s=10', 'Premium spatial audio speaker with six drivers, Dolby Atmos support, Trueplay tuning, and AirPlay 2. Connects via WiFi 6, Bluetooth, or USB-C line-in.', 50),
  (31, 'Apple AirPods Pro 2 USB-C', 'Audio', 249.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFKfTxqmk4lOVqqLecof8WLAwG4RoKgdqZnfWPPewtkWCcLEnKGi3JX2WB&s=10', 'Active noise cancelling earbuds with Adaptive Transparency, personalized Spatial Audio, USB-C charging, IP54 dust resistance, and up to 6 hours of listening time.', 50),
  (32, 'Razer BlackWidow V4 75% Keyboard', 'Peripherals', 179.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtuLDDA3QuNQ-7BeG-rL6wFh4ilmamPLmZQN0V5wvvuw&s=10', 'Hot-swappable mechanical keyboard with Razer Orange Tactile switches, gasket-mounted FR4 plate, sound-dampening foam, and per-key RGB with aluminum top case.', 50),
  (33, 'Be Quiet Dark Power 13 1100W PSU', 'PC Components', 249.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBSjp4NDGK4_orR39yNYGLI1RaST2w4F9qx-_r51efoSOh2tQEo6pszjld&s=10', '80 PLUS Titanium ATX 3.0 power supply with full bridge LLC, frameless silent wings fan, and overclocking key switch. Native 12VHPWR for next-gen GPUs.', 50),
  (34, 'Corsair K100 RGB Mechanical Keyboard', 'Peripherals', 199.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBb1BwFS_XpzOrukkp3XKpSwpNl6iueZS30IJ8vt3wm2Em5q5Rvviy8oZl&s=10', 'Premium mechanical keyboard with OPX optical switches, iCUE control wheel, per-key RGB, PBT keycaps, and dedicated macro keys. Aluminum frame with USB passthrough.', 50),
  (35, 'ASUS ZenWiFi Pro ET12 Mesh Router', 'Networking', 449.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTENRAmjOMYz4Fu-no4VrEJM3mAwJKqjSqlGaj2KKHJTg&s=10', 'Tri-band WiFi 6E mesh system with dedicated backhaul, 6GHz band support, 2.5G WAN port, and AiMesh technology for seamless whole-home coverage up to 5500 sq ft.', 50),
  (36, 'WD My Passport 5TB External HDD', 'Storage', 129.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSC4yLFCpwK48EybgAyPnT-anxG4kxXC3_W5ikf0-qiA&s', '5TB portable external hard drive with USB 3.0, 256-bit AES hardware encryption, and WD Discovery software. Slim 2.5-inch form factor with backup scheduling.', 50),
  (37, 'Razer Kiyo Pro Ultra Webcam', 'Peripherals', 199.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRn-bX7zAovnjwgJGaGhDq0YK-xa0bakcTkHt29tvcIDw&s=10', '4K30fps webcam with large Sony STARVIS 2 sensor, adaptive light sensor, built-in ring light, and AI-powered image processing. Uncompressed 4K output via USB-C.', 50),
  (38, 'Phanteks Enthoo 719 Full Tower Case', 'PC Components', 199.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_lRNKhR1KouiyqX4wqpjgYOXPRPmz7mirQaeY6Bg-uQ&s=10', 'Full-tower case supporting dual systems, up to E-ATX motherboards, dual 480mm radiators, and vertical GPU mounting. Tempered glass side panel with D-RGB lighting.', 50),
  (39, 'SteelSeries Prime Wireless Gaming Mouse', 'Peripherals', 129.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQii0iSSshZSRmN2EGFChe8PBiVeANQJRb78v6LTylGEw&s', 'Esports-grade wireless mouse with Prestige OM switches rated for 100M clicks, TrueMove Air sensor at 18,000 DPI, and 100-hour battery life.', 50),
  (40, 'ASUS ROG Swift PG27AQDM 27" OLED Monitor', 'Displays', 799.99, 'https://dlcdnwebimgs.asus.com/gain/59F76A27-DF1B-4EB6-A47A-9604D403C261/w717/h525/fwebp', '27-inch QHD OLED monitor with 240Hz refresh rate, 0.03ms response time, anti-flicker technology, and 99% DCI-P3. Custom heatsink for sustained peak brightness.', 50)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  price = excluded.price,
  image = excluded.image,
  description = excluded.description;
