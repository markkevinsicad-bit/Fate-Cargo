-- Migration 0014: qr_scan_logs
-- Every QR scan (successful or not) creates an audit trail row. This
-- table is operational data - never exposed to customers.

create table if not exists public.qr_scan_logs (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid references public.shipments(id) on delete set null,
  scanned_by uuid references public.profiles(id) on delete set null,
  scan_type public.qr_scan_type not null,
  scan_result public.qr_scan_result not null,
  operational_action text,
  device_info text,
  created_at timestamptz not null default now()
);

create index if not exists qr_scan_logs_shipment_idx on public.qr_scan_logs (shipment_id, created_at desc);
create index if not exists qr_scan_logs_scanned_by_idx on public.qr_scan_logs (scanned_by, created_at desc);

alter table public.qr_scan_logs enable row level security;

drop policy if exists "qr_scan_logs_select_ops" on public.qr_scan_logs;
create policy "qr_scan_logs_select_ops"
  on public.qr_scan_logs for select
  using (public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[]));

-- Rows are written exclusively through the scan_qr_token() RPC
-- (SECURITY DEFINER). This INSERT policy is a defense-in-depth backstop.
drop policy if exists "qr_scan_logs_ops_insert" on public.qr_scan_logs;
create policy "qr_scan_logs_ops_insert"
  on public.qr_scan_logs for insert
  with check (public.current_role_is(array['staff', 'warehouse', 'admin']::public.user_role[]));
