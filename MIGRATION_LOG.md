# UI Migration Log

## Phase 0 — Baseline (2026-09-20)

### Branch & git state
- Branch created: `ui-migration` (from `main`).
- **Git state was not clean** when Phase 0 started. Working tree already had many uncommitted edits (providers, pages, components, deletions) plus untracked `UI_MIGRATION.md` and `src/components/Skeletons.jsx`. Those pre-existing changes were left as-is; Phase 0 did not commit or discard them.
- `MIGRATION_LOG.md` is the only file intentionally added by Phase 0.

### Lint & build
| Command | Result |
|---|---|
| `npm run lint` | **FAIL** — 31 errors, 0 warnings (exit 1) |
| `npm run build` | **PASS** (exit 0) — rolldown-vite v7.2.5, 810 modules, ~1.35s |

Lint failures observed (baseline; not fixed in Phase 0):
- `api/*`: `process` / `Buffer` `no-undef` (Node globals not configured for ESLint)
- `AppFlash`, `CartProvider`, `CatalogProvider`: `react-hooks/set-state-in-effect`
- Context providers: `react-refresh/only-export-components`
- Empty `catch` blocks (`no-empty`) in AuthProvider, useWarmReveal, storage

### Bundle sizes (`dist/assets`, post-`npm run build`)

Sizes below are **filesystem raw bytes** and **gzip level 9** (Node `zlib.gzipSync`). Vite’s console “gzip” column uses a slightly different compressor and may differ by ~1–4%.

#### Totals (JS + CSS only; fonts excluded)

| Asset class | Raw | Gzip (level 9) |
|---|---:|---:|
| All JS | 929.31 kB (951,610 B) | 281.55 kB (288,311 B) |
| All CSS | 9.86 kB (10,093 B) | 1.20 kB (1,230 B) |
| **JS + CSS** | **939.16 kB** | **282.75 kB** |

#### Per-chunk (from Vite build output, for Phase 7 comparison)

| File | Raw (Vite) | Gzip (Vite) |
|---|---:|---:|
| `mui-BDjiAW5r.js` | 372.00 kB | 114.22 kB |
| `index-BZksmJLC.js` | 279.31 kB | 76.70 kB |
| `react-BTdowPNK.js` | 245.75 kB | 79.58 kB |
| `Account-7xOvHLt1.js` | 13.80 kB | 4.69 kB |
| `Auth-CopsANP6.js` | 11.17 kB | 3.48 kB |
| `index-DlofsbqE.css` | 10.09 kB | 1.25 kB |
| `Browse-D3rj0Ykw.js` | 7.13 kB | 2.71 kB |
| `ProductDetails-CK2N5OT_.js` | 4.87 kB | 1.92 kB |
| `CheckoutSuccess-DzEIeuQf.js` | 4.25 kB | 1.59 kB |
| `Cart-DAXs6Fpz.js` | 3.42 kB | 1.33 kB |
| `Checkout-C9BJJ3FF.js` | 3.25 kB | 1.49 kB |
| `stripe-DYB8KWz0.js` | 2.46 kB | 1.18 kB |
| `OrderSummary-BbJHPYgF.js` | 1.83 kB | 0.82 kB |
| `NotFound-YM2h1Bc5.js` | 0.89 kB | 0.49 kB |
| `GoogleGlyph-BowBKNee.js` | 0.85 kB | 0.52 kB |
| `rolldown-runtime-y2wrX6ue.js` | 0.55 kB | 0.35 kB |

MUI alone is ~372 kB raw / ~114 kB gzip — primary Phase 7 savings target.

### Env files & variables

**Gitignore confirmed:**
- `.gitignore` has `.env` and `.env.*` with exceptions for `!.env.example` / `!.env*.example`
- `git check-ignore` matches `.env`, `.env.local`, `.env.production`
- Local `.env` exists on disk and is **not** tracked by git

**Env var NAMES the app reads (no values):**

Client (`import.meta.env`):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `DEV` (Vite built-in, used in ErrorBoundary)

Server / API (`process.env`):
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL` (fallback)
- `SUPABASE_ANON_KEY` (fallback)
- `VITE_SUPABASE_URL` (also read server-side as fallback)
- `VITE_SUPABASE_ANON_KEY` (also read server-side as fallback)
- `SITE_URL`

### MUI import inventory (working tree)

33 files currently import `@mui` / `@mui/system`. Phase column follows `UI_MIGRATION.md` ownership (primary migration slice). Icons listed briefly.

| File | MUI components / APIs used | Phase |
|---|---|---|
| `src/App.jsx` | Box | 3 |
| `src/components/AppFlash.jsx` | Box, Fade, Portal, Typography; icons CheckRounded, PriorityHighRounded | 3 |
| `src/components/BrandMark.jsx` | SvgIcon (custom SVG; keep mark, drop MUI wrapper) | 3 |
| `src/components/CartBadge.jsx` | Badge | 3 |
| `src/components/CategoryTiles.jsx` | Box, Card, CardActionArea, Typography; ChevronRight | 4 |
| `src/components/CheckoutProgress.jsx` | Box, Typography | 6 |
| `src/components/ErrorBoundary.jsx` | Box, Button, Container, Stack, Typography | 3 |
| `src/components/GoogleGlyph.jsx` | Box (custom SVG; keep glyph) | 6 |
| `src/components/Navbar.jsx` | AppBar, Avatar, Box, Button, Container, Divider, Drawer, IconButton, List, ListItemButton, ListItemText, ListSubheader, Menu, MenuItem, Stack, Toolbar, Tooltip, Typography; Close, DarkModeOutlined, ExpandMore, LightModeOutlined, Menu, PersonOutlined, ShoppingCartOutlined | 3 |
| `src/components/OrderSummary.jsx` | Box, Divider, LinearProgress, Paper, Stack, Typography | 5 |
| `src/components/PageEnter.jsx` | Box | 3 |
| `src/components/ProductCard.jsx` | Box, Button, Card, CardActions, Typography; AddShoppingCart, Check | 4 |
| `src/components/ProductGrid.jsx` | Box | 4 |
| `src/components/ProductImage.jsx` | Box, Skeleton, Typography | 4 |
| `src/components/QuickPickCard.jsx` | Box, Button, IconButton, Paper, Stack, Typography; Add, Check, Remove | 4 |
| `src/components/RequireAuth.jsx` | Box, CircularProgress | 6 |
| `src/components/RouteFallback.jsx` | Box, Container, LinearProgress, Skeleton, Stack | 3 |
| `src/components/SectionHeader.jsx` | Box, Stack, Typography | 3 |
| `src/components/SiteFooter.jsx` | Box, Container, Divider, Link, Stack, Typography | 3 |
| `src/components/Skeletons.jsx` | Box, Card, Container, Skeleton, Stack | 3 |
| `src/components/StorefrontMasthead.jsx` | Box, Button, ButtonBase, Container, Fade, IconButton, Paper, Stack, Typography; ChevronLeft, ChevronRight, LocalShippingOutlined, SupportAgentOutlined, VerifiedOutlined | 3 |
| `src/context/ColorModeProvider.jsx` | ThemeProvider (`@mui/material/styles`), CssBaseline, useMediaQuery | 2 (bridge); 7 (remove MUI) |
| `src/pages/Account.jsx` | Alert, Avatar, Box, Button, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, List, ListItemButton, ListItemText, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography; DarkModeOutlined, EmailOutlined, LightModeOutlined, SettingsBrightnessOutlined | 6 |
| `src/pages/Auth.jsx` | Alert, Box, Button, CircularProgress, Container, IconButton, InputAdornment, Link, Paper, Stack, Tab, Tabs, TextField, Typography; VisibilityOffOutlined, VisibilityOutlined | 6 |
| `src/pages/Browse.jsx` | Box, Button, Chip, Container, Drawer, FormControl, FormControlLabel, IconButton, InputAdornment, InputLabel, MenuItem, Paper, Radio, RadioGroup, Select, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography; Close, FilterList, Search | 4 |
| `src/pages/Cart.jsx` | Box, Button, Container, IconButton, Paper, Stack, Typography; Add, DeleteOutlined, Remove, ShoppingCartOutlined | 5 |
| `src/pages/Checkout.jsx` | Alert, Box, Button, CircularProgress, Container, Paper, Stack, TextField, Typography; LockOutlined | 6 |
| `src/pages/CheckoutSuccess.jsx` | Alert, Box, Button, CircularProgress, Container, Divider, Paper, Stack, Typography | 6 |
| `src/pages/Home.jsx` | Box, Button, Container, IconButton, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography; ChevronLeft, ChevronRight | 4 |
| `src/pages/NotFound.jsx` | Button, Container, Stack, Typography | 6 |
| `src/pages/ProductDetails.jsx` | Alert, Box, Button, Chip, Collapse, Container, Divider, Link, MenuItem, Paper, Stack, TextField (select), Typography; AddShoppingCart, ArrowBack, AssignmentReturnOutlined, CheckCircleOutlined, LocalShippingOutlined, VerifiedUserOutlined | 5 |
| `src/theme/index.js` | `createTheme` (`@mui/material/styles`) | 2 (tokens); 7 (delete) |
| `src/theme/motion.js` | `keyframes` (`@mui/system`) | 2 |

**Note:** HEAD still lists deleted skeleton files (`HomeSkeleton`, `ProductCardSkeleton`, `ProductGridSkeleton`) that imported MUI; working tree consolidates them into `Skeletons.jsx` (untracked). Inventory above reflects the **current working tree**.

**Not used today (no migration target found):** Slider, Accordion, Breadcrumbs, Pagination, Snackbar (custom AppFlash instead), Autocomplete, Modal (Dialog used instead).

### MUI behaviors to reproduce

Must preserve equivalent UX/a11y when replacing with shadcn/Base UI + Tailwind:

1. **Dialog (Account delete)** — modal overlay; focus trap; Escape / backdrop close (disabled while `busy`); `autoFocus` on confirmation TextField; restore focus to opener on close.
2. **Drawer (Navbar mobile nav; Browse mobile filters)** — temporary left drawer; backdrop click / Escape close; body scroll lock; focus management inside panel; close on navigate / apply filters.
3. **Menu (Navbar categories + account)** — anchored popover menus; click-away / Escape close; arrow-key item navigation; MenuItem-as-RouterLink routing.
4. **Tabs (Auth signup/login)** — fullWidth tabs; keyboard activation (arrows / Home / End per MUI Tabs); selected tab association with panel content via controlled `value`.
5. **Select / TextField select** — Browse sort Select; ProductDetails quantity `TextField select` with MenuItems; label association, keyboard open/close, listbox semantics.
6. **ToggleButtonGroup** — exclusive selection (Home/Browse column density; Account color-mode system/light/dark); `aria-label` on density buttons.
7. **Tooltip** — Navbar icon buttons (theme, cart, account); hover/focus show; accessible name already via `aria-label` (Tooltip is supplementary).
8. **Fade / Collapse / Portal** — AppFlash fade + portal to body; StorefrontMasthead Fade; ProductDetails Collapse for post-add confirmation. Prefer CSS/`motion-safe` equivalents; keep enter/exit timing roughly similar.
9. **RadioGroup + FormControlLabel** — Browse filter radios; label click toggles; keyboard group navigation.
10. **Badge (CartBadge)** — numeric overlay on cart icon; updates with count.
11. **Skeleton / CircularProgress / LinearProgress** — loading placeholders and indeterminate progress (RouteFallback, RequireAuth, Checkout, OrderSummary free-shipping bar).
12. **ThemeProvider + CssBaseline + useMediaQuery** — light/dark palettes, baseline resets, system preference for `mode === "system"`; Phase 2 must bridge to `.dark` on `<html>` without flash.
13. **Link / Button `component={RouterLink}`** — MUI polymorphic `component` prop; shadcn Base UI equivalent is Button `render` (not `asChild`).
14. **Container maxWidth gutters** — consistent page width; Phase 3 introduces shared `PageContainer`.
15. **Chip** — Browse active filters + ProductDetails specs; compact removable/filter chips where applicable.
16. **List / ListItemButton** — Drawer nav and Account order list semantics (button rows, keyboard focus).

### Manual test checklist (baseline smoke)

At **375px** and **1280px**, **light** and **dark**:
- [ ] Home loads; hero/masthead and product grids render
- [ ] Browse: filters (desktop sidebar + mobile drawer), sort, search, column toggle, clear chips
- [ ] Product details: gallery, qty select, add-to-cart, collapse confirmation
- [ ] Cart: qty +/- , remove, totals
- [ ] Auth: signup/login tabs, password visibility, validation
- [ ] Account: theme toggle group, delete-account dialog focus trap
- [ ] Navbar: sticky, mobile drawer, category/account menus, cart badge, theme toggle
- [ ] Checkout → Stripe redirect path still wired (do not complete paid charge in baseline)
- [ ] No unexpected console errors on happy paths

### Suggested commit message (when you choose to commit)

```
chore: record Phase 0 UI migration baseline

Capture lint/build status, bundle sizes, env var names, and full @mui
file inventory before Tailwind/shadcn tooling.
```

Phase 0 did **not** commit (not required by the phase).

### Blockers / notes for Phase 1
1. **Dirty working tree** — decide whether to commit or stash current WIP on `ui-migration` before tooling so Phase 1 diffs stay reviewable.
2. **`npm run lint` already fails** — Phase definition-of-done expects lint green; either fix baseline lint first or explicitly allow documenting known failures until a later cleanup.
3. **Vite override** — build already uses rolldown-vite 7.2.5; Phase 1 step 1 should verify whether stable Vite 8 can replace the override.
4. No Slider/Accordion/Breadcrumbs/Pagination in app today — do not add those shadcn components until a slice needs them.
5. AppFlash is custom (Portal + Fade), not MUI Snackbar — Phase 3 maps it to sonner while keeping `lib/flash` public API.

---

## Phase 1 — Tooling (2026-09-20)

### What Phase 1 required
1. Resolve Vite override vs stable Vite 8 (+ peer deps for `@tailwindcss/vite` / `@vitejs/plugin-react`).
2. Install Tailwind v4 (`tailwindcss` + `@tailwindcss/vite`); wire plugin in `vite.config.js`.
3. Alias `@` → `./src` (Vite + `jsconfig.json`).
4. Create `src/index.css` with cascade layer order + `@import "tailwindcss"`; import from `main.jsx`.
5. MUI coexistence: `StyledEngineProvider enableCssLayer` + `GlobalStyles` layer-order string (per MUI Tailwind v4 docs).
6. `npx shadcn@latest init` (Base UI, JavaScript, CSS `src/index.css`).
7. Add: button, badge, card, input, label, separator, skeleton, sonner.
8. Verify build; app UI still driven by MUI (no component migration yet).

### Vite decision
| Package | Checked | Result |
|---|---|---|
| `vite` latest | **8.3.0** (Rolldown built-in) | Adopted `vite: ^8.3.0` |
| `@tailwindcss/vite` | peer `vite: ^5.2 \|\| ^6 \|\| ^7 \|\| ^8` | Compatible |
| `@vitejs/plugin-react` | 5.1.x peer stopped at Vite 7; **6.1.1** peers Vite `^8` | Upgraded to `^6.1.1` |

**Removed** `overrides.vite = npm:rolldown-vite@7.2.5`. Reinstall resolved real `vite@8.3.0`. Dev + production build both succeed.

### Files changed (Phase 1 only)
| Path | Change |
|---|---|
| `package.json` / `package-lock.json` | Vite 8, plugin-react 6, Tailwind, shadcn stack |
| `vite.config.js` | `tailwindcss()` plugin + `@` alias |
| `jsconfig.json` | **new** — `@/*` → `./src/*` |
| `src/index.css` | **new** — layers + Tailwind + shadcn tokens |
| `src/main.jsx` | import CSS; `StyledEngineProvider` + `GlobalStyles` |
| `components.json` | **new** — Base UI Nova, `"tsx": false` |
| `src/lib/utils.js` | **new** — `cn` re-export |
| `src/components/ui/{button,badge,card,input,label,separator,skeleton,sonner}.jsx` | **new** |
| `eslint.config.js` | ignore `react-refresh/only-export-components` under `src/components/ui/**` |
| `MIGRATION_LOG.md` | this Phase 1 section |

Pre-existing dirty WIP (pages/providers/components) was **not** committed or reverted.

### shadcn init
- Detected Vite + Tailwind v4 + `@` alias; JavaScript (`tsx: false`).
- Base: **base** (Base UI); style **base-nova**; preset Nova (default prompt).
- Installed (via CLI): `@base-ui/react`, `class-variance-authority`, `cn`, `lucide-react`, `shadcn`, `tw-animate-css`, `sonner`, `next-themes` (sonner peer).
- `button` was created during init; remaining seven via `shadcn add … -y`.
- Confirmed: `npx shadcn@latest info` → typescript No; installed components match Phase 1 list.

### Deviations / decisions
1. **Nova Geist font** — init added `@fontsource-variable/geist` and forced `html { font-sans }` / `body { bg-background text-foreground }`. Removed Geist import + body/html base applications so **IBM Plex + MUI CssBaseline** keep visual parity until Phase 2 token/font mapping. Uninstalled unused `@fontsource-variable/geist`.
2. **Layer order preserved** — first line of `src/index.css` remains `@layer theme, base, mui, components, utilities;`.
3. **`cn` package** — CLI uses `export { cn } from "cn"` (not local clsx/tailwind-merge). Allowed under global rule 4.
4. **Dirty tree** — left as-is (Phase 0 note); Phase 1 tooling diffs sit on top of WIP.
5. **Lint DoD** — full-repo lint still fails with the **same 31 baseline errors**. Phase 1 UI files lint clean after the eslint override. Not expanding into baseline lint cleanup.

### Verification
| Check | Result |
|---|---|
| `npm run build` | **PASS** — vite 8.3.0, 812 modules |
| `npm run lint` | **FAIL** — 31 errors (unchanged vs Phase 0 baseline); Phase 1 files clean |
| shadcn components | button, badge, card, input, label, separator, skeleton, sonner |
| Visual | No UI components swapped yet; MUI still renders the store. Tailwind Preflight is active in `@layer base` (MUI styles in `@layer mui` should win for MUI nodes). Spot-check recommended. |

#### Bundle sizes after Phase 1 (raw + gzip level 9)

| Asset class | Raw | Gzip (level 9) | vs Phase 0 |
|---|---:|---:|---|
| All JS | 927.99 kB (950,265 B) | 282.13 kB (288,901 B) | ~−1.3 kB raw / ~+0.6 kB gzip |
| All CSS | 40.28 kB (41,250 B) | 7.14 kB (7,310 B) | **+30.4 kB raw / +6.0 kB gzip** (Tailwind + shadcn CSS) |
| **JS + CSS** | **968.27 kB** | **289.26 kB** | |

CSS growth is expected (unused utility CSS until components migrate). JS nearly flat — shadcn components not imported by the app yet.

### Manual test checklist (375px & 1280px, light & dark)
- [ ] Home / Browse / Product details / Cart / Auth / Account still render as before (MUI)
- [ ] Navbar drawer, menus, cart badge, theme toggle unchanged
- [ ] No new console errors on happy paths
- [ ] Optional: DevTools → Styles → confirm cascade layers order includes `mui` before `utilities`

### Suggested commit message (when you choose to commit)

```
chore: add Tailwind v4 + shadcn Base UI tooling (Phase 1)

Upgrade to Vite 8, wire CSS layers for MUI coexistence, and scaffold
shadcn JS components without migrating pages yet.
```

Phase 1 did **not** commit.

### Blockers / notes for Phase 2
1. Map MUI palette → shadcn CSS variables; re-enable body/html token base styles carefully.
2. Set `--font-sans` / `--font-mono` to IBM Plex (already loaded); do not reintroduce Geist unless decided.
3. Bridge `ColorModeProvider` to toggle `.dark` on `<html>` (MUI mode + class must agree) + FOUC script in `index.html`.
4. Convert `theme/motion.js` / `useWarmReveal` to CSS keyframes under `motion-safe`.
5. Lint still red (31 baseline) — decide cleanup timing vs continuing slices.
6. Dirty WIP still mixed with migration diffs — commit/stash strategy still open.
7. `next-themes` was pulled in by sonner; unused until Toaster mount (Phase 3) — keep or drop then.

---

## Phase 2 — Theme tokens, color mode, fonts, motion (2026-09-20)

### What Phase 2 required
1. Map MUI palette (from `src/theme/index.js`) → shadcn CSS variables in `src/index.css` (`:root` / `.dark`) + `@theme inline`.
2. Fonts: IBM Plex → `--font-sans` / `--font-mono` (no Geist).
3. Bridge `ColorModeProvider` so MUI mode and `<html class="dark">` always agree; FOUC script in `index.html`.
4. Convert Emotion keyframes in `theme/motion.js` to CSS `@keyframes` under `@theme`; wrap PageEnter in `motion-safe`; keep hook APIs.
5. `--radius` = MUI `shape.borderRadius` (6px); no default shadows.

### Token mapping (inspected vs palette names)

| Token | Light | Dark | Source |
|---|---|---|---|
| background | `#f4f2ee` | `#10161c` | `palette.background.default` |
| foreground | `#14304a` | `#e6edf3` | `palette.text.primary` |
| card / popover | `#ffffff` | `#171f27` | `palette.background.paper` |
| primary | `#14304a` | `#8ab6de` | CTA `Button color="primary"` / AppBar text context |
| secondary | `#d9480f` | `#ff8a4c` | Orange accent (`CartBadge`, prices) |
| muted-foreground | `#5b6b7b` | `#9aa9b7` | `palette.text.secondary` |
| border / input | `#e0dcd4` | `#26313c` | `palette.divider` |
| ring | primary | primary | focus |
| success / warning / destructive | MUI defaults | MUI defaults | Alerts, stock Chip, AppFlash |
| --radius | `0.375rem` (6px) | same | `shape.borderRadius: 6` |

Muted/accent surfaces are soft fills (`#ebe8e2` / `#1c252e`) derived for hover/subtle UI — not named in the MUI palette.

Body/html base styles re-enabled carefully: `html { font-sans }`, `body { bg-background text-foreground }` so tokens match CssBaseline palette.

### Color mode bridge
- `ColorModeProvider` still drives MUI `ThemeProvider` + `CssBaseline`.
- `useLayoutEffect` toggles `document.documentElement.classList` (`dark`) and `colorScheme` whenever resolved `mode` changes.
- Persistence unchanged: `lib/storage` key `shopez.colorMode`; `null` = system via `useMediaQuery`.
- Inline FOUC script in `index.html` mirrors the same read/parse/system logic before first paint.

### Motion
- `@keyframes content-enter`, `badge-bump`, `confirm-pulse` registered in `@theme` with `--animate-*` utilities.
- `motion.js`: dropped `@mui/system` `keyframes`; exports CSS animation **name strings** (existing MUI `sx` consumers keep working) plus `ANIMATE.*` Tailwind class helpers.
- `PageEnter` uses `motion-safe:animate-content-enter` (no JS reduced-motion branch needed for enter).
- `useWarmReveal` API unchanged (timing gate only; no CSS transition to convert).

### Files changed (Phase 2 only)
| Path | Change |
|---|---|
| `src/index.css` | MUI-mapped tokens, IBM Plex fonts, keyframes, body/html base |
| `src/theme/motion.js` | CSS keyframe names; no Emotion |
| `src/context/ColorModeProvider.jsx` | `.dark` + `colorScheme` sync via `useLayoutEffect` |
| `src/components/PageEnter.jsx` | `motion-safe` CSS enter animation |
| `index.html` | FOUC color-mode script |
| `MIGRATION_LOG.md` | this Phase 2 section |

### Deviations / decisions
1. **Success/warning tokens** added (used by Alerts / Chip / AppFlash) even though not in custom `palettes` object — values match MUI built-in defaults.
2. **shadcn `secondary`** mapped to orange retail accent (true MUI secondary), not a muted gray. CTA navy stays `primary`.
3. **CartBadge / ProductCard / QuickPickCard** still apply bump/pulse via MUI `sx` + string keyframe names (works with global CSS `@keyframes`). Full class migration deferred to component phases.
4. **Lint DoD** — still 31 baseline errors; Phase 2 files introduce no new lint categories.
5. Did **not** commit (phase does not require it).

### Verification
| Check | Result |
|---|---|
| `npm run build` | **PASS** — vite 8.3.0, 812 modules |
| `npm run lint` | **FAIL** — 31 errors (unchanged vs Phase 0/1 baseline) |
| FOUC script in `dist/index.html` | Present; same `shopez.colorMode` logic |
| CSS tokens / keyframes in bundle | `#f4f2ee`, `#14304a`, `content-enter`, `badge-bump`, `confirm-pulse`, `--radius:.375rem` |

#### Bundle sizes after Phase 2 (raw + gzip level 9)

| Asset class | Raw | Gzip (level 9) | vs Phase 1 |
|---|---:|---:|---|
| All JS | 927.93 kB (950,196 B) | 282.14 kB (288,907 B) | ~flat |
| All CSS | 40.69 kB (41,664 B) | 7.39 kB (7,567 B) | ~+0.4 kB raw |
| **JS + CSS** | **968.61 kB** | **289.53 kB** | |

### Manual test checklist (375px & 1280px, light & dark)
- [ ] Hard refresh: no light/dark flash; `<html>` has `dark` when preference/system is dark
- [ ] Navbar / Account theme toggle: MUI palette and Tailwind tokens switch together
- [ ] System preference: set mode to System, flip OS theme — both MUI and `.dark` update
- [ ] Page navigations: soft fade-in still present; reduced-motion OS setting disables it
- [ ] Cart badge bump + add-to-cart confirm pulse still animate when motion allowed
- [ ] Fonts remain IBM Plex Sans/Mono (not Geist)
- [ ] Surfaces/CTAs look like pre-migration colors (navy primary, orange secondary)

### Suggested commit message (when you choose to commit)

```
chore: map ShopEZ theme tokens and dark class bridge (Phase 2)

Align shadcn CSS variables with the MUI palette, sync .dark on html
with ColorModeProvider, and move motion keyframes to Tailwind.
```

Phase 2 did **not** commit.

### Blockers / notes for Phase 3
1. Start shell migration (Navbar, SiteFooter, AppFlash→sonner, Skeletons, PageContainer, etc.) on top of these tokens.
2. Mount `<Toaster />` once; decide keep/drop `next-themes` (currently unused).
3. Button `render` (Base UI) for RouterLink — verify against current shadcn docs when wiring Navbar.
4. Lint still red (31 baseline) — cleanup timing still open.
5. Dirty WIP still mixed with migration diffs — commit/stash strategy still open.
6. MUI still owns almost all UI; body token styles + CssBaseline both set background — spot-check for double-application quirks after Preflight.

---

## Phase 3 — Shell and shared UI (2026-09-20)

### What Phase 3 required
Migrate shell / shared chrome off MUI: Navbar, SiteFooter, StorefrontMasthead, BrandMark, PageEnter, AppFlash (+ `lib/flash` API), Skeletons, RouteFallback, ErrorBoundary, CartBadge, SectionHeader, App layout, plus new `PageContainer`. Mount `<Toaster />` once; keep flash public API; mobile nav via Sheet.

### Docs grounding (Button / links)
Current shadcn Base UI Button docs (**As Link**): do **not** use `Button` `render={<Link />}` / `nativeButton={false}` for navigation — Base UI Button always applies `role="button"`, which breaks link semantics. Use `buttonVariants()` on a plain `react-router` `Link` / `<a>` instead.  
`DropdownMenuTrigger` / `DropdownMenuItem` still use Base UI `render` (menus/items), which is correct for that API. Sheet + DropdownMenu were added via `npx shadcn@latest add` (allowed when the slice needs them).

### Files changed (Phase 3 only)
| Path | Change |
|---|---|
| `src/components/PageContainer.jsx` | **new** — `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |
| `src/components/Navbar.jsx` | sticky header, Sheet drawer, DropdownMenus, lucide icons, `buttonVariants` links |
| `src/components/SiteFooter.jsx` | Tailwind + PageContainer + Separator |
| `src/components/StorefrontMasthead.jsx` | Tailwind shell; still embeds MUI `ProductImage` / `QuickPickCard` (Phase 4) |
| `src/components/BrandMark.jsx` | plain SVG; handle stroke `var(--secondary)` |
| `src/components/PageEnter.jsx` | div + motion-safe class (no MUI Box) |
| `src/components/AppFlash.jsx` | sonner `toast.*`; mounts `<Toaster theme={mode} />` |
| `src/components/ui/sonner.jsx` | dropped `next-themes`; theme passed as prop |
| `src/components/Skeletons.jsx` | shadcn Skeleton + PageContainer |
| `src/components/RouteFallback.jsx` | Tailwind + Skeleton fallbacks |
| `src/components/ErrorBoundary.jsx` | Button / `buttonVariants` Link |
| `src/components/CartBadge.jsx` | shadcn Badge overlay + bump class |
| `src/components/SectionHeader.jsx` | semantic heading + Tailwind |
| `src/App.jsx` | `<main className="flex-grow">` (no MUI Box) |
| `src/components/ui/sheet.jsx` | **new** (shadcn) |
| `src/components/ui/dropdown-menu.jsx` | **new** (shadcn) |
| `package.json` / lock | removed unused `next-themes` |
| `MIGRATION_LOG.md` | this Phase 3 section |

`lib/flash.js` public API unchanged (`setFlash`, `consumeFlash`, `showToast`, `showError`, `subscribeToast`). Presentation lives in AppFlash → sonner.

### Deviations / decisions
1. **Router links** use `buttonVariants` + `Link`, not Button `render` — per current shadcn docs (overrides UI_MIGRATION “use render for links” note).
2. **Tooltip** — dropped MUI Tooltip; `title` + existing `aria-label` on icon controls (Phase 0 noted Tooltip as supplementary).
3. **next-themes** — uninstalled; Toaster theme comes from `useColorMode().mode`.
4. **StorefrontMasthead** still depends on Phase 4 MUI children (`ProductImage`, `QuickPickCard`) for product media/cards.
5. **Lint** — full-repo lint **30** errors (was 31): AppFlash `set-state-in-effect` gone; no new Phase 3 lint categories.
6. Did **not** commit.

### Verification
| Check | Result |
|---|---|
| `npm run build` | **PASS** — vite 8.3.0 |
| `npm run lint` | **FAIL** — 30 errors (baseline −1 vs Phase 0/1/2) |
| Phase 3 files `@mui` imports | **none** |
| `next-themes` | removed from dependencies |

#### Bundle sizes after Phase 3 (raw + gzip level 9)

| Asset class | Raw | Gzip (level 9) | vs Phase 2 |
|---|---:|---:|---|
| All JS | 1090.28 kB (1,116,444 B) | 337.35 kB (345,443 B) | **+~162 kB raw** (Sheet/Menu/sonner in app graph; MUI still present) |
| All CSS | 61.73 kB (63,213 B) | 10.98 kB (11,245 B) | **+~21 kB raw** (more utilities) |
| **JS + CSS** | **1152.01 kB** | **348.33 kB** | |

MUI chunk ~329.6 kB raw / ~100.7 kB gzip (down from Phase 0 ~372 / ~114) — shell no longer pulls AppBar/Drawer/Menu into as many call sites, but pages still import MUI heavily.

### Manual test checklist (375px & 1280px, light & dark)
- [ ] Sticky Navbar: brand, Home / Categories / All products, theme toggle, cart badge, account or sign-in/signup
- [ ] Categories + account dropdowns open/close; items navigate
- [ ] Mobile: hamburger opens left Sheet; links close drawer; auth block works
- [ ] Cart badge bumps when count increases (motion allowed)
- [ ] Footer links + policy copy; year copyright
- [ ] Home masthead: service strip, slide arrows/dots, Shop now, quick picks still render
- [ ] Route transitions: soft enter; lazy route skeletons / progress strip
- [ ] Flash: sign-out / `setFlash` shows sonner toast (success ~2s, error ~2.8s); no FOUC theme mismatch on toasts
- [ ] Error boundary path (optional): throw in a child → Try again / Back to home
- [ ] Spot-check coexistence: MUI pages (Browse, Auth, Cart) under new shell — no obvious double backgrounds / broken sticky header

### Suggested commit message (when you choose to commit)

```
chore: migrate shell UI to Tailwind/shadcn (Phase 3)

Replace Navbar/footer/flash/skeletons with shared PageContainer,
Sheet, and sonner while keeping flash API and MUI pages intact.
```

Phase 3 did **not** commit.

### Blockers / notes for Phase 4
1. Catalog slice: ProductCard, ProductGrid, ProductImage, QuickPickCard, CategoryTiles, Home, Browse — finish masthead children (`ProductImage` / `QuickPickCard`) still on MUI.
2. Browse: keep URL search-param filter logic exact; sidebar + Sheet filters; do not change catalog service/shape.
3. Bundle is temporarily larger (shell primitives + remaining MUI); expect shrink mainly in Phase 7 uninstall.
4. Lint still red (30) — cleanup timing still open.
5. Dirty WIP still mixed with migration diffs — commit/stash strategy still open.
6. Spot-check MUI ↔ Tailwind coexistence on Home after ProductImage/QuickPickCard migrate (nested surfaces).

---

## Phase 4 — Catalog (2026-09-20)

### What Phase 4 required
Migrate catalog UI off MUI: ProductCard, ProductGrid, ProductImage, QuickPickCard, CategoryTiles, Home, Browse.
Browse URL search-param filter logic must stay exact; desktop sidebar + mobile Sheet; do not change catalog service/shape.
Finish masthead children still on MUI after Phase 3 (`ProductImage` / `QuickPickCard`).

### Docs grounding
- Added `select` + `radio-group` via `npx shadcn@latest add` (Base UI; Select requires `items` on root).
- Router CTAs continue Phase 3 pattern: `buttonVariants` + `Link` (not Button `render`).
- ProductImage API kept compatible for Phase 5 consumers (Cart / ProductDetails): numeric or `{ xs, sm, md }` height; `imagePadding` (MUI spacing × 8px); `className` / `style` instead of `sx`.

### Files changed (Phase 4 only)
| Path | Change |
|---|---|
| `src/components/ProductImage.jsx` | Tailwind + shadcn Skeleton; responsive CSS-var heights; no MUI |
| `src/components/ProductCard.jsx` | Link target for media/title; secondary Add-to-cart Button; lucide icons |
| `src/components/ProductGrid.jsx` | CSS grid column map (parity with xs/sm/md/lg breakpoints) |
| `src/components/QuickPickCard.jsx` | qty ± + add; ≥40px mobile tap targets on steppers |
| `src/components/CategoryTiles.jsx` | single Link tiles; chevron hover motion |
| `src/components/StorefrontMasthead.jsx` | ProductImage `className` (drop `sx`) |
| `src/pages/Home.jsx` | PageContainer; column density toggle; scroller; CTA link |
| `src/pages/Browse.jsx` | sticky filter sidebar; Sheet drawer; Select sort; RadioGroup price; Badge chips; URL logic unchanged |
| `src/components/ui/select.jsx` | **new** (shadcn) |
| `src/components/ui/radio-group.jsx` | **new** (shadcn) |
| `MIGRATION_LOG.md` | this Phase 4 section |

Catalog service / `CatalogProvider` / product data shape: **unchanged**.

### Deviations / decisions
1. **ProductCard content** — Phase brief mentions spec badges + stock; current MUI card had category/title/price/add only. Kept parity (no new badges/stock).
2. **Image fit** — brief says aspect-ratio + `object-cover`; existing UI used fixed height + `object-contain`. Kept contain + height for parity.
3. **Product photo surface** — loading `bg-muted`, ready/error `bg-card` (tokenized) instead of MUI `common.white` / `action.hover`.
4. **Column density** — plain `role="group"` toggle buttons (not a new ToggleGroup package); same exclusive 2/3/4 behavior.
5. **Filter chips** — Badge + icon button remove (Chip `onDelete` equivalent).
6. **Accordion / Slider / Checkbox** — not used by current Browse filters; not added.
7. **Lint** — still **30** errors (unchanged vs Phase 3); no new Phase 4 lint categories.
8. Did **not** commit.

### Verification
| Check | Result |
|---|---|
| `npm run build` | **PASS** — vite 8.3.0 |
| `npm run lint` | **FAIL** — 30 errors (same baseline as Phase 3) |
| Phase 4 files `@mui` imports | **none** |
| Browse URL params (`category`, `q`, `sort`, `price`) | logic copied verbatim (debounce, commitSearch, updateParam, resetFilters, filter/sort) |
| Remaining `@mui` under `src` | 14 files (Phase 5–7: details/cart, auth/account/checkout, theme bridge) |

#### Bundle sizes after Phase 4 (raw + gzip level 9)

| Asset class | Raw | Gzip (level 9) | vs Phase 3 |
|---|---:|---:|---|
| All JS | 1118.84 kB (1,145,696 B) | 348.55 kB (356,912 B) | **+~28.5 kB raw** (Select/Radio in Browse; ProductCard chunk shared) |
| All CSS | 71.84 kB (73,569 B) | 12.54 kB (12,845 B) | **+~10 kB raw** |
| **JS + CSS** | **1190.69 kB** | **361.09 kB** | |

MUI chunk ~305.9 kB raw / ~94.0 kB gzip (down from Phase 3 ~329.6 / ~100.7) — catalog pages no longer pull Card/Drawer/Select/etc. from MUI.

### Manual test checklist (375px & 1280px, light & dark)
- [ ] Home: masthead ProductImage + QuickPickCard; popular horizontal scroll ±; category tiles navigate with `?category=`
- [ ] Home: column toggle 2/3/4 updates “More to explore” grid; “View all products” → `/browse`
- [ ] Browse: search debounce 500ms + Enter/blur commit; category buttons; price radios; sort Select
- [ ] Browse URL: `?category=&q=&sort=&price=` round-trip; Clear all / chip remove; empty state
- [ ] Browse mobile: Filters Sheet left; Show N products closes; sticky desktop sidebar scrolls independently
- [ ] ProductCard: link opens details; Add to cart / In cart (n) / Max reached; confirm pulse when motion allowed
- [ ] QuickPickCard qty ± respects cart headroom; add works from masthead
- [ ] ProductImage: loading skeleton → fade-in; broken image letter fallback
- [ ] Spot-check Cart / ProductDetails still render ProductImage (Phase 5 files still MUI wrappers)

### Suggested commit message (when you choose to commit)

```
chore: migrate catalog UI to Tailwind/shadcn (Phase 4)

Replace Home/Browse product cards and filters with shared catalog
components; keep URL filter logic and catalog data shape unchanged.
```

Phase 4 did **not** commit.

### Blockers / notes for Phase 5
1. Product details + cart slice: ProductDetails, Cart, OrderSummary, quantity controls — still on MUI.
2. ProductImage is already Tailwind; Cart/ProductDetails only need wrapper migration (responsive height API already supported).
3. Lint still red (30) — cleanup timing still open.
4. Dirty WIP still mixed with migration diffs — commit/stash strategy still open.
5. Bundle still larger than Phase 0 until Phase 7 uninstalls MUI; expect further Select/Radio reuse on ProductDetails qty if mapped to Select.

---

## Phase 5 — Product details and cart (2026-09-20)

### What Phase 5 required
Migrate ProductDetails, Cart, OrderSummary, and quantity controls off MUI.
Product details: gallery, specs as semantic table/dl, stock/shipping notes as today.
Cart: line items, qty controls (≥40px targets), remove, totals via existing logic.
Do not change cart/catalog context APIs or checkout redirect behavior.

### Docs grounding
- Reused Phase 4 Select (`items` on root) for ProductDetails qty; Label association via `htmlFor` / trigger `id`.
- Router CTAs: `buttonVariants` + `Link` (not Button `render`), same as Phases 3–4.
- No new shadcn packages: success “Added to cart” callout and free-shipping bar are tokenized markup (Alert/Progress deferred; Phase 6 Auth will likely add Alert).

### Files changed (Phase 5 only)
| Path | Change |
|---|---|
| `src/pages/ProductDetails.jsx` | PageContainer; gallery sticky on `md+`; Select qty; Badge stock; dl specs; lucide service icons; CSS enter for add confirmation |
| `src/pages/Cart.jsx` | PageContainer; line-item cards; qty ± / remove (≥40px mobile); OrderSummary sticky sidebar; empty state |
| `src/components/OrderSummary.jsx` | card surface + Separator; itemised list; determinate free-shipping bar (div + `role="progressbar"`) |
| `MIGRATION_LOG.md` | this Phase 5 section |

Cart/product/order calculation APIs (`useCart`, `calculateTotals`, navigate to `/checkout`): **unchanged**.
ProductImage: wrapper-only consumers (existing height API).

### Deviations / decisions
1. **Sticky buy box on mobile** — Phase brief mentions it; current MUI layout sticky’d the **gallery** on `md+`, not the buy box. Kept gallery sticky for visual parity; mobile buy box stays in document flow.
2. **Specs** — semantic `<dl>` / `<dt>` / `<dd>` with `font-mono` values (brief); layout still label/value rows.
3. **Collapse + Alert** — replaced with conditional success banner + `motion-safe:animate-content-enter` (no Alert package this slice).
4. **LinearProgress** — plain secondary fill bar with dynamic width inline style (allowed for dynamic values).
5. **Continue shopping** — outline `buttonVariants` link (was MUI text Button); still secondary to checkout CTA.
6. **Lint** — still **30** errors (same baseline as Phase 3/4); Phase 5 files clean after fixing unused-binding false positive on ServiceRow.
7. Did **not** commit.

### Verification
| Check | Result |
|---|---|
| `npm run build` | **PASS** — vite 8.3.0 |
| `npm run lint` | **FAIL** — 30 errors (unchanged vs Phase 3/4 baseline) |
| Phase 5 files `@mui` imports | **none** |
| Remaining `@mui` under `src` | 11 files (Phase 6–7: auth/account/checkout, theme bridge, main StyledEngineProvider) |

#### Bundle sizes after Phase 5 (raw + gzip level 9)

| Asset class | Raw | Gzip (level 9) | vs Phase 4 |
|---|---:|---:|---|
| All JS | 1099.96 kB (1,126,358 B) | 346.36 kB (354,668 B) | **−~19 kB raw** (details/cart off MUI; Select shared) |
| All CSS | 74.97 kB (76,766 B) | 13.03 kB (13,339 B) | **+~3 kB raw** |
| **JS + CSS** | **1174.97 kB** | **359.38 kB** | |

MUI chunk ~275.2 kB raw / ~84.9 kB gzip (down from Phase 4 ~305.9 / ~94.0).

### Manual test checklist (375px & 1280px, light & dark)
- [ ] Product details: back link to category browse; sticky gallery on desktop; image loads via ProductImage
- [ ] Qty Select (disabled at max); Add to cart; success banner + View cart; max-quantity label
- [ ] Specs dl rows; delivery/returns/warranty notes; related “More in {category}” grid
- [ ] Missing product id → flash error + redirect `/browse`
- [ ] Cart: empty state → Browse products; line qty ± (≥40px on mobile), remove, line total on `sm+`
- [ ] Order summary: subtotal/shipping/tax/total; free-shipping progress when under threshold
- [ ] Proceed to checkout → `/checkout` (page still MUI until Phase 6); Continue shopping → `/browse`
- [ ] Checkout page still renders OrderSummary (itemised) without layout break

### Suggested commit message (when you choose to commit)

```
chore: migrate product details and cart UI (Phase 5)

Replace ProductDetails, Cart, and OrderSummary MUI surfaces with
Tailwind/shadcn while keeping cart totals and checkout navigation.
```

Phase 5 did **not** commit.

### Blockers / notes for Phase 6
1. Auth / Account / Checkout / CheckoutSuccess / CheckoutProgress / RequireAuth / NotFound / GoogleGlyph — still on MUI.
2. Checkout still owns Stripe redirect + react-hook-form TextFields; do not touch webhook/services.
3. Likely add shadcn Alert (+ Dialog for Account delete, Tabs for Auth) when that slice needs them.
4. Lint still red (30) — cleanup timing still open.
5. Dirty WIP still mixed with migration diffs — commit/stash strategy still open.
6. Bundle still larger than Phase 0 until Phase 7 uninstalls MUI; OrderSummary already shared with Checkout.

---

## Phase 6 — Auth, account, checkout (2026-09-20)

### What Phase 6 required
Migrate Auth, Account, Checkout, CheckoutSuccess, CheckoutProgress, RequireAuth, NotFound, GoogleGlyph off MUI.
Keep react-hook-form on Auth; Input/Label/Field with error text + `aria-invalid` / `aria-describedby`.
Checkout still redirects to Stripe; do not touch redirect, webhook, or services. OAuth redirect behavior unchanged.

### Docs grounding
- Added `alert`, `dialog`, `tabs`, `field` via `npx shadcn@latest add` (Base UI; Field skipped overwriting Label/Separator).
- RHF pattern from shadcn docs: `Controller` → `Field` + `FieldLabel` + `Input` + `FieldError` / `FieldDescription`.
- Router CTAs: `buttonVariants` + `Link` (Phases 3–5). Tabs controlled `value` / `onValueChange` for Auth signup/login (URL mode sync unchanged).
- Dialog: controlled `open` / `onOpenChange`; dismiss blocked while delete is busy; `showCloseButton={!busy}`.

### Files changed (Phase 6 only)
| Path | Change |
|---|---|
| `src/pages/Auth.jsx` | Tabs + Field/Input RHF; Alert tones; lucide Eye/Loader2; Google button; no MUI |
| `src/pages/Account.jsx` | PageContainer; section nav; Dialog delete; Field forms; theme toggle group; order cards |
| `src/pages/Checkout.jsx` | PageContainer; read-only email Field; Stripe pay CTA; OrderSummary sticky |
| `src/pages/CheckoutSuccess.jsx` | PageContainer; confirmation / error / loading; Separator summary |
| `src/pages/NotFound.jsx` | Tailwind + `buttonVariants` links |
| `src/components/CheckoutProgress.jsx` | semantic `<nav>` + text steps |
| `src/components/RequireAuth.jsx` | Loader2 spinner; Navigate unchanged |
| `src/components/GoogleGlyph.jsx` | plain SVG (Google brand fills kept) |
| `src/components/ui/{alert,dialog,tabs,field}.jsx` | **new** (shadcn) |
| `MIGRATION_LOG.md` | this Phase 6 section |

Auth/account/checkout **business logic** (Supabase auth, `usePayment` / `payWithStripe`, `fetchCheckoutSession`, orders list, OAuth flags): **unchanged**.
Webhook / `services/stripe` / `api/*`: **not touched**.

### Deviations / decisions
1. **Alert severities** — shadcn Alert only ships `default` / `destructive`. Success/warning/info use token borders (`border-success/40`, `border-warning/40`, etc.) via className helper; no new deps.
2. **Auth Tabs** — tab list only (no `TabsContent`); forms still keyed by URL `mode` as before.
3. **Checkout email** — was plain MUI TextField (not RHF); kept non-RHF Input + FieldLabel/Description for parity.
4. **Account theme toggle** — exclusive button group (same as Home density), not a new ToggleGroup package.
5. **GoogleGlyph** — Google brand hex fills retained on the SVG (logo accuracy); not theme tokens.
6. **Lint** — back to **30** baseline after fixing unused-binding false positive on theme icons; Phase 6 files otherwise clean.
7. Did **not** commit.

### Verification
| Check | Result |
|---|---|
| `npm run build` | **PASS** — vite 8.3.0 |
| `npm run lint` | **FAIL** — 30 errors (unchanged vs Phase 3–5 baseline) |
| Phase 6 files `@mui` imports | **none** |
| Remaining `@mui` under `src` | **3 files** (Phase 7: `ColorModeProvider`, `main.jsx` StyledEngineProvider, `theme/index.js`) |

#### Bundle sizes after Phase 6 (raw + gzip level 9)

| Asset class | Raw | Gzip (level 9) | vs Phase 5 |
|---|---:|---:|---|
| All JS | 951.25 kB (974,081 B) | 306.04 kB (313,383 B) | **−~149 kB raw** (auth/account/checkout off MUI) |
| All CSS | 92.96 kB (95,192 B) | 15.34 kB (15,712 B) | **+~18 kB raw** (Alert/Dialog/Tabs/Field utilities) |
| **JS + CSS** | **1044.21 kB** | **321.38 kB** | |

MUI chunk ~99.2 kB raw / ~34.2 kB gzip (down from Phase 5 ~275 / ~85) — only theme bridge + CssBaseline remain.

### Manual test checklist (375px & 1280px, light & dark)
- [ ] Auth: Create account / Sign in tabs sync URL `?mode=`; validation + password visibility; Google continue
- [ ] Auth: reset request / update-password flows; email-confirm pending; OAuth timeout / signing-in states
- [ ] Account: section nav + `?section=`; profile name save; sign out flash
- [ ] Account: linked accounts connect/disconnect; password change (when allowed)
- [ ] Account: theme system/light/dark; delete dialog focus + phrase gate; busy blocks dismiss
- [ ] Account: orders loading / empty / list cards
- [ ] Checkout: empty cart state; canceled alert; Pay → Stripe redirect (do not complete paid charge)
- [ ] CheckoutSuccess: loading → confirmed / pending / error paths with `session_id`
- [ ] RequireAuth: loading spinner then redirect to login with `redirect=`
- [ ] NotFound: home + browse links
- [ ] No unexpected console errors on happy paths

### Suggested commit message (when you choose to commit)

```
chore: migrate auth, account, and checkout UI (Phase 6)

Replace Auth/Account/Checkout MUI surfaces with Tailwind/shadcn
Field, Tabs, Dialog, and Alert while keeping RHF and Stripe redirect.
```

Phase 6 did **not** commit.

### Blockers / notes for Phase 7
1. Only 3 `@mui` call sites left: `ColorModeProvider` (ThemeProvider/CssBaseline/useMediaQuery), `main.jsx` (StyledEngineProvider/GlobalStyles), `theme/index.js` (`createTheme`).
2. Phase 7: strip MUI providers/layers, delete `theme/index.js` (keep `motion.js` if used), uninstall `@mui/*` + `@emotion/*`, compare bundle to Phase 0 baseline.
3. Replace `useMediaQuery` with a tiny `matchMedia` helper (or CSS-only) when reducing ColorModeProvider.
4. Lint still red (30) — cleanup timing still open.
5. Dirty WIP still mixed with migration diffs — commit/stash strategy still open.
6. GoogleGlyph brand hex fills are intentional; do not force them onto CSS tokens in Phase 7.

---

## Phase 7 — Remove MUI (2026-09-20)

### What Phase 7 required
1. `git grep -l "@mui" -- src` and `git grep -l "@emotion" -- src` return nothing.
2. Remove StyledEngineProvider/GlobalStyles, ThemeProvider, CssBaseline; delete `src/theme/index.js` (keep `motion.js`); reduce ColorModeProvider to `.dark` + persistence; remove `mui` from CSS layer order.
3. `npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled`.
4. Build, lint, compare bundle sizes to Phase 0 baseline.

### Files changed (Phase 7 only)
| Path | Change |
|---|---|
| `src/hooks/useMediaQuery.js` | **new** — `matchMedia` subscription helper (replaces MUI `useMediaQuery`) |
| `src/context/ColorModeProvider.jsx` | dropped ThemeProvider / CssBaseline / `createAppTheme`; hook API unchanged |
| `src/main.jsx` | dropped StyledEngineProvider + GlobalStyles |
| `src/theme/index.js` | **deleted** |
| `src/index.css` | layer order without `mui`; `#root` / html / body / img base parity (former CssBaseline layout bits) |
| `package.json` / `package-lock.json` | uninstalled `@mui/*` + `@emotion/*` (−45 packages) |
| `MIGRATION_LOG.md` | this Phase 7 section |

`src/theme/motion.js` **kept** (ANIMATE / DURATION / `usePrefersReducedMotion` still used by shell/catalog).

### Deviations / decisions
1. **CssBaseline → base layer** — preserved `#root` flex column + min-height, html/body height/overflow, and `img` block/max-width so footer/`flex-grow` main layout stays intact. Did not port scrollbar styling or global reduced-motion CSS (Tailwind `motion-safe` / Preflight already cover app motion).
2. **`useMediaQuery` hook** — small shared helper under `src/hooks/` (same pattern as `usePrefersReducedMotion` in motion.js) rather than inlining in ColorModeProvider.
3. **Lint** — still **30** baseline errors; no new Phase 7 categories. ColorModeProvider still trips `react-refresh/only-export-components` (pre-existing pattern).
4. Did **not** commit (phase does not require it). Did not start Phase 8 polish.

### Verification
| Check | Result |
|---|---|
| `npm run build` | **PASS** — vite 8.3.0, 2322 modules, **no MUI chunk** |
| `npm run lint` | **FAIL** — 30 errors (unchanged vs Phase 3–6 baseline) |
| `git grep -l "@mui" -- src` | **empty** |
| `git grep -l "@emotion" -- src` | **empty** |
| `package.json` `@mui` / `@emotion` | **removed** |

#### Bundle sizes after Phase 7 (raw + gzip level 9)

| Asset class | Raw | Gzip (level 9) | vs Phase 0 | vs Phase 6 |
|---|---:|---:|---:|---:|
| All JS | 858.24 kB (878,838 B) | 273.70 kB (280,265 B) | **−71.1 kB / −7.9 kB** | **−93.0 kB / −32.3 kB** |
| All CSS | 92.60 kB (94,823 B) | 15.32 kB (15,685 B) | **+82.7 kB / +14.1 kB** | ~flat |
| **JS + CSS** | **950.84 kB** | **289.01 kB** | **+11.7 kB / +6.3 kB** | **−93.4 kB / −32.4 kB** |

Notes:
- Phase 0 MUI-only chunk (~372 kB / ~114 kB gzip) is **gone**.
- Net JS+CSS is slightly **above** Phase 0 because Tailwind/shadcn CSS (~93 kB) and Base UI / lucide replace a portion of the MUI savings; JS alone is clearly smaller.
- Largest remaining JS chunks: `react` (~248 kB), `createLucideIcon` (~215 kB), app `index` (~119 kB). Lucide tree-shaking is a Phase 8 opportunity.

### Manual test checklist (375px & 1280px, light & dark)
- [ ] Hard refresh: no FOUC; `<html class="dark">` matches preference / system
- [ ] Navbar + Account theme toggle (system/light/dark) still works without MUI ThemeProvider
- [ ] Layout: sticky header, `main` grows, footer at bottom on short pages
- [ ] Smoke: Home / Browse / Product / Cart / Auth / Account / Checkout shell render
- [ ] No `@mui` / Emotion runtime errors in console
- [ ] Stripe checkout redirect path still wired (do not complete paid charge)

### Suggested commit message (when you choose to commit)

```
chore: remove MUI and Emotion (Phase 7)

Drop theme bridge providers, delete createTheme, and uninstall @mui/*
+ @emotion/*; color mode keeps dark class + storage API only.
```

Phase 7 did **not** commit.

### Blockers / notes for Phase 8
1. Phase 8 is **polish + production review (report-only)** per `UI_MIGRATION.md` — do not start until requested.
2. Lint still red (30 baseline) — decide cleanup vs document-as-known.
3. Bundle: CSS larger than Phase 0; consider lucide import hygiene / unused utility purge review in Phase 8.
4. Dirty WIP / commit strategy still open across Phases 0–7.
5. Visual parity spot-check after CssBaseline removal (scrollbars, reduced-motion OS setting).

---
