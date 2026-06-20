import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database, PublicTableRow } from "./database.types";
import type { UserRole } from "../types/domain";

export async function getCurrentProfile(
  supabase: SupabaseClient<Database>,
  user: User,
): Promise<PublicTableRow<"profiles"> | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as PublicTableRow<"profiles"> | null;
}

export async function ensureCurrentProfile(
  supabase: SupabaseClient<Database>,
  user: User,
  role: UserRole = "planner",
): Promise<PublicTableRow<"profiles">> {
  const existingProfile = await getCurrentProfile(supabase, user);

  if (existingProfile) {
    return existingProfile;
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      email: user.email ?? "",
      full_name:
        typeof user.user_metadata.full_name === "string"
          ? user.user_metadata.full_name
          : null,
      role:
        typeof user.user_metadata.role === "string"
          ? (user.user_metadata.role as UserRole)
          : role,
      user_id: user.id,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as PublicTableRow<"profiles">;
}
