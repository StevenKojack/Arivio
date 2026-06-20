export function requirePositiveNumber(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be greater than zero.`);
  }
}

export function requireString(value: string, label: string) {
  if (!value.trim()) {
    throw new Error(`${label} is required.`);
  }
}

export function optionalUrl(value: string) {
  if (!value.trim()) {
    return null;
  }

  try {
    return new URL(value).toString();
  } catch {
    throw new Error("Website must be a valid URL.");
  }
}
