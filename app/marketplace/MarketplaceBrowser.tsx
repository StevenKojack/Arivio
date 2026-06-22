"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
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
  getEventById,
  getMarketplaceProviders,
} from "@/lib/repositories/marketplaceRepository";
import { getProfileByMarketplaceType } from "@/lib/event-intelligence/taxonomy";
import { recognizeEventIntent } from "@/lib/event-intelligence/search";
import { rankMarketplaceItems } from "@/lib/event-intelligence/recommendations";
import {
  createCartItem,
  updateCartItemTime,
} from "@/lib/repositories/cartRepository";
import { ensureCurrentProfile } from "@/lib/repositories/profilesRepository";
import { requestQuotesFromCart } from "@/lib/services/quoteService";
import { FilterDrawer } from "./components/FilterDrawer";
import { MarketplaceRow } from "./components/MarketplaceRow";
import { QuoteCartDrawer } from "./components/QuoteCartDrawer";

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
  const initialLocation = searchParams.get("location") ?? "";
  const initialNotes = searchParams.get("notes") ?? "";
  const initialRecommendedServices =
    initialEventType === "All" ? [] : eventPlanPresets[initialEventType].recommended;
  const [providers, setProviders] = useState<MarketplaceItem[]>(demoItems);
  const [marketplaceMessage, setMarketplaceMessage] = useState(
    "Loading marketplace providers...",
  );
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [savedEvent, setSavedEvent] = useState<EventRow | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventType | "All">(
    initialEventType,
  );
  const [selectedServices, setSelectedServices] = useState<ServiceName[]>(
    initialServices ?? initialRecommendedServices,
  );
  const [query, setQuery] = useState("");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [eventDate, setEventDate] = useState(searchParams.get("date") ?? "");
  const [startTime, setStartTime] = useState(searchParams.get("time") ?? "14:00");
  const [endTime, setEndTime] = useState(
    getEndTime(searchParams.get("time") ?? "14:00", Number(searchParams.get("duration") ?? 3)),
  );
  const [guestCount, setGuestCount] = useState(
    Number.isFinite(initialGuests) ? initialGuests : 40,
  );
  const [useHomeVenue, setUseHomeVenue] = useState(false);
  const [homeAddress, setHomeAddress] = useState(initialLocation);
  const [homeAreaName, setHomeAreaName] = useState(homeAreas[0].name);
  const [liveCoordinates, setLiveCoordinates] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartMessage, setCartMessage] = useState("");
  const [isRequestingQuotes, setIsRequestingQuotes] = useState(false);
  const venueItems = useMemo(
    () => providers.filter((item) => item.type === "Venue"),
    [providers],
  );
  const durationHours = getHoursBetween(startTime, endTime);
  const globalQuoteContext: QuoteContext = useMemo(
    () => ({
      date: eventDate,
      durationHours,
      endTime,
      guests: guestCount,
      startTime,
    }),
    [durationHours, endTime, eventDate, guestCount, startTime],
  );
  const selectedVenue = selectedVenueId
    ? venueItems.find((venue) => venue.id === selectedVenueId)
    : undefined;
  const homeArea = homeAreas.find((area) => area.name === homeAreaName) ?? homeAreas[0];
  const homeCoordinates = liveCoordinates ?? homeArea.coordinates;
  const eventCoordinates: Coordinates | undefined = useMemo(
    () =>
      useHomeVenue
        ? homeCoordinates
        : selectedVenue?.coordinates ??
          (savedEvent?.latitude && savedEvent.longitude
            ? { lat: savedEvent.latitude, lng: savedEvent.longitude }
            : undefined),
    [
      homeCoordinates,
      savedEvent?.latitude,
      savedEvent?.longitude,
      selectedVenue?.coordinates,
      useHomeVenue,
    ],
  );
  const providerEstimates = useMemo(
    () =>
      eventCoordinates
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
        : [],
    [eventCoordinates, providers],
  );
  const visibleMarketplaceTypes = (
    selectedEvent === "All"
      ? marketplaceTypes
      : [
          "All",
          ...eventPlanPresets[selectedEvent].recommended,
          ...selectedServices,
        ].filter((service, index, services) => services.indexOf(service) === index)
  ).filter((service): service is ServiceName => service !== "All");
  const planSummary = [
    isEventType(initialEvent) ? initialEvent : null,
    guestCount ? `${guestCount.toLocaleString()} guests` : null,
    initialBudget ? `$${Number(initialBudget).toLocaleString()} budget` : null,
  ]
    .filter(Boolean)
    .join(" - ");
  const eventLocationLabel = useHomeVenue
    ? homeAddress || homeAreaName
    : selectedVenue?.name || initialLocation || "Not selected";
  const serviceSummary = selectedServices.length
    ? selectedServices.slice(0, 4).join(", ")
    : "Open to suggestions";
  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    const nextItems = providers.filter((item) => {
      const matchesEvent =
        selectedEvent === "All" || item.events.includes(selectedEvent);
      const matchesServices =
        selectedServices.length === 0 ||
        item.services.some((service) => selectedServices.includes(service));
      const searchText = `${item.name} ${item.location} ${item.address} ${item.events.join(
        " ",
      )} ${item.services.join(" ")} ${(item.tags ?? []).join(" ")}`;
      const matchesQuery =
        !normalizedQuery || searchText.toLowerCase().includes(normalizedQuery);
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
      const matchesAvailability = isAvailableAt(
        item,
        eventDate,
        startTime,
        endTime,
      );

      return (
        matchesEvent &&
        matchesServices &&
        matchesQuery &&
        matchesCity &&
        withinRadius &&
        isNearEnough &&
        matchesAvailability
      );
    });

    if (selectedEvent === "All") {
      return nextItems;
    }

    const profile = getProfileByMarketplaceType(selectedEvent);
    const rankedItems = rankMarketplaceItems(
      nextItems,
      recognizeEventIntent(profile.subtype ?? profile.primaryType),
      {
        coordinates: eventCoordinates,
        quoteContext: globalQuoteContext,
      },
    );

    return rankedItems.map((rankedItem) => rankedItem.item);
  }, [
    endTime,
    eventCoordinates,
    eventDate,
    globalQuoteContext,
    normalizedQuery,
    providers,
    savedEvent?.city,
    selectedEvent,
    selectedServices,
    startTime,
  ]);
  const canSaveCart = Boolean(profile && savedEvent);
  const marketplaceRows = useMemo(
    () => buildMarketplaceRows(filteredItems),
    [filteredItems],
  );

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

  function toggleService(service: ServiceName) {
    setSelectedServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
  }

  function chooseEventType(nextEvent: EventType | "All") {
    setSelectedEvent(nextEvent);
    setQuery("");
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
      await updateCartItemTime(supabase, {
        cartItemId: nextLine.cartItemId,
        endTime: nextLine.serviceEnd,
        estimatedPrice: quoteItem(nextLine.item, getLineContext(nextLine)),
        eventId: savedEvent.id,
        startTime: nextLine.serviceStart,
      });
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
      const requests = await requestQuotesFromCart(supabase, {
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
    <>
      <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-[32px] border border-neutral-200 bg-[linear-gradient(135deg,#ffffff,#fbfbfa)] p-5 shadow-[0_18px_50px_rgba(20,20,20,0.05)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Event context
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
                  {planSummary ? `Best matches for ${planSummary}` : "Vendor collections"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                  {marketplaceMessage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(true)}
                className="h-11 w-fit rounded-full border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-950 transition hover:-translate-y-0.5 hover:border-neutral-950"
              >
                Edit event details
              </button>
            </div>
            <div className="mt-5 grid gap-3 text-sm text-neutral-600 md:grid-cols-5">
              <SummaryPill label="Date" value={eventDate || "Choose date"} />
              <SummaryPill label="Time" value={`${startTime} - ${endTime}`} />
              <SummaryPill label="Guests" value={guestCount.toLocaleString()} />
              <SummaryPill label="Location" value={eventLocationLabel} />
              <SummaryPill label="Services" value={serviceSummary} />
            </div>
            {initialNotes ? (
              <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-neutral-700 shadow-[inset_0_0_0_1px_rgba(229,229,229,1)]">
                Added details: {initialNotes}
              </p>
            ) : null}
          </section>

          <section className="grid min-w-0 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-[28px] border border-neutral-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">Location context</p>
                  <p className="mt-1 text-sm text-neutral-600">
                    Used for distance estimates only.
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
                  My home
                </button>
              </div>
              {useHomeVenue ? (
                <div className="mt-4 grid gap-3">
                  <input
                    value={homeAddress}
                    onChange={(event) => setHomeAddress(event.target.value)}
                    placeholder="Home address"
                    className="h-11 rounded-2xl border border-neutral-300 px-3 text-sm font-semibold text-neutral-900 outline-none focus:border-neutral-950"
                  />
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    className="h-11 rounded-full bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
                  >
                    Use live location
                  </button>
                  {locationStatus ? (
                    <p className="text-xs font-semibold text-neutral-600">{locationStatus}</p>
                  ) : null}
                </div>
              ) : (
                <select
                  value={selectedVenueId ?? ""}
                  onChange={(event) =>
                    setSelectedVenueId(event.target.value ? Number(event.target.value) : null)
                  }
                  className="mt-4 h-11 w-full rounded-2xl border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-900 outline-none focus:border-neutral-950"
                >
                  <option value="">Select a venue</option>
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
          </section>

          <LocationEstimatePanel
            eventCoordinates={eventCoordinates}
            homeAddress={homeAddress}
            isHomeVenue={useHomeVenue}
            providerEstimates={providerEstimates}
            selectedVenueName={selectedVenue?.name}
          />

          {marketplaceRows.length ? (
            <div className="space-y-6 animate-[fadeUp_280ms_ease-out]">
              {marketplaceRows.map((row) => (
                <MarketplaceRow
                  key={row.title}
                  title={row.title}
                  description={row.description}
                  items={row.items}
                  quoteContext={globalQuoteContext}
                  onAdd={addToCart}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-neutral-300 bg-white p-8 text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
                No close matches yet
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                Try opening filters or adjusting the location context.
              </p>
            </div>
          )}
        </div>

        <QuoteCartDrawer
          canSaveCart={canSaveCart}
          cart={cart}
          cartMessage={cartMessage}
          eventSummary={`${eventDate || "Choose a date"} from ${startTime} to ${endTime}`}
          getLineQuote={getLineQuote}
          isRequestingQuotes={isRequestingQuotes}
          onRemove={removeFromCart}
          onRequestQuotes={requestQuotes}
          onUpdateTime={updateCartTime}
        />
      </div>

      <FilterDrawer
        eventTypes={eventTypes}
        isOpen={isFilterDrawerOpen}
        query={query}
        selectedEvent={selectedEvent}
        selectedServices={selectedServices}
        serviceOptions={visibleMarketplaceTypes}
        onClose={() => setIsFilterDrawerOpen(false)}
        onEventChange={chooseEventType}
        onQueryChange={setQuery}
        onToggleService={toggleService}
      />
    </>
  );
}

type MarketplaceRowGroup = {
  description: string;
  items: MarketplaceItem[];
  title: string;
};

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f7f7f5] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-neutral-800">{value}</p>
    </div>
  );
}

function buildMarketplaceRows(items: MarketplaceItem[]): MarketplaceRowGroup[] {
  const rows: MarketplaceRowGroup[] = [
    {
      description: "The strongest matches based on your event details.",
      items: items.slice(0, 10),
      title: "Best matches",
    },
    {
      description: "Spaces and venues for the event itself.",
      items: byServices(items, ["Venue"]),
      title: "Venues",
    },
    {
      description: "Food, catering, cake, and dessert options.",
      items: byServices(items, ["Catering", "Cake & Desserts"]),
      title: "Food and catering",
    },
    {
      description: "DJs, live music, and sound-forward services.",
      items: byServices(items, ["DJ", "Live Music"]),
      title: "Music and DJs",
    },
    {
      description: "Tables, chairs, lounge, booths, and event equipment.",
      items: byServices(items, ["Rentals", "Booth Rentals"]),
      title: "Rentals",
    },
    {
      description: "Photographers, booths, and visual coverage.",
      items: byServices(items, ["Photography", "Photo Booth"]),
      title: "Photo and video",
    },
    {
      description: "Performers and specialty entertainment when appropriate.",
      items: byServices(items, ["Magic", "Character Performers"]),
      title: "Entertainment",
    },
    {
      description: "Florals, invitations, programs, and presentation details.",
      items: byServices(items, ["Florals", "Invitations", "Printed Programs", "Printed Materials"]),
      title: "Decor",
    },
    {
      description: "Support teams for guest flow and event operations.",
      items: byServices(items, ["Staffing", "Security", "Registration"]),
      title: "Security and staffing",
    },
    {
      description: "Restrooms, production, livestreaming, and practical event support.",
      items: byServices(items, ["Portable Restrooms", "AV Production", "Live Streaming"]),
      title: "Restrooms and logistics",
    },
    {
      description: "Passenger movement, shuttles, and point-to-point event transport.",
      items: byServices(items, ["Transportation"]),
      title: "Transportation",
    },
  ];

  return rows.filter((row) => row.items.length > 0);
}

function byServices(items: MarketplaceItem[], services: ServiceName[]) {
  return items.filter(
    (item) =>
      services.includes(item.type) ||
      item.services.some((service) => services.includes(service)),
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
