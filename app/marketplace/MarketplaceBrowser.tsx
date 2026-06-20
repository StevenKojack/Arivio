"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MarketplaceCard } from "../components/MarketplaceCard";
import {
  eventTypes,
  marketplaceItems,
  marketplaceTypes,
  type EventType,
  type ServiceName,
} from "../data/marketplace";

type MarketplaceFilter = (typeof marketplaceTypes)[number];

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
  const guests = searchParams.get("guests");
  const budget = searchParams.get("budget");
  const [selectedType, setSelectedType] = useState<MarketplaceFilter>("All");
  const [selectedEvent, setSelectedEvent] = useState<EventType | "All">(
    isEventType(initialEvent) ? initialEvent : "All",
  );
  const [selectedServices, setSelectedServices] = useState<ServiceName[]>(
    initialServices ?? [],
  );
  const [query, setQuery] = useState("");
  const planSummary = [
    isEventType(initialEvent) ? initialEvent : null,
    guests ? `${Number(guests).toLocaleString()} guests` : null,
    budget ? `$${Number(budget).toLocaleString()} budget` : null,
  ]
    .filter(Boolean)
    .join(" · ");

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

  function toggleService(service: ServiceName) {
    setSelectedServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
  }

  return (
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
        <div className="mt-8 grid animate-[fadeUp_280ms_ease-out] gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <MarketplaceCard key={item.id} item={item} />
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
  );
}
