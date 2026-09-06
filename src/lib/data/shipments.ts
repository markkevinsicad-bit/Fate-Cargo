import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getCustomerShipments(customerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipments")
    .select(
      "id, fate_cargo_id, status, service_id, destination_id, weight_kg, number_of_packages, created_at, updated_at, services(name), destinations(name, region)",
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getCustomerShipments error:", error);
    return [];
  }
  return data ?? [];
}

export async function getShipmentById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipments")
    .select(
      "*, services(name), destinations(name, region), cargo_categories(name), profiles!shipments_customer_id_fkey(full_name, phone, email)",
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code !== "PGRST116") console.error("getShipmentById error:", error);
    return null;
  }
  return data;
}

export async function getShipmentByFateCargoId(fateCargoId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipments")
    .select(
      "*, services(name), destinations(name, region), cargo_categories(name), profiles!shipments_customer_id_fkey(full_name, phone, email)",
    )
    .eq("fate_cargo_id", fateCargoId.trim().toUpperCase())
    .maybeSingle();

  if (error) {
    console.error("getShipmentByFateCargoId error:", error);
    return null;
  }
  return data;
}

export async function getShipmentTrackingEvents(shipmentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipment_tracking_events")
    .select("*")
    .eq("shipment_id", shipmentId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getShipmentTrackingEvents error:", error);
    return [];
  }
  return data ?? [];
}

export async function getCargoConditionRecords(shipmentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cargo_condition_records")
    .select("*")
    .eq("shipment_id", shipmentId)
    .order("recorded_at", { ascending: false });

  if (error) {
    console.error("getCargoConditionRecords error:", error);
    return [];
  }
  return data ?? [];
}

export async function getSignedPhotoUrls(paths: string[]): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("cargo-photos").createSignedUrls(paths, 3600);

  if (error || !data) {
    console.error("getSignedPhotoUrls error:", error);
    return {};
  }

  const map: Record<string, string> = {};
  for (const item of data) {
    if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
  }
  return map;
}

export async function getLoadingTrips(limit = 50) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loading_trips")
    .select("*, destinations(name)")
    .order("loading_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getLoadingTrips error:", error);
    return [];
  }
  return data ?? [];
}

export async function getLoadingTripById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loading_trips")
    .select("*, destinations(name)")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code !== "PGRST116") console.error("getLoadingTripById error:", error);
    return null;
  }
  return data;
}

export async function getShipmentsForTrip(tripId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipments")
    .select("*, destinations(name)")
    .eq("loading_trip_id", tripId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getShipmentsForTrip error:", error);
    return [];
  }
  return data ?? [];
}

export async function getQrScanLogs(shipmentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("qr_scan_logs")
    .select("*, profiles(full_name)")
    .eq("shipment_id", shipmentId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getQrScanLogs error:", error);
    return [];
  }
  return data ?? [];
}
