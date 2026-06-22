"use client";

import { useMemo, useState } from "react";

export type AddressSuggestion = {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  context: "likely_home" | "likely_venue";
  label: string;
  neighborhood: string;
};

type AddressAutocompleteProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  selectedAddress?: string;
};

const mockAddressSuggestions: AddressSuggestion[] = [
  {
    address: "743 S Lucerne Blvd, Los Angeles, CA 90005",
    context: "likely_venue",
    coordinates: { lat: 34.0615, lng: -118.3245 },
    label: "The Ebell of Los Angeles",
    neighborhood: "Mid-Wilshire",
  },
  {
    address: "665 W Jefferson Blvd, Los Angeles, CA 90007",
    context: "likely_venue",
    coordinates: { lat: 34.0238, lng: -118.2819 },
    label: "Shrine Auditorium & Expo Hall",
    neighborhood: "University Park",
  },
  {
    address: "7001 Franklin Ave, Hollywood, CA 90028",
    context: "likely_venue",
    coordinates: { lat: 34.1041, lng: -118.3417 },
    label: "The Magic Castle",
    neighborhood: "Hollywood",
  },
  {
    address: "2651 S La Cienega Blvd, Los Angeles, CA 90034",
    context: "likely_venue",
    coordinates: { lat: 34.0332, lng: -118.3769 },
    label: "SmogShoppe",
    neighborhood: "Culver City",
  },
  {
    address: "123 Maple Ave, Los Angeles, CA 90004",
    context: "likely_home",
    coordinates: { lat: 34.0762, lng: -118.3091 },
    label: "Private residence",
    neighborhood: "Los Angeles",
  },
];

export function AddressAutocomplete({
  label,
  onChange,
  onSelect,
  selectedAddress,
  value,
}: AddressAutocompleteProps) {
  const [isFocused, setIsFocused] = useState(false);
  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();

    if (!query) {
      return mockAddressSuggestions.slice(0, 3);
    }

    return mockAddressSuggestions
      .filter((suggestion) =>
        `${suggestion.label} ${suggestion.address} ${suggestion.neighborhood}`
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 4);
  }, [value]);

  return (
    <div className="relative">
      <label className="text-sm font-semibold text-neutral-800">
        {label}
        <input
          value={value}
          onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Start typing a venue or address"
          className="mt-2 h-14 w-full rounded-[22px] border border-neutral-200 bg-white px-4 text-sm font-semibold outline-none shadow-[0_12px_34px_rgba(20,20,20,0.05)] transition focus:border-neutral-950"
        />
      </label>

      {isFocused && suggestions.length ? (
        <div className="absolute left-0 right-0 top-[76px] z-30 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-[0_22px_70px_rgba(20,20,20,0.16)]">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.address}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(suggestion)}
              className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition hover:-translate-y-0.5 hover:bg-[#f7f7f5]"
            >
              <span>
                <span className="block text-sm font-semibold text-neutral-950">
                  {suggestion.label}
                </span>
                <span className="mt-1 block text-xs text-neutral-500">
                  {suggestion.address}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white">
                Use
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {selectedAddress ? (
        <div className="mt-4 rounded-[24px] border border-neutral-200 bg-white p-4 shadow-[0_18px_48px_rgba(20,20,20,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
            Selected address
          </p>
          <p className="mt-1 text-sm font-semibold text-neutral-800">
            {selectedAddress}
          </p>
          <div className="relative mt-3 h-36 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#e9eee8,#f7f3ed)]">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.45)_1px,transparent_1px)] bg-[size:30px_30px]" />
            <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full bg-neutral-950 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(20,20,20,0.28)]">
              A
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
