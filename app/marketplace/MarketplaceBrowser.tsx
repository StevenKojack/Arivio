"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MarketplaceCard } from "../components/MarketplaceCard";
import {
  entertainmentServices,
  estimateDriveMinutes,
  eventPlanPresets,
  eventTypes,
  getDistanceMiles,
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
import { createBrowserSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/client";
import type { PublicTableRow } from "@/lib/supabase/database.types";
import {
  createCartItem,
  createQuoteRequestsFromCart,
  getEventById,
  getMarketplaceProviders,
} from "@/lib/supabase/marketplace";
import { ensureCurrentProfile } from "@/lib/supabase/profiles";

type MarketplaceFilter = (typeof marketplaceTypes)[number];
type EventRow = PublicTableRow<"events">;
type ProfileRow = PublicTableRow<"profiles">;
type CartLine = {
  cartItemId?: string;
  id: number;
  item: MarketplaceItem;
  persisted: boolean;
  serviceEnd: string;
  serviceStart: string;
};

function demoItems() {
  return marketplaceItems.map((item) => ({
    ...item,
    databaseSource: false,
  }));
}

function isEventType(value: string | null): value is EventType {
  return eventTypes.includes(value as EventType);
}

function isServiceName(value: string): value is ServiceName {
  return marketplaceTypes.includes(value as MarketplaceFilter) && value !== "All";
}

export function MarketplaceBrowser() {
  const searchParams = useSearchParams();
  const initialEvent = searchParams.get("event");
  const eventId = searchParams.get("eventId");
  const initialServices = searchParams
    .get("services")
    ?.split(",")
    .filter(isServiceName);
  const initialEventType = isEventType(initialEvent) ? initialEvent : "All";
  const initialGuests = Number(searchParams.get("guests") ?? 40);
  const initialBudget = searchParams.get("budget");
  const initialRecommendedServices =
    initialEventType === "All" ? [] : eventPlanPresets[initialEventType].recommended;
  const [providers, setProviders] = useState<MarketplaceItem[]>(demoItems);
  const [marketplaceMessage, setMarketplaceMessage] = useState(
    "Loading marketplace providers...",
  );
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [savedEvent, setSavedEvent] = useState<EventRow | null>(null);
  const [selectedType, setSelectedType] = useState<MarketplaceFilter>("All");
  const [selectedEvent, setSelectedEvent] = useState<EventType | "All">(
    initialEventType,
  );
  const [selectedServices, setSelectedServices] = useState<ServiceName[]>(
    initialServices ?? initialRecommendedServices,
  );
  const [query, setQuery] = useState("");
  const [showAllServiceFilters, setShowAllServiceFilters] = useState(false);
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
  const [liveCoordinates, setLiveCoordinates] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartMessage, setCartMessage] = useState("");
  const [isRequestingQuotes, setIsRequestingQuotes] = useState(false);
  const venueItems = providers.filter((item) => item.type === "Venue");
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
  const homeCoordinates = liveCoordinates ?? homeArea.coordinates;
  const eventCoordinates: Coordinates | undefined = useHomeVenue
    ? homeCoordinates
    : selectedVenue?.coordinates ??
      (savedEvent?.latitude && savedEvent.longitude
        ? { lat: savedEvent.latitude, lng: savedEvent.longitude }
        : undefined);
  const providerEstimates = eventCoordinates
    ? providers
        .filter((item) => item.type !== "Venue")
        .map((item) => ({
          driveMinutes: estimateDriveMinutes(eventCoordinates, item.coordinates),
          item,
          miles: getDistanceMiles(eventCoordinates, item.coordinates),
        }))
        .filter((estimate) => {
          const withinRadius = estimate.item.serviceRadiusMiles
            ? estimate.miles <= estimate.item.serviceRadiusMiles
            : true;

          return estimate.driveMinutes <= 60 && withinRadius;
        })
        .sort((a, b) => a.driveMinutes - b.driveMinutes)
    : [];
  const visibleMarketplaceTypes =
    showAllServiceFilters || selectedEvent === "All"
      ? marketplaceTypes
      : ([
          "All",
          ...eventPlanPresets[selectedEvent].recommended,
          ...selectedServices,
        ].filter(
          (service, index, services) => services.indexOf(service) === index,
        ) as MarketplaceFilter[]);
  const planSummary = [
    isEventType(initialEvent) ? initialEvent : null,
    guestCount ? `${guestCount.toLocaleString()} guests` : null,
    initialBudget ? `$${Number(initialBudget).toLocaleString()} budget` : null,
  ]
    .filter(Boolean)
    .join(" - ");
  const filteredItems = providers.filter((item) => {
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
    const miles = eventCoordinates
      ? getDistanceMiles(eventCoordinates, item.coordinates)
      : 0;
    const matchesCity =
      !savedEvent?.city ||
      item.type === "Venue" ||
      item.location.toLowerCase().includes(savedEvent.city.toLowerCase()) ||
      item.address.toLowerCase().includes(savedEvent.city.toLowerCase());
    const withinRadius =
      !eventCoordinates ||
      item.type === "Venue" ||
      !item.serviceRadiusMiles ||
      miles <= item.serviceRadiusMiles;
    const isNearEnough =
      !eventCoordinates || item.type === "Venue" || driveMinutes <= 60;

    return (
      matchesType &&
      matchesEvent &&
      matchesServices &&
      matchesQuery &&
      matchesCity &&
      withinRadius &&
      isNearEnough
    );
  });
  const cartTotal = cart.reduce((total, line) => total + getLineQuote(line), 0);
  const canSaveCart = Boolean(profile && savedEvent);

  useEffect(() => {
    async function loadMarketplace() {
      if (!hasSupabaseConfig()) {
        setProviders(demoItems());
        setMarketplaceMessage(
          "Supabase needs a real project URL. Showing demo providers until the database is connected.",
        );
        return;
      }

      try {
        const supabase = createBrowserSupabaseClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        if (user) {
          const currentProfile = await ensureCurrentProfile(supabase, user);
          setProfile(currentProfile);
        }

        if (eventId) {
          const eventRow = await getEventById(supabase, eventId);
          setSavedEvent(eventRow);
          setEventDate(eventRow.date ?? eventDate);
          setStartTime(eventRow.start_time?.slice(0, 5) ?? startTime);
          setEndTime(eventRow.end_time?.slice(0, 5) ?? endTime);
          setGuestCount(eventRow.guest_count ?? guestCount);
          if (isEventType(eventRow.event_type)) {
            chooseEventType(eventRow.event_type);
          }
        }

        const databaseProviders = await getMarketplaceProviders(supabase);

        if (databaseProviders.length) {
          setProviders(databaseProviders);
          setMarketplaceMessage(
            "Showing approved database providers from Supabase.",
          );
          return;
        }

        setProviders(demoItems());
        setMarketplaceMessage(
          "No approved database providers were found. Showing demo providers with clear demo labels.",
        );
      } catch (error) {
        setProviders(demoItems());
        setMarketplaceMessage(
          error instanceof Error
            ? `${error.message}. Showing demo providers until Supabase data is ready.`
            : "Unable to load database providers. Showing demo providers.",
        );
      }
    }

    loadMarketplace();
    // The initial URL params should seed the browser once when the route loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

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

  function chooseEventType(nextEvent: EventType | "All") {
    setSelectedEvent(nextEvent);
    setSelectedType("All");
    setQuery("");
    setShowAllServiceFilters(false);
    setSelectedServices(
      nextEvent === "All" ? [] : eventPlanPresets[nextEvent].recommended,
    );
    setSelectedVenueId(null);
  }

  function useCurrentLocation() {
    setLocationStatus("");

    if (!navigator.geolocation) {
      setLocationStatus("Your browser does not support live location.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const nearestArea = homeAreas
          .map((area) => ({
            area,
            distance: getDistanceMiles(nextCoordinates, area.coordinates),
          }))
          .sort((a, b) => a.distance - b.distance)[0]?.area;

        setLiveCoordinates(nextCoordinates);
        setUseHomeVenue(true);
        setHomeAddress("Current live location");
        if (nearestArea) {
          setHomeAreaName(nearestArea.name);
        }
        setLocationStatus("Live location applied. Provider estimates updated.");
      },
      () => {
        setLocationStatus("Location permission was blocked or unavailable.");
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 },
    );
  }

  async function addToCart(item: MarketplaceItem) {
    if (cart.some((line) => line.item.id === item.id)) {
      return;
    }

    const lineId = Date.now();
    const line: CartLine = {
      id: lineId,
      item,
      persisted: false,
      serviceEnd: endTime,
      serviceStart: startTime,
    };

    setCart((current) => [...current, line]);

    if (!profile || !savedEvent) {
      setCartMessage("Log in to save your quote cart.");
      return;
    }

    if (!item.databaseSource) {
      setCartMessage("Demo providers stay local. Add a database provider to save quote cart items.");
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      const estimatedPrice = quoteItem(item, {
        date: eventDate,
        durationHours,
        endTime,
        guests: guestCount,
        startTime,
      });
      const cartItem = await createCartItem(supabase, {
        endTime,
        estimatedPrice,
        eventId: savedEvent.id,
        itemType: item.type === "Venue" ? "venue" : "vendor_service",
        serviceId: item.serviceId ?? null,
        startTime,
        vendorId: item.vendorId ?? null,
        venueId: item.venueId ?? null,
      });

      setCart((current) =>
        current.map((currentLine) =>
          currentLine.id === lineId
            ? { ...currentLine, cartItemId: cartItem.id, persisted: true }
            : currentLine,
        ),
      );
      setCartMessage("Quote cart item saved to Supabase.");
    } catch (error) {
      setCartMessage(
        error instanceof Error
          ? error.message
          : "Unable to save this cart item yet.",
      );
    }
  }

  function removeFromCart(itemId: number) {
    setCart((current) => current.filter((line) => line.item.id !== itemId));
  }

  async function updateCartTime(
    itemId: number,
    field: "serviceStart" | "serviceEnd",
    value: string,
  ) {
    const existingLine = cart.find((line) => line.item.id === itemId);
    const nextLine = existingLine
      ? {
          ...existingLine,
          [field]: value,
        }
      : null;

    setCart((current) =>
      current.map((line) =>
        line.item.id === itemId ? { ...line, [field]: value } : line,
      ),
    );

    if (!nextLine?.cartItemId || !savedEvent || !nextLine.item.databaseSource) {
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from("cart_items")
        .update({
          end_time: nextLine.serviceEnd,
          estimated_price: quoteItem(nextLine.item, getLineContext(nextLine)),
          start_time: nextLine.serviceStart,
        })
        .eq("id", nextLine.cartItemId)
        .eq("event_id", savedEvent.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      setCartMessage(
        error instanceof Error ? error.message : "Unable to sync cart item time.",
      );
    }
  }

  async function requestQuotes() {
    setCartMessage("");

    if (!cart.length) {
      setCartMessage("Add providers before requesting quotes.");
      return;
    }

    if (!profile || !savedEvent) {
      setCartMessage("Log in to save your quote cart.");
      return;
    }

    const persistedDatabaseLines = cart.filter(
      (line) => line.persisted && line.cartItemId && line.item.databaseSource,
    );

    if (!persistedDatabaseLines.length) {
      setCartMessage("Only saved database providers can receive quote requests.");
      return;
    }

    setIsRequestingQuotes(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const requests = await createQuoteRequestsFromCart(supabase, {
        cartItems: persistedDatabaseLines.map((line) => ({
          end_time: line.serviceEnd,
          estimated_price: getLineQuote(line),
          event_id: savedEvent.id,
          id: line.cartItemId ?? String(line.id),
          service_id: line.item.serviceId ?? null,
          start_time: line.serviceStart,
          vendor_id: line.item.vendorId ?? null,
          venue_id: line.item.venueId ?? null,
        })),
        event: savedEvent,
        message: "Quote requested from Arivio marketplace cart.",
        plannerId: profile.id,
      });

      setCartMessage(
        `${requests.length} quote request${requests.length === 1 ? "" : "s"} sent. Status starts as pending.`,
      );
    } catch (error) {
      setCartMessage(
        error instanceof Error ? error.message : "Unable to request quotes.",
      );
    } finally {
      setIsRequestingQuotes(false);
    }
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

          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <p className="rounded-lg border border-neutral-200 bg-[#fbfbfa] px-4 py-3 text-sm font-semibold text-neutral-700">
              {marketplaceMessage}
            </p>
            {!canSaveCart ? (
              <p className="rounded-lg border border-[#ffd6d7] bg-[#fff8f8] px-4 py-3 text-sm font-semibold text-[#b73532]">
                Log in to save your quote cart.
              </p>
            ) : (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                Cart saves to event: {savedEvent?.title}
              </p>
            )}
          </div>

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
                chooseEventType(event.target.value as EventType | "All")
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

          <div className="mt-5 grid gap-4 xl:grid-cols-[360px_1fr]">
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
                    placeholder="Home address or use current location"
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
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    className="h-11 rounded-full bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
                  >
                    Autofill live location
                  </button>
                  {locationStatus ? (
                    <p className="text-xs font-semibold text-neutral-600">
                      {locationStatus}
                    </p>
                  ) : null}
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
              homeCoordinates={homeCoordinates}
              venues={venueItems}
              onSelectVenue={setSelectedVenueId}
            />
          </div>

          <LocationEstimatePanel
            eventCoordinates={eventCoordinates}
            homeAddress={homeAddress}
            isHomeVenue={useHomeVenue}
            providerEstimates={providerEstimates}
            selectedVenueName={selectedVenue?.name}
          />

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
            {visibleMarketplaceTypes.map((type) => (
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
            {selectedEvent !== "All" ? (
              <button
                type="button"
                onClick={() => setShowAllServiceFilters((current) => !current)}
                className="h-10 rounded-full border border-[#ffc5c7] bg-[#fff8f8] px-4 text-sm font-semibold text-[#b73532] transition hover:border-[#ff5a5f]"
              >
                {showAllServiceFilters ? "Show recommended" : "More services"}
              </button>
            ) : null}
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

        {!canSaveCart ? (
          <Link
            href="/auth/login"
            className="mt-4 block rounded-lg border border-[#ff8b8f]/40 bg-[#ff5a5f]/10 px-4 py-3 text-sm font-semibold text-[#ffd5d7]"
          >
            Log in to save your quote cart.
          </Link>
        ) : null}

        {cartMessage ? (
          <p className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white">
            {cartMessage}
          </p>
        ) : null}

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
                      <p className="mt-1 text-xs font-semibold text-neutral-500">
                        {line.persisted
                          ? "Saved cart item"
                          : line.item.databaseSource
                            ? "Not saved yet"
                            : "Demo provider"}
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
                    {line.item.sourceUrl !== "#" ? (
                      <a
                        href={line.item.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-[#c33d38]"
                      >
                        Source
                      </a>
                    ) : null}
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
            onClick={requestQuotes}
            disabled={isRequestingQuotes}
            className="mt-5 h-12 w-full rounded-full bg-[#ff5a5f] text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,90,95,0.25)] transition hover:-translate-y-0.5 hover:bg-[#e84f54] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRequestingQuotes ? "Requesting..." : "Request quotes"}
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

type ProviderEstimate = {
  driveMinutes: number;
  item: MarketplaceItem;
  miles: number;
};

function LocationEstimatePanel({
  eventCoordinates,
  homeAddress,
  isHomeVenue,
  providerEstimates,
  selectedVenueName,
}: {
  eventCoordinates?: Coordinates;
  homeAddress: string;
  isHomeVenue: boolean;
  providerEstimates: ProviderEstimate[];
  selectedVenueName?: string;
}) {
  const closestProvider = providerEstimates[0];
  const longestDrive = providerEstimates[providerEstimates.length - 1];

  return (
    <section className="mt-4 grid gap-3 rounded-lg border border-neutral-200 bg-neutral-950 p-4 text-white md:grid-cols-4">
      <div className="md:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff8b8f]">
          Live location estimate
        </p>
        <p className="mt-2 text-sm text-neutral-300">
          {eventCoordinates
            ? isHomeVenue
              ? homeAddress || "Home venue location selected"
              : selectedVenueName ?? "Venue selected"
            : "Select a venue or use live location to start estimating."}
        </p>
      </div>
      <EstimateMetric
        label="Providers within 1 hour"
        value={eventCoordinates ? String(providerEstimates.length) : "0"}
      />
      <EstimateMetric
        label="Closest provider"
        value={closestProvider ? `${closestProvider.driveMinutes} min` : "--"}
        detail={closestProvider?.item.name}
      />
      <div className="rounded-lg border border-white/10 p-3 md:col-span-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-neutral-300">
            Normal traffic estimate uses local coordinates until a routing API is connected.
          </p>
          <p className="text-sm font-semibold text-white">
            Farthest shown: {longestDrive ? `${longestDrive.driveMinutes} min` : "--"}
          </p>
        </div>
      </div>
    </section>
  );
}

function EstimateMetric({
  detail,
  label,
  value,
}: {
  detail?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 p-3">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-xs text-neutral-400">{detail}</p> : null}
    </div>
  );
}

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
  const minLat = lats.length ? Math.min(...lats) : 34.02;
  const maxLat = lats.length ? Math.max(...lats) : 34.12;
  const minLng = lngs.length ? Math.min(...lngs) : -118.45;
  const maxLng = lngs.length ? Math.max(...lngs) : -118.2;

  function toPosition(point: Coordinates) {
    const x = ((point.lng - minLng) / Math.max(maxLng - minLng, 0.01)) * 74 + 13;
    const y = 87 - ((point.lat - minLat) / Math.max(maxLat - minLat, 0.01)) * 74;

    return { x, y };
  }

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-neutral-200 bg-[#eef3ef] p-4 shadow-inner">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.42)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.42)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div className="absolute left-4 top-4 z-10 rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-700 shadow">
        Venue map
      </div>
      <div className="absolute bottom-4 left-4 z-10 max-w-[70%] rounded-lg bg-white/90 px-3 py-2 text-xs font-medium text-neutral-600 shadow">
        Map is a local prototype view. Pins use stored coordinates.
      </div>
      {points.length ? (
        points.map((point) => {
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
        })
      ) : (
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center text-sm font-semibold text-neutral-600">
          Add approved venue providers to Supabase to populate the map.
        </div>
      )}
    </div>
  );
}
