export function formatMoney(value: number | null | undefined) {
  return `$${Number(value ?? 0).toLocaleString()}`;
}

export function formatDate(value: string | null | undefined) {
  return value ?? "No date";
}

export function formatTime(value: string | null | undefined) {
  return value ? value.slice(0, 5) : "--";
}
