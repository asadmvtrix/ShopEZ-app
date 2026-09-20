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

