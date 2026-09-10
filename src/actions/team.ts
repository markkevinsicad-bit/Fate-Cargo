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

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (err) {
    console.error("createTeamAccount: createAdminClient failed:", err);
    return {
      success: false,
      error:
        "Server is missing Supabase admin credentials (SUPABASE_SERVICE_ROLE_KEY). Check your environment variables.",
    };
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    email_confirm: true,
    app_metadata: { role: input.role },
    user_metadata: { full_name: input.fullName.trim() },
  });

  if (error) {
    console.error("createTeamAccount: createUser failed:", error);
    return {
      success: false,
      // Surfacing the real Supabase error here is safe - this action is
      // admin-only - and makes setup/config issues far easier to diagnose
      // than a generic message.
      error: error.message || "Could not create the account. Please try again.",
    };
  }

  // IMPORTANT: don't rely on the handle_new_user() trigger alone to pick
  // up the role. In practice, Supabase's Auth service sets custom
  // app_metadata in a follow-up step after the initial auth.users insert,
  // not atomically with it - so a trigger firing on INSERT can see the
  // role as not-yet-set and default the profile to 'customer'. By the
  // time createUser() has returned successfully here, app_metadata is
  // guaranteed to be persisted, so we set profiles.role directly with the
  // service-role client (bypasses RLS - safe, this whole action is
  // already gated to admins only) rather than trusting trigger timing.
  if (data.user) {
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ role: input.role, full_name: input.fullName.trim() })
      .eq("id", data.user.id);

    if (profileError) {
      console.error("createTeamAccount: profile role sync failed:", profileError);
      return {
        success: false,
        error: "Account was created but its role could not be set. Please contact support.",
      };
    }
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
  try {
    const adminClient = createAdminClient();
    const { error: banError } = await adminClient.auth.admin.updateUserById(userId, {
      ban_duration: isActive ? "none" : "876000h", // ~100 years, effectively indefinite
    });
    if (banError) {
      console.error("setTeamMemberActive: updateUserById failed:", banError);
      return { success: false, error: banError.message || "Could not update sign-in access." };
    }
  } catch (err) {
    console.error("setTeamMemberActive: createAdminClient failed:", err);
    return {
      success: false,
      error: "Server is missing Supabase admin credentials (SUPABASE_SERVICE_ROLE_KEY).",
    };
  }

  revalidatePath("/admin/team");
  revalidatePath("/admin/drivers");
  return { success: true };
}
