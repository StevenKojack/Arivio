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
  const imageUrl = item.photoUrl ?? getVendorImage(item);
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
      className={`w-[min(82vw,328px)] shrink-0 snap-start overflow-hidden rounded-[28px] border bg-white shadow-[0_14px_38px_rgba(20,20,20,0.06)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(20,20,20,0.12)] ${
        isHighlighted
          ? "border-neutral-950 ring-4 ring-neutral-950/10"
          : "border-neutral-200"
      }`}
    >
      <div className="relative h-48 overflow-hidden bg-[#f2f0ec]">
        <div
          className="h-full bg-cover bg-center transition duration-500 hover:scale-105"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_38%,rgba(0,0,0,0.55))]" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-900 backdrop-blur">
            {item.type}
          </span>
          <span className="rounded-full bg-neutral-950/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {matchLabel}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {item.location}
            </p>
            <h3 className="mt-2 line-clamp-2 text-lg font-semibold tracking-tight text-neutral-950">
              {item.name}
            </h3>
          </div>
          <span className="shrink-0 rounded-full bg-[#f7f7f5] px-2.5 py-1 text-xs font-semibold text-neutral-700">
            {item.rating.toFixed(1)}
          </span>
        </div>
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

const categoryImages: Partial<Record<MarketplaceItem["type"], string>> = {
  Venue:
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80",
  Catering:
    "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=80",
  "Cake & Desserts":
    "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80",
  DJ:
    "https://images.unsplash.com/photo-1571266028243-d220c9c3b84d?auto=format&fit=crop&w=900&q=80",
  "Live Music":
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
  Magic:
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80",
  "Character Performers":
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
  "Photo Booth":
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
  Rentals:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80",
  Photography:
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
  Florals:
    "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=80",
  "AV Production":
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
  Registration:
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80",
  Transportation:
    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=900&q=80",
  Security:
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80",
  Staffing:
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
  "Booth Rentals":
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80",
  "Portable Restrooms":
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
};

function getVendorImage(item: MarketplaceItem) {
  if (item.name.toLowerCase().includes("scooter")) {
    return "https://images.unsplash.com/photo-1560506840-ec148e82a604?auto=format&fit=crop&w=900&q=80";
  }

  if (item.name.toLowerCase().includes("raceway")) {
    return "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=900&q=80";
  }

  return (
    categoryImages[item.type] ??
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=80"
  );
}
