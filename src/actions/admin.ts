"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/auth-helpers";
import { REQUEST_STATUSES, type RequestStatus } from "@/lib/constants";
import type { ActionResult } from "@/actions/quotes";

function isValidStatus(value: string): value is RequestStatus {
  return (REQUEST_STATUSES as readonly string[]).includes(value);
}

export async function updateQuoteRequestStatus(
  id: string,
  status: string,
  quotedAmount?: number | null,
  adminNotes?: string | null,
): Promise<ActionResult> {
  if (!isValidStatus(status)) {
    return { success: false, error: "Invalid status." };
  }

  try {
    await requireRole(["admin", "staff"]);
  } catch {
    return { success: false, error: "You are not authorized to perform this action." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("quote_requests")
    .update({
      status,
      quoted_amount: quotedAmount ?? null,
      admin_notes: adminNotes ?? null,
    })
    .eq("id", id);

  if (error) {
    console.error("updateQuoteRequestStatus error:", error);
    return { success: false, error: "Could not update the quote request." };
  }

  revalidatePath("/admin/quotes");
  return { success: true };
}

export async function updateMovingRequestStatus(
  id: string,
  status: string,
  quotedAmount?: number | null,
  adminNotes?: string | null,
): Promise<ActionResult> {
  if (!isValidStatus(status)) {
    return { success: false, error: "Invalid status." };
  }

  try {
    await requireRole(["admin", "staff"]);
  } catch {
    return { success: false, error: "You are not authorized to perform this action." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("moving_requests")
    .update({
      status,
      quoted_amount: quotedAmount ?? null,
      admin_notes: adminNotes ?? null,
    })
    .eq("id", id);

  if (error) {
    console.error("updateMovingRequestStatus error:", error);
    return { success: false, error: "Could not update the moving request." };
  }

  revalidatePath("/admin/moving-requests");
  return { success: true };
}

export async function createLoadingSchedule(input: {
  region: "visayas" | "mindanao";
  loading_date: string;
  booking_cutoff?: string | null;
  notes?: string | null;
}): Promise<ActionResult> {
  if (!input.region || !input.loading_date) {
    return { success: false, error: "Region and loading date are required." };
  }

  try {
    await requireRole(["admin", "staff"]);
  } catch {
    return { success: false, error: "You are not authorized to perform this action." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("loading_schedules").insert({
    region: input.region,
    loading_date: input.loading_date,
    booking_cutoff: input.booking_cutoff || null,
    notes: input.notes || null,
  });

  if (error) {
    console.error("createLoadingSchedule error:", error);
    return { success: false, error: "Could not create the loading schedule (it may already exist)." };
  }

  revalidatePath("/admin/schedules");
  revalidatePath("/schedule");
  revalidatePath("/");
  return { success: true };
}

export async function updateLoadingScheduleStatus(
  id: string,
  status: "scheduled" | "closed" | "completed" | "cancelled",
): Promise<ActionResult> {
  try {
    await requireRole(["admin", "staff"]);
  } catch {
    return { success: false, error: "You are not authorized to perform this action." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("loading_schedules").update({ status }).eq("id", id);

  if (error) {
    console.error("updateLoadingScheduleStatus error:", error);
    return { success: false, error: "Could not update the schedule." };
  }

  revalidatePath("/admin/schedules");
  revalidatePath("/schedule");
  revalidatePath("/");
  return { success: true };
}
