// Profile management utilities
// Handles user profiles, roles, and username locking

import { getSupabaseClient } from "./supabase";
import { getCurrentUser } from "./auth";

export type Profile = {
  id: string; // UUID, matches auth.users.id
  username: string | null;
  role: 'user' | 'admin';
  created_at: string;
};

/**
 * Get current user's profile
 */
export const getCurrentProfile = async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("getCurrentProfile error:", error);
      return null;
    }

    return data ? mapRowToProfile(data) : null;
  } catch (error) {
    console.error("getCurrentProfile error:", error);
    return null;
  }
};

/**
 * Upsert profile on first login
 * Creates profile if it doesn't exist, otherwise returns existing
 */
function logPostgrestError(label: string, err: { message?: string; code?: string; details?: string; hint?: string }) {
  const msg = err?.message ?? "";
  const code = err?.code ?? "";
  if (!msg && !code) return;
  console.warn(`${label}:`, code, msg, err?.details ?? "", err?.hint ?? "");
}

export const ensureProfile = async (userId: string): Promise<Profile | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data: existing, error: fetchError } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    // 0 rows: maybeSingle returns data null & error null. Skip logging empty error objects.
    if (
      fetchError &&
      (fetchError.message || fetchError.code) &&
      fetchError.code !== "PGRST116"
    ) {
      logPostgrestError("ensureProfile select", fetchError);
    }

    if (existing) {
      return mapRowToProfile(existing);
    }

    const newProfile = {
      id: userId,
      username: null,
      role: "user" as const,
      created_at: new Date().toISOString(),
    };

    const { data: inserted, error: insertError } = await client
      .from("profiles")
      .insert(newProfile)
      .select()
      .single();

    if (!insertError && inserted) {
      return mapRowToProfile(inserted);
    }

    // Duplicate / race: row exists now
    if (insertError?.code === "23505") {
      const { data: retry } = await client
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      return retry ? mapRowToProfile(retry) : null;
    }

    if (insertError) {
      logPostgrestError("ensureProfile insert", insertError);
      const { data: retry } = await client
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      return retry ? mapRowToProfile(retry) : null;
    }

    return null;
  } catch (error) {
    console.warn("ensureProfile error:", error);
    return null;
  }
};

/**
 * Check if user is admin
 */
export const isAdmin = async (): Promise<boolean> => {
  const profile = await getCurrentProfile();
  return profile?.role === 'admin';
};

/**
 * Lock username (set username on first successful submit)
 * Only works if username is currently null
 */
export const lockUsername = async (userId: string, username: string): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    // Check if username is already set
    const { data: existing } = await client
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .maybeSingle();

    if (existing?.username) {
      // Username already locked, reject change
      return false;
    }

    // Set username (lock it)
    const { error } = await client
      .from("profiles")
      .update({ username })
      .eq("id", userId)
      .is("username", null); // Only update if username is null

    if (error) {
      console.error("lockUsername error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("lockUsername error:", error);
    return false;
  }
};

/**
 * Get username (from profile, fallback to null)
 */
export const getUsername = async (userId: string): Promise<string | null> => {
  const profile = await getCurrentProfile();
  return profile?.username || null;
};

// --- Mappers ---

const mapRowToProfile = (row: any): Profile => ({
  id: row.id,
  username: row.username,
  role: row.role || 'user',
  created_at: row.created_at,
});
