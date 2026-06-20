"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { eventTypes } from "../data/marketplace";

const serviceOptions = [
  "Venue",
  "Catering",
  "Entertainment",
  "Rentals",
  "Invitations",
  "Photography",
];

export function PlannerForm() {
  const [eventType, setEventType] = useState("Wedding");
  const [guestCount, setGuestCount] = useState(120);
  const [budget, setBudget] = useState(15000);
  const [services, setServices] = useState(["Venue", "Catering", "Rentals"]);

  const budgetPerGuest = useMemo(
    () => Math.round(budget / Math.max(guestCount, 1)),
    [budget, guestCount],
  );

  function toggleService(service: string) {
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
              onChange={(event) => setEventType(event.target.value)}
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
          <legend className="text-sm font-semibold text-neutral-800">
            Services needed
          </legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {serviceOptions.map((service) => (
              <label
                key={service}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 p-4 text-sm font-medium text-neutral-700 transition hover:border-neutral-400"
              >
                <input
                  type="checkbox"
                  checked={services.includes(service)}
                  onChange={() => toggleService(service)}
                  className="h-4 w-4 accent-[#ff5a5f]"
                />
                {service}
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          className="mt-8 h-12 rounded-full bg-[#ff5a5f] px-7 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,90,95,0.25)] transition hover:bg-[#e84f54]"
        >
          Build my plan
        </button>
      </form>

      <aside className="rounded-lg bg-neutral-950 p-6 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ff8b8f]">
          Plan preview
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight">
          {eventType} for {guestCount.toLocaleString()} guests
        </h2>
        <div className="mt-8 space-y-4">
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
            <p className="text-sm text-neutral-400">Shortlist focus</p>
            <p className="mt-1 text-base font-semibold">
              {services.length ? services.join(", ") : "Choose services"}
            </p>
          </div>
        </div>
        <Link
          href="/marketplace"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-neutral-950"
        >
          View matched options
        </Link>
      </aside>
    </div>
  );
}
