"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MarketplaceCard } from "../components/MarketplaceCard";
import {
  entertainmentServices,
  eventTypes,
  isAvailableAt,
  marketplaceItems,
  marketplaceTypes,
  quoteItem,
  type EventType,
  type MarketplaceItem,
  type QuoteContext,
  type ServiceName,
} from "../data/marketplace";

type MarketplaceFilter = (typeof marketplaceTypes)[number];
type CartLine = {
  id: number;
  item: MarketplaceItem;
  quote: number;
};

function isEventType(value: string | null): value is EventType {
  return eventTypes.includes(value as EventType);
}

function isServiceName(value: string): value is ServiceName {
  return marketplaceTypes.includes(value as MarketplaceFilter) && value !== "All";
}

export function MarketplaceBrowser() {
  const searchParams = useSearchParams();
  const initialEvent = searchParams.get("event");
  const initialServices = searchParams
    .get("services")
    ?.split(",")
    .filter(isServiceName);
  const initialGuests = Number(searchParams.get("guests") ?? 40);
  const initialBudget = searchParams.get("budget");
  const [selectedType, setSelectedType] = useState<MarketplaceFilter>("All");
  const [selectedEvent, setSelectedEvent] = useState<EventType | "All">(
    isEventType(initialEvent) ? initialEvent : "All",
  );
  const [selectedServices, setSelectedServices] = useState<ServiceName[]>(
    initialServices ?? [],
  );
  const [query, setQuery] = useState("");
  const [eventDate, setEventDate] = useState(searchParams.get("date") ?? "");
  const [startTime, setStartTime] = useState(searchParams.get("time") ?? "14:00");
  const [durationHours, setDurationHours] = useState(
    Number(searchParams.get("duration") ?? 3),
  );
  const [guestCount, setGuestCount] = useState(Number.isFinite(initialGuests) ? initialGuests : 40);
  const [cart, setCart] = useState<CartLine[]>([]);
  const quoteContext: QuoteContext = {
    date: eventDate,
    durationHours,
    guests: guestCount,
    startTime,
  };
  const planSummary = [
    isEventType(initialEvent) ? initialEvent : null,
    guestCount ? `${guestCount.toLocaleString()} guests` : null,
    initialBudget ? `$${Number(initialBudget).toLocaleString()} budget` : null,
  ]
    .filter(Boolean)
    .join(" - ");

  const filteredItems = useMemo(() => {
    return marketplaceItems.filter((item) => {
      const matchesType = selectedType === "All" || item.type === selectedType;
      const matchesEvent =
        selectedEvent === "All" || item.events.includes(selectedEvent);
      const matchesServices =
        selectedServices.length === 0 ||
        item.services.some((service) => selectedServices.includes(service));
      const searchText = `${item.name} ${item.location} ${item.events.join(
        " ",
      )} ${item.services.join(" ")}`;
      const matchesQuery = searchText.toLowerCase().includes(query.toLowerCase());

      return matchesType && matchesEvent && matchesServices && matchesQuery;
    });
  }, [query, selectedEvent, selectedServices, selectedType]);
  const cartTotal = cart.reduce((total, line) => total + line.quote, 0);

  function toggleService(service: ServiceName) {
    setSelectedServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
  }

  function addToCart(item: MarketplaceItem) {
    const quote = quoteItem(item, quoteContext);

    setCart((current) => {
      if (current.some((line) => line.item.id === item.id)) {
        return current.map((line) =>
          line.item.id === item.id ? { ...line, quote } : line,
        );
      }

      return [...current, { id: Date.now(), item, quote }];
    });
  }

  function removeFromCart(itemId: number) {
    setCart((current) => current.filter((line) => line.item.id !== itemId));
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
      <div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-[0_18px_44px_rgba(20,20,20,0.05)]">
          {planSummary ? (
            <div className="mb-4 rounded-lg bg-[#fff5f5] px-4 py-3 text-sm font-semibold text-[#b73532]">
              Matches for {planSummary}
            </div>
          ) : null}
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, city, event, or service"
              className="h-12 rounded-lg border border-neutral-300 px-4 text-sm font-medium outline-none transition focus:border-neutral-950"
            />
            <select
              value={selectedEvent}
              onChange={(event) =>
                setSelectedEvent(event.target.value as EventType | "All")
              }
              className="h-12 rounded-lg border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 outline-none transition focus:border-neutral-950"
            >
              <option>All</option>
              {eventTypes.map((eventType) => (
                <option key={eventType}>{eventType}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Date
              <input
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
                type="date"
                className="mt-2 h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm font-semibold normal-case tracking-normal text-neutral-900 outline-none focus:border-neutral-950"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Start time
              <input
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                type="time"
                className="mt-2 h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm font-semibold normal-case tracking-normal text-neutral-900 outline-none focus:border-neutral-950"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Hours
              <input
                value={durationHours}
                onChange={(event) => setDurationHours(Number(event.target.value))}
                type="number"
                min="1"
                max="12"
                className="mt-2 h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm font-semibold normal-case tracking-normal text-neutral-900 outline-none focus:border-neutral-950"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Guests
              <input
                value={guestCount}
                onChange={(event) => setGuestCount(Number(event.target.value))}
                type="number"
                min="1"
                className="mt-2 h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm font-semibold normal-case tracking-normal text-neutral-900 outline-none focus:border-neutral-950"
              />
            </label>
          </div>

          <div className="mt-5 rounded-lg border border-[#ffd6d7] bg-[#fff8f8] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-950">
                  Entertainment hub
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  DJ, live music, magic, character performers, and photo booths
                  are separate bookable services.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {entertainmentServices.map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleService(service)}
                    className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                      selectedServices.includes(service)
                        ? "bg-[#ff5a5f] text-white"
                        : "border border-[#ffc5c7] bg-white text-[#b73532] hover:border-[#ff5a5f]"
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {marketplaceTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`h-10 rounded-full px-4 text-sm font-semibold transition ${
                  selectedType === type
                    ? "bg-neutral-950 text-white"
                    : "border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-950"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {selectedServices.length ? (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
              {selectedServices.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleService(service)}
                  className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white transition hover:bg-neutral-700"
                >
                  {service} x
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {filteredItems.length ? (
          <div className="mt-8 grid animate-[fadeUp_280ms_ease-out] gap-5 md:grid-cols-2">
            {filteredItems.map((item) => (
              <MarketplaceCard
                key={item.id}
                available={isAvailableAt(item, eventDate, startTime)}
                item={item}
                quote={quoteItem(item, quoteContext)}
                onAdd={addToCart}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
              No exact matches yet
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
              Try clearing one service tag or switching the event filter. Arivio
              will keep expanding the marketplace as more providers join.
            </p>
          </div>
        )}
      </div>

      <aside className="sticky top-24 h-fit rounded-lg border border-neutral-200 bg-neutral-950 p-5 text-white shadow-[0_24px_70px_rgba(20,20,20,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ff8b8f]">
              Quote cart
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              Build your booking stack
            </h2>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-neutral-950">
            {cart.length}
          </span>
        </div>

        <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-neutral-300">
          <p>
            {eventDate || "Choose a date"} at {startTime}, {durationHours}{" "}
            {durationHours === 1 ? "hour" : "hours"}
          </p>
          <p className="mt-1">{guestCount.toLocaleString()} guests</p>
        </div>

        <div className="mt-5 space-y-3">
          {cart.length ? (
            cart.map((line) => (
              <div
                key={line.item.id}
                className="rounded-lg border border-white/10 bg-white p-4 text-neutral-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{line.item.name}</p>
                    <p className="mt-1 text-xs font-medium text-neutral-500">
                      {line.item.type} - {line.item.pricing.label}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(line.item.id)}
                    className="text-xs font-semibold text-neutral-500 transition hover:text-neutral-950"
                  >
                    Remove
                  </button>
                </div>
                <p className="mt-3 text-xl font-semibold">
                  ${line.quote.toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-white/20 p-5 text-sm leading-6 text-neutral-300">
              Add vendors to see an itemized estimate. Quotes update from the
              selected date, time, duration, and guest count.
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-white/10 pt-5">
          <div className="flex items-end justify-between">
            <p className="text-sm text-neutral-400">Estimated total</p>
            <p className="text-3xl font-semibold">${cartTotal.toLocaleString()}</p>
          </div>
          <button
            type="button"
            className="mt-5 h-12 w-full rounded-full bg-[#ff5a5f] text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,90,95,0.25)] transition hover:-translate-y-0.5 hover:bg-[#e84f54]"
          >
            Request all quotes
          </button>
        </div>
      </aside>
    </div>
  );
}
