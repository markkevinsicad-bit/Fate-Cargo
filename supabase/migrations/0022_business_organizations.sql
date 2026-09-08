-- Migration 0022: business customer organizations

create table if not exists public.business_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_email text,
  contact_phone text,
  billing_address text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_business_organizations_updated_at on public.business_organizations;
create trigger set_business_organizations_updated_at
  before update on public.business_organizations
  for each row execute function public.set_updated_at();

create table if not exists public.business_organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.business_organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  org_role public.org_member_role not null default 'member',
  created_at timestamptz not null default now()
);

create unique index if not exists business_org_members_unique on public.business_organization_members (organization_id, user_id);
create index if not exists business_org_members_user_idx on public.business_organization_members (user_id);

-- A shipment may optionally belong to a business organization (booked by
-- one of its authorized members). Nullable - most bookings are personal.
alter table public.shipments add column if not exists organization_id uuid references public.business_organizations(id) on delete set null;
create index if not exists shipments_organization_idx on public.shipments (organization_id);

create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.business_organization_members
    where organization_id = p_org_id and user_id = auth.uid()
  );
$$;

alter table public.business_organizations enable row level security;

drop policy if exists "business_orgs_select_member_or_admin" on public.business_organizations;
create policy "business_orgs_select_member_or_admin"
  on public.business_organizations for select
  using (public.is_org_member(id) or public.is_admin());

drop policy if exists "business_orgs_admin_write" on public.business_organizations;
create policy "business_orgs_admin_write"
  on public.business_organizations for all
  using (public.is_admin())
  with check (public.is_admin());

alter table public.business_organization_members enable row level security;

drop policy if exists "org_members_select_own_org_or_admin" on public.business_organization_members;
create policy "org_members_select_own_org_or_admin"
  on public.business_organization_members for select
  using (public.is_org_member(organization_id) or public.is_admin());

drop policy if exists "org_members_admin_write" on public.business_organization_members;
create policy "org_members_admin_write"
  on public.business_organization_members for all
  using (public.is_admin())
  with check (public.is_admin());

-- Update shipments SELECT policy so org members can see shipments booked
-- under their organization (e.g. a manager reviewing the org's history).
drop policy if exists "shipments_select_own_or_ops" on public.shipments;
create policy "shipments_select_own_or_ops"
  on public.shipments for select
  using (
    customer_id = auth.uid()
    or public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[])
    or (organization_id is not null and public.is_org_member(organization_id))
  );
