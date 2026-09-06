"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/actions/quotes";

export async function createLoadingTrip(input: {
  region: "visayas" | "mindanao";
  loadingDate: string;
  destinationId?: string;
  loadingScheduleId?: string;
  notes?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_loading_trip", {
    p_region: input.region,
    p_loading_date: input.loadingDate,
    p_destination_id: input.destinationId || undefined,
    p_loading_schedule_id: input.loadingScheduleId || undefined,
    p_notes: input.notes || undefined,
  });

  if (error) {
    console.error("createLoadingTrip error:", error);
    return { success: false, error: "Could not create the loading trip." };
  }

  revalidatePath("/admin/loading-trips");
  return { success: true };
}
