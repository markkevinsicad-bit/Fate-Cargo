"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bookingSchema, type BookingInput } from "@/lib/validation/schemas";
import { toE164PH } from "@/lib/utils";
import type { ActionResult } from "@/actions/quotes";

export type CreateBookingResult =
  | { success: true; shipmentId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

export async function createBooking(input: BookingInput): Promise<CreateBookingResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to book a shipment." };
  }

  const originPhone = data.origin_contact_phone ? toE164PH(data.origin_contact_phone) : null;
  const recipientPhone = data.recipient_phone ? toE164PH(data.recipient_phone) : null;

  const payload = {
    service_id: data.service_id || null,
    origin_address: data.origin_address,
    origin_city: data.origin_city || null,
    origin_contact_name: data.origin_contact_name || null,
    origin_contact_phone: originPhone ?? data.origin_contact_phone ?? null,
    pickup_required: data.pickup_required,
    pickup_date: data.pickup_date || null,
    pickup_time: data.pickup_time || null,
    pickup_notes: data.pickup_notes || null,
    destination_id: data.destination_id || null,
    destination_address: data.destination_address || null,
    recipient_name: data.recipient_name || null,
    recipient_phone: recipientPhone ?? data.recipient_phone ?? null,
    delivery_notes: data.delivery_notes || null,
    cargo_category_id: data.cargo_category_id || null,
    cargo_description: data.cargo_description || null,
    number_of_packages: data.number_of_packages ?? null,
    package_type: data.package_type || null,
    weight_kg: data.weight_kg ?? null,
    length_cm: data.length_cm ?? null,
    width_cm: data.width_cm ?? null,
    height_cm: data.height_cm ?? null,
    special_handling: data.special_handling,
    special_handling_notes: data.special_handling_notes || null,
    customer_notes: data.customer_notes || null,
  };

  const { data: shipmentId, error } = await supabase.rpc("create_booking", { payload });

  if (error || !shipmentId) {
    console.error("createBooking RPC error:", error);
    return {
      success: false,
      error: "We couldn't create your booking right now. Please try again in a moment.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/shipments");

  return { success: true, shipmentId };
}

export async function cancelBooking(shipmentId: string, reason?: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_shipment_status", {
    p_shipment_id: shipmentId,
    p_status: "cancelled",
    p_note: reason ? `Cancelled: ${reason}` : undefined,
  });

  if (error) {
    console.error("cancelBooking error:", error);
    return { success: false, error: "Could not cancel the booking." };
  }

  revalidatePath("/dashboard/shipments");
  revalidatePath(`/dashboard/shipments/${shipmentId}`);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/shipments");
  return { success: true };
}
