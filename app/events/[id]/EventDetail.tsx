"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildMarketplaceHrefForEvent } from "@/lib/actions/navigationActions";
import { createBrowserSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { getEventWorkspace } from "@/lib/repositories/eventsRepository";
import type { BookingRow } from "@/lib/repositories/bookingsRepository";
import type { QuoteRequestRow } from "@/lib/repositories/quotesRepository";
import { confirmAcceptedQuote } from "@/lib/services/quoteService";
import type { PublicTableRow } from "@/lib/supabase/database.types";
import { formatDate, formatMoney, formatTime } from "@/lib/utils/format";

type EventRow = PublicTableRow<"events">;
type CartItemRow = PublicTableRow<"cart_items">;

export function EventDetail({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<EventRow | null>(null);
  const [cartItems, setCartItems] = useState<CartItemRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequestRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [message, setMessage] = useState("Loading event...");

  useEffect(() => {
    async function loadEvent() {
      if (!hasSupabaseConfig()) {
        setMessage("Supabase is not configured yet.");
        return;
      }

      try {
        const supabase = createBrowserSupabaseClient();
        const workspace = await getEventWorkspace(supabase, eventId);

        setEvent(workspace.event);
        setCartItems(workspace.cartItems);
        setQuotes(workspace.quotes);
        setBookings(workspace.bookings);
        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load event.");
      }
    }

    loadEvent();
  }, [eventId]);

  const confirmedQuoteIds = useMemo(
    () =>
      new Set(
        bookings
          .map((booking) => booking.quote_request_id)
          .filter((quoteId): quoteId is string => Boolean(quoteId)),
      ),
    [bookings],
  );

  async function confirmQuote(quote: QuoteRequestRow) {
    try {
      const supabase = createBrowserSupabaseClient();
      const booking = await confirmAcceptedQuote(supabase, quote);
      setBookings((current) => [booking, ...current]);
      setMessage("Booking created. Payment has not been collected.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to confirm quote.");
    }
  }

  if (message && !event) {
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
            {event.event_type} - {formatDate(event.date)} -{" "}
            {event.guest_count ?? 0} guests
          </p>
        </div>
        <Link
          href={buildMarketplaceHrefForEvent(event)}
          className="rounded-full bg-[#ff5a5f] px-5 py-3 text-sm font-semibold text-white"
        >
          Browse vendors
        </Link>
      </div>

      {message ? (
        <p className="mt-6 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700">
          {message}
        </p>
      ) : null}

      <div className="mt-10 grid gap-5 lg:grid-cols-4">
        <Metric label="Status" value={event.status} />
        <Metric label="Budget" value={formatMoney(event.budget_max)} />
        <Metric label="Quotes" value={String(quotes.length)} />
        <Metric label="Bookings" value={String(bookings.length)} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel title="Quote cart">
          {cartItems.length ? (
            cartItems.map((item) => (
              <Row
                key={item.id}
                title={`${item.item_type} - ${formatMoney(item.estimated_price)}`}
                detail={`${formatTime(item.start_time)} to ${formatTime(item.end_time)} - ${item.status}`}
              />
            ))
          ) : (
            <Empty text="No saved cart items yet. Add database providers from the marketplace." />
          )}
        </Panel>
        <Panel title="Quote requests">
          {quotes.length ? (
            quotes.map((quote) => {
              const isConfirmed = confirmedQuoteIds.has(quote.id);

              return (
                <div key={quote.id} className="rounded-lg border border-neutral-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-neutral-950">
                        {isConfirmed ? "booked" : quote.status}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        {formatTime(quote.requested_start_time)} to{" "}
                        {formatTime(quote.requested_end_time)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatMoney(quote.vendor_final_price ?? quote.estimated_price)}
                    </p>
                  </div>
                  {quote.status === "accepted" && !isConfirmed ? (
                    <button
                      type="button"
                      onClick={() => confirmQuote(quote)}
                      className="mt-4 h-10 rounded-full bg-neutral-950 px-4 text-sm font-semibold text-white"
                    >
                      Confirm vendor
                    </button>
                  ) : null}
                </div>
              );
            })
          ) : (
            <Empty text="No quote requests yet. Add providers to the cart, then request quotes." />
          )}
        </Panel>
        <Panel title="Bookings">
          {bookings.length ? (
            bookings.map((booking) => (
              <Row
                key={booking.id}
                title={`${formatMoney(booking.final_price)} - ${booking.booking_status}`}
                detail={`Deposit ${formatMoney(booking.deposit_amount)} - balance ${formatMoney(booking.balance_due)} - ${booking.payment_status}`}
              />
            ))
          ) : (
            <Empty text="No confirmed vendors yet." />
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

function Row({ detail, title }: { detail: string; title: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4 text-sm">
      <p className="font-semibold text-neutral-950">{title}</p>
      <p className="mt-1 text-neutral-500">{detail}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed border-neutral-300 p-5 text-sm text-neutral-600">
      {text}
    </p>
  );
}
