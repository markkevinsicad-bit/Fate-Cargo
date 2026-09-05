"use server";

import { createClient } from "@/lib/supabase/server";
import { quoteRequestSchema, type QuoteRequestInput } from "@/lib/validation/schemas";
import { toE164PH } from "@/lib/utils";

export type ActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

export async function submitQuoteRequest(input: QuoteRequestInput): Promise<ActionResult> {
  const parsed = quoteRequestSchema.safeParse(input);
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

    const { error } = await supabase.from("quote_requests").insert({
      customer_id: user?.id ?? null,
      full_name: data.full_name,
      phone: e164Phone ?? data.phone,
      email: data.email || null,
      origin: data.origin,
      destination_id: data.destination_id || null,
      destination_text: data.destination_text || null,
      cargo_category_id: data.cargo_category_id || null,
      cargo_description: data.cargo_description || null,
      number_of_packages: data.number_of_packages ?? null,
      weight_kg: data.weight_kg ?? null,
      length_cm: data.length_cm ?? null,
      width_cm: data.width_cm ?? null,
      height_cm: data.height_cm ?? null,
      special_handling: data.special_handling,
      pickup_required: data.pickup_required,
      additional_notes: data.additional_notes || null,
    });

    if (error) {
      console.error("submitQuoteRequest insert error:", error);
      return {
        success: false,
        error: "We couldn't submit your request right now. Please try again in a moment.",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("submitQuoteRequest unexpected error:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
