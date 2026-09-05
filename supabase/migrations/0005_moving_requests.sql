-- Migration 0005: moving_requests
-- Dedicated Lipat Bahay / Office / Condo moving request form.

create table if not exists public.moving_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete set null,

  full_name text not null,
  phone text not null,
  email text,

  moving_type public.moving_type not null,
  pickup_location text not null,
  destination_location text not null,
  preferred_date date,
  rooms_estimate text,
  major_items text,
  elevator_available boolean,
  stairs boolean,
  special_items text,
  notes text,

  status public.request_status not null default 'requested',
  admin_notes text,
  quoted_amount numeric(12, 2),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists moving_requests_customer_idx on public.moving_requests (customer_id);
create index if not exists moving_requests_status_idx on public.moving_requests (status);
create index if not exists moving_requests_created_idx on public.moving_requests (created_at desc);

drop trigger if exists set_moving_requests_updated_at on public.moving_requests;
create trigger set_moving_requests_updated_at
  before update on public.moving_requests
  for each row execute function public.set_updated_at();

alter table public.moving_requests enable row level security;

drop policy if exists "moving_requests_insert_public" on public.moving_requests;
create policy "moving_requests_insert_public"
  on public.moving_requests for insert
  with check (customer_id is null or customer_id = auth.uid());

drop policy if exists "moving_requests_select_own_or_admin" on public.moving_requests;
create policy "moving_requests_select_own_or_admin"
  on public.moving_requests for select
  using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "moving_requests_admin_update" on public.moving_requests;
create policy "moving_requests_admin_update"
  on public.moving_requests for update
  using (public.current_role_is(array['admin', 'staff']::public.user_role[]))
  with check (public.current_role_is(array['admin', 'staff']::public.user_role[]));

drop policy if exists "moving_requests_admin_delete" on public.moving_requests;
create policy "moving_requests_admin_delete"
  on public.moving_requests for delete
  using (public.is_admin());
