"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/auth-helpers";
import type { ActionResult } from "@/actions/quotes";

export async function setDriverActive(driverId: string, isActive: boolean): Promise<ActionResult> {
  try {
    await requireRole(["admin"]);
  } catch {
    return { success: false, error: "You are not authorized to perform this action." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ is_active: isActive }).eq("id", driverId).eq("role", "driver");

  if (error) {
    console.error("setDriverActive error:", error);
    return { success: false, error: "Could not update driver status." };
  }

  revalidatePath("/admin/drivers");
  return { success: true };
}

/**
 * Promotes an existing customer (identified by phone) to the driver role.
 * The person must already have an account (signed up via phone OTP) -
 * this never creates auth users directly, only changes their role.
 */
export async function promoteToDriver(phone: string): Promise<ActionResult> {
  try {
    await requireRole(["admin"]);
  } catch {
    return { success: false, error: "You are not authorized to perform this action." };
  }

  const supabase = await createClient();
  const { data: profile, error: findError } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (findError || !profile) {
    return { success: false, error: "No account found with that phone number. They must sign up first via phone OTP." };
  }

  const { error } = await supabase.from("profiles").update({ role: "driver", is_active: true }).eq("id", profile.id);

  if (error) {
    console.error("promoteToDriver error:", error);
    return { success: false, error: "Could not update the account role." };
  }

  revalidatePath("/admin/drivers");
  return { success: true };
}
