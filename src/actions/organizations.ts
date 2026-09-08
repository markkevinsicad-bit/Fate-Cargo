"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole, getCurrentProfile } from "@/lib/supabase/auth-helpers";
import type { ActionResult } from "@/actions/quotes";
import type { OrgMemberRole, SavedAddressType } from "@/lib/constants";

export async function createOrganization(input: {
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  billingAddress?: string;
}): Promise<ActionResult> {
  let profile;
  try {
    profile = await requireRole(["admin"]);
  } catch {
    return { success: false, error: "You are not authorized to perform this action." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_organizations")
    .insert({
      name: input.name,
      contact_email: input.contactEmail || null,
      contact_phone: input.contactPhone || null,
      billing_address: input.billingAddress || null,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("createOrganization error:", error);
    return { success: false, error: "Could not create the organization." };
  }

  revalidatePath("/admin/organizations");
  return { success: true };
}

export async function addOrganizationMember(
  organizationId: string,
  phone: string,
  orgRole: OrgMemberRole = "member",
): Promise<ActionResult> {
  try {
    await requireRole(["admin"]);
  } catch {
    return { success: false, error: "You are not authorized to perform this action." };
  }

  const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (profileError || !profile) {
    return { success: false, error: "No customer found with that phone number. They must sign up first." };
  }

  const { error } = await supabase.from("business_organization_members").insert({
    organization_id: organizationId,
    user_id: profile.id,
    org_role: orgRole,
  });

  if (error) {
    console.error("addOrganizationMember error:", error);
    return { success: false, error: "Could not add that member (they may already be part of this organization)." };
  }

  revalidatePath(`/admin/organizations/${organizationId}`);
  return { success: true };
}

export async function saveAddress(input: {
  label: string;
  address: string;
  addressType: SavedAddressType;
  contactName?: string;
  contactPhone?: string;
  organizationId?: string;
}): Promise<ActionResult> {
  const profile = await getCurrentProfile();
  if (!profile) return { success: false, error: "You must be logged in." };

  const supabase = await createClient();
  const { error } = await supabase.from("saved_addresses").insert({
    customer_id: input.organizationId ? null : profile.id,
    organization_id: input.organizationId || null,
    label: input.label,
    address: input.address,
    address_type: input.addressType,
    contact_name: input.contactName || null,
    contact_phone: input.contactPhone || null,
  });

  if (error) {
    console.error("saveAddress error:", error);
    return { success: false, error: "Could not save the address." };
  }

  revalidatePath("/dashboard/addresses");
  return { success: true };
}

export async function deleteSavedAddress(addressId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("saved_addresses").delete().eq("id", addressId);

  if (error) {
    console.error("deleteSavedAddress error:", error);
    return { success: false, error: "Could not delete the address." };
  }

  revalidatePath("/dashboard/addresses");
  return { success: true };
}
