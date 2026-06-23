export function formatMoney(value: number | null | undefined) {
  return `$${Number(value ?? 0).toLocaleString()}`;
}

export function formatDate(value: string | null | undefined) {
  return value ?? "No date";
}

export function formatTime(value: string | null | undefined) {
  if (!value) {
    return "--";
  }

  const [hourValue, minuteValue = "00"] = value.slice(0, 5).split(":");
  const hour = Number(hourValue);
  const minute = Number(minuteValue);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return value;
  }

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}

export function getTimeOptions(stepMinutes = 15) {
  const options: Array<{ label: string; value: string }> = [];

  for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

    options.push({
      label: formatTime(value),
      value,
    });
  }

  return options;
}
