-- Migration 0007: seed reference data
-- Idempotent: safe to re-run (upserts on the unique keys created above).

insert into public.destinations (name, region) values
  ('Mindoro', 'visayas'),
  ('Caticlan / Kalibo, Aklan', 'visayas'),
  ('Boracay Island', 'visayas'),
  ('Iloilo', 'visayas'),
  ('Bacolod', 'visayas'),
  ('Cebu', 'visayas'),
  ('Tacloban / Leyte', 'mindanao'),
  ('Surigao', 'mindanao'),
  ('Butuan', 'mindanao'),
  ('Cagayan de Oro', 'mindanao'),
  ('Davao', 'mindanao'),
  ('General Santos', 'mindanao')
on conflict (name) do update set region = excluded.region;

insert into public.services (name, slug, description, icon) values
  ('Door to Door Delivery', 'door-to-door', 'We pick up from your door and deliver straight to the recipient''s door.', 'truck'),
  ('Domestic Cargo Consolidation', 'consolidation', 'Consolidate multiple shipments into one cost-efficient load.', 'package'),
  ('Lipat Bahay', 'lipat-bahay', 'Full household moving service, handled with care.', 'home'),
  ('Office Transfer', 'office-transfer', 'Relocate office furniture, equipment and files with minimal downtime.', 'building-2'),
  ('Condo Transfer', 'condo-transfer', 'Moving service built for condo logistics: elevators, loading docks and tight schedules.', 'building')
on conflict (slug) do update set name = excluded.name, description = excluded.description, icon = excluded.icon;

insert into public.cargo_categories (name, slug) values
  ('Commercial Products', 'commercial-products'),
  ('Medical Supplies', 'medical-supplies'),
  ('Medical Equipment', 'medical-equipment'),
  ('Construction Materials', 'construction-materials'),
  ('Telco Products', 'telco-products'),
  ('Personal Effects', 'personal-effects'),
  ('Balikbayan Boxes', 'balikbayan-boxes'),
  ('Ukay Bales', 'ukay-bales'),
  ('General Cargo', 'general-cargo')
on conflict (slug) do update set name = excluded.name;

-- Seed the next 8 weeks of Visayas (Friday) / Mindanao (Saturday) loading
-- dates so the "Next Loading Schedule" widgets have real data on day one.
-- This is a one-time seed - ongoing schedule management happens through
-- the admin panel (Phase 2+), not by re-running this migration.
do $$
declare
  d date := current_date;
  weeks_ahead int := 0;
begin
  while weeks_ahead < 8 loop
    -- next Friday from d (ISO dow: Friday = 5)
    insert into public.loading_schedules (region, loading_date, booking_cutoff, status)
    values (
      'visayas',
      d + ((5 - extract(isodow from d)::int + 7) % 7) + (weeks_ahead * 7),
      (d + ((5 - extract(isodow from d)::int + 7) % 7) + (weeks_ahead * 7) - 1)::timestamptz + interval '17 hours',
      'scheduled'
    )
    on conflict (region, loading_date) do nothing;

    -- next Saturday from d (ISO dow: Saturday = 6)
    insert into public.loading_schedules (region, loading_date, booking_cutoff, status)
    values (
      'mindanao',
      d + ((6 - extract(isodow from d)::int + 7) % 7) + (weeks_ahead * 7),
      (d + ((6 - extract(isodow from d)::int + 7) % 7) + (weeks_ahead * 7) - 1)::timestamptz + interval '17 hours',
      'scheduled'
    )
    on conflict (region, loading_date) do nothing;

    weeks_ahead := weeks_ahead + 1;
  end loop;
end $$;
