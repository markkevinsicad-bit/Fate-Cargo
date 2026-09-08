"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/actions/quotes";

export async function getMyReferralCode(): Promise<{ code: string } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_or_create_referral_code");
  if (error || !data) {
    console.error("getMyReferralCode error:", error);
    return { error: "Could not generate a referral code right now." };
  }
  return { code: data };
}

const REFERRAL_ERROR_MESSAGES: Record<string, string> = {
  ALREADY_REFERRED: "You've already used a referral code.",
  INVALID_CODE: "That referral code doesn't exist.",
  SELF_REFERRAL_NOT_ALLOWED: "You can't use your own referral code.",
};

export async function redeemReferralCode(code: string): Promise<ActionResult> {
  if (!code.trim()) {
    return { success: false, error: "Enter a referral code." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("redeem_referral_code", { p_code: code.trim() });

  if (error) {
    const message = (error as { message?: string })?.message ?? "";
    return { success: false, error: REFERRAL_ERROR_MESSAGES[message] ?? "Could not apply that referral code." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
