"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/client";
import type { PublicTableRow } from "@/lib/supabase/database.types";
import { ensureCurrentProfile } from "@/lib/supabase/profiles";
import type { QuoteStatus } from "@/lib/types/domain";

type VendorBusinessRow = PublicTableRow<"vendor_businesses">;
type QuoteRequestRow = PublicTableRow<"quote_requests">;
type EventRow = PublicTableRow<"events">;

type QuoteWithEvent = QuoteRequestRow & {
  event?: EventRow;
};

export function VendorDashboard() {
  const [vendors, setVendors] = useState<VendorBusinessRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteWithEvent[]>([]);
  const [counterPrices, setCounterPrices] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      if (!hasSupabaseConfig()) {
        setMessage("Supabase is not configured yet. Add the project URL to use vendor quotes.");
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createBrowserSupabaseClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        if (!user) {
          setMessage("Log in as a vendor to see quote requests.");
          setIsLoading(false);
          return;
        }

        const profile = await ensureCurrentProfile(supabase, user, "vendor");
        const { data: vendorRows, error: vendorError } = await supabase
          .from("vendor_businesses")
          .select("*")
          .eq("owner_id", profile.id)
          .order("created_at", { ascending: false });

        if (vendorError) {
          throw vendorError;
        }

        const vendorIds = (vendorRows ?? []).map((vendor) => vendor.id);
        setVendors(vendorRows ?? []);

        if (!vendorIds.length) {
          setQuotes([]);
          setIsLoading(false);
          return;
        }

        const { data: quoteRows, error: quoteError } = await supabase
          .from("quote_requests")
          .select("*")
          .in("vendor_id", vendorIds)
          .order("created_at", { ascending: false });

        if (quoteError) {
          throw quoteError;
        }

        const eventIds = Array.from(
          new Set((quoteRows ?? []).map((quote) => quote.event_id)),
        );
        const { data: eventRows } = eventIds.length
          ? await supabase.from("events").select("*").in("id", eventIds)
          : { data: [] };
        const eventsById = new Map(
          (eventRows ?? []).map((eventRow) => [eventRow.id, eventRow]),
        );

        setQuotes(
          (quoteRows ?? []).map((quote) => ({
            ...quote,
            event: eventsById.get(quote.event_id),
          })),
        );
        setMessage("");
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Unable to load vendor dashboard.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  async function updateQuote(
    quoteId: string,
    status: Extract<QuoteStatus, "accepted" | "declined" | "countered">,
  ) {
    try {
      const supabase = createBrowserSupabaseClient();
      const finalPrice =
        status === "countered" ? Number(counterPrices[quoteId] ?? 0) : null;

      if (status === "countered" && (!finalPrice || finalPrice <= 0)) {
        setMessage("Add a counter price before sending a counter.");
        return;
      }

      const { error } = await supabase
        .from("quote_requests")
        .update({
          status,
          vendor_final_price: finalPrice,
        })
        .eq("id", quoteId);

      if (error) {
        throw error;
      }

      setQuotes((current) =>
        current.map((quote) =>
          quote.id === quoteId
            ? {
                ...quote,
                status,
                vendor_final_price: finalPrice,
              }
            : quote,
        ),
      );
      setMessage(`Quote ${status}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update quote.");
    }
  }

  if (isLoading) {
    return <DashboardShell message="Loading vendor dashboard..." />;
  }

  if (message && !vendors.length) {
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
            href="/vendor/onboarding"
            className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-950"
          >
            Create vendor profile
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
            Vendor dashboard
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Quote requests.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-600">
            Accept, decline, or counter planner quote requests. Bookings and
            payments are intentionally not part of this milestone.
          </p>
        </div>
        <Link
          href="/vendor/onboarding"
          className="rounded-full bg-[#ff5a5f] px-5 py-3 text-sm font-semibold text-white"
        >
          Add services
        </Link>
      </div>

      {message ? (
        <p className="mt-6 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700">
          {message}
        </p>
      ) : null}

      <div className="mt-10 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-[0_18px_44px_rgba(20,20,20,0.05)]">
          <h2 className="text-2xl font-semibold tracking-tight">Your vendor profiles</h2>
          <div className="mt-5 space-y-3">
            {vendors.length ? (
              vendors.map((vendor) => (
                <article key={vendor.id} className="rounded-lg border border-neutral-200 p-4">
                  <p className="font-semibold text-neutral-950">
                    {vendor.business_name}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {vendor.category} - {vendor.approval_status}
                  </p>
                </article>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-neutral-300 p-5 text-sm text-neutral-600">
                Create a vendor profile to receive quote requests.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-[0_18px_44px_rgba(20,20,20,0.05)]">
          <h2 className="text-2xl font-semibold tracking-tight">Incoming requests</h2>
          <div className="mt-5 space-y-4">
            {quotes.length ? (
              quotes.map((quote) => (
                <article key={quote.id} className="rounded-lg border border-neutral-200 p-4">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <p className="font-semibold text-neutral-950">
                        {quote.event?.title ?? "Planner event"}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        {quote.event?.event_type ?? "Event"} -{" "}
                        {quote.event?.date ?? "No date"} -{" "}
                        {quote.guest_count ?? quote.event?.guest_count ?? 0} guests
                      </p>
                      <p className="mt-2 text-sm text-neutral-600">
                        Requested: {quote.requested_start_time ?? "--"} to{" "}
                        {quote.requested_end_time ?? "--"}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                      {quote.status}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
                    <div className="min-w-32">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        Estimate
                      </p>
                      <p className="mt-1 text-2xl font-semibold">
                        $
                        {Number(
                          quote.vendor_final_price ?? quote.estimated_price ?? 0,
                        ).toLocaleString()}
                      </p>
                    </div>
                    <label className="grid flex-1 gap-2 text-sm font-semibold text-neutral-700">
                      Counter price
                      <input
                        value={counterPrices[quote.id] ?? ""}
                        onChange={(event) =>
                          setCounterPrices((current) => ({
                            ...current,
                            [quote.id]: event.target.value,
                          }))
                        }
                        type="number"
                        min="1"
                        className="h-11 rounded-lg border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-950"
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuote(quote.id, "accepted")}
                        className="h-10 rounded-full bg-neutral-950 px-4 text-sm font-semibold text-white"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => updateQuote(quote.id, "countered")}
                        className="h-10 rounded-full bg-[#ff5a5f] px-4 text-sm font-semibold text-white"
                      >
                        Counter
                      </button>
                      <button
                        type="button"
                        onClick={() => updateQuote(quote.id, "declined")}
                        className="h-10 rounded-full border border-neutral-300 px-4 text-sm font-semibold text-neutral-950"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-neutral-300 p-5 text-sm text-neutral-600">
                No incoming quote requests yet.
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
