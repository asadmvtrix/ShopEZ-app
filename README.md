# ShopEZ

A storefront for PC components, peripherals, displays and audio gear. React + Vite on
the front end, Material UI for the design system. **Auth is backed by Supabase**; the
catalogue and checkout are still client-side for now.

## Running it

```bash
npm install
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

**Google login + email branding:** follow the short checklist in [`SETUP-AUTH.md`](./SETUP-AUTH.md).

## Stage 1 — Supabase Auth setup

1. Create a free project at [supabase.com](https://supabase.com).
2. **Project Settings → API**: copy Project URL and the `anon` `public` key into `.env`.
3. **Authentication → URL configuration**:
   - Site URL: `http://localhost:5173` (or your Vite port)
   - Redirect URLs: add at least
     - `http://localhost:5173/auth?mode=login`
     - `http://localhost:5173/auth?mode=login&oauth=1`
     - `http://localhost:5173/auth?mode=login&verified=1`
     - `http://localhost:5173/auth?mode=update-password`
4. **Authentication → Providers → Email**: enable Email. For local demos you can turn
   **Confirm email** off so sign-up signs in immediately; leave it on for production-like flow.
5. Run `supabase/setup.sql` once in **SQL Editor** so Account → Delete account works
   (`rpc('delete_own_account')`).
6. Restart `npm run dev` after editing `.env`.

### Google sign-in (dashboard steps)

1. **Google Cloud Console** → create (or pick) a project → **APIs & Services → Credentials**.
2. Configure the **OAuth consent screen** (External is fine for testing; add your Google
   account as a test user while the app is in Testing).
3. Create an **OAuth client ID** type **Web application**:
   - Authorized JavaScript origins: `http://localhost:5173` (and later your production URL)
   - Authorized redirect URIs: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
     (copy the exact callback from Supabase → **Authentication → Providers → Google**)
4. Copy the **Client ID** and **Client secret**.
5. In Supabase → **Authentication → Providers → Google**: enable it, paste Client ID +
   secret, save.
6. Ensure the redirect URLs in step 3 of Stage 1 include `.../auth?mode=login&oauth=1`.

The app shows **Continue with Google** on Create account and Sign in. Google-only accounts
skip the password form on `/account`.

### Brand the auth emails (ShopEZ, not “Supabase Auth”)

Why it says Supabase Auth: the free built-in mailer always sends from Supabase’s servers.
Subject/body can still be ShopEZ; the **From** name only changes with custom SMTP.

**Quick win (no SMTP)** — **Authentication → Email Templates**:
- Confirm signup subject: `Confirm your ShopEZ account`
- Reset password subject: `Reset your ShopEZ password`
- Body: greet as ShopEZ; remove generic “Supabase” wording where you can

**Real From: ShopEZ &lt;noreply@yourdomain&gt;** — need custom SMTP:
1. Sign up for Resend or Brevo (free tiers work for testing).
2. Verify a domain (or use their onboarding address for tests).
3. Supabase → **Project Settings → Authentication → SMTP Settings** (or Auth → SMTP):
   enable custom SMTP and paste host / port / user / password / sender email /
   **sender name `ShopEZ`**.
4. Send a test signup and confirm the From line.

Password reset: open the link on the same browser → `/auth?mode=update-password`.
Confirm signup → `/auth?mode=login&verified=1` with a verified state.

## What is real and what is not

- **Accounts** — Supabase Auth (email/password + Google). Session restores across refreshes.
  Change password and delete account live under `/account`.
- **Catalogue** — still a static array in `src/data/products.js`. Images are hotlinked from
  supplier CDNs; `ProductImage` shows a shimmer then falls back to an initial if they fail.
- **Cart** — still `localStorage` on this device only.
- **Checkout** — validates cards in the browser and posts to a placeholder endpoint.
  Nothing is charged. Point `VITE_PAYMENT_API_URL` at a real endpoint when you have one.
  Until then the form uses `autocomplete="off"` on card fields.

## Layout

```
src/
  components/   reusable UI (cards, grids, skeletons, route fallback)
  config/       tax, shipping and formatting
  context/      auth (Supabase), cart, colour-mode
  data/         static catalogue
  hooks/        usePayment, reduced-motion, warm reveal
  lib/          card helpers, storage, supabase client
  pages/        one file per route
  theme/        Material UI theme + motion tokens
supabase/
  setup.sql     one-time SQL for self-serve account deletion
```

## Known gaps (next stages)

- Catalogue still not in a database; no stock tracking.
- No order history after the receipt screen.
- Checkout is still a sandbox (Stage 3: Stripe).
- No automated tests.
