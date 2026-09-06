-- Migration 0013: cargo_condition_records + storage
-- The "Cargo Condition Passport" - condition recorded at RECEIVING,
-- PRE_LOADING, ARRIVAL and DELIVERY. Photos live in Supabase Storage,
-- never as bytea in Postgres.

create table if not exists public.cargo_condition_records (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  stage public.cargo_condition_stage not null,
  condition text not null,
  packaging_condition text,
  notes text,
  photo_paths text[] not null default '{}',
  recorded_by uuid references public.profiles(id) on delete set null,
  recorded_at timestamptz not null default now()
);

create index if not exists cargo_condition_records_shipment_idx
  on public.cargo_condition_records (shipment_id, recorded_at desc);

alter table public.cargo_condition_records enable row level security;

drop policy if exists "cargo_condition_select_accessible" on public.cargo_condition_records;
create policy "cargo_condition_select_accessible"
  on public.cargo_condition_records for select
  using (public.can_access_shipment(shipment_id));

drop policy if exists "cargo_condition_ops_insert" on public.cargo_condition_records;
create policy "cargo_condition_ops_insert"
  on public.cargo_condition_records for insert
  with check (public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[]));

drop policy if exists "cargo_condition_ops_update" on public.cargo_condition_records;
create policy "cargo_condition_ops_update"
  on public.cargo_condition_records for update
  using (public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[]))
  with check (public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[]));

-- ---------------------------------------------------------------------
-- Storage bucket for cargo condition photos. Private bucket - files are
-- only reachable through RLS-checked signed URLs / authenticated reads,
-- never a public URL. Path convention: {shipment_id}/{record_id}/{file}
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cargo-photos', 'cargo-photos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "cargo_photos_ops_insert" on storage.objects;
create policy "cargo_photos_ops_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'cargo-photos'
    and public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[])
  );

drop policy if exists "cargo_photos_select_accessible" on storage.objects;
create policy "cargo_photos_select_accessible"
  on storage.objects for select
  using (
    bucket_id = 'cargo-photos'
    and (
      public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[])
      or public.can_access_shipment(nullif((storage.foldername(name))[1], '')::uuid)
    )
  );

drop policy if exists "cargo_photos_ops_delete" on storage.objects;
create policy "cargo_photos_ops_delete"
  on storage.objects for delete
  using (
    bucket_id = 'cargo-photos'
    and public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[])
  );
