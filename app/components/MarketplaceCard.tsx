import Link from "next/link";
import type { MarketplaceItem } from "../data/marketplace";

type MarketplaceCardProps = {
  item: MarketplaceItem;
};

export function MarketplaceCard({ item }: MarketplaceCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-lg border border-neutral-200 bg-white p-5 shadow-[0_18px_44px_rgba(20,20,20,0.06)] transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_24px_58px_rgba(20,20,20,0.1)]">
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
      <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
        <div>
          <p className="text-xs text-neutral-500">From</p>
          <p className="text-lg font-semibold text-neutral-950">{item.price}</p>
        </div>
        <Link
          href="/plan"
          className="inline-flex h-10 items-center rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          Add to plan
        </Link>
      </div>
    </article>
  );
}
