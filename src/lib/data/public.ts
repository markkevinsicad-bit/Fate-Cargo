import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getActiveDestinations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .eq("active", true)
    .order("region")
    .order("name");
  if (error) {
    console.error("getActiveDestinations error:", error);
    return [];
  }
  return data ?? [];
}

export async function getActiveServices() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("name");
  if (error) {
    console.error("getActiveServices error:", error);
    return [];
  }
  return data ?? [];
}

export async function getActiveCargoCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cargo_categories")
    .select("*")
    .eq("active", true)
    .order("name");
  if (error) {
    console.error("getActiveCargoCategories error:", error);
    return [];
  }
  return data ?? [];
}

/** Returns the next scheduled loading date for each region (today or later). */
export async function getNextLoadingSchedules() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("loading_schedules")
    .select("*")
    .eq("status", "scheduled")
    .gte("loading_date", today)
    .order("loading_date", { ascending: true });

  if (error) {
    console.error("getNextLoadingSchedules error:", error);
    return { visayas: null, mindanao: null };
  }

  const visayas = data?.find((s) => s.region === "visayas") ?? null;
  const mindanao = data?.find((s) => s.region === "mindanao") ?? null;
  return { visayas, mindanao };
}

export async function getUpcomingLoadingSchedules(limit = 10) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("loading_schedules")
    .select("*")
    .gte("loading_date", today)
    .order("loading_date", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("getUpcomingLoadingSchedules error:", error);
    return [];
  }
  return data ?? [];
}
