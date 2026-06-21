import type { EventType, ServiceName } from "@/app/data/marketplace";

export type BudgetTier = "economy" | "standard" | "premium" | "luxury";
export type Formality = "casual" | "semi-formal" | "formal" | "black-tie";
export type IndoorOutdoor = "indoor" | "outdoor" | "indoor-outdoor";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "late-night";

export type EventTaxonomyProfile = {
  aliases: string[];
  ageContext?: string;
  budgetTier: BudgetTier;
  culture?: string;
  description: string;
  eventFamily?: string;
  excludedServices?: ServiceName[];
  formality: Formality;
  guestSize: string;
  id: string;
  indoorOutdoor: IndoorOutdoor;
  likelyGuestType?: string;
  likelyNeeds?: string[];
  likelyVibe?: string;
  luxuryAddOns: ServiceName[];
  marketplaceEventType?: EventType;
  optionalVendors: ServiceName[];
  primaryType: string;
  recommendedTags: string[];
  recommendedVendors: ServiceName[];
  religion?: string;
  requiredVendors: ServiceName[];
  season: string;
  subtype?: string;
  timeOfDay: TimeOfDay;
  venueStyle: string;
};

export type EventRecognition = {
  confidence: number;
  matchedAlias: string;
  normalizedQuery: string;
  profile: EventTaxonomyProfile;
  preservedSubtype?: string;
  recommendedServices: ServiceName[];
  excludedServices: ServiceName[];
  suggestedClarifyingQuestions: string[];
  tags: string[];
};

export type DiscoveryQuestion = {
  id: string;
  label: string;
  options?: string[];
  placeholder?: string;
  type: "text" | "select" | "number" | "boolean";
};

export type EventTiming = {
  date: string;
  endTime: string;
  setupTime: string;
  startTime: string;
  teardownTime: string;
  timezone: string;
};

export type VendorScoreFactor = {
  label: string;
  value: number;
};

export type VendorMatchScore = {
  bucket: "required" | "recommended" | "optional" | "luxury" | "other";
  factors: VendorScoreFactor[];
  reasons: string[];
  score: number;
};
