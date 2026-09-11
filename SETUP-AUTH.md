# Easy setup: Google login + ShopEZ emails

Use your real Vite port if it is not `5173` (check the terminal: `Local: http://localhost:????`).

---

## A) Google login — 8 steps

### 1. Open Supabase Google settings
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Open your **ShopEz-app** project
3. Left sidebar → **Authentication**
4. Click **Sign In / Providers** (or **Providers**)
5. Click **Google**
6. Turn **Enable Sign in with Google** **ON**
7. Leave this tab open — you need the **Callback URL** shown there  
   (looks like `https://xxxxx.supabase.co/auth/v1/callback`)

### 2. Open Google Cloud
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Top bar → pick a project (or **New Project** → name it ShopEZ → Create)

### 3. OAuth consent screen
1. Menu ☰ → **APIs & Services** → **OAuth consent screen**
2. Choose **External** → Create
3. App name: `ShopEZ`
4. User support email: your email
5. Developer contact: your email
6. Save and Continue through the screens (Scopes can stay default)
7. On **Test users** → **Add users** → add **your Gmail**
8. Save

### 4. Create Google Client ID
1. **APIs & Services** → **Credentials**
2. **+ Create credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `ShopEZ web`
5. **Authorized JavaScript origins** → Add URI:
   - `http://localhost:5173`
   - (if Vite uses another port, add that too, e.g. `http://localhost:5174`)
6. **Authorized redirect URIs** → Add URI:
   - paste the **exact** Supabase Callback URL from step A1
7. Create → copy **Client ID** and **Client secret**

### 5. Paste into Supabase
1. Back to Supabase Google provider page
2. Paste **Client ID**
3. Paste **Client secret**
4. Save

### 6. Allow your app URLs in Supabase
1. Supabase → **Authentication** → **URL Configuration**
2. **Site URL**: `http://localhost:5173` (or your port)
3. **Redirect URLs** → add these (one per line):
   - `http://localhost:5173/auth?mode=login`
   - `http://localhost:5173/auth?mode=login&oauth=1`
   - `http://localhost:5173/auth?mode=login&verified=1`
   - `http://localhost:5173/auth?mode=update-password`
4. Save

### 7. Restart the app
```bash
# stop the server (Ctrl+C), then:
npm run dev
```

### 8. Test
1. Open the app → **Sign in**
2. Click **Continue with Google**
3. Pick your test Gmail

If Google says “Access blocked”: your Gmail must be in **Test users** (step A3).

---

## B) Why email says “Supabase Auth” — fix branding

The **From** line is controlled by Supabase’s mail server, not our React code.

### Easy (5 minutes) — change subject & body to ShopEZ
1. Supabase → **Authentication** → **Email Templates**
2. Open **Confirm signup**
3. Subject → `Confirm your ShopEZ account`
4. In the message, change any “Supabase” wording to **ShopEZ**
5. Save
6. Do the same for **Reset password**  
   Subject → `Reset your ShopEZ password`

Inbox will still show From as something like Supabase until you do custom SMTP (below).

### Full fix — From name becomes ShopEZ (needs Resend/Brevo)
1. Create a free [Resend](https://resend.com) or [Brevo](https://www.brevo.com) account
2. Get SMTP host, port, user, password
3. Supabase → **Project Settings** → **Authentication** → **SMTP Settings**
4. Enable custom SMTP
5. Sender name: `ShopEZ`
6. Sender email: the address Resend/Brevo gives you
7. Save → send a test signup email

---

## C) Phone / other device testing

Dev server now listens on your network (`npm run dev`).

1. On your PC, note the **Network** URL Vite prints, e.g. `http://192.168.x.x:5173`
2. On your phone (same Wi‑Fi), open that URL
3. In Supabase redirect URLs + Google JavaScript origins, also add that `http://192.168.x.x:5173` URL if Google login from the phone fails
