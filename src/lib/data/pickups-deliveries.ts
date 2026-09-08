import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getPickups(filters?: { status?: string; driverId?: string; date?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("pickups")
    .select("*, shipments(fate_cargo_id, status, weight_kg, special_handling), profiles!pickups_assigned_driver_id_fkey(full_name)")
    .order("scheduled_date", { ascending: true, nullsFirst: false })
    .limit(150);

  if (filters?.status) query = query.eq("status", filters.status as never);
  if (filters?.driverId) query = query.eq("assigned_driver_id", filters.driverId);
  if (filters?.date) query = query.eq("scheduled_date", filters.date);

  const { data, error } = await query;
  if (error) {
    console.error("getPickups error:", error);
    return [];
  }
  return data ?? [];
}

export async function getPickupByShipmentId(shipmentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("pickups").select("*").eq("shipment_id", shipmentId).maybeSingle();
  if (error) {
    console.error("getPickupByShipmentId error:", error);
    return null;
  }
  return data;
}

export async function getDriverPickups(driverId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pickups")
    .select("*, shipments(fate_cargo_id, cargo_description, special_handling, weight_kg)")
    .eq("assigned_driver_id", driverId)
    .order("scheduled_date", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("getDriverPickups error:", error);
    return [];
  }
  return data ?? [];
}

export async function getDeliveries(filters?: { status?: string; driverId?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("deliveries")
    .select("*, shipments(fate_cargo_id, status, destinations(name)), profiles!deliveries_assigned_driver_id_fkey(full_name)")
    .order("scheduled_date", { ascending: true, nullsFirst: false })
    .limit(150);

  if (filters?.status) query = query.eq("status", filters.status as never);
  if (filters?.driverId) query = query.eq("assigned_driver_id", filters.driverId);

  const { data, error } = await query;
  if (error) {
    console.error("getDeliveries error:", error);
    return [];
  }
  return data ?? [];
}

export async function getDriverDeliveries(driverId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deliveries")
    .select("*, shipments(fate_cargo_id, cargo_description, special_handling)")
    .eq("assigned_driver_id", driverId)
    .order("scheduled_date", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("getDriverDeliveries error:", error);
    return [];
  }
  return data ?? [];
}

export async function getActiveDrivers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, is_active")
    .eq("role", "driver")
    .order("full_name");

  if (error) {
    console.error("getActiveDrivers error:", error);
    return [];
  }
  return data ?? [];
}

export async function getDeliveryByShipmentId(shipmentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("deliveries").select("*").eq("shipment_id", shipmentId).maybeSingle();
  if (error) {
    console.error("getDeliveryByShipmentId error:", error);
    return null;
  }
  return data;
}
