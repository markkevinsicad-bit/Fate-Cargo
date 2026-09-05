"use server";

import { createClient } from "@/lib/supabase/server";
import { movingRequestSchema, type MovingRequestInput } from "@/lib/validation/schemas";
import { toE164PH } from "@/lib/utils";
import type { ActionResult } from "@/actions/quotes";

export async function submitMovingRequest(input: MovingRequestInput): Promise<ActionResult> {
  const parsed = movingRequestSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const data = parsed.data;
  const e164Phone = toE164PH(data.phone);

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("moving_requests").insert({
      customer_id: user?.id ?? null,
      full_name: data.full_name,
      phone: e164Phone ?? data.phone,
      email: data.email || null,
      moving_type: data.moving_type,
      pickup_location: data.pickup_location,
      destination_location: data.destination_location,
      preferred_date: data.preferred_date || null,
      rooms_estimate: data.rooms_estimate || null,
      major_items: data.major_items || null,
      elevator_available: data.elevator_available ?? null,
      stairs: data.stairs ?? null,
      special_items: data.special_items || null,
      notes: data.notes || null,
    });

    if (error) {
      console.error("submitMovingRequest insert error:", error);
      return {
        success: false,
        error: "We couldn't submit your request right now. Please try again in a moment.",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("submitMovingRequest unexpected error:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
