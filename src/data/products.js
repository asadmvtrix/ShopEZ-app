const products = [
  {
    id: 1,
    name: "SteelSeries Arctis Nova 7 Wireless Headset",
    category: "Audio",
    price: 179.99,
    image:
      "https://images.unsplash.com/photo-1677086813101-496781a0f327?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Z2FtaW5nJTIwaGVhZHNldHxlbnwwfHwwfHx8Mg%3D%3D",
    description:
      "Wireless gaming headset with multi-platform support, retractable ClearCast mic, and up to 38-hour battery life. Lightweight steel headband with AirWeave ear cushions.",
  },
  {
    id: 2,
    name: "Samsung Galaxy Watch 6 Classic 47mm",
    category: "Wearables",
    price: 329.99,
    image:
      "https://images.unsplash.com/photo-1637160151663-a410315e4e75?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c21hcnQlMjB3YXRjaHxlbnwwfHwwfHx8Mg%3D%3D",
    description:
      "Rotating bezel smartwatch with advanced health monitoring, BIA sensor, and sapphire crystal glass. Runs Wear OS with Samsung's One UI Watch interface.",
  },
  {
    id: 3,
    name: "NVIDIA GeForce RTX 4070 Ti SUPER",
    category: "PC Components",
    price: 799.99,
    image:
      "https://static.webx.pk/files/87161/Images/czone-20260221064155-87161-0-210226064201883.webp",
    description:
      "16GB GDDR6X memory with Ada Lovelace architecture. DLSS 3, ray tracing cores, and AV1 encoding. Excellent 1440p and 4K gaming performance.",
  },
  {
    id: 4,
    name: "Keychron Q1 Max Wireless Mechanical Keyboard",
    category: "Peripherals",
    price: 199.00,
    image:
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWVjaGFuaWNhbCUyMGtleWJvYXJkfGVufDB8fDB8fHwy",
    description:
      "Triple-mode wireless mechanical keyboard with hot-swappable Gateron Jupiter switches, CNC aluminum case, and south-facing RGB. Supports Bluetooth, 2.4GHz, and USB-C.",
  },
  {
    id: 5,
    name: "Dell WD22TB4 Thunderbolt 4 Dock",
    category: "Networking",
    price: 269.00,
    image:
      "https://images.unsplash.com/photo-1760376789487-994070337c76?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNiJTIwaHVifGVufDB8fDB8fHwy",
    description:
      "Thunderbolt 4 docking station with 180W power delivery, dual 4K display support, 2.5GbE ethernet, and multiple USB-A/C ports for streamlined workspace connectivity.",
  },
  {
    id: 6,
    name: "Fractal Design Torrent Compact Case",
    category: "PC Components",
    price: 139.99,
    image:
      "https://static.webx.pk/files/87161/Images/czone.com.pk-62-1540-19914-041225115920-87161-2509264-231225065423.webp",
    description:
      "High-airflow ATX mid-tower with two pre-installed 180mm Dynamic X2 fans, open grille front panel, and optimized internal layout for serious cooling performance.",
  },
  {
    id: 7,
    name: "LG 27GP950-B UltraGear 27\" 4K 160Hz Monitor",
    category: "Displays",
    price: 649.99,
    image:
      "https://images.unsplash.com/photo-1666771410140-0573b232426e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8OGslMjBNb25pdG9yJTIwd2hpdGV8ZW58MHx8MHx8fDI%3D",
    description:
      "Nano IPS 4K UHD panel with 160Hz refresh rate, 1ms GtG response time, HDMI 2.1, and 98% DCI-P3 color coverage. G-SYNC Compatible and AMD FreeSync Premium Pro.",
  },
  {
    id: 8,
    name: "Elgato Facecam Pro 4K60 Webcam",
    category: "Peripherals",
    price: 299.99,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHpuPkB1UY7BLt4J_FjDo7bbn5NkBVClhf2iNR-qJ20tBMGA9Aruau1sD9&s=10",
    description:
      "4K60fps streaming webcam with Sony STARVIS sensor, uncompressed video output via USB-C, adjustable FOV, and built-in privacy shutter. Works with Elgato Camera Hub software.",
  },
  {
    id: 9,
    name: "Corsair Vengeance DDR5 32GB 6000MHz",
    category: "PC Components",
    price: 109.99,
    image:
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop&q=60",
    description:
      "32GB (2x16GB) DDR5 memory kit rated at 6000MHz with XMP 3.0 support. Optimized for Intel and AMD platforms with aluminum heat spreader for thermal management.",
  },
  {
    id: 10,
    name: "Logitech MX Master 3S Mouse",
    category: "Peripherals",
    price: 99.99,
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60",
    description:
      "Ergonomic wireless mouse with 8000 DPI sensor, MagSpeed scroll wheel, quiet clicks, and Flow cross-computer control. Connects via Bluetooth or Bolt receiver.",
  },
  {
    id: 11,
    name: "Samsung 990 Pro 2TB NVMe SSD",
    category: "Storage",
    price: 179.99,
    image:
      "https://banner2.cleanpng.com/20180814/srk/bba86bbbb9d9b20a4df43e8680c4329f.webp",
    description:
      "PCIe Gen 4 NVMe M.2 SSD with sequential read speeds up to 7,450 MB/s and write speeds up to 6,900 MB/s. Samsung V-NAND technology with nickel-coated controller.",
  },
  {
    id: 12,
    name: "Corsair RM850x 850W 80+ Gold PSU",
    category: "PC Components",
    price: 139.99,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTfDaRxLfhD6YgR-PLaWN4HegQVvyakEE33zoCHkwJvZx5eGDO5iIdAs4&s=10",
    description:
      "Fully modular ATX power supply with 80 PLUS Gold efficiency, 135mm fan with zero-RPM mode, and fully sleeved cables. Ten-year warranty for long-term reliability.",
  },
  {
    id: 13,
    name: "Arctic Liquid Freezer II 360 AIO Cooler",
    category: "PC Components",
    price: 109.99,
    image:
      "https://www.arctic.de/media/f4/45/b2/1658395878/Liquid-Freezer-II-360-g06.jpg",
    description:
      "360mm all-in-one liquid CPU cooler with MX-6 thermal paste pre-applied, efficient pump design, and three P12 PWM fans. Compatible with Intel LGA1700 and AMD AM5.",
  },
  {
    id: 14,
    name: "LG C4 55\" OLED evo 4K TV",
    category: "Displays",
    price: 1299.99,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKZPonVrezUgZEOAp905Ox0oUvCylWwHmDOqT_x0Zzni5Fs-G-Nd0x56ou&s=10",
    description:
      "55-inch OLED evo panel with α9 Gen7 AI processor, Dolby Vision and Atmos, four HDMI 2.1 ports, 144Hz gaming mode, and webOS smart TV platform.",
  },
  {
    id: 15,
    name: "Anker 737 Power Bank 24000mAh",
    category: "Power",
    price: 109.99,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRREamPcs1f2O7RCsfGy5b2TFlsj7agc2M8ICoggyBrZaxv_wEQFbtsjV2I&s=10",
    description:
      "24,000mAh portable charger with 140W max output via USB-C, smart digital display, and bi-directional fast charging. Can fully charge a MacBook Pro in under an hour.",
  },
  {
    id: 16,
    name: "Razer DeathAdder V3 HyperSpeed Mouse",
    category: "Peripherals",
    price: 99.99,
    image:
      "https://computerlounge.co.nz/cdn/shop/files/65625_productphoto1_1.png?v=1785295788&width=1200",
    description:
      "Lightweight wireless gaming mouse at 63g with Focus Pro 35K optical sensor, Gen-3 optical switches rated for 90 million clicks, and HyperSpeed wireless connectivity.",
  },
  {
    id: 17,
    name: "JBL Quantum 910 Wireless Gaming Headset",
    category: "Audio",
    price: 249.99,
    image:
      "https://images.unsplash.com/photo-1599669454699-248893623440?w=500&auto=format&fit=crop&q=60",
    description:
      "Wireless gaming headset with JBL QuantumSPATIAL 360, active noise cancelling, head-tracking, and up to 43-hour battery life. Compatible with PC, PlayStation, and Switch.",
  },
  {
    id: 18,
    name: "Crucial T705 4TB PCIe Gen5 NVMe SSD",
    category: "Storage",
    price: 399.99,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqRIegbSs3ZVYo8UB7SDAdINxsFqgn_VUX8Ra37cB62A&s=10",
    description:
      "PCIe Gen5 NVMe M.2 SSD delivering sequential read speeds up to 12,400 MB/s and write speeds up to 11,800 MB/s. Includes optional heatsink for sustained thermal performance.",
  },
  {
    id: 19,
    name: "ASUS ROG Strix B650E-F Gaming WiFi Motherboard",
    category: "PC Components",
    price: 279.99,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTwQmyBrC9X0S8-nntXWfVclopurtqCDm6dNtf_rLewg&s=10",
    description:
      "AMD B650E chipset motherboard with DDR5 support, PCIe 5.0 x16 slot, WiFi 6E, 2.5Gb Ethernet, and AI-powered cooling and networking. Robust VRM design for Ryzen 7000/9000 series.",
  },
  {
    id: 20,
    name: "BenQ ScreenBar Plus Monitor Light",
    category: "Peripherals",
    price: 109.99,
    image: "https://image.benq.com/is/image/benqco/01-screenbar-plus-controller-front45-1?$ResponsivePreset$",
    description:
      "Asymmetric LED monitor light bar with auto-dimming sensor, wired controller, and USB-C power. Reduces screen glare while illuminating your desk evenly.",
  },
  {
    id: 21,
    name: "Western Digital WD_BLACK SN850X 2TB",
    category: "Storage",
    price: 149.99,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGhYodvX0WbTJAa0UFclyyy907bJdh_7reev3nrIzC4cdyvjL16XV09ss&s=10",
    description:
      "PCIe Gen4 NVMe SSD with up to 7,300 MB/s read speeds, Game Mode 2.0 optimization, and WD BLACK Dashboard software. Built for PC and PlayStation 5.",
  },
  {
    id: 22,
    name: "HyperX Cloud III Wireless Headset",
    category: "Audio",
    price: 169.99,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjL-UFzlu0Z2atIiuEdJqlnpVRZoBU8v_EgzgU9ul1Sc416XSMa2g1tUA9&s=10",
    description:
      "Wireless gaming headset with angled 53mm drivers, DTS Headphone:X spatial audio, and up to 120-hour battery life. Memory foam ear cushions with premium leatherette.",
  },
  {
    id: 23,
    name: "ASUS ProArt PA278QV 27\" WQHD Monitor",
    category: "Displays",
    price: 319.99,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBxJnzQTq4oS7i1a3nv-lMjNAket18Lq5xdf0bjJKNog&s=10",
    description:
      "27-inch WQHD IPS monitor with 100% sRGB, Calman Verified factory calibration, USB-C connectivity, and ergonomic stand with height/tilt/swivel/pivot adjustment.",
  },
  {
    id: 24,
    name: "Logitech G PRO X Superlight 2 Mouse",
    category: "Peripherals",
    price: 159.99,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmNm5ZfqI97J85aE7j_WC2R99DZVeiFXfNBzhrZ8XM5Q&s",
    description:
      "60g wireless gaming mouse with HERO 2 sensor at 32,000 DPI, LIGHTSPEED wireless, and 95-hour battery. PTFE feet and zero-additive design for unobstructed glide.",
  },
  {
    id: 25,
    name: "Seasonic Focus GX-1000 1000W 80+ Gold PSU",
    category: "PC Components",
    price: 189.99,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSsZ_wxCc-CQNpNDzd5s7QRArz6IEa3bZr4k_tBFYikJR2Eb6-7kATxgmh&s=10",
    description:
      "Fully modular 1000W power supply with 80 PLUS Gold, hybrid fan control, and premium Japanese capacitors. ATX 3.0 ready with native 12VHPWR connector.",
  },
  {
    id: 26,
    name: "Noctua NH-D15 chromax.black CPU Cooler",
    category: "PC Components",
    price: 109.99,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMA3pegNc8hYnpAegI5Vb7ZFLdB-qWI3alp26uQYbCpA&s",
    description:
      "Dual-tower air cooler with two NF-A15 PWM fans, chromax.black coating, and SecuFirm2 mounting system. Near-silent operation with up to 246W TDP cooling capacity.",
  },
  {
    id: 27,
    name: "TP-Link Archer BE900 WiFi 7 Router",
    category: "Networking",
    price: 599.99,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRGzNJOobWKUlnZE0eV3JCTWR93tGkQa6N9gPfe16Oh8MZgjKZTIVygxb1&s=10",
    description:
      "Quad-band WiFi 7 router with speeds up to 24 Gbps, two 10G ports, 12-stream MLO, and HomeShield security. AI-driven mesh for whole-home coverage.",
  },
  {
    id: 28,
    name: "Glorious Model O 2 Wireless Mouse",
    category: "Peripherals",
    price: 79.99,
    image: "https://www.gloriousgaming.com/cdn/shop/files/GLO-MS-OV2-MW_Web_Gallery_Front_c3e70b0f-514e-422b-aa2c-8088675c9b02.webp?v=1720630358&width=800",
    description:
      "Ultralight wireless gaming mouse at 57g with BAMF 2.0 optical sensor at 26,000 DPI, honeycomb shell, and 2.4GHz/Bluetooth dual connectivity.",
  },
  {
    id: 29,
    name: "NZXT Kraken Elite 360 RGB AIO",
    category: "PC Components",
    price: 299.99,
    image: "https://www.pakbyte.pk/cdn/shop/files/NZXT-Kraken-Elite-RGB-360-RL-KR36E-B1-360mm-AIO-CPU-Liquid-Cooler-Black-PakByte-Computers-25873436082243.jpg?v=1753672499",
    description:
      "360mm AIO liquid cooler with 2.1-inch LCD display on pump cap, customizable RGB, and three F120Q fans. CAM software integration for real-time system monitoring.",
  },
  {
    id: 30,
    name: "Sonos Era 300 Smart Speaker",
    category: "Audio",
    price: 449.99,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbciTqvtq4GZ6jUMldvyZQSD759c4i7S9w0FaihiSD-VmNRvOP1hhUhDw&s=10",
    description:
      "Premium spatial audio speaker with six drivers, Dolby Atmos support, Trueplay tuning, and AirPlay 2. Connects via WiFi 6, Bluetooth, or USB-C line-in.",
  },
  {
    id: 31,
    name: "Apple AirPods Pro 2 USB-C",
    category: "Audio",
    price: 249.99,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFKfTxqmk4lOVqqLecof8WLAwG4RoKgdqZnfWPPewtkWCcLEnKGi3JX2WB&s=10",
    description:
      "Active noise cancelling earbuds with Adaptive Transparency, personalized Spatial Audio, USB-C charging, IP54 dust resistance, and up to 6 hours of listening time.",
  },
  {
    id: 32,
    name: "Razer BlackWidow V4 75% Keyboard",
    category: "Peripherals",
    price: 179.99,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtuLDDA3QuNQ-7BeG-rL6wFh4ilmamPLmZQN0V5wvvuw&s=10",
    description:
      "Hot-swappable mechanical keyboard with Razer Orange Tactile switches, gasket-mounted FR4 plate, sound-dampening foam, and per-key RGB with aluminum top case.",
  },
  {
    id: 33,
    name: "Be Quiet Dark Power 13 1100W PSU",
    category: "PC Components",
    price: 249.99,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBSjp4NDGK4_orR39yNYGLI1RaST2w4F9qx-_r51efoSOh2tQEo6pszjld&s=10",
    description:
      "80 PLUS Titanium ATX 3.0 power supply with full bridge LLC, frameless silent wings fan, and overclocking key switch. Native 12VHPWR for next-gen GPUs.",
  },
  {
    id: 34,
    name: "Corsair K100 RGB Mechanical Keyboard",
    category: "Peripherals",
    price: 199.99,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBb1BwFS_XpzOrukkp3XKpSwpNl6iueZS30IJ8vt3wm2Em5q5Rvviy8oZl&s=10",
    description:
      "Premium mechanical keyboard with OPX optical switches, iCUE control wheel, per-key RGB, PBT keycaps, and dedicated macro keys. Aluminum frame with USB passthrough.",
  },
  {
    id: 35,
    name: "ASUS ZenWiFi Pro ET12 Mesh Router",
    category: "Networking",
    price: 449.99,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTENRAmjOMYz4Fu-no4VrEJM3mAwJKqjSqlGaj2KKHJTg&s=10",
    description:
      "Tri-band WiFi 6E mesh system with dedicated backhaul, 6GHz band support, 2.5G WAN port, and AiMesh technology for seamless whole-home coverage up to 5500 sq ft.",
  },
  {
    id: 36,
    name: "WD My Passport 5TB External HDD",
    category: "Storage",
    price: 129.99,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSC4yLFCpwK48EybgAyPnT-anxG4kxXC3_W5ikf0-qiA&s",
    description:
      "5TB portable external hard drive with USB 3.0, 256-bit AES hardware encryption, and WD Discovery software. Slim 2.5-inch form factor with backup scheduling.",
  },
  {
    id: 37,
    name: "Razer Kiyo Pro Ultra Webcam",
    category: "Peripherals",
    price: 199.99,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRn-bX7zAovnjwgJGaGhDq0YK-xa0bakcTkHt29tvcIDw&s=10",
    description:
      "4K30fps webcam with large Sony STARVIS 2 sensor, adaptive light sensor, built-in ring light, and AI-powered image processing. Uncompressed 4K output via USB-C.",
  },
  {
    id: 38,
    name: "Phanteks Enthoo 719 Full Tower Case",
    category: "PC Components",
    price: 199.99,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_lRNKhR1KouiyqX4wqpjgYOXPRPmz7mirQaeY6Bg-uQ&s=10",
    description:
      "Full-tower case supporting dual systems, up to E-ATX motherboards, dual 480mm radiators, and vertical GPU mounting. Tempered glass side panel with D-RGB lighting.",
  },
  {
    id: 39,
    name: "SteelSeries Prime Wireless Gaming Mouse",
    category: "Peripherals",
    price: 129.99,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQii0iSSshZSRmN2EGFChe8PBiVeANQJRb78v6LTylGEw&s",
    description:
      "Esports-grade wireless mouse with Prestige OM switches rated for 100M clicks, TrueMove Air sensor at 18,000 DPI, and 100-hour battery life.",
  },
  {
    id: 40,
    name: "ASUS ROG Swift PG27AQDM 27\" OLED Monitor",
    category: "Displays",
    price: 799.99,
    image: "https://dlcdnwebimgs.asus.com/gain/59F76A27-DF1B-4EB6-A47A-9604D403C261/w717/h525/fwebp",
    description:
      "27-inch QHD OLED monitor with 240Hz refresh rate, 0.03ms response time, anti-flicker technology, and 99% DCI-P3. Custom heatsink for sustained peak brightness.",
  },
];

export function getProducts() {
  return products;
}

export function getProductById(id, list = products) {
  return list.find((product) => product.id === Number(id));
}

export function getCategories(list = products) {
  return [...new Set(list.map((product) => product.category))].sort();
}

// Stock codes are derived rather than stored: the catalogue is small and the id is
// already the stable identifier, so keeping a second column in sync buys nothing.
export function getSku(product) {
  const prefix = product.category.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
  return `SEZ-${prefix}-${String(product.id).padStart(3, "0")}`;
}

// Longest first so "Western Digital" wins over "WD" and "Logitech G" over "Logitech".
const BRANDS = [
  "Western Digital",
  "Fractal Design",
  "Logitech G",
  "SteelSeries",
  "Be Quiet",
  "Seasonic",
  "Phanteks",
  "Keychron",
  "Glorious",
  "Logitech",
  "Crucial",
  "Corsair",
  "Samsung",
  "TP-Link",
  "HyperX",
  "Noctua",
  "NVIDIA",
  "Elgato",
  "Anker",
  "Razer",
  "Sonos",
  "Apple",
  "ASUS",
  "BenQ",
  "NZXT",
  "Dell",
  "JBL",
  "WD",
  "LG",
];

export function getBrand(product) {
  return BRANDS.find((brand) => product.name.startsWith(brand)) ?? null;
}

// The catalogue descriptions are written as comma-separated spec sentences, so they
// can be broken into feature bullets instead of inventing a spec sheet. Fragments keep
// their original casing because terms like "webOS" must not be sentence-cased.
export function getHighlights(product) {
  return product.description
    .split(/(?<=\.)\s+/)
    .flatMap((sentence) => {
      const clean = sentence.trim().replace(/\.$/, "");
      const commas = (clean.match(/,/g) ?? []).length;
      return commas >= 2 ? clean.split(",") : [clean];
    })
    .map((fragment) => fragment.trim().replace(/^(and|plus)\s+/i, ""))
    .filter((fragment) => fragment.length > 2);
}

export function getCategorySummaries(list = products) {
  return getCategories(list).map((category) => {
    const inCategory = list.filter((product) => product.category === category);
    return {
      category,
      count: inCategory.length,
      image: inCategory[0]?.image ?? null,
      from: Math.min(...inCategory.map((product) => product.price)),
    };
  });
}
