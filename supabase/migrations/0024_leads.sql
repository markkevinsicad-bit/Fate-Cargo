-- Migration 0024: leads
-- A lightweight lead-capture funnel distinct from quote_requests (which
-- is the detailed booking-style quote form). Leads are for quick,
-- low-friction "just tell us roughly what you need" interest capture that
-- admin nurtures toward a booking.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  origin text,
  destination text,
  cargo_type text,
  estimated_size text,
  preferred_service_id uuid references public.services(id) on delete set null,
  notes text,
  status public.lead_status not null default 'new',
  internal_notes text,
  follow_up_date date,
  converted_shipment_id uuid references public.shipments(id) on delete set null,
  referral_code_used text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_follow_up_idx on public.leads (follow_up_date) where follow_up_date is not null;

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

alter table public.leads enable row level security;

-- Anyone (including anonymous website visitors) can submit a lead.
drop policy if exists "leads_insert_public" on public.leads;
create policy "leads_insert_public"
  on public.leads for insert
  with check (true);

drop policy if exists "leads_select_ops" on public.leads;
create policy "leads_select_ops"
  on public.leads for select
  using (public.current_role_is(array['staff', 'admin']::public.user_role[]));

drop policy if exists "leads_ops_update" on public.leads;
create policy "leads_ops_update"
  on public.leads for update
  using (public.current_role_is(array['staff', 'admin']::public.user_role[]))
  with check (public.current_role_is(array['staff', 'admin']::public.user_role[]));
