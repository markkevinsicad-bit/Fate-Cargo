import "server-only";
import { createClient } from "@/lib/supabase/server";
import { SHIPMENT_STATUSES } from "@/lib/constants";

function rangeStart(range: string): string | null {
  const now = new Date();
  if (range === "today") {
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  }
  if (range === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d.toISOString();
  }
  if (range === "month") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return d.toISOString();
  }
  return null; // "all"
}

export async function getShipmentReportData(range: string, customStart?: string, customEnd?: string) {
  const supabase = await createClient();
  const start = customStart || rangeStart(range);
  const end = customEnd || null;

  let statusCountsQuery = supabase.from("shipments").select("status");
  if (start) statusCountsQuery = statusCountsQuery.gte("created_at", start);
  if (end) statusCountsQuery = statusCountsQuery.lte("created_at", end);
  const { data: statusRows } = await statusCountsQuery;

  const statusCounts: Record<string, number> = {};
  for (const s of SHIPMENT_STATUSES) statusCounts[s] = 0;
  for (const row of statusRows ?? []) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
  }

  let destQuery = supabase.from("shipments").select("destinations(name, region)");
  if (start) destQuery = destQuery.gte("created_at", start);
  if (end) destQuery = destQuery.lte("created_at", end);
  const { data: destRows } = await destQuery;

  const byDestination = new Map<string, number>();
  const byRegion = new Map<string, number>();
  for (const row of destRows ?? []) {
    const dest = (row as unknown as { destinations: { name: string; region: string } | null }).destinations;
    if (dest?.name) byDestination.set(dest.name, (byDestination.get(dest.name) ?? 0) + 1);
    if (dest?.region) byRegion.set(dest.region, (byRegion.get(dest.region) ?? 0) + 1);
  }

  let serviceQuery = supabase.from("shipments").select("services(name)");
  if (start) serviceQuery = serviceQuery.gte("created_at", start);
  if (end) serviceQuery = serviceQuery.lte("created_at", end);
  const { data: serviceRows } = await serviceQuery;

  const byService = new Map<string, number>();
  for (const row of serviceRows ?? []) {
    const svc = (row as unknown as { services: { name: string } | null }).services;
    if (svc?.name) byService.set(svc.name, (byService.get(svc.name) ?? 0) + 1);
  }

  const { count: newCustomerCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "customer")
    .gte("created_at", start || "1970-01-01");

  const { data: allCustomerShipments } = await supabase.from("shipments").select("customer_id");
  const shipmentCountByCustomer = new Map<string, number>();
  for (const row of allCustomerShipments ?? []) {
    shipmentCountByCustomer.set(row.customer_id, (shipmentCountByCustomer.get(row.customer_id) ?? 0) + 1);
  }
  const returningCustomers = Array.from(shipmentCountByCustomer.values()).filter((c) => c > 1).length;

  const { count: pickupCompletedCount } = await supabase
    .from("pickups")
    .select("*", { count: "exact", head: true })
    .eq("status", "picked_up");
  const { count: deliveryCompletedCount } = await supabase
    .from("deliveries")
    .select("*", { count: "exact", head: true })
    .eq("status", "delivered");

  return {
    statusCounts,
    byDestination: Array.from(byDestination.entries()).sort((a, b) => b[1] - a[1]),
    byRegion: Array.from(byRegion.entries()).sort((a, b) => b[1] - a[1]),
    byService: Array.from(byService.entries()).sort((a, b) => b[1] - a[1]),
    newCustomerCount: newCustomerCount ?? 0,
    returningCustomers,
    totalCustomersWithShipments: shipmentCountByCustomer.size,
    pickupCompletedCount: pickupCompletedCount ?? 0,
    deliveryCompletedCount: deliveryCompletedCount ?? 0,
  };
}

export async function getAcquisitionReportData(range: string) {
  const supabase = await createClient();
  const start = rangeStart(range);

  let leadsQuery = supabase.from("leads").select("status");
  if (start) leadsQuery = leadsQuery.gte("created_at", start);
  const { data: leadRows } = await leadsQuery;

  const totalLeads = leadRows?.length ?? 0;
  const convertedLeads = leadRows?.filter((l) => l.status === "converted").length ?? 0;

  let referralsQuery = supabase.from("referrals").select("converted");
  if (start) referralsQuery = referralsQuery.gte("created_at", start);
  const { data: referralRows } = await referralsQuery;

  const totalReferrals = referralRows?.length ?? 0;
  const convertedReferrals = referralRows?.filter((r) => r.converted).length ?? 0;

  return { totalLeads, convertedLeads, totalReferrals, convertedReferrals };
}
