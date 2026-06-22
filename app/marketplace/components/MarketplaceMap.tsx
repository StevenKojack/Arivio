"use client";

import { useMemo } from "react";
import type { Coordinates, MarketplaceItem, ServiceName } from "@/app/data/marketplace";
import { getMapboxStaticMapUrl, hasMapboxConfig } from "@/lib/maps/config";

export type MarketplaceMapPin = {
  isActiveRowMatch: boolean;
  isCarted: boolean;
  item: MarketplaceItem;
};

type MarketplaceMapProps = {
  activeCategory: string;
  cartedIds: number[];
  eventCoordinates?: Coordinates;
  hoveredItemId: number | null;
  pins: MarketplaceMapPin[];
  selectedItemId: number | null;
  onHoverItem: (itemId: number | null) => void;
  onSelectItem: (item: MarketplaceItem) => void;
};

const categoryColors: Partial<Record<ServiceName, string>> = {
  Venue: "#111111",
  Catering: "#7a4f2b",
  DJ: "#4f46e5",
  "Live Music": "#4f46e5",
  Rentals: "#0f766e",
  Photography: "#7c3aed",
  "Photo Booth": "#7c3aed",
  Security: "#b45309",
  Staffing: "#b45309",
  Transportation: "#0369a1",
};

export function MarketplaceMap({
  activeCategory,
  cartedIds,
  eventCoordinates,
  hoveredItemId,
  pins,
  selectedItemId,
  onHoverItem,
  onSelectItem,
}: MarketplaceMapProps) {
  const visiblePoints = useMemo(() => {
    const points = pins.map((pin) => pin.item.coordinates);
    return eventCoordinates ? [eventCoordinates, ...points] : points;
  }, [eventCoordinates, pins]);
  const bounds = useMemo(() => getBounds(visiblePoints), [visiblePoints]);
  const center = eventCoordinates ?? getCenter(visiblePoints);
  const staticMapUrl = getMapboxStaticMapUrl({
    center,
    height: 720,
    width: 1280,
    zoom: eventCoordinates ? 10 : 9,
  });

  return (
    <section className="sticky top-24 overflow-hidden rounded-[34px] border border-neutral-200 bg-[#e9eee8] shadow-[0_28px_90px_rgba(20,20,20,0.14)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/70 bg-white/85 px-5 py-4 backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Live marketplace map
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
            {activeCategory}
          </h2>
        </div>
        <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white">
          {pins.length} pins
        </span>
      </div>
      <div className="relative min-h-[520px] overflow-hidden">
        {staticMapUrl ? (
          <div
            aria-label="Mapbox map preview"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${staticMapUrl})` }}
          />
        ) : (
          <FallbackMapBackground />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.22))]" />

        {eventCoordinates ? (
          <MapMarker
            label="Event"
            position={toPosition(eventCoordinates, bounds)}
            tone="event"
          />
        ) : null}

        {pins.map((pin) => {
          const isHovered = hoveredItemId === pin.item.id;
          const isSelected = selectedItemId === pin.item.id;
          const isCarted = cartedIds.includes(pin.item.id) || pin.isCarted;
          const color = categoryColors[pin.item.type] ?? "#111111";

          return (
            <button
              key={pin.item.id}
              type="button"
              onClick={() => onSelectItem(pin.item)}
              onMouseEnter={() => onHoverItem(pin.item.id)}
              onMouseLeave={() => onHoverItem(null)}
              className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white text-xs font-semibold text-white shadow-[0_18px_44px_rgba(20,20,20,0.25)] transition duration-200 hover:-translate-y-[58%] ${
                isSelected || isHovered
                  ? "px-4 py-2 scale-110"
                  : isCarted
                    ? "px-3.5 py-2 ring-4 ring-[#ff5a5f]/25"
                    : pin.isActiveRowMatch
                      ? "px-3.5 py-2"
                      : "px-3 py-1.5 opacity-80"
              }`}
              style={{
                backgroundColor: isCarted ? "#ff5a5f" : color,
                left: `${toPosition(pin.item.coordinates, bounds).x}%`,
                top: `${toPosition(pin.item.coordinates, bounds).y}%`,
              }}
            >
              {isCarted ? "Cart" : pin.item.type}
              {(isHovered || isSelected) ? (
                <span className="absolute left-1/2 top-[calc(100%+8px)] w-56 -translate-x-1/2 rounded-2xl bg-white p-3 text-left text-neutral-950 shadow-[0_22px_60px_rgba(20,20,20,0.18)]">
                  <span className="block text-sm font-semibold">{pin.item.name}</span>
                  <span className="mt-1 block text-xs leading-5 text-neutral-600">
                    {pin.item.location} · {pin.item.price}
                  </span>
                </span>
              ) : null}
            </button>
          );
        })}

        <div className="absolute bottom-5 left-5 right-5 rounded-3xl bg-white/90 p-4 shadow-[0_18px_50px_rgba(20,20,20,0.12)] backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-neutral-950">
              {hasMapboxConfig()
                ? "Mapbox static map active"
                : "Mock map fallback active"}
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <LegendDot color="#111111" label="active row" />
              <LegendDot color="#ff5a5f" label="carted" />
              <LegendDot color="#3b82f6" label="event" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FallbackMapBackground() {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(135deg,#e6ece6,#f4efe8)]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute left-[12%] top-[24%] h-24 w-[70%] -rotate-6 rounded-full border border-white/70" />
      <div className="absolute left-[18%] top-[54%] h-28 w-[64%] rotate-12 rounded-full border border-white/70" />
    </div>
  );
}

function MapMarker({
  label,
  position,
  tone,
}: {
  label: string;
  position: { x: number; y: number };
  tone: "event";
}) {
  return (
    <div
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-[0_18px_44px_rgba(20,20,20,0.25)]"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
      {tone === "event" ? label : label}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-neutral-600">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function getBounds(points: Coordinates[]) {
  if (!points.length) {
    return {
      maxLat: 34.22,
      maxLng: -118.12,
      minLat: 33.95,
      minLng: -118.52,
    };
  }

  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latPadding = Math.max((maxLat - minLat) * 0.2, 0.025);
  const lngPadding = Math.max((maxLng - minLng) * 0.2, 0.025);

  return {
    maxLat: maxLat + latPadding,
    maxLng: maxLng + lngPadding,
    minLat: minLat - latPadding,
    minLng: minLng - lngPadding,
  };
}

function getCenter(points: Coordinates[]) {
  const bounds = getBounds(points);

  return {
    lat: (bounds.minLat + bounds.maxLat) / 2,
    lng: (bounds.minLng + bounds.maxLng) / 2,
  };
}

function toPosition(point: Coordinates, bounds: ReturnType<typeof getBounds>) {
  const x =
    ((point.lng - bounds.minLng) / Math.max(bounds.maxLng - bounds.minLng, 0.01)) *
      82 +
    9;
  const y =
    91 -
    ((point.lat - bounds.minLat) / Math.max(bounds.maxLat - bounds.minLat, 0.01)) *
      82;

  return { x, y };
}
