"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/auth-helpers";
import type { ActionResult } from "@/actions/quotes";

const INTERNAL_ROLES = ["staff", "warehouse", "driver", "admin"] as const;
type InternalRole = (typeof INTERNAL_ROLES)[number];

function isInternalRole(value: string): value is InternalRole {
  return (INTERNAL_ROLES as readonly string[]).includes(value);
}

/**
 * Creates a new internal (non-customer) account with email + password
 * login. Only an existing admin may call this. The role is written to
 * app_metadata via the Admin API (service-role key) - this is the ONLY
 * code path that can set app_metadata.role, which is exactly what makes
 * it safe for handle_new_user() to trust it (see migration 0027).
 */
export async function createTeamAccount(input: {
  email: string;
  password: string;
  fullName: string;
  role: string;
}): Promise<ActionResult> {
  try {
    await requireRole(["admin"]);
  } catch {
    return { success: false, error: "You are not authorized to perform this action." };
  }

  if (!isInternalRole(input.role)) {
    return { success: false, error: "Invalid role." };
  }
  if (!input.email.trim() || !input.password || input.password.length < 8) {
    return { success: false, error: "A valid email and a password of at least 8 characters are required." };
  }
  if (!input.fullName.trim()) {
    return { success: false, error: "Full name is required." };
  }

  const adminClient = createAdminClient();

  const { error } = await adminClient.auth.admin.createUser({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    email_confirm: true,
    app_metadata: { role: input.role },
    user_metadata: { full_name: input.fullName.trim() },
  });

  if (error) {
    console.error("createTeamAccount error:", error);
    return {
      success: false,
      error: error.message.includes("already been registered")
        ? "An account with that email already exists."
        : "Could not create the account. Please try again.",
    };
  }

  revalidatePath("/admin/team");
  revalidatePath("/admin/drivers");
  return { success: true };
}

export async function setTeamMemberActive(userId: string, isActive: boolean): Promise<ActionResult> {
  try {
    await requireRole(["admin"]);
  } catch {
    return { success: false, error: "You are not authorized to perform this action." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId)
    .in("role", INTERNAL_ROLES);

  if (error) {
    console.error("setTeamMemberActive error:", error);
    return { success: false, error: "Could not update account status." };
  }

  // Also revoke/restore actual sign-in ability, not just the app-level
  // is_active flag, so a deactivated staff member truly cannot log in.
  const adminClient = createAdminClient();
  await adminClient.auth.admin.updateUserById(userId, {
    ban_duration: isActive ? "none" : "876000h", // ~100 years, effectively indefinite
  });

  revalidatePath("/admin/team");
  revalidatePath("/admin/drivers");
  return { success: true };
}
