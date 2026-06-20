"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { ensureCurrentProfile } from "@/lib/supabase/profiles";
import type { PublicTableRow } from "@/lib/supabase/database.types";

type EventRow = PublicTableRow<"events">;
type VendorBusinessRow = PublicTableRow<"vendor_businesses">;
type ProfileRow = PublicTableRow<"profiles">;

export function AccountDashboard() {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [vendors, setVendors] = useState<VendorBusinessRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAccount() {
      if (!hasSupabaseConfig()) {
        setMessage(
          "Supabase is not configured yet. Add .env.local values to use saved accounts and events.",
        );
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createBrowserSupabaseClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        if (!user) {
          setMessage("Log in or create an account to see your dashboard.");
          setIsLoading(false);
          return;
        }

        const currentProfile = await ensureCurrentProfile(supabase, user);
        setProfile(currentProfile);

        const { data: eventRows } = await supabase
          .from("events")
          .select("*")
          .eq("planner_id", currentProfile.id)
          .order("created_at", { ascending: false });
        const { data: vendorRows } = await supabase
          .from("vendor_businesses")
          .select("*")
          .eq("owner_id", currentProfile.id)
          .order("created_at", { ascending: false });

        setEvents(eventRows ?? []);
        setVendors(vendorRows ?? []);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Unable to load dashboard.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadAccount();
  }, []);

  if (isLoading) {
    return <DashboardShell message="Loading your dashboard..." />;
  }

  if (message) {
    return (
      <DashboardShell message={message}>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/auth/login"
            className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-950"
          >
            Create account
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e24b44]">
            Dashboard
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}.
          </h1>
          <p className="mt-4 text-lg text-neutral-600">
            Role: <span className="font-semibold text-neutral-950">{profile?.role}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/plan"
            className="rounded-full bg-[#ff5a5f] px-5 py-3 text-sm font-semibold text-white"
          >
            New event
          </Link>
          <Link
            href="/vendor/onboarding"
            className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-950"
          >
            List services
          </Link>
          <Link
            href="/auth/logout"
            className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-950"
          >
            Log out
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-[0_18px_44px_rgba(20,20,20,0.05)]">
          <h2 className="text-2xl font-semibold tracking-tight">Saved events</h2>
          <div className="mt-5 space-y-3">
            {events.length ? (
              events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block rounded-lg border border-neutral-200 p-4 transition hover:-translate-y-0.5 hover:border-neutral-950"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-neutral-950">{event.title}</p>
                      <p className="mt-1 text-sm text-neutral-500">
                        {event.event_type} · {event.date ?? "No date"} ·{" "}
                        {event.guest_count ?? 0} guests
                      </p>
                    </div>
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                      {event.status}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-neutral-300 p-5 text-sm text-neutral-600">
                No saved events yet. Create one from the planner.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-[0_18px_44px_rgba(20,20,20,0.05)]">
          <h2 className="text-2xl font-semibold tracking-tight">Vendor listings</h2>
          <div className="mt-5 space-y-3">
            {vendors.length ? (
              vendors.map((vendor) => (
                <article key={vendor.id} className="rounded-lg border border-neutral-200 p-4">
                  <p className="font-semibold text-neutral-950">
                    {vendor.business_name}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {vendor.category} · {vendor.approval_status}
                  </p>
                </article>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-neutral-300 p-5 text-sm text-neutral-600">
                No vendor business yet. Create a provider listing to start onboarding.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function DashboardShell({
  children,
  message,
}: {
  children?: React.ReactNode;
  message: string;
}) {
  return (
    <div className="mx-auto max-w-7xl rounded-lg border border-neutral-200 bg-white p-6 shadow-[0_18px_44px_rgba(20,20,20,0.05)]">
      <p className="text-sm font-semibold text-neutral-700">{message}</p>
      {children}
    </div>
  );
}
