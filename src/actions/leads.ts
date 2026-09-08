"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/auth-helpers";
import { toE164PH } from "@/lib/utils";
import type { ActionResult } from "@/actions/quotes";
import type { LeadStatus } from "@/lib/constants";

export async function submitLead(input: {
  fullName: string;
  phone: string;
  email?: string;
  origin?: string;
  destination?: string;
  cargoType?: string;
  estimatedSize?: string;
  preferredServiceId?: string;
  notes?: string;
  referralCode?: string;
}): Promise<ActionResult> {
  if (!input.fullName.trim() || !input.phone.trim()) {
    return { success: false, error: "Name and phone are required." };
  }

  const supabase = await createClient();
  const phone = toE164PH(input.phone) ?? input.phone;

  const { error } = await supabase.from("leads").insert({
    full_name: input.fullName,
    phone,
    email: input.email || null,
    origin: input.origin || null,
    destination: input.destination || null,
    cargo_type: input.cargoType || null,
    estimated_size: input.estimatedSize || null,
    preferred_service_id: input.preferredServiceId || null,
    notes: input.notes || null,
    referral_code_used: input.referralCode || null,
  });

  if (error) {
    console.error("submitLead error:", error);
    return { success: false, error: "We couldn't submit your request. Please try again." };
  }

  return { success: true };
}

export async function updateLead(
  leadId: string,
  input: { status?: LeadStatus; internalNotes?: string; followUpDate?: string | null },
): Promise<ActionResult> {
  try {
    await requireRole(["admin", "staff"]);
  } catch {
    return { success: false, error: "You are not authorized to perform this action." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({
      ...(input.status ? { status: input.status } : {}),
      ...(input.internalNotes !== undefined ? { internal_notes: input.internalNotes } : {}),
      ...(input.followUpDate !== undefined ? { follow_up_date: input.followUpDate } : {}),
    })
    .eq("id", leadId);

  if (error) {
    console.error("updateLead error:", error);
    return { success: false, error: "Could not update the lead." };
  }

  revalidatePath("/admin/leads");
  return { success: true };
}
