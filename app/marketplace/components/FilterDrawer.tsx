"use client";

import type { EventType, ServiceName } from "@/app/data/marketplace";

type FilterDrawerProps = {
  eventTypes: EventType[];
  isOpen: boolean;
  query: string;
  selectedEvent: EventType | "All";
  selectedServices: ServiceName[];
  serviceOptions: ServiceName[];
  onClose: () => void;
  onEventChange: (eventType: EventType | "All") => void;
  onQueryChange: (value: string) => void;
  onToggleService: (service: ServiceName) => void;
};

export function FilterDrawer({
  eventTypes,
  isOpen,
  onClose,
  onEventChange,
  onQueryChange,
  onToggleService,
  query,
  selectedEvent,
  selectedServices,
  serviceOptions,
}: FilterDrawerProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-950/30 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-2xl rounded-[28px] bg-white p-5 shadow-[0_34px_120px_rgba(20,20,20,0.22)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Filters
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Refine marketplace
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-full border border-neutral-200 px-4 text-sm font-semibold transition hover:border-neutral-950"
          >
            Done
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search vendors, cities, or services"
            className="h-12 rounded-2xl border border-neutral-300 px-4 text-sm font-semibold outline-none transition focus:border-neutral-950"
          />
          <select
            value={selectedEvent}
            onChange={(event) => onEventChange(event.target.value as EventType | "All")}
            className="h-12 rounded-2xl border border-neutral-300 bg-white px-4 text-sm font-semibold outline-none transition focus:border-neutral-950"
          >
            <option>All</option>
            {eventTypes.map((eventType) => (
              <option key={eventType}>{eventType}</option>
            ))}
          </select>
          <div>
            <p className="text-sm font-semibold text-neutral-800">Services</p>
            <div className="mt-3 flex max-h-52 flex-wrap gap-2 overflow-y-auto">
              {serviceOptions.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => onToggleService(service)}
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
        </div>
      </div>
    </div>
  );
}
