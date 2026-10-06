# HARI DEALERS

Next.js storefront for Hari Dealers with a dress catalog, cart and checkout, customer pages, a password protected admin portal, and Xerox/printing requests.

## Project structure

- `app/` – public routes, admin pages, and API handlers
- `components/` – shared storefront and admin UI
- `lib/` – store, Supabase clients, validation, payment, and email helpers
- `types/` – shared TypeScript data types
- `supabase/migrations/` – database setup in numbered SQL migrations

## Supabase setup

1. Create a Supabase project and open its SQL Editor.
2. Apply `supabase/migrations/001_initial_schema.sql` through `006_xerox_printing.sql` in order. Existing databases should apply only migrations they have not already run.
3. Confirm the private `xerox-documents` bucket exists. Migration 006 creates it; uploaded customer documents must remain private.
4. Configure Supabase Auth email settings if using the existing customer account pages. Do not expose the service role key in browser code.

Migration 006 adds `xerox_pricing` (one configurable price row) and `xerox_orders`, enables customer-owned order reads, and creates the private Xerox document bucket. The server uses the service role key for file upload and admin operations; keep it only in server environment variables.

## Environment

Copy `.env.example` to `.env.local` and set real values:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `ADMIN_USERNAME` (use `haridealers`)
- `ADMIN_PASSWORD` (set the separately supplied password here; never commit it)
- `ADMIN_SESSION_SECRET` (required random secret with at least 32 characters; keep separate from Supabase keys)
- Optional payment and email values: `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `EMAIL_FROM`, `ADMIN_EMAIL`, `RESEND_API_KEY`

`.env.local` is ignored by Git. Never commit real credentials.

## Single administrator login

There is no admin signup. The only accepted administrator username is `haridealers`; the matching password is read only from server environment configuration. Set it as `ADMIN_PASSWORD` in the ignored local `.env.local` file and as a secret environment variable in Vercel. Set `ADMIN_SESSION_SECRET` to a separate random value of at least 32 characters in both places. A successful login receives a 12-hour, signed, HttpOnly, SameSite=Strict cookie with an admin role claim. `/admin/*` pages are checked by middleware and server layout; admin write APIs check the signed cookie themselves. Logout clears the cookie and replaces the current browser history entry. Customer signup does not create or grant admin access.

To test locally, start `npm run dev`, visit `http://localhost:3000/admin/login`, sign in with the configured username and password, verify `/admin` opens, then sign out and confirm `/admin` redirects back to login. Try a wrong password and confirm the form shows `Invalid admin credentials`. Do not place the password in source files or browser storage.

For Vercel, configure `ADMIN_USERNAME=haridealers`, `ADMIN_PASSWORD`, and a distinct strong `ADMIN_SESSION_SECRET` in Project Settings → Environment Variables for the deployment environment, redeploy, then test `/admin/login`, `/admin`, and logout on the deployed domain. Keep these values server-side; do not prefix them with `NEXT_PUBLIC_`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Production build: `npm run build`; run it with `npm start`.

## Main routes

- `/`, `/about`, `/contact`, `/shop`, `/product/[slug]`, `/cart`, `/checkout`
- `/login`, `/register`, `/account`, `/account/orders`
- `/xerox` – Xerox request, private document upload, and live price estimate
- `/admin/login` – administrator login; `/admin` and `/admin/xerox` – protected admin pages

## Xerox flow check

After Supabase migrations and environment values are set, submit a small PDF from `/xerox`; confirm a generated `XRX-…` order appears in `/admin/xerox`. Change a price and reload the public form to confirm estimates use the saved database value. Admin document downloads use short lived signed URLs. This flow requires configured Supabase credentials and cannot be exercised against a local build without a connected project.

## Deployment

Push the project to a private or public GitHub repository without `.env.local`, create a Vercel project from that repository, and add the same environment variables in Vercel project settings. Apply Supabase migrations before deploying; set `NEXT_PUBLIC_SITE_URL` to the production URL. Deploy and verify the main routes, admin login, a test Xerox request, pricing updates, and the admin signed document download. Do not use development or placeholder credentials in production.
