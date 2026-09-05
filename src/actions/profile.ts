"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSetupSchema } from "@/lib/validation/schemas";
import type { ActionResult } from "@/actions/quotes";

export async function completeProfileSetup(input: {
  full_name: string;
  email?: string;
}): Promise<ActionResult> {
  const parsed = profileSetupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please enter your full name." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      email: parsed.data.email || null,
    })
    .eq("id", user.id);

  if (error) {
    console.error("completeProfileSetup error:", error);
    return { success: false, error: "Could not save your profile. Please try again." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function markNotificationRead(notificationId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: "Could not update notification." };
  }

  revalidatePath("/dashboard/notifications");
  return { success: true };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
