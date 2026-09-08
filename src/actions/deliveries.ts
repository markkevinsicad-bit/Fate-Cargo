"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/actions/quotes";
import type { DeliveryStatus } from "@/lib/constants";

const ERROR_MESSAGES: Record<string, string> = {
  NOT_AUTHORIZED: "You are not authorized to perform this action.",
  SHIPMENT_NOT_FOUND: "Shipment not found.",
  DELIVERY_NOT_FOUND: "Delivery not found.",
  INVALID_DRIVER: "That driver is not available for assignment.",
  USE_COMPLETE_DELIVERY: "Use the delivery completion form to mark this as delivered.",
  RECIPIENT_NAME_REQUIRED: "Recipient name is required to complete delivery.",
};

function friendlyError(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const message = (error as { message?: string })?.message ?? "";
  return ERROR_MESSAGES[message] ?? fallback;
}

export async function createDeliveryAssignment(input: {
  shipmentId: string;
  destinationAddress: string;
  recipientName?: string;
  recipientPhone?: string;
  scheduledDate?: string;
  notes?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_delivery_assignment", {
    p_shipment_id: input.shipmentId,
    p_destination_address: input.destinationAddress,
    p_recipient_name: input.recipientName || undefined,
    p_recipient_phone: input.recipientPhone || undefined,
    p_scheduled_date: input.scheduledDate || undefined,
    p_notes: input.notes || undefined,
  });

  if (error) {
    console.error("createDeliveryAssignment error:", error);
    return { success: false, error: friendlyError(error) };
  }

  revalidatePath("/admin/deliveries");
  return { success: true };
}

export async function assignDeliveryDriver(deliveryId: string, driverId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("assign_delivery_driver", {
    p_delivery_id: deliveryId,
    p_driver_id: driverId,
  });

  if (error) {
    console.error("assignDeliveryDriver error:", error);
    return { success: false, error: friendlyError(error) };
  }

  revalidatePath("/admin/deliveries");
  revalidatePath("/driver");
  return { success: true };
}

export async function updateDeliveryStatus(
  deliveryId: string,
  status: Exclude<DeliveryStatus, "delivered">,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("driver_update_delivery_status", {
    p_delivery_id: deliveryId,
    p_status: status,
  });

  if (error) {
    console.error("updateDeliveryStatus error:", error);
    return { success: false, error: friendlyError(error) };
  }

  revalidatePath("/admin/deliveries");
  revalidatePath("/driver");
  return { success: true };
}

export async function completeDelivery(input: {
  deliveryId: string;
  recipientName: string;
  photoPath?: string;
  notes?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_delivery", {
    p_delivery_id: input.deliveryId,
    p_recipient_name: input.recipientName,
    p_photo_path: input.photoPath || undefined,
    p_notes: input.notes || undefined,
  });

  if (error) {
    console.error("completeDelivery error:", error);
    return { success: false, error: friendlyError(error) };
  }

  revalidatePath("/admin/deliveries");
  revalidatePath("/driver");
  return { success: true };
}
