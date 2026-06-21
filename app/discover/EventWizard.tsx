"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  allServices,
  getHoursBetween,
  homeAreas,
  marketplaceItems,
  quoteItem,
  type MarketplaceItem,
  type QuoteContext,
  type ServiceName,
} from "../data/marketplace";
import {
  groupRankedItems,
  rankMarketplaceItems,
  type RankedMarketplaceItem,
} from "@/lib/event-intelligence/recommendations";
import {
  recognizeEventIntent,
  searchEventIntents,
} from "@/lib/event-intelligence/search";
import { createBrowserSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { getMarketplaceProviders } from "@/lib/repositories/marketplaceRepository";
import { CalendarPicker } from "./components/CalendarPicker";
import { ServiceRecommendationCard } from "./components/ServiceRecommendationCard";
import { StepCard } from "./components/StepCard";
import { TimeDurationPicker } from "./components/TimeDurationPicker";

type LocationChoice = "home" | "need_venue" | "have_venue" | "not_sure";

const steps = [
  "What",
  "Confirm",
  "When",
  "Where",
  "Guests",
  "Recommendations",
] as const;

const locationOptions: Array<{
  body: string;
  id: LocationChoice;
  label: string;
}> = [
  { body: "Use your address as the event location.", id: "home", label: "My home" },
  { body: "Start with venue matches before vendors.", id: "need_venue", label: "I need a venue" },
  { body: "Use a known location for vendor distance and availability.", id: "have_venue", label: "I already have a venue" },
  { body: "Keep location flexible for now.", id: "not_sure", label: "Not sure yet" },
];

function demoItems() {
  return marketplaceItems.map((item) => ({ ...item, databaseSource: false }));
}

export function EventWizard() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") ?? "";
  const [step, setStep] = useState(initialQuery ? 1 : 0);
  const [query, setQuery] = useState(initialQuery);
  const [providers, setProviders] = useState<MarketplaceItem[]>(demoItems);
  const [providerMessage, setProviderMessage] = useState("Loading provider matches...");
  const [timing, setTiming] = useState({
    date: "",
    endTime: "22:00",
    endDate: "",
    setupTime: "17:00",
    startTime: "18:00",
    teardownTime: "23:00",
  });
  const [showAdvancedTiming, setShowAdvancedTiming] = useState(false);
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [locationChoice, setLocationChoice] = useState<LocationChoice>("not_sure");
  const [locationDetail, setLocationDetail] = useState("");
  const [guestCount, setGuestCount] = useState(60);
  const [budget, setBudget] = useState(6000);
  const [customNote, setCustomNote] = useState("");
  const [selectedServices, setSelectedServices] = useState<ServiceName[]>(
    () => recognizeEventIntent(initialQuery || "Private party").recommendedServices,
  );
  const recognition = useMemo(
    () => recognizeEventIntent(query || "Private party"),
    [query],
  );
  const suggestions = useMemo(() => searchEventIntents(query, 5), [query]);
  const relevantServices = useMemo(
    () =>
      uniqueServices([
        ...recognition.profile.requiredVendors,
        ...recognition.profile.recommendedVendors,
        ...recognition.profile.optionalVendors,
        ...recognition.profile.luxuryAddOns,
      ]).filter((service) => !recognition.excludedServices.includes(service)),
    [recognition],
  );
  const quoteContext = useMemo<QuoteContext>(
    () => ({
      date: timing.date,
      durationHours: getHoursBetween(timing.startTime, timing.endTime),
      endTime: timing.endTime,
      guests: guestCount,
      startTime: timing.startTime,
    }),
    [guestCount, timing.date, timing.endTime, timing.startTime],
  );
  const rankedItems = useMemo(
    () =>
      rankMarketplaceItems(
        providers.filter(
          (item) =>
            selectedServices.length === 0 ||
            item.services.some((service) => selectedServices.includes(service)) ||
            selectedServices.includes(item.type),
        ),
        recognition,
        {
          coordinates: homeAreas[0].coordinates,
          quoteContext,
        },
      ),
    [providers, quoteContext, recognition, selectedServices],
  );
  const groupedItems = groupRankedItems(rankedItems);
  const marketplaceHref = useMemo(() => {
    const profile = recognition.profile;
    const params = new URLSearchParams({
      budget: String(budget),
      date: timing.date,
      duration: String(quoteContext.durationHours),
      event: profile.marketplaceEventType ?? "Private Party",
      guests: String(guestCount),
      services: selectedServices.join(","),
      time: timing.startTime,
    });

    if (locationDetail) {
      params.set("location", locationDetail);
    }

    return `/marketplace?${params.toString()}`;
  }, [
    budget,
    guestCount,
    locationDetail,
    quoteContext.durationHours,
    recognition.profile,
    selectedServices,
    timing.date,
    timing.startTime,
  ]);
  const canOpenMarketplace =
    Boolean(timing.date && timing.startTime && timing.endTime) &&
    guestCount > 0 &&
    locationChoice !== "not_sure";

  useEffect(() => {
    async function loadProviders() {
      if (!hasSupabaseConfig()) {
        setProviders(demoItems());
        setProviderMessage("Showing demo providers until Supabase has approved vendors.");
        return;
      }

      try {
        const supabase = createBrowserSupabaseClient();
        const databaseProviders = await getMarketplaceProviders(supabase);

        if (databaseProviders.length) {
          setProviders(databaseProviders);
          setProviderMessage("Showing approved database providers ranked by event fit.");
          return;
        }

        setProviders(demoItems());
        setProviderMessage("No approved database providers found yet. Showing demo providers.");
      } catch (error) {
        setProviders(demoItems());
        setProviderMessage(
          error instanceof Error
            ? `${error.message}. Showing demo providers.`
            : "Unable to load database providers. Showing demo providers.",
        );
      }
    }

    loadProviders();
  }, []);

  function continueFromSearch(nextQuery = query) {
    const cleanQuery = nextQuery.trim();

    if (!cleanQuery) {
      return;
    }

    setQuery(cleanQuery);
    setSelectedServices(recognizeEventIntent(cleanQuery).recommendedServices);
    setStep(1);
  }

  function toggleService(service: ServiceName) {
    setSelectedServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
  }

  return (
    <section className="px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <StepRail currentStep={step} />
        <div className="mt-8 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-[0_28px_90px_rgba(20,20,20,0.08)]">
          {step === 0 ? (
            <StepCard
              eyebrow="Step 1"
              title="What are you planning?"
              body="Type the event naturally. Arivio will infer the profile in the background."
              action={
                <button
                  type="button"
                  onClick={() => continueFromSearch()}
                  disabled={!query.trim()}
                  className="h-12 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue
                </button>
              }
            >
              <SearchBox
                query={query}
                suggestions={suggestions}
                onChange={setQuery}
                onSelect={continueFromSearch}
              />
            </StepCard>
          ) : null}

          {step === 1 ? (
            <StepCard
              eyebrow="Step 2"
              title={getConfirmationTitle(recognition)}
              body={getConfirmationBody(recognition)}
              action={<PrimaryButton label="Looks right" onClick={() => setStep(2)} />}
            >
              <UnderstandingCard
                customNote={customNote}
                onCustomNoteChange={setCustomNote}
                recognition={recognition}
                selectedServices={selectedServices}
                onToggleService={toggleService}
                onAddService={(service) =>
                  setSelectedServices((current) =>
                    current.includes(service) ? current : [...current, service],
                  )
                }
              />
            </StepCard>
          ) : null}

          {step === 2 ? (
            <StepCard
              eyebrow="Step 3"
              title="When is it?"
              body="Date and time drive availability, pricing, and vendor fit."
              action={<PrimaryButton label="Continue" onClick={() => setStep(3)} />}
            >
              <div className="grid gap-5">
                <CalendarPicker
                  label="Date"
                  value={timing.date}
                  onChange={(value) => setTiming((current) => ({ ...current, date: value }))}
                />
                <TimeDurationPicker
                  startTime={timing.startTime}
                  endTime={timing.endTime}
                  onStartTimeChange={(value) =>
                    setTiming((current) => ({ ...current, startTime: value }))
                  }
                  onEndTimeChange={(value) =>
                    setTiming((current) => ({ ...current, endTime: value }))
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => setShowAdvancedTiming((current) => !current)}
                className="mt-5 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-950"
              >
                {showAdvancedTiming ? "Hide advanced timing" : "Advanced timing"}
              </button>
              {showAdvancedTiming ? (
                <div className="mt-4 grid gap-4 rounded-[24px] border border-neutral-200 bg-[#fbfbfa] p-4 md:grid-cols-2">
                  <label className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-neutral-800">
                    Multi-day event
                    <input
                      type="checkbox"
                      checked={isMultiDay}
                      onChange={(event) => setIsMultiDay(event.target.checked)}
                      className="h-5 w-5 accent-neutral-950"
                    />
                  </label>
                  {isMultiDay ? (
                    <CalendarPicker
                      label="End date"
                      value={timing.endDate}
                      onChange={(value) =>
                        setTiming((current) => ({ ...current, endDate: value }))
                      }
                    />
                  ) : null}
                  <TimingField
                    label="Setup time"
                    type="time"
                    value={timing.setupTime}
                    onChange={(value) =>
                      setTiming((current) => ({ ...current, setupTime: value }))
                    }
                  />
                  <TimingField
                    label="Teardown time"
                    type="time"
                    value={timing.teardownTime}
                    onChange={(value) =>
                      setTiming((current) => ({ ...current, teardownTime: value }))
                    }
                  />
                </div>
              ) : null}
            </StepCard>
          ) : null}

          {step === 3 ? (
            <StepCard
              eyebrow="Step 4"
              title="Where is it?"
              body="Location keeps venue and vendor recommendations realistic."
              action={<PrimaryButton label="Continue" onClick={() => setStep(4)} />}
            >
              <div className="grid gap-3 md:grid-cols-2">
                {locationOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setLocationChoice(option.id)}
                    className={`rounded-lg border p-4 text-left transition ${
                      locationChoice === option.id
                        ? "border-neutral-950 bg-neutral-950 text-white"
                        : "border-neutral-200 bg-[#fbfbfa] text-neutral-950 hover:border-neutral-400"
                    }`}
                  >
                    <span className="block text-base font-semibold">{option.label}</span>
                    <span
                      className={`mt-2 block text-sm leading-6 ${
                        locationChoice === option.id ? "text-neutral-300" : "text-neutral-600"
                      }`}
                    >
                      {option.body}
                    </span>
                  </button>
                ))}
              </div>
              {locationChoice !== "not_sure" ? (
                <input
                  value={locationDetail}
                  onChange={(event) => setLocationDetail(event.target.value)}
                  placeholder={
                    locationChoice === "home"
                      ? "Home address"
                      : locationChoice === "have_venue"
                        ? "Venue name or address"
                        : "Preferred city or neighborhood"
                  }
                  className="mt-5 h-12 w-full rounded-lg border border-neutral-300 px-4 text-sm font-semibold outline-none transition focus:border-neutral-950"
                />
              ) : null}
            </StepCard>
          ) : null}

          {step === 4 ? (
            <StepCard
              eyebrow="Step 5"
              title="Guest count and budget."
              body="This helps Arivio avoid vendors that are too small, too large, or badly priced."
              action={<PrimaryButton label="Build recommendations" onClick={() => setStep(5)} />}
            >
              <div className="grid gap-5">
                <div className="grid gap-4 md:grid-cols-2">
                <TimingField
                  label="Guest count"
                  type="number"
                  value={String(guestCount)}
                  onChange={(value) => setGuestCount(Number(value))}
                />
                <TimingField
                  label="Estimated budget"
                  type="number"
                  value={String(budget)}
                  onChange={(value) => setBudget(Number(value))}
                />
                </div>
                <div className="grid gap-2 sm:grid-cols-4">
                  {[
                    ["Simple", 2500],
                    ["Standard", 6000],
                    ["Premium", 15000],
                    ["Luxury", 30000],
                  ].map(([label, value]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setBudget(Number(value))}
                      className={`h-12 rounded-full border text-sm font-semibold transition ${
                        budget === Number(value)
                          ? "border-neutral-950 bg-neutral-950 text-white"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-950"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={budget}
                  onChange={(event) => setBudget(Number(event.target.value))}
                  className="w-full accent-neutral-950"
                />
              </div>
            </StepCard>
          ) : null}

          {step === 5 ? (
            <StepCard
              eyebrow="Step 6"
              title="Smart recommendations."
              body={providerMessage}
              action={
                canOpenMarketplace ? (
                  <Link
                    href={marketplaceHref}
                    className="inline-flex h-12 items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800"
                  >
                    Continue to marketplace
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="h-12 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white opacity-40"
                  >
                    Add date and location first
                  </button>
                )
              }
            >
              <ServiceControl
                relevantServices={relevantServices}
                selectedServices={selectedServices}
                onToggle={toggleService}
              />
              <div className="mt-6 grid gap-5">
                <RecommendationGroup
                  title="Required"
                  description="The plan likely needs these to function."
                  items={groupedItems.required}
                  quoteContext={quoteContext}
                />
                <RecommendationGroup
                  title="Recommended"
                  description="Strong fit for the event experience."
                  items={groupedItems.recommended}
                  quoteContext={quoteContext}
                />
                <RecommendationGroup
                  title="Optional"
                  description="Useful depending on taste, program, and location."
                  items={groupedItems.optional}
                  quoteContext={quoteContext}
                />
                <RecommendationGroup
                  title="Luxury add-ons"
                  description="Elevated touches when the budget allows."
                  items={groupedItems.luxury}
                  quoteContext={quoteContext}
                />
              </div>
            </StepCard>
          ) : null}
        </div>

        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(current - 1, 0))}
            className="mt-5 text-sm font-semibold text-neutral-500 transition hover:text-neutral-950"
          >
            Back
          </button>
        ) : null}
      </div>
    </section>
  );
}

function StepRail({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {steps.map((label, index) => (
        <div
          key={label}
          className={`flex min-w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
            currentStep === index
              ? "border-neutral-950 bg-neutral-950 text-white"
              : currentStep > index
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-neutral-200 bg-white text-neutral-500"
          }`}
        >
          <span>{index + 1}</span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function SearchBox({
  onChange,
  onSelect,
  query,
  suggestions,
}: {
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  query: string;
  suggestions: ReturnType<typeof searchEventIntents>;
}) {
  return (
    <div>
      <input
        value={query}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Pool party, funeral reception, corporate seminar..."
        className="h-14 w-full rounded-full border border-neutral-300 px-5 text-lg font-semibold outline-none transition focus:border-neutral-950"
      />
      <div className="mt-4 overflow-hidden rounded-[28px] border border-neutral-200 bg-[#fbfbfa] p-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.label}
            type="button"
            onClick={() => onSelect(suggestion.label)}
            className="flex w-full items-center justify-between gap-4 rounded-[22px] px-4 py-3 text-left transition hover:bg-white"
          >
            <span>
              <span className="block text-sm font-semibold text-neutral-950">
                {suggestion.label}
              </span>
              <span className="mt-1 block text-xs font-medium text-neutral-500">
                {suggestion.recognition.profile.likelyVibe ??
                  suggestion.recognition.profile.venueStyle}
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-700">
              Select
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PlainDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold capitalize text-neutral-950">{value}</p>
    </div>
  );
}

function ReadonlyInput({ label, value }: { label: string; value: string }) {
  return (
    <label className="text-sm font-semibold text-neutral-800">
      {label}
      <input
        value={value}
        readOnly
        className="mt-2 h-12 w-full rounded-2xl border border-neutral-200 bg-[#fbfbfa] px-4 text-sm font-semibold text-neutral-700"
      />
    </label>
  );
}

function UnderstandingCard({
  customNote,
  onCustomNoteChange,
  onAddService,
  onToggleService,
  recognition,
  selectedServices,
}: {
  customNote: string;
  onAddService: (service: ServiceName) => void;
  onCustomNoteChange: (value: string) => void;
  onToggleService: (service: ServiceName) => void;
  recognition: ReturnType<typeof recognizeEventIntent>;
  selectedServices: ServiceName[];
}) {
  const profile = recognition.profile;
  const [isEditing, setIsEditing] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const visibleServices = selectedServices.filter(
    (service) => !recognition.excludedServices.includes(service),
  );
  const addableServices = allServices.filter(
    (service) =>
      !visibleServices.includes(service) &&
      !recognition.excludedServices.includes(service) &&
      (!serviceSearch ||
        service.toLowerCase().includes(serviceSearch.trim().toLowerCase())),
  );

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-neutral-200 bg-[#fbfbfa] p-5">
        <p className="text-sm font-semibold text-neutral-500">You are planning</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
          {recognition.preservedSubtype ?? profile.subtype ?? profile.primaryType}
        </h2>
        <p className="mt-3 text-base leading-7 text-neutral-600">
          {getConfirmationBody(recognition)}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <PlainDetail label="Style" value={profile.culture ?? profile.likelyVibe ?? "Flexible"} />
          <PlainDetail label="Setting" value={profile.indoorOutdoor} />
          <PlainDetail label="Vibe" value={profile.likelyVibe ?? "Guided"} />
          <PlainDetail label="Guests" value={profile.likelyGuestType ?? "Your guests"} />
        </div>
      </div>

      <div className="rounded-[28px] border border-neutral-200 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-neutral-950">
              We will help you find
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              Remove anything you do not need.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing((current) => !current)}
            className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-950"
          >
            {isEditing ? "Done" : "Edit details"}
          </button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {visibleServices.map((service) => (
            <ServiceRecommendationCard
              key={service}
              service={service}
              isSelected
              onToggle={onToggleService}
            />
          ))}
        </div>
      </div>

      {isEditing ? (
        <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_18px_50px_rgba(20,20,20,0.06)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadonlyInput label="Event type" value={profile.primaryType} />
            <ReadonlyInput
              label="Subtype"
              value={recognition.preservedSubtype ?? profile.subtype ?? "General"}
            />
            <ReadonlyInput label="Culture or style" value={profile.culture ?? "Flexible"} />
            <ReadonlyInput label="Indoor or outdoor" value={profile.indoorOutdoor} />
            <ReadonlyInput label="Vibe" value={profile.likelyVibe ?? "Flexible"} />
          </div>
          <label className="mt-5 block text-sm font-semibold text-neutral-800">
            Add a service
            <input
              value={serviceSearch}
              onChange={(event) => setServiceSearch(event.target.value)}
              placeholder="Search services"
              className="mt-2 h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm font-semibold outline-none transition focus:border-neutral-950"
            />
          </label>
          <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {addableServices.slice(0, 8).map((service) => (
              <ServiceRecommendationCard
                key={service}
                service={service}
                isSelected={false}
                onToggle={onAddService}
              />
            ))}
          </div>
        </div>
      ) : null}

      <label className="block text-sm font-semibold text-neutral-800">
        Want to add anything?
        <input
          value={customNote}
          onChange={(event) => onCustomNoteChange(event.target.value)}
          placeholder="Theme, cultural needs, accessibility, food style..."
          className="mt-2 h-12 w-full rounded-lg border border-neutral-300 px-4 text-sm font-semibold outline-none transition focus:border-neutral-950"
        />
      </label>
    </div>
  );
}

function TimingField({
  label,
  onChange,
  type,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  type: string;
  value: string;
}) {
  return (
    <label className="text-sm font-semibold text-neutral-800">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-lg border border-neutral-300 px-4 text-sm font-semibold outline-none transition focus:border-neutral-950"
      />
    </label>
  );
}

function PrimaryButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-12 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800"
    >
      {label}
    </button>
  );
}

function ServiceControl({
  onToggle,
  relevantServices,
  selectedServices,
}: {
  onToggle: (service: ServiceName) => void;
  relevantServices: ServiceName[];
  selectedServices: ServiceName[];
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-[#fbfbfa] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-950">Customize your event profile</p>
          <p className="mt-1 text-sm text-neutral-600">
            Only relevant suggestions are shown here.
          </p>
        </div>
        <p className="text-xs font-semibold text-neutral-500">
          {selectedServices.length} selected
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {relevantServices.map((service) => (
          <button
            key={service}
            type="button"
            onClick={() => onToggle(service)}
            className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
              selectedServices.includes(service)
                ? "bg-neutral-950 text-white"
                : "border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-950"
            }`}
          >
            {service}
          </button>
        ))}
      </div>
    </div>
  );
}

function RecommendationGroup({
  description,
  items,
  quoteContext,
  title,
}: {
  description: string;
  items: RankedMarketplaceItem[];
  quoteContext: QuoteContext;
  title: string;
}) {
  const visibleItems = items.slice(0, 3);

  return (
    <div className="rounded-lg border border-neutral-200 bg-[#fbfbfa] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-neutral-950">
            {title}
          </h3>
          <p className="mt-1 text-sm text-neutral-600">{description}</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-700">
          {items.length}
        </span>
      </div>

      {visibleItems.length ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {visibleItems.map(({ item, match }) => (
            <article key={`${title}-${item.id}`} className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#e24b44]">
                    {item.type}
                  </p>
                  <h4 className="mt-2 text-base font-semibold text-neutral-950">
                    {item.name}
                  </h4>
                </div>
                <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white">
                  {match.score}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium text-neutral-500">{item.location}</p>
              <p className="mt-3 text-sm text-neutral-600">
                {match.reasons.slice(0, 2).join(". ")}
              </p>
              <p className="mt-4 text-lg font-semibold text-neutral-950">
                ${quoteItem(item, quoteContext).toLocaleString()}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-neutral-300 bg-white p-4 text-sm font-semibold text-neutral-500">
          No provider matches yet.
        </p>
      )}
    </div>
  );
}

function getConfirmationTitle(recognition: ReturnType<typeof recognizeEventIntent>) {
  const label =
    recognition.preservedSubtype ??
    recognition.profile.subtype ??
    recognition.profile.primaryType.toLowerCase();

  return `Looks like ${startsWithVowel(label) ? "an" : "a"} ${label}.`;
}

function getConfirmationBody(recognition: ReturnType<typeof recognizeEventIntent>) {
  const profile = recognition.profile;
  const services = toFriendlyNeeds(profile.likelyNeeds ?? recognition.recommendedServices);

  if (profile.id === "pool-party") {
    return "We will include rentals, food, drinks, shade, lighting, cleaning, and optional lifeguards.";
  }

  if (profile.id === "bachelor-party") {
    return "We will include venues, transportation, food and drinks, entertainment, and late-night options.";
  }

  if (profile.id === "funeral") {
    return "We will focus on venues, catering, flowers, printed programs, transportation, and livestreaming.";
  }

  if (
    (recognition.preservedSubtype ?? profile.subtype ?? "")
      .toLowerCase()
      .includes("sweet")
  ) {
    return "We will include DJ, cake, decor, photo booth, photographer, and rentals.";
  }

  return `We will help you find ${services}.`;
}

function toFriendlyNeeds(needs: string[]) {
  const visibleNeeds = needs.slice(0, 7).map((need) => need.toLowerCase());

  if (visibleNeeds.length <= 1) {
    return visibleNeeds[0] ?? "the right vendors";
  }

  return `${visibleNeeds.slice(0, -1).join(", ")}, and ${visibleNeeds.at(-1)}`;
}

function startsWithVowel(value: string) {
  return /^[aeiou]/i.test(value.trim());
}

function uniqueServices(services: ServiceName[]) {
  return services.filter((service, index) => services.indexOf(service) === index);
}
