"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  allServices,
  eventPlanPresets,
  eventTypes,
  type EventType,
  type ServiceName,
} from "../data/marketplace";

export function PlannerForm() {
  const [eventType, setEventType] = useState<EventType>("Birthday");
  const [guestCount, setGuestCount] = useState(40);
  const [budget, setBudget] = useState(5000);
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("14:00");
  const [durationHours, setDurationHours] = useState(3);
  const [needsVenue, setNeedsVenue] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [services, setServices] = useState<ServiceName[]>(
    eventPlanPresets.Birthday.recommended,
  );

  const preset = eventPlanPresets[eventType];
  const recommendedServices = useMemo(
    () =>
      needsVenue
        ? preset.recommended
        : preset.recommended.filter((service) => service !== "Venue"),
    [needsVenue, preset.recommended],
  );
  const moreServices = useMemo(
    () =>
      allServices.filter(
        (service) =>
          !recommendedServices.includes(service) &&
          !preset.more.includes(service),
      ),
    [preset.more, recommendedServices],
  );
  const optionalServices = [...preset.more, ...moreServices];

  const activeServices = useMemo(
    () => services.filter((service) => needsVenue || service !== "Venue"),
    [needsVenue, services],
  );
  const budgetPerGuest = useMemo(
    () => Math.round(budget / Math.max(guestCount, 1)),
    [budget, guestCount],
  );
  const planHref = useMemo(() => {
    const params = new URLSearchParams({
      event: eventType,
      venue: needsVenue ? "yes" : "no",
      guests: String(guestCount),
      budget: String(budget),
      date: eventDate,
      duration: String(durationHours),
      time: startTime,
    });

    if (activeServices.length > 0) {
      params.set("services", activeServices.join(","));
    }

    return `/marketplace?${params.toString()}`;
  }, [
    activeServices,
    budget,
    durationHours,
    eventDate,
    eventType,
    guestCount,
    needsVenue,
    startTime,
  ]);

  function chooseEventType(nextEventType: EventType) {
    const nextRecommended = eventPlanPresets[nextEventType].recommended;

    setEventType(nextEventType);
    setShowMore(false);
    setServices(
      needsVenue
        ? nextRecommended
        : nextRecommended.filter((service) => service !== "Venue"),
    );
  }

  function chooseVenueNeed(nextNeedsVenue: boolean) {
    setNeedsVenue(nextNeedsVenue);
    setServices((current) => {
      if (nextNeedsVenue) {
        return current.includes("Venue") ? current : ["Venue", ...current];
      }

      return current.filter((service) => service !== "Venue");
    });
  }

  function toggleService(service: ServiceName) {
    setServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="rounded-lg border border-neutral-200 bg-white p-6 shadow-[0_22px_60px_rgba(20,20,20,0.07)]">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
            Event type
            <select
              value={eventType}
              onChange={(event) => chooseEventType(event.target.value as EventType)}
              className="h-12 rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium outline-none transition focus:border-neutral-950"
            >
              {eventTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
            Event date
            <input
              type="date"
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
              className="h-12 rounded-lg border border-neutral-300 px-4 text-sm font-medium outline-none transition focus:border-neutral-950"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
            Location
            <input
              placeholder="Los Angeles, CA"
              className="h-12 rounded-lg border border-neutral-300 px-4 text-sm font-medium outline-none transition focus:border-neutral-950"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
            Guest count
            <input
              type="number"
              min="1"
              value={guestCount}
              onChange={(event) => setGuestCount(Number(event.target.value))}
              className="h-12 rounded-lg border border-neutral-300 px-4 text-sm font-medium outline-none transition focus:border-neutral-950"
            />
          </label>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
            Start time
            <input
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="h-12 rounded-lg border border-neutral-300 px-4 text-sm font-medium outline-none transition focus:border-neutral-950"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
            Service hours
            <input
              type="number"
              min="1"
              max="12"
              value={durationHours}
              onChange={(event) => setDurationHours(Number(event.target.value))}
              className="h-12 rounded-lg border border-neutral-300 px-4 text-sm font-medium outline-none transition focus:border-neutral-950"
            />
          </label>
        </div>

        <div className="mt-7 rounded-lg bg-[#f7f7f5] p-4">
          <p className="text-sm font-semibold text-neutral-800">
            Do you need a venue?
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[true, false].map((value) => (
              <button
                key={String(value)}
                type="button"
                onClick={() => chooseVenueNeed(value)}
                className={`h-11 rounded-full text-sm font-semibold transition ${
                  needsVenue === value
                    ? "bg-neutral-950 text-white shadow-[0_12px_24px_rgba(20,20,20,0.16)]"
                    : "border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-950"
                }`}
              >
                {value ? "Yes, find venues" : "No, I have one"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7">
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="budget"
              className="text-sm font-semibold text-neutral-800"
            >
              Budget
            </label>
            <span className="text-sm font-semibold text-neutral-950">
              ${budget.toLocaleString()}
            </span>
          </div>
          <input
            id="budget"
            type="range"
            min="1000"
            max="100000"
            step="500"
            value={budget}
            onChange={(event) => setBudget(Number(event.target.value))}
            className="mt-4 w-full accent-[#ff5a5f]"
          />
        </div>

        <fieldset className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <legend className="text-sm font-semibold text-neutral-800">
                Recommended for a {eventType.toLowerCase()}
              </legend>
              <p className="mt-1 text-sm text-neutral-500">
                These options change based on the event you pick.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowMore((current) => !current)}
              className="h-10 rounded-full border border-neutral-300 px-4 text-sm font-semibold text-neutral-950 transition hover:border-neutral-950"
            >
              {showMore ? "Show less" : "More options"}
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {recommendedServices.map((service) => (
              <ServiceToggle
                key={service}
                service={service}
                checked={activeServices.includes(service)}
                recommended
                onChange={() => toggleService(service)}
              />
            ))}
          </div>

          {showMore ? (
            <div className="mt-5 animate-[fadeUp_240ms_ease-out] rounded-lg border border-neutral-200 bg-[#fbfbfa] p-4">
              <p className="text-sm font-semibold text-neutral-800">
                Everything else available
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {optionalServices.map((service) => (
                  <ServiceToggle
                    key={service}
                    service={service}
                    checked={activeServices.includes(service)}
                    onChange={() => toggleService(service)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </fieldset>

        <Link
          href={planHref}
          className="mt-8 inline-flex h-12 items-center rounded-full bg-[#ff5a5f] px-7 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,90,95,0.25)] transition hover:-translate-y-0.5 hover:bg-[#e84f54] hover:shadow-[0_18px_36px_rgba(255,90,95,0.32)]"
        >
          Build my plan
        </Link>
      </form>

      <aside className="sticky top-24 h-fit rounded-lg bg-neutral-950 p-6 text-white shadow-[0_24px_70px_rgba(20,20,20,0.18)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ff8b8f]">
          Plan preview
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight">
          {eventType} for {guestCount.toLocaleString()} guests
        </h2>
        <div className="mt-8 space-y-4">
          <div className="rounded-lg border border-white/10 p-4">
            <p className="text-sm text-neutral-400">Booking window</p>
            <p className="mt-1 text-base font-semibold">
              {eventDate || "Choose date"} at {startTime} for {durationHours}h
            </p>
          </div>
          <div className="rounded-lg border border-white/10 p-4">
            <p className="text-sm text-neutral-400">Venue search</p>
            <p className="mt-1 text-xl font-semibold">
              {needsVenue ? "Included" : "Not needed"}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 p-4">
            <p className="text-sm text-neutral-400">Estimated budget</p>
            <p className="mt-1 text-2xl font-semibold">
              ${budget.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 p-4">
            <p className="text-sm text-neutral-400">Budget per guest</p>
            <p className="mt-1 text-2xl font-semibold">${budgetPerGuest}</p>
          </div>
          <div className="rounded-lg border border-white/10 p-4">
            <p className="text-sm text-neutral-400">Booking categories</p>
            <p className="mt-1 text-base font-semibold">
              {activeServices.length
                ? activeServices.join(", ")
                : "Choose services"}
            </p>
          </div>
        </div>
        <Link
          href={planHref}
          className="mt-8 inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100"
        >
          View matched options
        </Link>
      </aside>
    </div>
  );
}

type ServiceToggleProps = {
  service: ServiceName;
  checked: boolean;
  recommended?: boolean;
  onChange: () => void;
};

function ServiceToggle({
  service,
  checked,
  recommended,
  onChange,
}: ServiceToggleProps) {
  return (
    <label
      className={`group flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-4 text-sm font-medium transition hover:-translate-y-0.5 ${
        checked
          ? "border-neutral-950 bg-white shadow-[0_14px_28px_rgba(20,20,20,0.08)]"
          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
      }`}
    >
      <span className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 accent-[#ff5a5f]"
        />
        {service}
      </span>
      {recommended ? (
        <span className="rounded-full bg-[#fff1f1] px-2 py-1 text-[11px] font-semibold text-[#d6423d]">
          Suggested
        </span>
      ) : null}
    </label>
  );
}
