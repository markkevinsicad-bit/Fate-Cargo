"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/auth-helpers";
import type { ActionResult } from "@/actions/quotes";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createDestination(name: string, region: "visayas" | "mindanao"): Promise<ActionResult> {
  try {
    await requireRole(["admin"]);
  } catch {
    return { success: false, error: "You are not authorized to perform this action." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("destinations").insert({ name, region });
  if (error) return { success: false, error: "Could not create destination (it may already exist)." };
  revalidatePath("/admin/settings");
  revalidatePath("/destinations");
  revalidatePath("/");
  return { success: true };
}

export async function toggleDestinationActive(id: string, active: boolean): Promise<ActionResult> {
  try {
    await requireRole(["admin"]);
  } catch {
    return { success: false, error: "You are not authorized to perform this action." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("destinations").update({ active }).eq("id", id);
  if (error) return { success: false, error: "Could not update destination." };
  revalidatePath("/admin/settings");
  revalidatePath("/destinations");
  return { success: true };
}

export async function createService(name: string, description?: string): Promise<ActionResult> {
  try {
    await requireRole(["admin"]);
  } catch {
    return { success: false, error: "You are not authorized to perform this action." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("services").insert({ name, slug: slugify(name), description: description || null });
  if (error) return { success: false, error: "Could not create service (it may already exist)." };
  revalidatePath("/admin/settings");
  revalidatePath("/services");
  revalidatePath("/");
  return { success: true };
}

export async function toggleServiceActive(id: string, active: boolean): Promise<ActionResult> {
  try {
    await requireRole(["admin"]);
  } catch {
    return { success: false, error: "You are not authorized to perform this action." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("services").update({ active }).eq("id", id);
  if (error) return { success: false, error: "Could not update service." };
  revalidatePath("/admin/settings");
  revalidatePath("/services");
  return { success: true };
}

export async function createCargoCategory(name: string): Promise<ActionResult> {
  try {
    await requireRole(["admin"]);
  } catch {
    return { success: false, error: "You are not authorized to perform this action." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("cargo_categories").insert({ name, slug: slugify(name) });
  if (error) return { success: false, error: "Could not create cargo category (it may already exist)." };
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function toggleCargoCategoryActive(id: string, active: boolean): Promise<ActionResult> {
  try {
    await requireRole(["admin"]);
  } catch {
    return { success: false, error: "You are not authorized to perform this action." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("cargo_categories").update({ active }).eq("id", id);
  if (error) return { success: false, error: "Could not update cargo category." };
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function updateReferralSettings(rewardDescription: string, isActive: boolean): Promise<ActionResult> {
  try {
    await requireRole(["admin"]);
  } catch {
    return { success: false, error: "You are not authorized to perform this action." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("referral_settings")
    .update({ reward_description: rewardDescription, is_active: isActive })
    .eq("id", true);
  if (error) return { success: false, error: "Could not update referral settings." };
  revalidatePath("/admin/settings");
  return { success: true };
}
