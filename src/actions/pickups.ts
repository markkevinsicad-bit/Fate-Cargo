"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/actions/quotes";
import type { PickupStatus } from "@/lib/constants";

const ERROR_MESSAGES: Record<string, string> = {
  NOT_AUTHORIZED: "You are not authorized to perform this action.",
  SHIPMENT_NOT_FOUND: "Shipment not found.",
  PICKUP_NOT_FOUND: "Pickup not found.",
  INVALID_DRIVER: "That driver is not available for assignment.",
  USE_COMPLETE_PICKUP: "Use the pickup completion form to mark cargo as picked up.",
};

function friendlyError(error: unknown): string {
  const message = (error as { message?: string })?.message ?? "";
  if (ERROR_MESSAGES[message]) return ERROR_MESSAGES[message];
  // Surface the real Postgres/Supabase error rather than a generic
  // message - these actions are already role-gated (staff/admin/driver),
  // so it's safe, and makes setup/config issues far easier to diagnose.
  return message ? `Action failed: ${message}` : "Something went wrong. Please try again.";
}

export async function createPickupRequest(input: {
  shipmentId: string;
  pickupAddress: string;
  scheduledDate?: string;
  scheduledTime?: string;
  contactName?: string;
  contactPhone?: string;
  notes?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_pickup_request", {
    p_shipment_id: input.shipmentId,
    p_pickup_address: input.pickupAddress,
    p_scheduled_date: input.scheduledDate || undefined,
    p_scheduled_time: input.scheduledTime || undefined,
    p_pickup_contact_name: input.contactName || undefined,
    p_pickup_contact_phone: input.contactPhone || undefined,
    p_notes: input.notes || undefined,
  });

  if (error) {
    console.error("createPickupRequest error:", error);
    return { success: false, error: friendlyError(error) };
  }

  revalidatePath("/admin/pickups");
  return { success: true };
}

export async function assignPickupDriver(pickupId: string, driverId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("assign_pickup_driver", {
    p_pickup_id: pickupId,
    p_driver_id: driverId,
  });

  if (error) {
    console.error("assignPickupDriver error:", error);
    return { success: false, error: friendlyError(error) };
  }

  revalidatePath("/admin/pickups");
  revalidatePath("/driver");
  return { success: true };
}

export async function updatePickupStatus(
  pickupId: string,
  status: Exclude<PickupStatus, "picked_up">,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("driver_update_pickup_status", {
    p_pickup_id: pickupId,
    p_status: status,
  });

  if (error) {
    console.error("updatePickupStatus error:", error);
    return { success: false, error: friendlyError(error) };
  }

  revalidatePath("/admin/pickups");
  revalidatePath("/driver");
  return { success: true };
}

export async function completePickup(input: {
  pickupId: string;
  condition: string;
  notes?: string;
  photoPaths: string[];
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_pickup", {
    p_pickup_id: input.pickupId,
    p_condition: input.condition,
    p_notes: input.notes || undefined,
    p_photo_paths: input.photoPaths,
  });

  if (error) {
    console.error("completePickup error:", error);
    return { success: false, error: friendlyError(error) };
  }

  revalidatePath("/admin/pickups");
  revalidatePath("/driver");
  revalidatePath("/admin/warehouse");
  return { success: true };
}
