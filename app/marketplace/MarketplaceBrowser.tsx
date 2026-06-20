"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { MarketplaceCard } from "../components/MarketplaceCard";
import {
  entertainmentServices,
  estimateDriveMinutes,
  eventTypes,
  getEndTime,
  getHoursBetween,
  homeAreas,
  isAvailableAt,
  marketplaceItems,
  marketplaceTypes,
  quoteItem,
  type Coordinates,
  type EventType,
  type MarketplaceItem,
  type QuoteContext,
  type ServiceName,
} from "../data/marketplace";

type MarketplaceFilter = (typeof marketplaceTypes)[number];
type CartLine = {
  id: number;
  item: MarketplaceItem;
  serviceEnd: string;
  serviceStart: string;
};
const venueItems = marketplaceItems.filter((item) => item.type === "Venue");

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
  const [endTime, setEndTime] = useState(
    getEndTime(searchParams.get("time") ?? "14:00", Number(searchParams.get("duration") ?? 3)),
  );
  const [guestCount, setGuestCount] = useState(
    Number.isFinite(initialGuests) ? initialGuests : 40,
  );
  const [useHomeVenue, setUseHomeVenue] = useState(false);
  const [homeAddress, setHomeAddress] = useState("");
  const [homeAreaName, setHomeAreaName] = useState(homeAreas[0].name);
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(() => {
    if (!isEventType(initialEvent)) {
      return null;
    }

    return (
      venueItems.find((venue) => venue.events.includes(initialEvent))?.id ?? null
    );
  });
  const [cart, setCart] = useState<CartLine[]>([]);
  const durationHours = getHoursBetween(startTime, endTime);
  const globalQuoteContext: QuoteContext = {
    date: eventDate,
    durationHours,
    endTime,
    guests: guestCount,
    startTime,
  };
  const selectedVenue = selectedVenueId
    ? venueItems.find((venue) => venue.id === selectedVenueId)
    : undefined;
  const homeArea = homeAreas.find((area) => area.name === homeAreaName) ?? homeAreas[0];
  const eventCoordinates: Coordinates | undefined = useHomeVenue
    ? homeArea.coordinates
    : selectedVenue?.coordinates;
  const planSummary = [
    isEventType(initialEvent) ? initialEvent : null,
    guestCount ? `${guestCount.toLocaleString()} guests` : null,
    initialBudget ? `$${Number(initialBudget).toLocaleString()} budget` : null,
  ]
    .filter(Boolean)
    .join(" - ");

  const filteredItems = marketplaceItems.filter((item) => {
    const matchesType = selectedType === "All" || item.type === selectedType;
    const matchesEvent =
      selectedEvent === "All" || item.events.includes(selectedEvent);
    const matchesServices =
      selectedServices.length === 0 ||
      item.services.some((service) => selectedServices.includes(service));
    const searchText = `${item.name} ${item.location} ${item.address} ${item.events.join(
      " ",
    )} ${item.services.join(" ")}`;
    const matchesQuery = searchText.toLowerCase().includes(query.toLowerCase());
    const driveMinutes = eventCoordinates
      ? estimateDriveMinutes(eventCoordinates, item.coordinates)
      : 0;
    const isNearEnough =
      !eventCoordinates || item.type === "Venue" || driveMinutes <= 60;

    return (
      matchesType &&
      matchesEvent &&
      matchesServices &&
      matchesQuery &&
      isNearEnough
    );
  });
  const cartTotal = cart.reduce((total, line) => total + getLineQuote(line), 0);

  function getLineContext(line: CartLine): QuoteContext {
    return {
      date: eventDate,
      durationHours: getHoursBetween(line.serviceStart, line.serviceEnd),
      endTime: line.serviceEnd,
      guests: guestCount,
      startTime: line.serviceStart,
    };
  }

  function getLineQuote(line: CartLine) {
    return quoteItem(line.item, getLineContext(line));
  }

  function getDriveMinutes(item: MarketplaceItem) {
    if (!eventCoordinates || item.type === "Venue") {
      return undefined;
    }

    return estimateDriveMinutes(eventCoordinates, item.coordinates);
  }

  function toggleService(service: ServiceName) {
    setSelectedServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
  }

  function addToCart(item: MarketplaceItem) {
    setCart((current) => {
      if (current.some((line) => line.item.id === item.id)) {
        return current;
      }

      return [
        ...current,
        {
          id: Date.now(),
          item,
          serviceEnd: endTime,
          serviceStart: startTime,
        },
      ];
    });
  }

  function removeFromCart(itemId: number) {
    setCart((current) => current.filter((line) => line.item.id !== itemId));
  }

  function updateCartTime(itemId: number, field: "serviceStart" | "serviceEnd", value: string) {
    setCart((current) =>
      current.map((line) =>
        line.item.id === itemId ? { ...line, [field]: value } : line,
      ),
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
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
              placeholder="Search by name, city, event, address, or service"
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
              Party start
              <input
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                type="time"
                className="mt-2 h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm font-semibold normal-case tracking-normal text-neutral-900 outline-none focus:border-neutral-950"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Party end
              <input
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                type="time"
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

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-lg border border-neutral-200 bg-[#fbfbfa] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">
                    Party venue
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">
                    Pick a venue or use your home so providers stay within an
                    estimated one-hour drive.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setUseHomeVenue((current) => !current)}
                  className={`h-10 rounded-full px-4 text-sm font-semibold transition ${
                    useHomeVenue
                      ? "bg-neutral-950 text-white"
                      : "border border-neutral-300 bg-white text-neutral-800"
                  }`}
                >
                  Use my home
                </button>
              </div>

              {useHomeVenue ? (
                <div className="mt-4 grid gap-3">
                  <input
                    value={homeAddress}
                    onChange={(event) => setHomeAddress(event.target.value)}
                    placeholder="Home address"
                    className="h-11 rounded-lg border border-neutral-300 px-3 text-sm font-semibold text-neutral-900 outline-none focus:border-neutral-950"
                  />
                  <select
                    value={homeAreaName}
                    onChange={(event) => setHomeAreaName(event.target.value)}
                    className="h-11 rounded-lg border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-900 outline-none focus:border-neutral-950"
                  >
                    {homeAreas.map((area) => (
                      <option key={area.name}>{area.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <select
                  value={selectedVenueId ?? ""}
                  onChange={(event) =>
                    setSelectedVenueId(
                      event.target.value ? Number(event.target.value) : null,
                    )
                  }
                  className="mt-4 h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-900 outline-none focus:border-neutral-950"
                >
                  <option value="">Select a venue from the map</option>
                  {venueItems.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <VenueMap
              selectedVenueId={selectedVenueId}
              useHomeVenue={useHomeVenue}
              homeCoordinates={homeArea.coordinates}
              venues={venueItems}
              onSelectVenue={setSelectedVenueId}
            />
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
                available={isAvailableAt(item, eventDate, startTime, endTime)}
                driveMinutes={getDriveMinutes(item)}
                item={item}
                quote={quoteItem(item, globalQuoteContext)}
                onAdd={addToCart}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
              No providers within one hour
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
              Try a closer venue, a different home area, or clear one of the
              service filters. Arivio currently hides providers estimated to be
              more than one hour away in normal traffic.
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
            {eventDate || "Choose a date"} from {startTime} to {endTime}
          </p>
          <p className="mt-1">{guestCount.toLocaleString()} guests</p>
          <p className="mt-1">
            Venue:{" "}
            {useHomeVenue
              ? homeAddress || homeAreaName
              : selectedVenue?.name || "not selected"}
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {cart.length ? (
            cart.map((line) => {
              const lineQuote = getLineQuote(line);
              const lineAvailable = isAvailableAt(
                line.item,
                eventDate,
                line.serviceStart,
                line.serviceEnd,
              );

              return (
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
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                      Start
                      <input
                        type="time"
                        value={line.serviceStart}
                        onChange={(event) =>
                          updateCartTime(
                            line.item.id,
                            "serviceStart",
                            event.target.value,
                          )
                        }
                        className="mt-1 h-9 w-full rounded-md border border-neutral-200 px-2 text-sm text-neutral-950"
                      />
                    </label>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                      End
                      <input
                        type="time"
                        value={line.serviceEnd}
                        onChange={(event) =>
                          updateCartTime(
                            line.item.id,
                            "serviceEnd",
                            event.target.value,
                          )
                        }
                        className="mt-1 h-9 w-full rounded-md border border-neutral-200 px-2 text-sm text-neutral-950"
                      />
                    </label>
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xl font-semibold">
                        ${lineQuote.toLocaleString()}
                      </p>
                      <p
                        className={`mt-1 text-xs font-semibold ${
                          lineAvailable ? "text-emerald-700" : "text-amber-700"
                        }`}
                      >
                        {lineAvailable ? "Available for this window" : "Check this time"}
                      </p>
                    </div>
                    <a
                      href={line.item.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-[#c33d38]"
                    >
                      Source
                    </a>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-lg border border-dashed border-white/20 p-5 text-sm leading-6 text-neutral-300">
              Add vendors to see an itemized estimate. Each provider can have a
              different start and end time, so entertainment can cover only part
              of the party.
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

type VenueMapProps = {
  homeCoordinates: Coordinates;
  onSelectVenue: (id: number) => void;
  selectedVenueId: number | null;
  useHomeVenue: boolean;
  venues: MarketplaceItem[];
};

function VenueMap({
  homeCoordinates,
  onSelectVenue,
  selectedVenueId,
  useHomeVenue,
  venues,
}: VenueMapProps) {
  const points = useHomeVenue
    ? [{ id: 0, name: "Home venue", coordinates: homeCoordinates }]
    : venues;
  const lats = points.map((point) => point.coordinates.lat);
  const lngs = points.map((point) => point.coordinates.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  function toPosition(point: Coordinates) {
    const x = ((point.lng - minLng) / Math.max(maxLng - minLng, 0.01)) * 74 + 13;
    const y = 87 - ((point.lat - minLat) / Math.max(maxLat - minLat, 0.01)) * 74;

    return { x, y };
  }

  return (
    <div className="relative min-h-64 overflow-hidden rounded-lg border border-neutral-200 bg-[#eef3ef] p-4">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.42)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.42)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div className="absolute left-4 top-4 z-10 rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-700 shadow">
        Venue map
      </div>
      <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-white/90 px-3 py-2 text-xs font-medium text-neutral-600 shadow">
        Map is a local prototype view. Pins use stored LA coordinates.
      </div>
      {points.map((point) => {
        const position = toPosition(point.coordinates);
        const isSelected = point.id === selectedVenueId || useHomeVenue;

        return (
          <button
            key={point.id}
            type="button"
            onClick={() => !useHomeVenue && onSelectVenue(point.id)}
            className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white px-3 py-2 text-xs font-semibold shadow-[0_12px_30px_rgba(20,20,20,0.2)] transition hover:-translate-y-[55%] ${
              isSelected ? "bg-[#ff5a5f] text-white" : "bg-neutral-950 text-white"
            }`}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
          >
            {point.name}
          </button>
        );
      })}
    </div>
  );
}
