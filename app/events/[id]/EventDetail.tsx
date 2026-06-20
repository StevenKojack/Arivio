"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/client";
import type { PublicTableRow } from "@/lib/supabase/database.types";

type EventRow = PublicTableRow<"events">;
type CartItemRow = PublicTableRow<"cart_items">;
type QuoteRequestRow = PublicTableRow<"quote_requests">;

export function EventDetail({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<EventRow | null>(null);
  const [cartItems, setCartItems] = useState<CartItemRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequestRow[]>([]);
  const [message, setMessage] = useState("Loading event...");

  useEffect(() => {
    async function loadEvent() {
      if (!hasSupabaseConfig()) {
        setMessage("Supabase is not configured yet.");
        return;
      }

      try {
        const supabase = createBrowserSupabaseClient();
        const { data: eventRow, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single();

        if (eventError) {
          throw eventError;
        }

        const { data: cartRows } = await supabase
          .from("cart_items")
          .select("*")
          .eq("event_id", eventId);
        const { data: quoteRows } = await supabase
          .from("quote_requests")
          .select("*")
          .eq("event_id", eventId);

        setEvent(eventRow);
        setCartItems(cartRows ?? []);
        setQuotes(quoteRows ?? []);
        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load event.");
      }
    }

    loadEvent();
  }, [eventId]);

  if (message) {
    return (
      <div className="mx-auto max-w-7xl rounded-lg border border-neutral-200 bg-white p-6">
        <p className="text-sm font-semibold text-neutral-700">{message}</p>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e24b44]">
            Event dashboard
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            {event.title}
          </h1>
          <p className="mt-4 text-lg text-neutral-600">
            {event.event_type} - {event.date ?? "No date"} -{" "}
            {event.guest_count ?? 0} guests
          </p>
        </div>
        <Link
          href={`/marketplace?event=${encodeURIComponent(
            event.event_type,
          )}&guests=${event.guest_count ?? 40}&budget=${
            event.budget_max ?? 5000
          }&date=${event.date ?? ""}&time=${
            event.start_time?.slice(0, 5) ?? "14:00"
          }&eventId=${event.id}`}
          className="rounded-full bg-[#ff5a5f] px-5 py-3 text-sm font-semibold text-white"
        >
          Browse vendors
        </Link>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <Metric label="Status" value={event.status} />
        <Metric label="Budget" value={`$${Number(event.budget_max ?? 0).toLocaleString()}`} />
        <Metric label="Venue" value={event.venue_needed ? "Needed" : "Home or selected"} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Quote cart">
          {cartItems.length ? (
            cartItems.map((item) => (
              <p key={item.id} className="rounded-lg border border-neutral-200 p-4 text-sm">
                {item.item_type} - ${Number(item.estimated_price ?? 0).toLocaleString()}
              </p>
            ))
          ) : (
            <p className="text-sm text-neutral-600">
              No saved cart items yet. Add database providers from the marketplace.
            </p>
          )}
        </Panel>
        <Panel title="Quote requests">
          {quotes.length ? (
            quotes.map((quote) => (
              <p key={quote.id} className="rounded-lg border border-neutral-200 p-4 text-sm">
                {quote.status} - $
                {Number(
                  quote.vendor_final_price ?? quote.estimated_price ?? 0,
                ).toLocaleString()}
              </p>
            ))
          ) : (
            <p className="text-sm text-neutral-600">
              No quote requests yet. Add providers to the cart, then request quotes.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-950">{value}</p>
    </div>
  );
}

function Panel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-6">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-5 space-y-3">{children}</div>
    </section>
  );
}
