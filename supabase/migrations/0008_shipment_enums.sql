-- Phase 2 — Migration 0008: additional enums for the shipment workflow

do $$ begin
  create type public.cargo_condition_stage as enum ('receiving', 'pre_loading', 'arrival', 'delivery');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.loading_trip_status as enum ('planned', 'open', 'loading', 'departed', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.qr_scan_type as enum ('validation', 'receiving', 'warehouse', 'loading', 'delivery');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.qr_scan_result as enum (
    'success', 'invalid_token', 'not_found', 'unauthorized', 'already_processed', 'cancelled_shipment', 'error'
  );
exception when duplicate_object then null; end $$;
