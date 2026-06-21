import {
  estimateDriveMinutes,
  getDistanceMiles,
  isAvailableAt,
  quoteItem,
  type Coordinates,
  type MarketplaceItem,
  type QuoteContext,
  type ServiceName,
} from "@/app/data/marketplace";
import type {
  EventRecognition,
  EventTaxonomyProfile,
  VendorMatchScore,
  VendorScoreFactor,
} from "./types";

export type RecommendationContext = {
  coordinates?: Coordinates;
  quoteContext: QuoteContext;
};

export type RankedMarketplaceItem = {
  item: MarketplaceItem;
  match: VendorMatchScore;
};

export function rankMarketplaceItems(
  items: MarketplaceItem[],
  recognition: EventRecognition,
  context: RecommendationContext,
) {
  return items
    .filter((item) => !recognition.excludedServices.includes(item.type))
    .map((item) => ({
      item,
      match: scoreVendorForEvent(item, recognition, context),
    }))
    .sort((left, right) => right.match.score - left.match.score);
}

export function groupRankedItems(items: RankedMarketplaceItem[]) {
  return {
    luxury: items.filter((item) => item.match.bucket === "luxury"),
    optional: items.filter((item) => item.match.bucket === "optional"),
    recommended: items.filter((item) => item.match.bucket === "recommended"),
    required: items.filter((item) => item.match.bucket === "required"),
  };
}

export function scoreVendorForEvent(
  item: MarketplaceItem,
  recognition: EventRecognition,
  context: RecommendationContext,
): VendorMatchScore {
  const profile = recognition.profile;
  const factors: VendorScoreFactor[] = [];
  const reasons: string[] = [];
  const serviceMatch = strongestServiceMatch(item, profile);
  const eventMatch = profile.marketplaceEventType && item.events.includes(profile.marketplaceEventType);
  const tagScore = getTagScore(item, recognition.tags);
  const ratingScore = Math.min(item.rating / 5, 1);
  const reviewScore = item.reviewCount ? Math.min(item.reviewCount / 100, 1) : 0.5;
  const experienceScore = item.repeatClientRate
    ? Math.min(item.repeatClientRate / 100, 1)
    : item.databaseSource
      ? 0.7
      : 0.55;
  const availabilityScore = isAvailableAt(
    item,
    context.quoteContext.date,
    context.quoteContext.startTime,
    context.quoteContext.endTime,
  )
    ? 1
    : 0.35;
  const distanceScore = getDistanceScore(item, context.coordinates);
  const budgetScore = getBudgetScore(item, profile, context.quoteContext);
  const guestScore = getGuestCountScore(item, context.quoteContext.guests);
  const responseScore = item.averageResponseMinutes
    ? Math.max(0.35, 1 - item.averageResponseMinutes / 1440)
    : 0.6;
  const cultureScore = getCultureScore(item, profile);
  const languageScore = item.languages?.length ? 0.85 : 0.65;

  addFactor(factors, "Event match", eventMatch ? 1 : serviceMatch > 0 ? 0.75 : 0.25, 18);
  addFactor(factors, "Vendor category", serviceMatch, 18);
  addFactor(factors, "Shared tags", tagScore, 12);
  addFactor(factors, "Distance", distanceScore, 10);
  addFactor(factors, "Availability", availabilityScore, 10);
  addFactor(factors, "Rating", ratingScore, 7);
  addFactor(factors, "Review count", reviewScore, 4);
  addFactor(factors, "Budget fit", budgetScore, 6);
  addFactor(factors, "Guest count fit", guestScore, 5);
  addFactor(factors, "Response time", responseScore, 3);
  addFactor(factors, "Repeat clients", experienceScore, 3);
  addFactor(factors, "Culture match", cultureScore, 3);
  addFactor(factors, "Language match", languageScore, 1);

  if (eventMatch) {
    reasons.push(`Serves ${profile.marketplaceEventType} events`);
  }

  if (serviceMatch >= 1) {
    reasons.push(`${item.type} is central to this plan`);
  }

  if (tagScore > 0.5) {
    reasons.push("Tags line up with the event profile");
  }

  if (availabilityScore === 1) {
    reasons.push("Available for the selected window");
  }

  const score = Math.round(factors.reduce((total, factor) => total + factor.value, 0));

  return {
    bucket: getBucket(item, profile),
    factors,
    reasons: reasons.length ? reasons : ["Broad provider fit for this event"],
    score,
  };
}

function addFactor(
  factors: VendorScoreFactor[],
  label: string,
  score: number,
  weight: number,
) {
  factors.push({
    label,
    value: Math.max(0, Math.min(score, 1)) * weight,
  });
}

function strongestServiceMatch(item: MarketplaceItem, profile: EventTaxonomyProfile) {
  if (profile.requiredVendors.includes(item.type)) {
    return 1;
  }

  if (profile.recommendedVendors.includes(item.type)) {
    return 0.85;
  }

  if (profile.optionalVendors.includes(item.type)) {
    return 0.7;
  }

  if (profile.luxuryAddOns.includes(item.type)) {
    return 0.58;
  }

  return item.services.some((service) =>
    [
      ...profile.requiredVendors,
      ...profile.recommendedVendors,
      ...profile.optionalVendors,
      ...profile.luxuryAddOns,
    ].includes(service),
  )
    ? 0.5
    : 0.15;
}

function getBucket(item: MarketplaceItem, profile: EventTaxonomyProfile) {
  const buckets: Array<[VendorMatchScore["bucket"], ServiceName[]]> = [
    ["required", profile.requiredVendors],
    ["recommended", profile.recommendedVendors],
    ["optional", profile.optionalVendors],
    ["luxury", profile.luxuryAddOns],
  ];

  return (
    buckets.find(([, services]) =>
      services.some((service) => item.type === service || item.services.includes(service)),
    )?.[0] ?? "other"
  );
}

function getTagScore(item: MarketplaceItem, recognitionTags: string[]) {
  const itemTags = new Set(
    [
      item.type,
      item.name,
      item.location,
      ...item.events,
      ...item.services,
      ...(item.tags ?? []),
      ...(item.cultures ?? []),
      ...(item.languages ?? []),
    ].map((value) => value.toLowerCase()),
  );
  const matches = recognitionTags.filter((tag) => itemTags.has(tag.toLowerCase()));

  return matches.length / Math.max(recognitionTags.length, 1);
}

function getDistanceScore(item: MarketplaceItem, coordinates?: Coordinates) {
  if (!coordinates || item.type === "Venue") {
    return 0.75;
  }

  const miles = getDistanceMiles(coordinates, item.coordinates);
  const minutes = estimateDriveMinutes(coordinates, item.coordinates);
  const withinRadius = item.serviceRadiusMiles ? miles <= item.serviceRadiusMiles : true;

  if (!withinRadius || minutes > 60) {
    return 0.15;
  }

  return Math.max(0.35, 1 - minutes / 90);
}

function getBudgetScore(
  item: MarketplaceItem,
  profile: EventTaxonomyProfile,
  quoteContext: QuoteContext,
) {
  if (item.budgetTier && item.budgetTier === profile.budgetTier) {
    return 1;
  }

  const quote = quoteItem(item, quoteContext);
  const perGuest = quote / Math.max(quoteContext.guests, 1);

  if (profile.budgetTier === "economy") {
    return perGuest < 35 ? 1 : 0.55;
  }

  if (profile.budgetTier === "luxury") {
    return perGuest > 75 ? 1 : 0.65;
  }

  return perGuest >= 25 && perGuest <= 140 ? 0.9 : 0.65;
}

function getGuestCountScore(item: MarketplaceItem, guests: number) {
  if (item.minGuestCount && guests < item.minGuestCount) {
    return 0.45;
  }

  if (item.maxGuestCount && guests > item.maxGuestCount) {
    return 0.35;
  }

  return 0.85;
}

function getCultureScore(item: MarketplaceItem, profile: EventTaxonomyProfile) {
  if (!profile.culture) {
    return 1;
  }

  return item.cultures?.some((culture) => cultureMatches(culture, profile.culture ?? ""))
    ? 1
    : 0.55;
}

function cultureMatches(left: string, right: string) {
  return left.toLowerCase() === right.toLowerCase();
}
