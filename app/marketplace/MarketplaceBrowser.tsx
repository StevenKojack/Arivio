"use client";

import { useMemo, useState } from "react";
import { MarketplaceCard } from "../components/MarketplaceCard";
import { marketplaceItems, marketplaceTypes } from "../data/marketplace";

export function MarketplaceBrowser() {
  const [selectedType, setSelectedType] =
    useState<(typeof marketplaceTypes)[number]>("All");
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    return marketplaceItems.filter((item) => {
      const matchesType = selectedType === "All" || item.type === selectedType;
      const searchText = `${item.name} ${item.location} ${item.tags.join(" ")}`;
      const matchesQuery = searchText.toLowerCase().includes(query.toLowerCase());

      return matchesType && matchesQuery;
    });
  }, [query, selectedType]);

  return (
    <div>
      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-[0_18px_44px_rgba(20,20,20,0.05)]">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, city, or event type"
            className="h-12 rounded-lg border border-neutral-300 px-4 text-sm font-medium outline-none transition focus:border-neutral-950"
          />
          <div className="flex flex-wrap gap-2">
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
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((item) => (
          <MarketplaceCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
