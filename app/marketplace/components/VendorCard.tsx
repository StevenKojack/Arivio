"use client";

import type { MarketplaceItem } from "@/app/data/marketplace";

type VendorCardProps = {
  buttonLabel?: string;
  isHighlighted?: boolean;
  item: MarketplaceItem;
  matchLabel?: string;
  matchReason?: string;
  quote: number;
  onAdd: (item: MarketplaceItem) => void;
  onHover?: (itemId: number | null) => void;
  onSelect?: (item: MarketplaceItem) => void;
};

export function VendorCard({
  buttonLabel = "Add to quote",
  isHighlighted = false,
  item,
  matchLabel = "Good match",
  matchReason = "Fits your event details and timing.",
  onHover,
  onSelect,
  quote,
  onAdd,
}: VendorCardProps) {
  const tags = [
    item.type,
    ...(item.tags ?? []),
    ...(item.cultures ?? []),
  ].slice(0, 3);

  return (
    <article
      onClick={() => onSelect?.(item)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.(item);
        }
      }}
      onMouseEnter={() => onHover?.(item.id)}
      onMouseLeave={() => onHover?.(null)}
      role="button"
      tabIndex={0}
      className={`w-[min(78vw,292px)] shrink-0 snap-start overflow-hidden rounded-[26px] border bg-white shadow-[0_14px_38px_rgba(20,20,20,0.06)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(20,20,20,0.12)] ${
        isHighlighted
          ? "border-neutral-950 ring-4 ring-neutral-950/10"
          : "border-neutral-200"
      }`}
    >
      <div className="relative h-40 overflow-hidden bg-[#f2f0ec]">
        <div
          className={`h-full bg-cover bg-center transition duration-500 hover:scale-105 ${
            item.photoUrl ? "" : "bg-[radial-gradient(circle_at_20%_20%,#ffffff,transparent_34%),linear-gradient(135deg,#ece7df,#f7f7f5)]"
          }`}
          style={item.photoUrl ? { backgroundImage: `url(${item.photoUrl})` } : undefined}
        />
        {!item.photoUrl ? (
          <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-white/70 px-4 py-3 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Arivio verified
            </p>
          </div>
        ) : null}
      </div>
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
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-600">
          {matchReason}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#f7f7f5] px-2.5 py-1 text-xs font-semibold text-neutral-600"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-neutral-500">Starts around</p>
            <p className="text-lg font-semibold text-neutral-950">
              ${quote.toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAdd(item);
            }}
            className="h-10 rounded-full bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
