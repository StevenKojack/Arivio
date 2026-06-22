"use client";

import Link from "next/link";
import { marketplaceItems, quoteItem } from "../data/marketplace";
import { MarketplaceCard } from "./MarketplaceCard";

export function MarketplacePreview() {
  return (
    <section className="relative overflow-hidden bg-[#111111] px-6 py-24 text-white sm:px-8 lg:px-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,90,95,0.18),transparent_32%),linear-gradient(135deg,#171717,#24211d)]" />
      <div className="mx-auto max-w-7xl">
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ff8a82]">
              Vendor categories
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Venues, food, entertainment, rentals, production, and support in one flow.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-neutral-300">
              Marketplace browsing should feel like discovering the right team,
              not sorting through a spreadsheet.
            </p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex h-12 w-fit items-center rounded-full bg-white px-5 text-sm font-semibold text-neutral-950 shadow-[0_18px_44px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5"
          >
            Browse marketplace
          </Link>
        </div>
        <div className="relative mt-10 grid gap-5 md:grid-cols-3">
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
