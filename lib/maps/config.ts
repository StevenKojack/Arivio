export const MAPBOX_ACCESS_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() ?? "";

export const MAPBOX_STYLE_ID =
  process.env.NEXT_PUBLIC_MAPBOX_STYLE_ID?.trim() ?? "mapbox/light-v11";

export function hasMapboxConfig() {
  return Boolean(MAPBOX_ACCESS_TOKEN);
}

export function getMapboxStaticMapUrl({
  center,
  height,
  width,
  zoom = 10,
}: {
  center: { lat: number; lng: number };
  height: number;
  width: number;
  zoom?: number;
}) {
  if (!hasMapboxConfig()) {
    return "";
  }

  return `https://api.mapbox.com/styles/v1/${MAPBOX_STYLE_ID}/static/${center.lng},${center.lat},${zoom},0/${width}x${height}?access_token=${MAPBOX_ACCESS_TOKEN}`;
}
