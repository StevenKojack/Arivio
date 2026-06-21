"use client";

import { quoteItem, type MarketplaceItem, type QuoteContext } from "@/app/data/marketplace";
import { VendorCard } from "./VendorCard";

type MarketplaceRowProps = {
  description?: string;
  items: MarketplaceItem[];
  quoteContext: QuoteContext;
  title: string;
  onAdd: (item: MarketplaceItem) => void;
};

export function MarketplaceRow({
  description,
  items,
  onAdd,
  quoteContext,
  title,
}: MarketplaceRowProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_18px_50px_rgba(20,20,20,0.05)]">
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
      <div className="mt-5 flex gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]">
        {items.map((item, index) => (
          <VendorCard
            key={`${title}-${item.id}`}
            item={item}
            matchLabel={index < 3 ? "Top match" : "Match"}
            quote={quoteItem(item, quoteContext)}
            onAdd={onAdd}
          />
        ))}
      </div>
    </section>
  );
}
