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
2. Apply `supabase/migrations/001_initial_schema.sql` through `007_google_auth_and_persisted_order_contacts.sql` in order. Existing databases should apply only migrations they have not already run.
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

The existing Supabase Auth integration is for customer accounts. Admin login is the separate server-side credential and signed-cookie flow above; the Supabase service-role key is used by protected server API routes for database and storage operations, not as a browser login credential.

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

GitHub Pages cannot host this project as a working website: it publishes static files, while the existing site depends on Next.js server rendering and API routes for admin login, the signed admin session, Supabase service-role operations, checkout, payments, and Xerox uploads. Do not use `output: 'export'` or put admin secrets in browser code to work around this. The current routes and assets also use root paths, so hosting under a GitHub Pages repository subpath would need path changes even for static pages.

Keep the GitHub repository as the source, and deploy this existing Next.js project to a server-capable host such as Vercel:

1. Import the repository into Vercel and set the Root Directory to `hari-dealers` if the repository contains the project in that folder. Leave the framework preset as Next.js; do not enable static export.
2. In the Vercel project settings, add the production environment variables from `.env.example`, including `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. Generate a unique random `ADMIN_SESSION_SECRET` of at least 32 characters. Keep all values without the `NEXT_PUBLIC_` prefix private except the Supabase URL and anon key.
3. Set `NEXT_PUBLIC_SITE_URL` to the deployed site URL, apply the Supabase migrations, then redeploy after saving environment variables. Environment variables configured in GitHub Pages settings do not become server environment variables and cannot make its static host run these API routes.
4. Verify `/admin/login`, successful and rejected login, dashboard access, logout, and representative storefront routes on the Vercel domain. Also verify Supabase backed features after their credentials and migrations are configured.

The message `Admin login is not configured` is generated by `/api/admin/login` when a Next.js server is running without valid `ADMIN_USERNAME` and `ADMIN_PASSWORD`. If that exact JSON response appears, the request is reaching a server runtime, but its environment is missing those values. On GitHub Pages, the route itself cannot run; deploy the app to the server-capable host and configure the variables there. Never commit `.env.local` or put the secrets in GitHub Pages build output.
