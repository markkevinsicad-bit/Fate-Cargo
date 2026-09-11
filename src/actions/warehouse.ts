"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/actions/quotes";
import type { ShipmentStatus, QrScanType, CargoConditionStage } from "@/lib/constants";

export type ScanQrResult =
  | { success: true; shipment: Record<string, unknown> }
  | { success: false; error: string };

const ERROR_MESSAGES: Record<string, string> = {
  NOT_AUTHORIZED: "You are not authorized to scan shipments.",
  INVALID_TOKEN: "That doesn't look like a valid FATE Cargo QR code or ID.",
  SHIPMENT_NOT_FOUND: "No shipment found for that code.",
  SHIPMENT_CANCELLED: "This shipment has been cancelled.",
  ALREADY_RECEIVED: "This shipment has already been received.",
};

function friendlyError(error: unknown): string {
  const message = (error as { message?: string })?.message ?? "";
  if (ERROR_MESSAGES[message]) return ERROR_MESSAGES[message];
  return message ? `Action failed: ${message}` : "Something went wrong while looking up this shipment.";
}

export async function scanQrToken(token: string, scanType: QrScanType): Promise<ScanQrResult> {
  const supabase = await createClient();
  const deviceInfo = "web-scanner";

  const { data, error } = await supabase.rpc("scan_qr_token", {
    p_token: token,
    p_scan_type: scanType,
    p_device_info: deviceInfo,
  });

  if (error || !data) {
    return { success: false, error: friendlyError(error) };
  }

  return { success: true, shipment: data as Record<string, unknown> };
}

export async function receiveCargo(input: {
  shipmentId: string;
  condition: string;
  packagingCondition?: string;
  notes?: string;
  photoPaths: string[];
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("receive_cargo", {
    p_shipment_id: input.shipmentId,
    p_condition: input.condition,
    p_packaging_condition: input.packagingCondition || null,
    p_notes: input.notes || null,
    p_photo_paths: input.photoPaths,
  });

  if (error) {
    console.error("receiveCargo error:", error);
    return { success: false, error: friendlyError(error) };
  }

  revalidatePath("/admin/warehouse");
  revalidatePath("/admin/shipments");
  return { success: true };
}

export async function recordCargoCondition(input: {
  shipmentId: string;
  stage: CargoConditionStage;
  condition: string;
  packagingCondition?: string;
  notes?: string;
  photoPaths: string[];
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("record_cargo_condition", {
    p_shipment_id: input.shipmentId,
    p_stage: input.stage,
    p_condition: input.condition,
    p_packaging_condition: input.packagingCondition || null,
    p_notes: input.notes || null,
    p_photo_paths: input.photoPaths,
  });

  if (error) {
    console.error("recordCargoCondition error:", error);
    return { success: false, error: friendlyError(error) };
  }

  revalidatePath("/admin/warehouse");
  revalidatePath("/admin/shipments");
  return { success: true };
}

export async function updateShipmentStatus(
  shipmentId: string,
  status: ShipmentStatus,
  note?: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_shipment_status", {
    p_shipment_id: shipmentId,
    p_status: status,
    p_note: note || undefined,
  });

  if (error) {
    console.error("updateShipmentStatus error:", error);
    return { success: false, error: friendlyError(error) };
  }

  revalidatePath("/admin/warehouse");
  revalidatePath("/admin/shipments");
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/shipments/${shipmentId}`);
  return { success: true };
}

export async function assignShipmentToTrip(shipmentId: string, tripId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("assign_shipment_to_trip", {
    p_shipment_id: shipmentId,
    p_trip_id: tripId,
  });

  if (error) {
    console.error("assignShipmentToTrip error:", error);
    return { success: false, error: friendlyError(error) };
  }

  revalidatePath("/admin/shipments");
  revalidatePath("/admin/loading-trips");
  revalidatePath(`/admin/loading-trips/${tripId}`);
  return { success: true };
}
