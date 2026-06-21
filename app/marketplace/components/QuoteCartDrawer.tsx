"use client";

import Link from "next/link";
import { isAvailableAt, type MarketplaceItem } from "@/app/data/marketplace";

export type QuoteCartLine = {
  cartItemId?: string;
  id: number;
  item: MarketplaceItem;
  persisted: boolean;
  serviceEnd: string;
  serviceStart: string;
};

type QuoteCartDrawerProps = {
  canSaveCart: boolean;
  cart: QuoteCartLine[];
  cartMessage: string;
  eventSummary: string;
  getLineQuote: (line: QuoteCartLine) => number;
  isRequestingQuotes: boolean;
  onRemove: (itemId: number) => void;
  onRequestQuotes: () => void;
  onUpdateTime: (
    itemId: number,
    field: "serviceStart" | "serviceEnd",
    value: string,
  ) => void;
};

export function QuoteCartDrawer({
  canSaveCart,
  cart,
  cartMessage,
  eventSummary,
  getLineQuote,
  isRequestingQuotes,
  onRemove,
  onRequestQuotes,
  onUpdateTime,
}: QuoteCartDrawerProps) {
  const total = cart.reduce((sum, line) => sum + getLineQuote(line), 0);

  return (
    <aside className="sticky top-24 h-fit rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_22px_70px_rgba(20,20,20,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Quote cart
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {cart.length} selected
          </h2>
        </div>
        <span className="rounded-full bg-[#f7f7f5] px-3 py-1 text-sm font-semibold text-neutral-700">
          ${total.toLocaleString()}
        </span>
      </div>

      <p className="mt-4 rounded-2xl bg-[#f7f7f5] px-4 py-3 text-sm text-neutral-600">
        {eventSummary}
      </p>

      {!canSaveCart ? (
        <Link
          href="/auth/login"
          className="mt-4 block rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-950"
        >
          Log in to save your quote cart.
        </Link>
      ) : null}

      {cartMessage ? (
        <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {cartMessage}
        </p>
      ) : null}

      <div className="mt-5 space-y-3">
        {cart.length ? (
          cart.map((line) => (
          <CartLineCard
              key={line.item.id}
              line={line}
              quote={getLineQuote(line)}
              onRemove={onRemove}
              onUpdateTime={onUpdateTime}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-5 text-sm leading-6 text-neutral-500">
            Add vendors from the rows to build a clean quote estimate.
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-neutral-100 pt-5">
        <div className="flex items-end justify-between">
          <p className="text-sm text-neutral-500">Estimated total</p>
          <p className="text-3xl font-semibold">${total.toLocaleString()}</p>
        </div>
        <button
          type="button"
          onClick={onRequestQuotes}
          disabled={isRequestingQuotes}
          className="mt-5 h-12 w-full rounded-full bg-neutral-950 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRequestingQuotes ? "Requesting..." : "Request quotes"}
        </button>
      </div>
    </aside>
  );
}

function CartLineCard({
  line,
  onRemove,
  onUpdateTime,
  quote,
}: {
  line: QuoteCartLine;
  onRemove: (itemId: number) => void;
  onUpdateTime: (
    itemId: number,
    field: "serviceStart" | "serviceEnd",
    value: string,
  ) => void;
  quote: number;
}) {
  const lineAvailable = isAvailableAt(
    line.item,
    undefined,
    line.serviceStart,
    line.serviceEnd,
  );

  return (
    <div className="rounded-2xl border border-neutral-200 bg-[#fbfbfa] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-neutral-950">{line.item.name}</p>
          <p className="mt-1 text-xs font-medium text-neutral-500">
            {line.item.type} - {line.item.pricing.label}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(line.item.id)}
          className="text-xs font-semibold text-neutral-500 transition hover:text-neutral-950"
        >
          Remove
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <CartTimeField
          label="Start"
          value={line.serviceStart}
          onChange={(value) => onUpdateTime(line.item.id, "serviceStart", value)}
        />
        <CartTimeField
          label="End"
          value={line.serviceEnd}
          onChange={(value) => onUpdateTime(line.item.id, "serviceEnd", value)}
        />
      </div>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-xl font-semibold">${quote.toLocaleString()}</p>
        <p
          className={`text-xs font-semibold ${
            lineAvailable ? "text-emerald-700" : "text-amber-700"
          }`}
        >
          {lineAvailable ? "Available" : "Check time"}
        </p>
      </div>
    </div>
  );
}

function CartTimeField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
      {label}
      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-9 w-full rounded-xl border border-neutral-200 bg-white px-2 text-sm text-neutral-950"
      />
    </label>
  );
}
