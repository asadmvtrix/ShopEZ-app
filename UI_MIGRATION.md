# UI Migration: MUI -> Tailwind v4 + shadcn/ui (Base UI)

## Context
Solo-built PC/tech parts storefront (gaming + office components). Vite SPA, JavaScript (.jsx),
React 19, react-router-dom 7, Supabase (auth, products, orders), Stripe Checkout + /api webhook,
react-hook-form, cart in Context + localStorage, filters in URL search params.
Currently MUI 9.4 + Emotion: 33 files import @mui, ~28 use sx. Theme in src/theme/index.js:
IBM Plex Sans/Mono, light #14304a / #d9480f on #f4f2ee, dark #8ab6de / #ff8a4c on #10161c.
Goal: production-ready consumer store UI: fast, accessible, light/dark, mobile-first,
small bundle, components we own.

## Global rules (every phase)
1. One phase per session. Do only the requested phase, then STOP and report: files changed,
   deviations, anything needing my decision. Never start the next phase.
2. UI layer only. Never change business logic, data flow, routes, Supabase/Stripe calls,
   services/, context APIs, or env handling. If a UI change needs a logic change, stop and ask.
3. Visual parity first: same layout, content, and behavior as today. Polish happens in Phase 8.
4. No new dependencies without asking. Allowed: tailwindcss, @tailwindcss/vite, whatever
   `shadcn init/add` installs (class-variance-authority, clsx, tailwind-merge, tw-animate-css,
   the Base UI package), lucide-react, sonner.
5. Ground yourself in current docs instead of memory: `npx shadcn@latest info` for project setup,
   the shadcn docs (ui.shadcn.com/docs/components) or the CLI docs command for each component's
   API, and the docs for the installed MUI version for the Tailwind v4 integration.
6. Base UI flavor: compose with the `render` prop, NOT `asChild` (e.g. a Button rendering as a
   react-router Link). Verify against docs each time.
7. Styling: Tailwind utilities + semantic tokens only (bg-background, bg-card, text-foreground,
   text-muted-foreground, border-border, bg-primary, text-primary-foreground, ring-ring).
   No hard-coded hex or Tailwind palette colors (e.g. neutral-900) in components; colors change
   only in CSS variables. Use `cn()` from src/lib/utils.js. No inline styles unless the value is
   dynamic. No @apply except tiny base rules.
8. JavaScript only: .jsx files, components.json "tsx": false, no TypeScript conversion.
9. Accessibility: semantic HTML (header/nav/main/section/ul, button vs a), visible focus rings,
   aria-label on icon-only buttons, alt text on images, respect prefers-reduced-motion,
   tap targets >= 40px on mobile.
10. Performance: images get explicit aspect ratio/width/height and lazy loading below the fold;
    keep existing route-level lazy loading; no animation libraries, only CSS/Tailwind keyframes.
11. Definition of done for every slice: `npm run lint` and `npm run build` pass, no console
    errors, and I get a short manual test checklist (375px and 1280px, light and dark) plus a
    suggested commit message.
12. If unsure about existing behavior, read the code; don't guess. If a MUI feature has no
    direct equivalent, say so and propose the simplest option.

## Default component mapping
- Box/Stack/Grid -> div/semantic elements with flex/grid/gap utilities
- Container (15 uses) -> one shared src/components/PageContainer.jsx (max-w-7xl mx-auto px-4 sm:px-6 lg:px-8)
- Typography -> real h1-h6/p/span with Tailwind text classes
- Paper/Card -> shadcn Card or div with bg-card border rounded-lg (no shadows by default)
- Button/IconButton -> shadcn Button (variants default/secondary/outline/ghost/link, size icon)
- Link -> react-router Link with Tailwind classes, or Button with render
- TextField -> shadcn Input/Textarea + Label (+ Field for errors), keep react-hook-form wiring
- Select/Menu -> shadcn Select / DropdownMenu
- Chip -> Badge (spec badges: font-mono text-xs)
- AppBar/Toolbar -> sticky <header>
- Drawer -> Sheet; Dialog -> Dialog; Tabs -> Tabs; Alert -> Alert; Divider -> Separator
- Snackbar/AppFlash -> sonner (keep lib/flash public API)
- Skeleton/CircularProgress -> Skeleton / lucide Loader2 with animate-spin
- Slider/Checkbox/Accordion/Breadcrumbs/Pagination -> shadcn equivalents
- @mui/icons-material -> lucide-react (keep GoogleGlyph and BrandMark as custom SVGs)
Add shadcn components only when the current slice needs them.

## Phase 0: Baseline (no code changes)
- Create branch `ui-migration`; confirm clean git state.
- Run `npm run lint` and `npm run build`; record dist JS + CSS sizes (raw and gzip) in MIGRATION_LOG.md.
- Confirm .env files are gitignored; list env var NAMES the app reads (no values).
- Table in MIGRATION_LOG.md: every file importing @mui, the MUI components it uses, and which
  phase below it belongs to.
- Note MUI behaviors we must reproduce (Dialog focus trap, Drawer, Tabs keyboard nav, etc.).
STOP and report.

## Phase 1: Tooling
1. Vite: package.json overrides vite with rolldown-vite 7.2.5, a temporary preview package;
   stable Vite 8 has Rolldown built in. Check `npm view vite version` and the peer deps of
   @tailwindcss/vite and @vitejs/plugin-react. If compatible, remove the override, set vite ^8,
   reinstall, and verify dev + build. If not, keep it and tell me why.
2. Install tailwindcss + @tailwindcss/vite; add tailwindcss() next to react() in vite.config.js.
3. Alias `@` -> ./src in vite.config.js (use fileURLToPath(new URL('./src', import.meta.url)))
   and create jsconfig.json with paths {"@/*": ["./src/*"]}.
4. Create src/index.css. First line: `@layer theme, base, mui, components, utilities;` then
   `@import "tailwindcss";`. Import it in main.jsx.
5. MUI coexistence: wrap the app in StyledEngineProvider with enableCssLayer and add GlobalStyles
   with the same layer-order string, following the MUI Tailwind v4 integration docs for the
   installed version (the API may differ in v9; verify).
6. Run `npx shadcn@latest init` (Base UI, JavaScript, CSS file src/index.css, aliases
   @/components and @/lib/utils). Confirm components.json has "tsx": false. If the CLI can't
   handle a JS project, stop and tell me why.
7. Add only: button, badge, card, input, label, separator, skeleton, sonner.
8. Verify the app looks unchanged and build passes.
STOP and report.

## Phase 2: Theme tokens, color mode, fonts, motion
1. Read src/theme/index.js, context/ColorModeProvider, theme/motion.js, hooks/useWarmReveal.js.
2. Map the MUI palette to shadcn CSS variables in src/index.css (:root light, .dark dark):
   background, foreground, card, popover, primary (whatever color main CTAs render today),
   secondary, muted, muted-foreground, accent, destructive, border, input, ring, --radius,
   plus success/warning tokens if used. Preserve rendered colors: inspect what Button, Chip and
   AppBar actually render, not just palette names. Register them in @theme inline.
3. Fonts: keep @fontsource IBM Plex; set --font-sans and --font-mono in @theme.
4. Color mode bridge: ColorModeProvider keeps driving MUI while ALSO toggling the `dark` class
   on <html>, persisting via existing lib/storage and following system preference exactly as
   today. Add a tiny inline script in index.html to set the class before first paint (no flash).
   MUI mode and .dark must always agree.
5. Motion: convert theme/motion.js keyframes and useWarmReveal/PageEnter transitions into CSS
   keyframes registered in @theme; wrap in motion-safe; keep the hook API.
6. Set --radius to match current cards; no shadows by default.
STOP and report.

## Phase 3: Shell and shared UI
Files: Navbar, SiteFooter, StorefrontMasthead, BrandMark, PageEnter, AppFlash (+ lib/flash),
Skeletons, RouteFallback, ErrorBoundary, CartBadge, SectionHeader, App.jsx layout, PageContainer.
- Navbar: sticky header, desktop nav, mobile menu in a Sheet, cart icon with badge,
  color-mode toggle, account/auth links. Keep all links and behavior.
- Mount <Toaster /> once; AppFlash/lib/flash keep their public API, internals use sonner.
STOP and report.

## Phase 4: Catalog
Files: ProductCard, ProductGrid, ProductImage, QuickPickCard, CategoryTiles, Home, Browse.
- ProductCard: fixed aspect-ratio image (object-cover, lazy), title (line-clamp-2), key spec
  badges (font-mono), price, stock state, add-to-cart. The card is one link target with no
  nested-interactive accessibility conflicts.
- Browse filters: keep URL search-param logic EXACTLY; UI = sidebar (desktop) + Sheet (mobile)
  using Accordion/Checkbox/Slider/Select as current filters need; active-filter chips with clear;
  empty state; skeleton loading.
- Do not change catalog service or data shape.
STOP and report.

## Phase 5: Product details and cart
Files: ProductDetails, Cart, OrderSummary, quantity controls.
- Product details: gallery, specs as a semantic table or dl with mono values, sticky buy box on
  mobile, stock/shipping notes as currently supported.
- Cart: line items, quantity controls (>= 40px targets), remove, totals via existing logic.
STOP and report.

## Phase 6: Auth, account, checkout
Files: Auth, Account, Checkout, CheckoutSuccess, CheckoutProgress, RequireAuth, NotFound, GoogleGlyph.
- Keep react-hook-form; replace TextField with Input/Label/Field including error text,
  aria-invalid and aria-describedby (check shadcn docs for the current RHF pattern).
- Checkout still redirects to Stripe Checkout; do not touch redirect, webhook, or services.
- OAuth redirect behavior stays identical.
STOP and report.

## Phase 7: Remove MUI
1. `git grep -l "@mui" -- src` and `git grep -l "@emotion" -- src` must return nothing;
   finish any stragglers first.
2. Remove StyledEngineProvider/GlobalStyles, ThemeProvider, CssBaseline; delete src/theme/index.js
   (keep motion.js only if still used); reduce ColorModeProvider to toggling the `dark` class +
   persistence (keep its hook API). Remove `mui` from the layer statement.
3. `npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled`.
4. Build, lint, and compare bundle sizes against the Phase 0 baseline in MIGRATION_LOG.md.
STOP and report.

## Phase 8: Polish, then production review
Polish: consistent spacing/type scale, focus and hover states, loading/empty/error states on
every page, one primary CTA per view, consistent image ratios. Retail look: flat surfaces,
crisp 1px borders, subtle accent border/ring on hover; no glow, no heavy shadows.
Production review (REPORT ONLY, change nothing without approval): Lighthouse (perf, a11y, SEO),
bundle analysis and lazy-loading opportunities, title/meta/OG per route, 404 handling,
Supabase RLS assumptions, Stripe webhook signature verification and server-side price
calculation (never trust client-sent prices), secrets not exposed in the client bundle,
failed-network states.