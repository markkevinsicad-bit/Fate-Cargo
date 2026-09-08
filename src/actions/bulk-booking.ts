"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bookingSchema } from "@/lib/validation/schemas";
import { toE164PH } from "@/lib/utils";

export type BulkBookingRowResult = { row: number; success: boolean; fateCargoId?: string; error?: string };

export async function submitBulkBookings(
  rows: Record<string, string>[],
  organizationId?: string,
): Promise<BulkBookingRowResult[]> {
  const supabase = await createClient();
  const results: BulkBookingRowResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const parsed = bookingSchema.safeParse({
      origin_address: row.origin_address,
      origin_city: row.origin_city,
      destination_address: row.destination_address,
      recipient_name: row.recipient_name,
      recipient_phone: row.recipient_phone,
      cargo_description: row.cargo_description,
      number_of_packages: row.number_of_packages,
      weight_kg: row.weight_kg,
      length_cm: row.length_cm,
      width_cm: row.width_cm,
      height_cm: row.height_cm,
      pickup_required: row.pickup_required?.toLowerCase() === "true",
      special_handling: [],
    });

    if (!parsed.success) {
      results.push({
        row: i + 1,
        success: false,
        error: parsed.error.issues.map((iss) => iss.message).join("; "),
      });
      continue;
    }

    const data = parsed.data;
    const { data: shipmentId, error } = await supabase.rpc("create_booking", {
      payload: {
        organization_id: organizationId || null,
        origin_address: data.origin_address,
        origin_city: data.origin_city || null,
        destination_address: data.destination_address || null,
        recipient_name: data.recipient_name || null,
        recipient_phone: (data.recipient_phone ? toE164PH(data.recipient_phone) : null) ?? data.recipient_phone ?? null,
        cargo_description: data.cargo_description || null,
        number_of_packages: data.number_of_packages ?? null,
        weight_kg: data.weight_kg,
        length_cm: data.length_cm ?? null,
        width_cm: data.width_cm ?? null,
        height_cm: data.height_cm ?? null,
        pickup_required: data.pickup_required,
      },
    });

    if (error || !shipmentId) {
      results.push({ row: i + 1, success: false, error: "Could not create this booking." });
      continue;
    }

    const { data: shipment } = await supabase.from("shipments").select("fate_cargo_id").eq("id", shipmentId).single();
    results.push({ row: i + 1, success: true, fateCargoId: shipment?.fate_cargo_id });
  }

  revalidatePath("/dashboard/shipments");
  return results;
}
