import type { ApprovalStatus } from "@/lib/types/domain";
import type { ArivioSupabaseClient } from "./types";

export async function getAdminOverview(supabase: ArivioSupabaseClient) {
  const [
    profiles,
    vendors,
    events,
    quoteRequests,
    bookings,
    services,
  ] = await Promise.all([
    getProfiles(supabase),
    getVendors(supabase),
    getEvents(supabase),
    getQuoteRequests(supabase),
    getBookings(supabase),
    getServices(supabase),
  ]);

  return {
    bookings,
    events,
    profiles,
    quoteRequests,
    services,
    vendors,
  };
}

export async function updateVendorApprovalStatus(
  supabase: ArivioSupabaseClient,
  input: {
    status: Extract<ApprovalStatus, "approved" | "rejected">;
    vendorId: string;
  },
) {
  const { data, error } = await supabase
    .from("vendor_businesses")
    .update({ approval_status: input.status })
    .eq("id", input.vendorId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function getProfiles(supabase: ArivioSupabaseClient) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function getVendors(supabase: ArivioSupabaseClient) {
  const { data, error } = await supabase
    .from("vendor_businesses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function getEvents(supabase: ArivioSupabaseClient) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function getQuoteRequests(supabase: ArivioSupabaseClient) {
  const { data, error } = await supabase
    .from("quote_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function getBookings(supabase: ArivioSupabaseClient) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function getServices(supabase: ArivioSupabaseClient) {
  const { data, error } = await supabase
    .from("vendor_services")
    .select("*");

  if (error) {
    throw error;
  }

  return data ?? [];
}
