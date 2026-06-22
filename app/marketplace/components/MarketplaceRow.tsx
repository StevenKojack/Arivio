"use client";

import { quoteItem, type MarketplaceItem, type QuoteContext } from "@/app/data/marketplace";
import { VendorCard } from "./VendorCard";

type MarketplaceRowProps = {
  activeItemId?: number | null;
  isComplete?: boolean;
  description?: string;
  hoveredItemId?: number | null;
  items: MarketplaceItem[];
  quoteContext: QuoteContext;
  rowId: string;
  selectedItems?: MarketplaceItem[];
  title: string;
  onAdd: (item: MarketplaceItem) => void;
  onHoverItem?: (itemId: number | null) => void;
  onReplace?: () => void;
  onSelectItem?: (item: MarketplaceItem) => void;
};

export function MarketplaceRow({
  activeItemId,
  description,
  hoveredItemId,
  isComplete = false,
  items,
  onAdd,
  onHoverItem,
  onReplace,
  onSelectItem,
  quoteContext,
  rowId,
  selectedItems = [],
  title,
}: MarketplaceRowProps) {
  if (!items.length) {
    return null;
  }

  if (isComplete) {
    return (
      <section className="min-w-0 rounded-[32px] border border-emerald-200 bg-[linear-gradient(135deg,#ffffff,#f7fbf8)] p-5 shadow-[0_18px_52px_rgba(20,20,20,0.05)] transition duration-300 ease-out">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Complete
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-neutral-600">
              Keeping your selected provider visible on the map.
            </p>
          </div>
          <button
            type="button"
            onClick={onReplace}
            className="h-10 rounded-full border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-900 transition hover:-translate-y-0.5 hover:border-neutral-950"
          >
            Replace
          </button>
        </div>
        <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
          {selectedItems.map((item) => (
            <div key={`${title}-selected-${item.id}`} id={`vendor-card-${item.id}`} data-row-id={rowId}>
              <VendorCard
                buttonLabel="Selected"
                isHighlighted={hoveredItemId === item.id || activeItemId === item.id}
                item={item}
                matchLabel="Selected"
                matchReason={`Chosen for ${title.toLowerCase()}. It stays pinned while you continue planning.`}
                quote={quoteItem(item, quoteContext)}
                onAdd={onAdd}
                onHover={onHoverItem}
                onSelect={onSelectItem}
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="min-w-0 rounded-[32px] border border-neutral-200 bg-[linear-gradient(135deg,#ffffff,#fbfbfa)] p-5 shadow-[0_20px_60px_rgba(20,20,20,0.06)] transition duration-300 ease-out hover:shadow-[0_26px_78px_rgba(20,20,20,0.1)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-neutral-600">{description}</p>
          ) : null}
        </div>
        <span className="rounded-full bg-[#f7f7f5] px-3 py-1 text-xs font-semibold text-neutral-600">
          {items.length}
        </span>
      </div>
      <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
        {items.map((item, index) => (
          <div key={`${title}-${item.id}`} id={`vendor-card-${item.id}`} data-row-id={rowId}>
            <VendorCard
              isHighlighted={hoveredItemId === item.id || activeItemId === item.id}
              item={item}
              matchLabel={index < 3 ? "Top match" : "Match"}
              matchReason={getMatchReason(title, item)}
              quote={quoteItem(item, quoteContext)}
              onAdd={onAdd}
              onHover={onHoverItem}
              onSelect={onSelectItem}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function getMatchReason(title: string, item: MarketplaceItem) {
  if (title === "Best matches") {
    return `Strong fit for ${item.events.slice(0, 2).join(" and ")} with ${item.services
      .slice(0, 2)
      .join(" and ")} available.`;
  }

  if (item.serviceRadiusMiles) {
    return `Serves this area within about ${item.serviceRadiusMiles} miles.`;
  }

  return `Fits the ${title.toLowerCase()} part of this event plan.`;
}
