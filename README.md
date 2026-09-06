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

## 4. Enable Phone Auth (OTP)

Customer login uses phone + OTP exclusively (no passwords). In your Supabase
project:

1. **Authentication → Sign In / Providers → Phone** → enable it.
2. Configure a real SMS provider (Twilio, MessageBird, or Vonage) under
   **Authentication → Sign In / Providers → Phone → SMS Provider**. Without a
   configured provider, OTP codes won't actually be sent.
3. (Optional, for local dev with `supabase start`) `supabase/config.toml`
   already has phone auth enabled for the local emulator.

---

## 5. Install dependencies and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

To make yourself an admin: sign up once as a customer via `/login`, then in
the Supabase SQL editor run:

```sql
update public.profiles set role = 'admin' where phone = '+63917XXXXXXX';
```

Then visit `/admin`.

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

## What's intentionally NOT in Phase 2 (Phase 3)

- Driver pickup/delivery workflows, proof of delivery
- Realtime (Supabase Realtime) live updates — current implementation uses Next.js `revalidatePath` + manual refresh; live push updates were not added this phase
- Repeat booking, business customers, bulk booking, referrals, reviews, reports/analytics, audit logs, settings
