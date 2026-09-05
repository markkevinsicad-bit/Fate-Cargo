-- Migration 0004: quote_requests
-- Public "Get a Quote" form. Guests (not logged in) may submit; if the
-- submitter is logged in, customer_id is attached automatically.

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete set null,

  full_name text not null,
  phone text not null,
  email text,

  origin text not null,
  destination_id uuid references public.destinations(id) on delete set null,
  destination_text text,

  cargo_category_id uuid references public.cargo_categories(id) on delete set null,
  cargo_description text,

  number_of_packages integer check (number_of_packages is null or number_of_packages > 0),
  weight_kg numeric(10, 2) check (weight_kg is null or weight_kg >= 0),
  length_cm numeric(10, 2) check (length_cm is null or length_cm >= 0),
  width_cm numeric(10, 2) check (width_cm is null or width_cm >= 0),
  height_cm numeric(10, 2) check (height_cm is null or height_cm >= 0),
  volume_cbm numeric(12, 4),

  special_handling public.special_handling[] not null default '{}',
  pickup_required boolean not null default true,
  additional_notes text,

  status public.request_status not null default 'requested',
  admin_notes text,
  quoted_amount numeric(12, 2),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quote_requests_customer_idx on public.quote_requests (customer_id);
create index if not exists quote_requests_status_idx on public.quote_requests (status);
create index if not exists quote_requests_created_idx on public.quote_requests (created_at desc);

drop trigger if exists set_quote_requests_updated_at on public.quote_requests;
create trigger set_quote_requests_updated_at
  before update on public.quote_requests
  for each row execute function public.set_updated_at();

-- Auto-compute volume (cubic meters) from L/W/H in centimeters whenever
-- present, so the frontend never has to duplicate this logic.
create or replace function public.compute_quote_volume()
returns trigger
language plpgsql
as $$
begin
  if new.length_cm is not null and new.width_cm is not null and new.height_cm is not null then
    new.volume_cbm := round((new.length_cm * new.width_cm * new.height_cm) / 1000000.0, 4);
  else
    new.volume_cbm := null;
  end if;
  return new;
end;
$$;

drop trigger if exists compute_quote_requests_volume on public.quote_requests;
create trigger compute_quote_requests_volume
  before insert or update on public.quote_requests
  for each row execute function public.compute_quote_volume();

alter table public.quote_requests enable row level security;

-- Anyone can submit a quote request (guest or logged-in customer), but the
-- customer_id must either be null or match the caller - nobody can submit
-- a quote request "as" someone else.
drop policy if exists "quote_requests_insert_public" on public.quote_requests;
create policy "quote_requests_insert_public"
  on public.quote_requests for insert
  with check (customer_id is null or customer_id = auth.uid());

drop policy if exists "quote_requests_select_own_or_admin" on public.quote_requests;
create policy "quote_requests_select_own_or_admin"
  on public.quote_requests for select
  using (customer_id = auth.uid() or public.is_admin());

-- Customers cannot edit a submitted quote request (prevents tampering with
-- admin-set fields like status/quoted_amount). Only admins/staff update.
drop policy if exists "quote_requests_admin_update" on public.quote_requests;
create policy "quote_requests_admin_update"
  on public.quote_requests for update
  using (public.current_role_is(array['admin', 'staff']::public.user_role[]))
  with check (public.current_role_is(array['admin', 'staff']::public.user_role[]));

drop policy if exists "quote_requests_admin_delete" on public.quote_requests;
create policy "quote_requests_admin_delete"
  on public.quote_requests for delete
  using (public.is_admin());
