"use client";

import type { MarketplaceItem } from "../data/marketplace";

type MarketplaceCardProps = {
  available: boolean;
  buttonLabel?: string;
  item: MarketplaceItem;
  quote: number;
  onAdd: (item: MarketplaceItem) => void;
};

export function MarketplaceCard({
  available,
  buttonLabel = "Add to cart",
  item,
  quote,
  onAdd,
}: MarketplaceCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-[0_18px_44px_rgba(20,20,20,0.06)] transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_24px_58px_rgba(20,20,20,0.1)]">
      <div className="h-2 bg-[#ff5a5f]" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#e24b44]">
              {item.type}
            </p>
            <h3 className="mt-3 text-xl font-semibold tracking-tight text-neutral-950">
              {item.name}
            </h3>
          </div>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-semibold text-neutral-800">
            {item.rating.toFixed(2)}
          </span>
        </div>
        <p className="mt-3 text-sm font-medium text-neutral-500">{item.location}</p>
        <p className="mt-4 flex-1 text-sm leading-6 text-neutral-600">
          {item.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {item.events.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {item.services.slice(0, 3).map((service) => (
            <span
              key={service}
              className="rounded-full bg-[#fff5f5] px-3 py-1 text-xs font-semibold text-[#c33d38]"
            >
              {service}
            </span>
          ))}
        </div>

        <div className="mt-5 rounded-lg bg-[#f7f7f5] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Quote
              </p>
              <p className="mt-1 text-2xl font-semibold text-neutral-950">
                ${quote.toLocaleString()}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                available
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {available ? "Available" : "Check time"}
            </span>
          </div>
          <p className="mt-2 text-xs text-neutral-500">{item.pricing.label}</p>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
          <div>
            <p className="text-xs text-neutral-500">Listed from</p>
            <p className="text-lg font-semibold text-neutral-950">{item.price}</p>
          </div>
          <button
            type="button"
            onClick={() => onAdd(item)}
            className="inline-flex h-10 items-center rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
