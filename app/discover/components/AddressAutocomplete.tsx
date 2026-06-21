"use client";

import { useMemo, useState } from "react";

export type AddressSuggestion = {
  address: string;
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
    label: "The Ebell of Los Angeles",
    neighborhood: "Mid-Wilshire",
  },
  {
    address: "665 W Jefferson Blvd, Los Angeles, CA 90007",
    label: "Shrine Auditorium & Expo Hall",
    neighborhood: "University Park",
  },
  {
    address: "7001 Franklin Ave, Hollywood, CA 90028",
    label: "The Magic Castle",
    neighborhood: "Hollywood",
  },
  {
    address: "2651 S La Cienega Blvd, Los Angeles, CA 90034",
    label: "SmogShoppe",
    neighborhood: "Culver City",
  },
  {
    address: "Los Angeles, CA",
    label: "Home or private address",
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
          className="mt-2 h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm font-semibold outline-none transition focus:border-neutral-950"
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
              className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#f7f7f5]"
            >
              <span>
                <span className="block text-sm font-semibold text-neutral-950">
                  {suggestion.label}
                </span>
                <span className="mt-1 block text-xs text-neutral-500">
                  {suggestion.address}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                Use
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {selectedAddress ? (
        <div className="mt-3 rounded-2xl border border-neutral-200 bg-[#fbfbfa] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
            Selected address
          </p>
          <p className="mt-1 text-sm font-semibold text-neutral-800">
            {selectedAddress}
          </p>
          <div className="mt-3 h-28 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#ece7df,#f7f7f5)]">
            <div className="h-full w-full bg-[linear-gradient(90deg,rgba(255,255,255,0.42)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.42)_1px,transparent_1px)] bg-[size:28px_28px]" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
