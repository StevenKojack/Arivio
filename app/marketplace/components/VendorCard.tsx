"use client";

import type { MarketplaceItem } from "@/app/data/marketplace";

type VendorCardProps = {
  buttonLabel?: string;
  item: MarketplaceItem;
  matchLabel?: string;
  quote: number;
  onAdd: (item: MarketplaceItem) => void;
};

export function VendorCard({
  buttonLabel = "Add to quote",
  item,
  matchLabel = "Good match",
  quote,
  onAdd,
}: VendorCardProps) {
  return (
    <article className="w-[280px] shrink-0 overflow-hidden rounded-[24px] border border-neutral-200 bg-white shadow-[0_14px_38px_rgba(20,20,20,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(20,20,20,0.1)]">
      <div
        className={`h-40 bg-cover bg-center ${
          item.photoUrl ? "" : "bg-gradient-to-br from-neutral-100 to-neutral-200"
        }`}
        style={item.photoUrl ? { backgroundImage: `url(${item.photoUrl})` } : undefined}
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {item.type}
            </p>
            <h3 className="mt-2 line-clamp-2 text-lg font-semibold tracking-tight text-neutral-950">
              {item.name}
            </h3>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            {matchLabel}
          </span>
        </div>
        <p className="mt-2 text-sm font-medium text-neutral-500">{item.location}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-neutral-500">Starts around</p>
            <p className="text-lg font-semibold text-neutral-950">
              ${quote.toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAdd(item)}
            className="h-10 rounded-full bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
