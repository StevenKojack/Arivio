"use client";

import { useEffect, useMemo, useRef } from "react";
import mapboxgl, { type LngLatBoundsLike, type Map as MapboxMap } from "mapbox-gl";
import type { Coordinates, MarketplaceItem, ServiceName } from "@/app/data/marketplace";
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE_ID, hasMapboxConfig } from "@/lib/maps/config";

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
  layout?: "panel" | "sheet" | "sticky";
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
  Florals: "#be185d",
  Magic: "#6d28d9",
  "Character Performers": "#db2777",
  Security: "#b45309",
  Staffing: "#b45309",
  Transportation: "#0369a1",
  "Portable Restrooms": "#475569",
};

const fallbackBounds = {
  maxLat: 34.32,
  maxLng: -118.05,
  minLat: 33.88,
  minLng: -118.55,
};

export function MarketplaceMap({
  activeCategory,
  cartedIds,
  eventCoordinates,
  hoveredItemId,
  layout = "sticky",
  pins,
  selectedItemId,
  onHoverItem,
  onSelectItem,
}: MarketplaceMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markerRefs = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const isSheet = layout === "sheet";
  const isSticky = layout === "sticky";
  const visiblePoints = useMemo(() => {
    const points = pins.map((pin) => pin.item.coordinates);
    return eventCoordinates ? [eventCoordinates, ...points] : points;
  }, [eventCoordinates, pins]);
  const bounds = useMemo(() => getBounds(visiblePoints), [visiblePoints]);
  const center = eventCoordinates ?? getCenter(visiblePoints);
  const hasInteractiveMap = hasMapboxConfig();

  useEffect(() => {
    if (!hasInteractiveMap || !mapContainerRef.current || mapRef.current) {
      return;
    }

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    const map = new mapboxgl.Map({
      attributionControl: false,
      center: [center.lng, center.lat],
      container: mapContainerRef.current,
      cooperativeGestures: true,
      dragRotate: false,
      pitchWithRotate: false,
      scrollZoom: true,
      style: getMapboxStyleUrl(),
      zoom: eventCoordinates ? 10 : 9,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");
    map.on("load", () => map.resize());
    window.setTimeout(() => map.resize(), 0);
    mapRef.current = map;

    return () => {
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      popupRef.current?.remove();
      popupRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [center.lat, center.lng, eventCoordinates, hasInteractiveMap]);

  useEffect(() => {
    if (!mapRef.current || !hasInteractiveMap) {
      return;
    }

    window.setTimeout(() => mapRef.current?.resize(), 0);
  }, [hasInteractiveMap, layout]);

  useEffect(() => {
    if (!mapRef.current || !hasInteractiveMap) {
      return;
    }

    const map = mapRef.current;

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];
    popupRef.current?.remove();
    popupRef.current = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: "260px",
      offset: 18,
    });

    if (eventCoordinates) {
      const eventMarker = new mapboxgl.Marker({
        element: createEventMarker(),
      })
        .setLngLat([eventCoordinates.lng, eventCoordinates.lat])
        .addTo(map);
      markerRefs.current.push(eventMarker);
    }

    pins.forEach((pin) => {
      const isHovered = hoveredItemId === pin.item.id;
      const isSelected = selectedItemId === pin.item.id;
      const isCarted = cartedIds.includes(pin.item.id) || pin.isCarted;
      const markerElement = createProviderMarker({
        color: categoryColors[pin.item.type] ?? "#111111",
        isActive: pin.isActiveRowMatch,
        isCarted,
        isHovered,
        isSelected,
        label: isCarted ? "Cart" : pin.item.type,
      });

      markerElement.addEventListener("mouseenter", () => {
        onHoverItem(pin.item.id);
        popupRef.current
          ?.setLngLat([pin.item.coordinates.lng, pin.item.coordinates.lat])
          .setHTML(getPopupHtml(pin.item))
          .addTo(map);
      });
      markerElement.addEventListener("mouseleave", () => {
        onHoverItem(null);
        popupRef.current?.remove();
      });
      markerElement.addEventListener("click", () => {
        onSelectItem(pin.item);
        popupRef.current
          ?.setLngLat([pin.item.coordinates.lng, pin.item.coordinates.lat])
          .setHTML(getPopupHtml(pin.item))
          .addTo(map);
      });

      const marker = new mapboxgl.Marker({ element: markerElement })
        .setLngLat([pin.item.coordinates.lng, pin.item.coordinates.lat])
        .addTo(map);
      markerRefs.current.push(marker);
    });
  }, [
    cartedIds,
    eventCoordinates,
    hasInteractiveMap,
    hoveredItemId,
    onHoverItem,
    onSelectItem,
    pins,
    selectedItemId,
  ]);

  useEffect(() => {
    if (!mapRef.current || !hasInteractiveMap) {
      return;
    }

    const map = mapRef.current;
    const nextBounds = toLngLatBounds(bounds);

    if (!visiblePoints.length) {
      map.easeTo({
        center: [center.lng, center.lat],
        duration: 450,
        zoom: 9,
      });
      return;
    }

    map.fitBounds(nextBounds, {
      duration: 650,
      maxZoom: eventCoordinates ? 12 : 10.5,
      padding: isSheet
        ? { bottom: 86, left: 36, right: 36, top: 82 }
        : { bottom: 96, left: 56, right: 56, top: 92 },
    });
  }, [bounds, center.lat, center.lng, eventCoordinates, hasInteractiveMap, isSheet, visiblePoints.length]);

  return (
    <section
      className={`overflow-hidden rounded-[34px] border border-neutral-200 bg-[#e9eee8] shadow-[0_28px_90px_rgba(20,20,20,0.14)] ${
        isSticky ? "sticky top-24" : "relative"
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/70 bg-white/85 px-5 py-4 backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Interactive marketplace map
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
            {activeCategory}
          </h2>
        </div>
        <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white">
          {pins.length} pins
        </span>
      </div>
      <div
        className={`relative overflow-hidden ${
          isSheet
            ? "h-[68vh] min-h-[420px]"
            : "h-[calc(100vh-15rem)] min-h-[500px]"
        }`}
      >
        {hasInteractiveMap ? (
          <div className="absolute inset-0">
            <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
          </div>
        ) : (
          <FallbackMap
            bounds={bounds}
            cartedIds={cartedIds}
            eventCoordinates={eventCoordinates}
            hoveredItemId={hoveredItemId}
            pins={pins}
            selectedItemId={selectedItemId}
            onHoverItem={onHoverItem}
            onSelectItem={onSelectItem}
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.38),transparent)]" />

        <div className="absolute bottom-5 left-5 right-5 rounded-3xl bg-white/90 p-4 shadow-[0_18px_50px_rgba(20,20,20,0.12)] backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-neutral-950">
              {hasInteractiveMap
                ? "Mapbox GL active - drag, pan, and zoom"
                : "Mock map fallback active"}
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <LegendDot color="#111111" label="active row" />
              <LegendDot color="#ff5a5f" label="carted" />
              <LegendDot color="#2563eb" label="event" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FallbackMap({
  bounds,
  cartedIds,
  eventCoordinates,
  hoveredItemId,
  pins,
  selectedItemId,
  onHoverItem,
  onSelectItem,
}: {
  bounds: ReturnType<typeof getBounds>;
  cartedIds: number[];
  eventCoordinates?: Coordinates;
  hoveredItemId: number | null;
  pins: MarketplaceMapPin[];
  selectedItemId: number | null;
  onHoverItem: (itemId: number | null) => void;
  onSelectItem: (item: MarketplaceItem) => void;
}) {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(135deg,#e6ece6,#f4efe8)]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute left-[12%] top-[24%] h-24 w-[70%] -rotate-6 rounded-full border border-white/70" />
      <div className="absolute left-[18%] top-[54%] h-28 w-[64%] rotate-12 rounded-full border border-white/70" />

      {eventCoordinates ? (
        <MapMarker label="Event" position={toPosition(eventCoordinates, bounds)} />
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
                ? "scale-110 px-4 py-2"
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
          </button>
        );
      })}
    </div>
  );
}

function createProviderMarker({
  color,
  isActive,
  isCarted,
  isHovered,
  isSelected,
  label,
}: {
  color: string;
  isActive: boolean;
  isCarted: boolean;
  isHovered: boolean;
  isSelected: boolean;
  label: string;
}) {
  const marker = document.createElement("button");
  marker.type = "button";
  marker.textContent = label;
  marker.style.backgroundColor = isCarted ? "#ff5a5f" : color;
  marker.className = [
    "rounded-full",
    "border-2",
    "border-white",
    "px-3",
    "py-1.5",
    "text-xs",
    "font-semibold",
    "text-white",
    "shadow-[0_18px_44px_rgba(20,20,20,0.25)]",
    "transition",
    "duration-200",
    "hover:scale-110",
    isCarted ? "ring-4 ring-[#ff5a5f]/25" : "",
    isActive ? "" : "opacity-80",
    isHovered || isSelected ? "scale-110 px-4 py-2" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return marker;
}

function createEventMarker() {
  const marker = document.createElement("div");
  marker.textContent = "Event";
  marker.className =
    "rounded-full border-2 border-white bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-[0_18px_44px_rgba(20,20,20,0.25)]";

  return marker;
}

function getPopupHtml(item: MarketplaceItem) {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; min-width: 190px;">
      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #111;">${escapeHtml(
        item.name,
      )}</p>
      <p style="margin: 0; font-size: 12px; line-height: 1.45; color: #666;">${escapeHtml(
        item.location,
      )}</p>
      <p style="margin: 8px 0 0; font-size: 12px; font-weight: 700; color: #111;">${escapeHtml(
        item.price,
      )}</p>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function MapMarker({
  label,
  position,
}: {
  label: string;
  position: { x: number; y: number };
}) {
  return (
    <div
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-[0_18px_44px_rgba(20,20,20,0.25)]"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
      {label}
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

function getMapboxStyleUrl() {
  if (MAPBOX_STYLE_ID.startsWith("mapbox://")) {
    return MAPBOX_STYLE_ID;
  }

  return `mapbox://styles/${MAPBOX_STYLE_ID}`;
}

function getBounds(points: Coordinates[]) {
  if (!points.length) {
    return fallbackBounds;
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

function toLngLatBounds(bounds: ReturnType<typeof getBounds>): LngLatBoundsLike {
  return [
    [bounds.minLng, bounds.minLat],
    [bounds.maxLng, bounds.maxLat],
  ];
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
