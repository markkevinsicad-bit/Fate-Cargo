"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/auth-helpers";
import type { ActionResult } from "@/actions/quotes";

export async function submitReview(shipmentId: string, rating: number, comment?: string): Promise<ActionResult> {
  if (rating < 1 || rating > 5) {
    return { success: false, error: "Please select a rating between 1 and 5." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_review", {
    p_shipment_id: shipmentId,
    p_rating: rating,
    p_comment: comment || undefined,
  });

  if (error) {
    console.error("submitReview error:", error);
    const message = (error as { message?: string })?.message ?? "";
    return {
      success: false,
      error: message === "NOT_ELIGIBLE" ? "Only delivered shipments can be reviewed." : "Could not submit your review.",
    };
  }

  revalidatePath(`/dashboard/shipments/${shipmentId}`);
  revalidatePath("/dashboard/reviews");
  return { success: true };
}

export async function setReviewVisibility(reviewId: string, visible: boolean): Promise<ActionResult> {
  try {
    await requireRole(["admin"]);
  } catch {
    return { success: false, error: "You are not authorized to perform this action." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").update({ is_visible: visible }).eq("id", reviewId);

  if (error) {
    console.error("setReviewVisibility error:", error);
    return { success: false, error: "Could not update the review." };
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/about");
  return { success: true };
}
