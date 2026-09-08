-- Migration 0021: driver access extension
-- Drivers should be able to see (and upload photos for) a shipment only
-- when they have an active pickup or delivery assignment on it.

create or replace function public.can_access_shipment(p_shipment_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.shipments s
    where s.id = p_shipment_id
      and (
        s.customer_id = auth.uid()
        or public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[])
        or exists (select 1 from public.pickups pu where pu.shipment_id = s.id and pu.assigned_driver_id = auth.uid())
        or exists (select 1 from public.deliveries de where de.shipment_id = s.id and de.assigned_driver_id = auth.uid())
      )
  );
$$;

-- Drivers may upload pickup/delivery proof photos into the same
-- cargo-photos bucket (path convention: {shipment_id}/pickup/... or
-- {shipment_id}/delivery/...).
drop policy if exists "cargo_photos_ops_insert" on storage.objects;
create policy "cargo_photos_ops_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'cargo-photos'
    and (
      public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[])
      or (
        public.current_role_is(array['driver']::public.user_role[])
        and public.can_access_shipment(nullif((storage.foldername(name))[1], '')::uuid)
      )
    )
  );
