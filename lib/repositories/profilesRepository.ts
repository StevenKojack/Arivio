import type { User } from "@supabase/supabase-js";
import type { PublicTableRow } from "@/lib/supabase/database.types";
import type { UserRole } from "@/lib/types/domain";
import type { ArivioSupabaseClient } from "./types";

export async function getCurrentProfile(
  supabase: ArivioSupabaseClient,
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

  return data;
}

export async function upsertProfile(
  supabase: ArivioSupabaseClient,
  input: {
    email: string;
    fullName?: string | null;
    phone?: string | null;
    role: UserRole;
    userId: string;
  },
) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      email: input.email,
      full_name: input.fullName ?? null,
      phone: input.phone ?? null,
      role: input.role,
      user_id: input.userId,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function ensureCurrentProfile(
  supabase: ArivioSupabaseClient,
  user: User,
  role: UserRole = "planner",
): Promise<PublicTableRow<"profiles">> {
  const existingProfile = await getCurrentProfile(supabase, user);

  if (existingProfile) {
    return existingProfile;
  }

  const fullName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : null;
  const profileRole =
    typeof user.user_metadata.role === "string"
      ? (user.user_metadata.role as UserRole)
      : role;

  return upsertProfile(supabase, {
    email: user.email ?? "",
    fullName,
    phone: null,
    role: profileRole,
    userId: user.id,
  });
}
