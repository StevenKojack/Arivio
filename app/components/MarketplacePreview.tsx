"use client";

import Link from "next/link";
import { marketplaceItems, quoteItem } from "../data/marketplace";
import { MarketplaceCard } from "./MarketplaceCard";

export function MarketplacePreview() {
  return (
    <section className="bg-white px-6 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e24b44]">
              Marketplace
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Curated spaces and services for every part of the plan.
            </h2>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex h-11 w-fit items-center rounded-full border border-neutral-300 px-5 text-sm font-semibold text-neutral-950 transition hover:border-neutral-950"
          >
            Browse marketplace
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {marketplaceItems.slice(0, 3).map((item) => (
            <MarketplaceCard
              key={item.id}
              available
              buttonLabel="Preview quote"
              item={item}
              quote={quoteItem(item, {
                durationHours: 3,
                guests: 40,
                startTime: "14:00",
              })}
              onAdd={() => undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
