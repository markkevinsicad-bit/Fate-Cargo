import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "./database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/** Returns the logged-in user's profile row, or null if not authenticated. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

/**
 * Requires an authenticated user with one of `roles`. Returns the profile.
 * Throws if unauthenticated/unauthorized - callers in Server Components
 * should catch this via redirect(), Server Actions should catch and return
 * a user-facing error. This is a defense-in-depth check: RLS at the
 * database is the real authorization boundary.
 */
export async function requireRole(roles: Profile["role"][]): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error("UNAUTHENTICATED");
  }
  if (!roles.includes(profile.role)) {
    throw new Error("UNAUTHORIZED");
  }
  return profile;
}
