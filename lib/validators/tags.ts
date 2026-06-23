const blockedTagTerms = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "nigger",
  "nigga",
  "fag",
  "faggot",
  "kike",
  "spic",
  "chink",
  "wetback",
];

export function normalizeVendorTags(tags: string[]) {
  return Array.from(
    new Set(
      tags
        .map((tag) =>
          tag
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/(^-|-$)/g, ""),
        )
        .filter(Boolean),
    ),
  ).slice(0, 16);
}

export function validateVendorTags(tags: string[]) {
  const normalizedTags = normalizeVendorTags(tags);
  const blockedTag = normalizedTags.find((tag) =>
    blockedTagTerms.some((term) => tag.includes(term)),
  );

  if (blockedTag) {
    throw new Error(`Remove the offensive tag "${blockedTag}" before continuing.`);
  }

  normalizedTags.forEach((tag) => {
    if (tag.length > 32) {
      throw new Error("Keep each tag to 32 characters or fewer.");
    }
  });

  return normalizedTags;
}
