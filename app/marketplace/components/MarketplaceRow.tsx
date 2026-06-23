"use client";

import { quoteItem, type MarketplaceItem, type QuoteContext } from "@/app/data/marketplace";
import { VendorCard } from "./VendorCard";

type MarketplaceRowProps = {
  activeItemId?: number | null;
  cartedIds?: number[];
  description?: string;
  hoveredItemId?: number | null;
  items: MarketplaceItem[];
  quoteContext: QuoteContext;
  rowId: string;
  title: string;
  onAdd: (item: MarketplaceItem) => void;
  onHoverItem?: (itemId: number | null) => void;
  onSelectItem?: (item: MarketplaceItem) => void;
};

export function MarketplaceRow({
  activeItemId,
  cartedIds = [],
  description,
  hoveredItemId,
  items,
  onAdd,
  onHoverItem,
  onSelectItem,
  quoteContext,
  rowId,
  title,
}: MarketplaceRowProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="min-w-0 rounded-[30px] border border-neutral-200 bg-white p-5 shadow-[0_18px_56px_rgba(20,20,20,0.055)] transition duration-300 ease-out">
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
      <div className="mt-5 grid min-w-0 grid-cols-1 gap-x-5 gap-y-7 lg:grid-cols-2 xl:grid-cols-2">
        {items.map((item, index) => (
          <div key={`${title}-${item.id}`} id={`vendor-card-${item.id}`} data-row-id={rowId}>
            <VendorCard
              buttonLabel={cartedIds.includes(item.id) ? "Selected" : "Add to quote"}
              isHighlighted={hoveredItemId === item.id || activeItemId === item.id}
              isSelected={cartedIds.includes(item.id)}
              item={item}
              matchLabel={cartedIds.includes(item.id) ? "Selected" : index < 3 ? "Top match" : "Match"}
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
