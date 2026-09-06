"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/auth-helpers";
import type { ActionResult } from "@/actions/quotes";

export async function updateShipmentInternalNotes(shipmentId: string, notes: string): Promise<ActionResult> {
  try {
    await requireRole(["admin", "staff", "warehouse"]);
  } catch {
    return { success: false, error: "You are not authorized to perform this action." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("shipments").update({ internal_notes: notes }).eq("id", shipmentId);

  if (error) {
    console.error("updateShipmentInternalNotes error:", error);
    return { success: false, error: "Could not save internal notes." };
  }

  revalidatePath(`/admin/shipments/${shipmentId}`);
  return { success: true };
}
