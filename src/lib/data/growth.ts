import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getUserOrganizations(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_organization_members")
    .select("org_role, business_organizations(id, name, is_active)")
    .eq("user_id", userId);

  if (error) {
    console.error("getUserOrganizations error:", error);
    return [];
  }
  return data ?? [];
}

export async function getOrganizationById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("business_organizations").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("getOrganizationById error:", error);
    return null;
  }
  return data;
}

export async function getOrganizationMembers(orgId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_organization_members")
    .select("*, profiles(full_name, phone, email)")
    .eq("organization_id", orgId);

  if (error) {
    console.error("getOrganizationMembers error:", error);
    return [];
  }
  return data ?? [];
}

export async function getOrganizationShipments(orgId: string, limit = 100) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipments")
    .select("id, fate_cargo_id, status, created_at, destinations(name), services(name)")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getOrganizationShipments error:", error);
    return [];
  }
  return data ?? [];
}

export async function getAllOrganizations() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("business_organizations").select("*").order("name");
  if (error) {
    console.error("getAllOrganizations error:", error);
    return [];
  }
  return data ?? [];
}

export async function getSavedAddresses(customerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_addresses")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getSavedAddresses error:", error);
    return [];
  }
  return data ?? [];
}

export async function getLeads(status?: string, q?: string) {
  const supabase = await createClient();
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(150);
  if (status) query = query.eq("status", status as never);
  if (q) query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`);
  const { data, error } = await query;
  if (error) {
    console.error("getLeads error:", error);
    return [];
  }
  return data ?? [];
}

export async function getReferralStats() {
  const supabase = await createClient();
  const [{ count: totalReferrals }, { count: convertedReferrals }] = await Promise.all([
    supabase.from("referrals").select("*", { count: "exact", head: true }),
    supabase.from("referrals").select("*", { count: "exact", head: true }).eq("converted", true),
  ]);

  const { data: topReferrers } = await supabase
    .from("referrals")
    .select("referrer_id, profiles!referrals_referrer_id_fkey(full_name)")
    .limit(500);

  const counts = new Map<string, { name: string; count: number }>();
  for (const r of topReferrers ?? []) {
    const key = r.referrer_id;
    const existing = counts.get(key);
    const name = (r as unknown as { profiles?: { full_name: string | null } }).profiles?.full_name ?? "Unknown";
    if (existing) existing.count += 1;
    else counts.set(key, { name, count: 1 });
  }
  const ranked = Array.from(counts.values()).sort((a, b) => b.count - a.count).slice(0, 10);

  return {
    totalReferrals: totalReferrals ?? 0,
    convertedReferrals: convertedReferrals ?? 0,
    topReferrers: ranked,
  };
}

export async function getReviews(onlyVisible = false) {
  const supabase = await createClient();
  let query = supabase
    .from("reviews")
    .select("*, profiles(full_name), shipments(fate_cargo_id, destinations(name))")
    .order("created_at", { ascending: false })
    .limit(100);
  if (onlyVisible) query = query.eq("is_visible", true);
  const { data, error } = await query;
  if (error) {
    console.error("getReviews error:", error);
    return [];
  }
  return data ?? [];
}

export async function getAuditLogs(entityType?: string, limit = 100) {
  const supabase = await createClient();
  let query = supabase
    .from("audit_logs")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (entityType) query = query.eq("entity_type", entityType);
  const { data, error } = await query;
  if (error) {
    console.error("getAuditLogs error:", error);
    return [];
  }
  return data ?? [];
}

export async function getAllDriversWithStats() {
  const supabase = await createClient();
  const { data: drivers, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "driver")
    .order("full_name");

  if (error || !drivers) {
    console.error("getAllDriversWithStats error:", error);
    return [];
  }

  const results = await Promise.all(
    drivers.map(async (d) => {
      const [{ count: pickupCount }, { count: deliveryCount }] = await Promise.all([
        supabase.from("pickups").select("*", { count: "exact", head: true }).eq("assigned_driver_id", d.id),
        supabase.from("deliveries").select("*", { count: "exact", head: true }).eq("assigned_driver_id", d.id),
      ]);
      return { ...d, pickupCount: pickupCount ?? 0, deliveryCount: deliveryCount ?? 0 };
    }),
  );

  return results;
}

export async function getInternalAccounts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["admin", "staff", "warehouse", "driver"])
    .order("role")
    .order("full_name");

  if (error) {
    console.error("getInternalAccounts error:", error);
    return [];
  }
  return data ?? [];
}
