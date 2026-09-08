# FATE CARGO 360

**"From booking to doorstep, everything connected."**

A production-oriented logistics management platform for FATE CARGO, built with
Next.js, TypeScript, Tailwind CSS, and Supabase.

This repository contains **Phase 1**: technical foundation, database schema,
phone-OTP authentication, the public marketing site, the quote/moving request
system, the customer dashboard foundation, and the admin foundation.

---

## Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Radix UI primitives
- **Backend / DB:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Auth:** Supabase Auth — **phone number + OTP only** for customers
- **Forms:** react-hook-form + zod
- **Hosting:** Vercel-compatible (no special config needed)

---

## 1. Prerequisites

- Node.js 20+
- A Supabase project (create one free at https://supabase.com)
- (Optional but recommended) the [Supabase CLI](https://supabase.com/docs/guides/cli) for running migrations locally or against your linked project

---

## 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in the three values from **Supabase Dashboard → Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Never commit `.env.local`** (already gitignored) and never expose the
service-role key to the browser — it's only read by `src/lib/supabase/admin.ts`,
which is marked `server-only`.

---

## 3. Apply the database migrations

All schema, RLS policies, and seed data live in `supabase/migrations/`, in order:

| File | What it creates |
|---|---|
| `0001_extensions_and_enums.sql` | pgcrypto extension + shared enum types |
| `0002_profiles.sql` | `profiles` table, auto-create-on-signup trigger, `is_admin()` helper, RLS |
| `0003_core_lookup_tables.sql` | `destinations`, `services`, `cargo_categories`, `loading_schedules` + RLS |
| `0004_quote_requests.sql` | `quote_requests` table, auto volume calculation, RLS |
| `0005_moving_requests.sql` | `moving_requests` table + RLS |
| `0006_notifications.sql` | `notifications` table, auto-notify trigger on status change, RLS |
| `0007_seed_data.sql` | Seeds destinations, services, cargo categories, and 8 weeks of real loading dates |

### Option A — Supabase CLI (recommended)

```bash
npm install -g supabase   # if you don't have it
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### Option B — Manual (SQL editor)

Open **Supabase Dashboard → SQL Editor** and run each file in
`supabase/migrations/` **in numeric order**, top to bottom.

---

## 4. Authentication setup

FATE CARGO 360 uses **two separate login methods**:

- **Customers** → phone number + OTP (no password, ever)
- **Admin / Staff / Warehouse / Driver** → email + password (no SMS/Twilio needed)

### 4a. Customer phone OTP

1. **Authentication → Sign In / Providers → Phone** → enable it.
2. Configure a real SMS provider (Twilio, MessageBird, or Vonage) under
   **Authentication → Sign In / Providers → Phone → SMS Provider**. Without a
   configured provider, OTP codes won't actually be sent. If you don't have
   an SMS provider available yet, you can still fully build and test
   everything else - only the customer-facing phone login will be blocked
   until a provider is configured.
3. (Optional, for local dev with `supabase start`) `supabase/config.toml`
   already has phone auth enabled for the local emulator.

### 4b. Staff email + password

1. **Authentication → Sign In / Providers → Email** → enable it, and make
   sure **"Enable email signup"** (public self-registration) is **OFF**.
   Staff/admin/warehouse/driver accounts are only ever created by an
   existing admin from `/admin/team` (using the service-role Admin API),
   never through public sign-up.
2. Password-reset emails ("Forgot password?" on `/staff-login`) use
   Supabase's built-in email sending for auth emails - this works out of
   the box with no SMS/Twilio setup required.
3. **Bootstrapping your first admin** (chicken-and-egg: creating a team
   account normally requires an existing admin):
   - Go to **Supabase Dashboard → Authentication → Users → Add User**,
     create a user with an email and password, and check "Auto Confirm
     User".
   - Then in the **SQL Editor**, run:
     ```sql
     update public.profiles set role = 'admin' where email = 'you@example.com';
     ```
   - Log in at `/staff-login` with that email/password. From then on, use
     `/admin/team` to create every other staff/warehouse/driver/admin
     account normally.

**Security note:** roles for staff-created accounts are stored in Supabase
Auth's `app_metadata`, not `user_metadata` - `app_metadata` can only be set
via the service-role Admin API, never by a client-side signup call. This is
what prevents a customer from ever self-escalating their role through the
public signup API. See migration `0027_staff_email_auth.sql`.

---

## 5. Install dependencies and run


```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. To access the admin panel, follow the
"Bootstrapping your first admin" steps in section 4b above, then visit
`/admin`.

---

## 6. Verify before deploying

```bash
npx tsc --noEmit   # TypeScript
npx eslint .       # Lint
npm run build      # Production build
```

All three currently pass cleanly in this repository.

---

## 7. Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the same three environment variables from `.env.local` in
   **Vercel → Project Settings → Environment Variables**.
4. Deploy.

---

## Project Structure

```
src/
  app/
    (site)/            Public marketing site (home, services, destinations, schedule,
                        get-quote, moving, track, about, contact)
    login/              Phone + OTP login
    dashboard/          Customer dashboard (auth-gated)
    admin/              Admin dashboard (role-gated)
  actions/              Server Actions (quotes, moving, profile, admin)
  components/
    ui/                 Reusable primitives (button, input, card, select, dialog, ...)
    layout/              Navbar, Footer
    site/                Marketing page components
    forms/               Quote form, moving form, OTP login form
    dashboard/           Customer dashboard components
    admin/               Admin components
  lib/
    supabase/            Browser/server/admin Supabase clients, middleware, auth helpers, DB types
    validation/          Zod schemas
    data/                Server-side data-fetching helpers
    constants.ts          Shared enums/constants (kept in sync with SQL enums)
supabase/
  migrations/            SQL migrations (run in order)
  config.toml            Supabase CLI config
```

---

## What's implemented in Phase 1

- ✅ Supabase project wiring (browser / server / admin clients)
- ✅ Full relational schema with RLS on every table
- ✅ Phone + OTP customer auth, auto-profile creation, first-time profile setup
- ✅ Role system (`customer`, `staff`, `warehouse`, `driver`, `admin`) enforced via RLS + server checks
- ✅ Public site: services, destinations, loading schedule (DB-driven, not hardcoded), get-quote, moving request
- ✅ Customer dashboard: overview, quote requests, notifications, profile
- ✅ Admin dashboard: real metrics, quote/moving request review + status updates, loading schedule management, customer list
- ✅ Honest empty states everywhere real data doesn't exist yet (no fabricated stats)
- ✅ Phase 2/3 modules (bookings, shipments, warehouse, pickup, delivery, QR scanner, reports, settings) are clearly labeled placeholders — not fake functionality

## What's implemented in Phase 2

- ✅ Complete booking workflow: multi-section booking form → review/confirm screen (duplicate-submit guarded) → `create_booking()` RPC (customer_id always from `auth.uid()`, never trusted from the client)
- ✅ Booking = shipment (single entity, per the agreed architecture) progressing through the full `shipment_status` lifecycle
- ✅ Safe, atomic FATE Cargo ID generation (`FATE-YYYY-NNNNNN`, row-lock upsert counter — no `Math.random()`)
- ✅ Secure QR token generation (48-char hex via `gen_random_bytes`) — QR images encode only the opaque token, never customer data
- ✅ Customer: QR view/download/share, shipment detail with full tracking timeline, cargo condition records, dashboard shipment list
- ✅ Public `/track`: safe, limited lookup by FATE Cargo ID via a SECURITY DEFINER RPC that returns only non-sensitive fields
- ✅ Admin/staff QR scanner (`/admin/scanner`): camera-based (jsQR) with manual FATE Cargo ID fallback, contextual operational actions per shipment status
- ✅ Warehouse receiving workflow: `receive_cargo()` RPC does condition recording + status update + tracking event + notification atomically (all-or-nothing)
- ✅ Cargo Condition Passport: condition records at receiving/pre-loading/arrival/delivery, photos in a private Supabase Storage bucket with role-based RLS
- ✅ Admin bookings/shipments management: search, filter by status/destination, detail view with status control, internal notes (staff/admin only), trip assignment
- ✅ Loading trips: create trips, assign shipments, real calculated totals (weight, destinations, special handling, ready/loaded counts — no fabricated numbers)
- ✅ QR scan audit log (`qr_scan_logs`) — every scan, successful or not, is recorded
- ✅ Every shipment status change creates a tracking event + customer notification automatically (via RPC, not scattered client-side logic)

## What's implemented in Phase 3

- ✅ **Pickup management**: full workflow (requested → scheduled → assigned → out for pickup → arrived → picked up), admin assignment UI (`/admin/pickups`), driver completion with condition/photos (`complete_pickup` RPC — atomic proof + status + tracking event + notification + audit log)
- ✅ **Delivery management + Proof of Delivery**: full workflow (`/admin/deliveries`), driver completion requiring recipient name + optional photo (`complete_delivery` RPC is the *only* path to a DELIVERED shipment)
- ✅ **Driver portal** (`/driver`): role-gated, shows today's/upcoming/completed pickups and deliveries with real assignment data, start/arrive/complete actions, camera photo capture for proof
- ✅ **Driver management** (`/admin/drivers`): activate/deactivate (soft, preserves history), promote existing customer accounts to driver
- ✅ **Business customer portal**: organizations + authorized members (admin-managed), customer-facing org shipment history, CSV bulk booking with row-level validation shown before import (`/dashboard/organizations/[id]/bulk-booking`)
- ✅ **Saved addresses**: customers can save/reuse pickup & delivery addresses
- ✅ **Repeat booking**: pre-fills a new booking from a previous shipment's allowed fields — never reuses the old FATE Cargo ID, QR token, or internal notes; still requires full review/confirm
- ✅ **Lead generation**: public quick-lead widget on the homepage, admin CRM (`/admin/leads`) with status/follow-up/notes
- ✅ **Referral system**: unique per-customer codes generated on demand, self-referral and double-redemption blocked, conversion tracked automatically on first booking, admin analytics (`/admin/referrals`)
- ✅ **Reviews**: customers can review only their own delivered shipments, admin moderation gate before anything appears publicly, real approved reviews now shown on the homepage
- ✅ **Reports** (`/admin/reports`): shipment status/destination/region/service breakdowns, customer acquisition metrics, date-range filter, CSV export — all calculated from real data, with an honest note where a metric (average processing time) isn't reliably calculable yet
- ✅ **Settings** (`/admin/settings`): manage services, destinations, cargo categories, and referral settings without touching code
- ✅ **Audit logs**: every significant RPC (booking, status change, receiving, QR scan, pickup/delivery assignment & completion, referral redemption, review) writes an audit trail row; viewer at `/admin/audit-logs`
- ✅ Extended `can_access_shipment()` and storage policies so drivers only see/upload photos for shipments they're actually assigned to

## Authentication model (updated after Phase 3)

- **Customers**: phone + OTP only, at `/login`. No password, ever.
- **Admin / Staff / Warehouse / Driver**: email + password, at `/staff-login`, with a "Forgot password?" flow using Supabase's built-in auth email (no SMS/Twilio required). Accounts are created exclusively by an existing admin from `/admin/team` via the service-role Admin API - there is no public self-registration for these roles.
- Role is stored in Supabase Auth's `app_metadata` (server-only, never client-settable), not `user_metadata`, specifically to prevent a customer from self-escalating their role through the public signup API. See migration `0027_staff_email_auth.sql`.
- Deactivating a team account (`/admin/team` or `/admin/drivers`) both flips `profiles.is_active` and bans the underlying Supabase Auth user, so a deactivated staff member truly cannot log back in (not just a UI-level flag).

## What's simplified or deferred (noted honestly, not hidden)

- Referral code redemption is available on the customer's `/dashboard/referrals` page, not auto-applied during the OTP signup flow itself — a customer redeems it once, post-signup
- Reports show a fixed set of date ranges (Today/Week/Month/All Time); no arbitrary custom date-range picker yet
- No GPS/location verification on Proof of Delivery — intentionally not claimed, per the "don't falsely claim location verification" instruction
- Realtime (Supabase Realtime) push updates were not added in this phase either; the app relies on `revalidatePath` + manual refresh
