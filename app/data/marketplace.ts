export type EventType =
  | "Birthday"
  | "Wedding"
  | "Graduation"
  | "Corporate"
  | "Seminar"
  | "Convention"
  | "Funeral"
  | "Baby Shower"
  | "Fundraiser"
  | "Private Party";

export type ServiceName =
  | "Venue"
  | "Catering"
  | "Cake & Desserts"
  | "DJ"
  | "Live Music"
  | "Magic"
  | "Character Performers"
  | "Photo Booth"
  | "Rentals"
  | "Invitations"
  | "Photography"
  | "Florals"
  | "AV Production"
  | "Registration"
  | "Printed Materials"
  | "Printed Programs"
  | "Live Streaming"
  | "Transportation"
  | "Security"
  | "Staffing"
  | "Booth Rentals";

export type Coordinates = {
  lat: number;
  lng: number;
};

export type PricingModel =
  | {
      kind: "flat";
      basePrice: number;
      label: string;
    }
  | {
      kind: "hourly";
      hourlyRate: number;
      minHours: number;
      setupFee?: number;
      label: string;
    }
  | {
      kind: "perGuest";
      perGuest: number;
      minimum: number;
      serviceFee?: number;
      label: string;
    };

export type AvailabilityWindow = {
  days: string[];
  start: string;
  end: string;
};

export type MarketplaceItem = {
  id: number;
  databaseSource?: boolean;
  name: string;
  type: ServiceName;
  location: string;
  photoUrl?: string | null;
  address: string;
  coordinates: Coordinates;
  price: string;
  capacity?: string;
  rating: number;
  events: EventType[];
  services: ServiceName[];
  description: string;
  pricing: PricingModel;
  availability: AvailabilityWindow[];
  blockedDates?: string[];
  sourceLabel: string;
  sourceUrl: string;
  serviceRadiusMiles?: number;
  vendorId?: string | null;
  serviceId?: string | null;
  venueId?: string | null;
  averageResponseMinutes?: number;
  budgetTier?: "economy" | "standard" | "premium" | "luxury";
  cultures?: string[];
  languages?: string[];
  maxGuestCount?: number;
  minGuestCount?: number;
  repeatClientRate?: number;
  reviewCount?: number;
  tags?: string[];
};

export type QuoteContext = {
  date?: string;
  durationHours: number;
  endTime?: string;
  guests: number;
  startTime?: string;
};

export type EventPlanPreset = {
  recommended: ServiceName[];
  more: ServiceName[];
};

export type HomeArea = {
  name: string;
  coordinates: Coordinates;
};

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
const weekend = ["Sat", "Sun"] as const;
const everyDay = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const eventTypes: EventType[] = [
  "Birthday",
  "Wedding",
  "Graduation",
  "Corporate",
  "Seminar",
  "Convention",
  "Funeral",
  "Baby Shower",
  "Fundraiser",
  "Private Party",
];

export const homeAreas: HomeArea[] = [
  { name: "Downtown Los Angeles", coordinates: { lat: 34.0407, lng: -118.2468 } },
  { name: "Hollywood", coordinates: { lat: 34.1016, lng: -118.3267 } },
  { name: "Mid-Wilshire", coordinates: { lat: 34.0617, lng: -118.3089 } },
  { name: "Pasadena", coordinates: { lat: 34.1478, lng: -118.1445 } },
  { name: "Santa Monica", coordinates: { lat: 34.0195, lng: -118.4912 } },
  { name: "Long Beach", coordinates: { lat: 33.7701, lng: -118.1937 } },
];

export const entertainmentServices: ServiceName[] = [
  "DJ",
  "Live Music",
  "Magic",
  "Character Performers",
  "Photo Booth",
];

export const allServices: ServiceName[] = [
  "Venue",
  "Catering",
  "Cake & Desserts",
  ...entertainmentServices,
  "Rentals",
  "Invitations",
  "Photography",
  "Florals",
  "AV Production",
  "Registration",
  "Printed Materials",
  "Printed Programs",
  "Live Streaming",
  "Transportation",
  "Security",
  "Staffing",
  "Booth Rentals",
];

export const eventPlanPresets: Record<EventType, EventPlanPreset> = {
  Birthday: {
    recommended: [
      "Venue",
      "Catering",
      "Cake & Desserts",
      "DJ",
      "Magic",
      "Character Performers",
      "Rentals",
      "Invitations",
      "Photography",
    ],
    more: ["Live Music", "Photo Booth", "Florals", "AV Production", "Staffing"],
  },
  Wedding: {
    recommended: [
      "Venue",
      "Catering",
      "Florals",
      "Photography",
      "Rentals",
      "Invitations",
      "Live Music",
      "DJ",
    ],
    more: ["Transportation", "AV Production", "Staffing", "Cake & Desserts"],
  },
  Graduation: {
    recommended: [
      "Venue",
      "Catering",
      "Photography",
      "Rentals",
      "Invitations",
      "DJ",
      "Photo Booth",
    ],
    more: ["Live Music", "AV Production", "Transportation", "Cake & Desserts"],
  },
  Corporate: {
    recommended: [
      "Venue",
      "Catering",
      "AV Production",
      "Rentals",
      "Photography",
      "Staffing",
    ],
    more: ["Live Music", "DJ", "Photo Booth", "Transportation", "Registration", "Security"],
  },
  Seminar: {
    recommended: [
      "Venue",
      "AV Production",
      "Registration",
      "Catering",
      "Printed Materials",
    ],
    more: ["Photography", "Staffing", "Transportation", "Rentals"],
  },
  Convention: {
    recommended: [
      "Venue",
      "AV Production",
      "Booth Rentals",
      "Registration",
      "Staffing",
      "Catering",
    ],
    more: ["Photography", "Transportation", "DJ", "Live Music", "Printed Materials", "Security"],
  },
  Funeral: {
    recommended: [
      "Venue",
      "Catering",
      "Florals",
      "Printed Programs",
      "Live Streaming",
      "Transportation",
    ],
    more: ["Photography", "AV Production", "Rentals", "Live Music", "Staffing"],
  },
  "Baby Shower": {
    recommended: [
      "Venue",
      "Catering",
      "Cake & Desserts",
      "Florals",
      "Rentals",
      "Invitations",
      "Photography",
    ],
    more: ["Magic", "Character Performers", "Photo Booth", "Transportation"],
  },
  Fundraiser: {
    recommended: [
      "Venue",
      "Catering",
      "AV Production",
      "Invitations",
      "Live Music",
      "Staffing",
    ],
    more: ["DJ", "Photography", "Florals", "Registration", "Printed Materials", "Security"],
  },
  "Private Party": {
    recommended: [
      "Venue",
      "Catering",
      "DJ",
      "Live Music",
      "Rentals",
      "Photography",
      "Invitations",
    ],
    more: ["Magic", "Character Performers", "Photo Booth", "Florals", "Staffing"],
  },
};

export const marketplaceTypes = ["All", ...allServices] as const;

export function getHoursBetween(startTime: string, endTime: string) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const start = startHour * 60 + startMinute;
  let end = endHour * 60 + endMinute;

  if (end <= start) {
    end += 24 * 60;
  }

  return Math.max((end - start) / 60, 1);
}

export function getEndTime(startTime: string, durationHours: number) {
  const [hour, minute] = startTime.split(":").map(Number);
  const totalMinutes = hour * 60 + minute + durationHours * 60;
  const endHour = Math.floor(totalMinutes / 60) % 24;
  const endMinute = totalMinutes % 60;

  return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
}

export function quoteItem(item: MarketplaceItem, context: QuoteContext) {
  const durationHours =
    context.startTime && context.endTime
      ? getHoursBetween(context.startTime, context.endTime)
      : context.durationHours;

  if (item.pricing.kind === "flat") {
    return item.pricing.basePrice;
  }

  if (item.pricing.kind === "hourly") {
    const billableHours = Math.max(durationHours, item.pricing.minHours);

    return billableHours * item.pricing.hourlyRate + (item.pricing.setupFee ?? 0);
  }

  return Math.max(
    context.guests * item.pricing.perGuest + (item.pricing.serviceFee ?? 0),
    item.pricing.minimum,
  );
}

export function isAvailableAt(
  item: MarketplaceItem,
  date?: string,
  startTime?: string,
  endTime?: string,
) {
  if (!date || !startTime) {
    return true;
  }

  if (item.blockedDates?.includes(date)) {
    return false;
  }

  const day = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
    new Date(`${date}T12:00:00`),
  );
  const serviceEnd = endTime ?? startTime;

  return item.availability.some(
    (window) =>
      window.days.includes(day) &&
      startTime >= window.start &&
      serviceEnd <= window.end,
  );
}

export function getDistanceMiles(from: Coordinates, to: Coordinates) {
  const milesPerDegreeLat = 69;
  const milesPerDegreeLng = 54.6;
  const latMiles = (from.lat - to.lat) * milesPerDegreeLat;
  const lngMiles = (from.lng - to.lng) * milesPerDegreeLng;

  return Math.sqrt(latMiles * latMiles + lngMiles * lngMiles);
}

export function estimateDriveMinutes(from: Coordinates, to: Coordinates) {
  return Math.round(getDistanceMiles(from, to) * 2.4 + 8);
}

export const marketplaceItems: MarketplaceItem[] = [
  {
    id: 1,
    name: "The Ebell of Los Angeles",
    type: "Venue",
    location: "Mid-Wilshire, Los Angeles",
    address: "743 S Lucerne Blvd, Los Angeles, CA 90005",
    coordinates: { lat: 34.0607, lng: -118.3246 },
    price: "$5,500 estimate",
    capacity: "1,238 theatre seats",
    rating: 4.9,
    events: ["Wedding", "Corporate", "Fundraiser", "Private Party"],
    services: ["Venue"],
    description: "Historic event campus and theatre in Mid-Wilshire for polished large gatherings.",
    pricing: { kind: "flat", basePrice: 5500, label: "venue estimate" },
    availability: [{ days: [...everyDay], start: "08:00", end: "23:00" }],
    budgetTier: "premium",
    maxGuestCount: 1200,
    reviewCount: 220,
    sourceLabel: "Official site / venue page",
    sourceUrl: "https://ebellofla.org/special-events/",
    tags: ["wedding", "corporate", "gala", "formal", "historic", "theatre"],
  },
  {
    id: 2,
    name: "Shrine Auditorium & Expo Hall",
    type: "Venue",
    location: "University Park, Los Angeles",
    address: "665 W Jefferson Blvd, Los Angeles, CA 90007",
    coordinates: { lat: 34.0237, lng: -118.2811 },
    price: "$8,400 estimate",
    capacity: "Large auditorium and expo hall",
    rating: 4.8,
    events: ["Convention", "Corporate", "Seminar", "Fundraiser", "Graduation"],
    services: ["Venue", "AV Production", "Booth Rentals"],
    description: "Large landmark venue suited to conferences, shows, graduations, and expos.",
    pricing: { kind: "flat", basePrice: 8400, label: "large venue estimate" },
    availability: [{ days: [...everyDay], start: "08:00", end: "22:00" }],
    budgetTier: "premium",
    maxGuestCount: 6000,
    reviewCount: 310,
    sourceLabel: "Official venue info",
    sourceUrl: "https://www.shrineauditorium.com/venue-info",
    tags: ["conference", "convention", "expo", "graduation", "av", "large-format"],
  },
  {
    id: 3,
    name: "The Magic Castle",
    type: "Venue",
    location: "Hollywood, Los Angeles",
    address: "7001 Franklin Ave, Hollywood, CA 90028",
    coordinates: { lat: 34.1046, lng: -118.3427 },
    price: "$3,200 estimate",
    capacity: "Private groups",
    rating: 4.9,
    events: ["Birthday", "Private Party", "Corporate", "Fundraiser"],
    services: ["Venue", "Magic", "Catering"],
    description: "World-famous private clubhouse with dining, shows, and private group options.",
    pricing: { kind: "flat", basePrice: 3200, label: "private group estimate" },
    availability: [{ days: [...everyDay], start: "17:00", end: "23:30" }],
    budgetTier: "premium",
    maxGuestCount: 300,
    reviewCount: 480,
    sourceLabel: "Official site",
    sourceUrl: "https://www.magiccastle.com/",
    tags: ["birthday", "magic", "private-party", "entertainment", "dining"],
  },
  {
    id: 4,
    name: "SmogShoppe",
    type: "Venue",
    location: "Culver City, CA",
    address: "2651 S La Cienega Blvd, Los Angeles, CA 90034",
    coordinates: { lat: 34.0319, lng: -118.3777 },
    price: "$4,900 estimate",
    capacity: "Indoor-outdoor venue",
    rating: 4.8,
    events: ["Wedding", "Corporate", "Private Party", "Fundraiser"],
    services: ["Venue"],
    description: "Indoor-outdoor event space in Culver City with a distinctive design-forward feel.",
    pricing: { kind: "flat", basePrice: 4900, label: "venue estimate" },
    availability: [{ days: [...everyDay], start: "09:00", end: "23:00" }],
    budgetTier: "premium",
    maxGuestCount: 250,
    reviewCount: 185,
    sourceLabel: "Official site",
    sourceUrl: "https://www.smogshoppe.com/",
    tags: ["wedding", "corporate", "indoor-outdoor", "sustainable", "private-party"],
  },
  {
    id: 5,
    name: "Wolfgang Puck Catering",
    type: "Catering",
    location: "Los Angeles, CA",
    address: "Los Angeles, CA",
    coordinates: { lat: 34.0522, lng: -118.2437 },
    price: "$115 / guest estimate",
    rating: 4.9,
    events: ["Wedding", "Corporate", "Fundraiser", "Birthday", "Private Party"],
    services: ["Catering", "Staffing"],
    description: "Real LA catering brand for social, wedding, corporate, and private chef events.",
    pricing: { kind: "perGuest", perGuest: 115, minimum: 2500, label: "per guest estimate" },
    availability: [{ days: [...everyDay], start: "08:00", end: "23:00" }],
    averageResponseMinutes: 240,
    budgetTier: "luxury",
    maxGuestCount: 1200,
    minGuestCount: 25,
    repeatClientRate: 72,
    reviewCount: 260,
    sourceLabel: "Official site",
    sourceUrl: "https://wolfgangpuckcatering.com/",
    tags: ["catering", "premium", "wedding", "corporate", "gala", "staffing"],
  },
  {
    id: 6,
    name: "VOX DJs",
    type: "DJ",
    location: "Los Angeles, CA",
    address: "Los Angeles, CA",
    coordinates: { lat: 34.0522, lng: -118.2437 },
    price: "$300 / 3 hours estimate",
    rating: 4.8,
    events: ["Birthday", "Wedding", "Graduation", "Corporate", "Private Party"],
    services: ["DJ", "AV Production"],
    description: "Los Angeles DJ and MC service for weddings, parties, school, and corporate events.",
    pricing: { kind: "hourly", hourlyRate: 100, minHours: 3, label: "$300 for 3 hours estimate" },
    availability: [
      { days: [...weekdays], start: "14:00", end: "23:00" },
      { days: [...weekend], start: "10:00", end: "23:30" },
    ],
    averageResponseMinutes: 120,
    budgetTier: "standard",
    maxGuestCount: 400,
    repeatClientRate: 68,
    reviewCount: 190,
    sourceLabel: "Official site",
    sourceUrl: "https://www.voxdjs.com/",
    tags: ["dj", "dance", "birthday", "graduation", "wedding", "corporate", "mc"],
  },
  {
    id: 7,
    name: "Rent For Event LA",
    type: "AV Production",
    location: "Los Angeles, CA",
    address: "Los Angeles, CA",
    coordinates: { lat: 34.0522, lng: -118.2437 },
    price: "$180 / hour estimate",
    rating: 4.7,
    events: ["Corporate", "Convention", "Seminar", "Wedding", "Private Party"],
    services: ["AV Production", "Live Streaming", "Rentals"],
    description: "Audio, video, lighting, staging, and event production rental provider.",
    pricing: { kind: "hourly", hourlyRate: 180, minHours: 3, setupFee: 250, label: "production crew estimate" },
    availability: [{ days: [...everyDay], start: "07:00", end: "23:00" }],
    averageResponseMinutes: 180,
    budgetTier: "premium",
    maxGuestCount: 1000,
    repeatClientRate: 61,
    reviewCount: 130,
    sourceLabel: "Official site",
    sourceUrl: "https://www.rentforevent.com/",
    tags: ["av", "conference", "seminar", "trade-show", "live-streaming", "production"],
  },
  {
    id: 8,
    name: "LA PartyWorks",
    type: "Rentals",
    location: "Los Angeles, CA",
    address: "Los Angeles, CA",
    coordinates: { lat: 34.0522, lng: -118.2437 },
    price: "$1,250 estimate",
    rating: 4.7,
    events: ["Birthday", "Baby Shower", "Private Party", "Wedding", "Corporate"],
    services: ["Rentals", "Photo Booth", "Staffing"],
    description: "Party rentals and entertainment equipment for social and corporate events.",
    pricing: { kind: "flat", basePrice: 1250, label: "rental package estimate" },
    availability: [{ days: [...everyDay], start: "07:00", end: "20:00" }],
    averageResponseMinutes: 300,
    budgetTier: "standard",
    maxGuestCount: 300,
    repeatClientRate: 58,
    reviewCount: 115,
    sourceLabel: "Official site",
    sourceUrl: "https://www.lapartyworks.com/",
    tags: ["rentals", "photo-booth", "birthday", "party", "family-friendly", "corporate"],
  },
  {
    id: 9,
    name: "Lark Cake Shop",
    type: "Cake & Desserts",
    location: "Silver Lake, Los Angeles",
    address: "3337 W Sunset Blvd, Los Angeles, CA 90026",
    coordinates: { lat: 34.0852, lng: -118.2755 },
    price: "$380 estimate",
    rating: 4.7,
    events: ["Birthday", "Wedding", "Baby Shower", "Graduation", "Private Party"],
    services: ["Cake & Desserts"],
    description: "Los Angeles bakery for cakes and desserts; useful for birthday and shower proof-of-concept.",
    pricing: { kind: "flat", basePrice: 380, label: "custom dessert estimate" },
    availability: [{ days: [...weekdays, ...weekend], start: "09:00", end: "18:00" }],
    averageResponseMinutes: 360,
    budgetTier: "standard",
    reviewCount: 145,
    sourceLabel: "Official site",
    sourceUrl: "https://www.larkcakeshop.com/",
    tags: ["cake", "dessert", "birthday", "baby-shower", "wedding", "custom"],
  },
  {
    id: 10,
    name: "Town & Country Event Rentals",
    type: "Rentals",
    location: "Van Nuys, CA",
    address: "7722 Gloria Ave, Van Nuys, CA 91406",
    coordinates: { lat: 34.2116, lng: -118.4793 },
    price: "$1,600 estimate",
    rating: 4.8,
    events: ["Wedding", "Corporate", "Private Party", "Birthday", "Fundraiser"],
    services: ["Rentals"],
    description: "Event rental company for tables, seating, tabletop, and larger rental needs.",
    pricing: { kind: "flat", basePrice: 1600, label: "rental order estimate" },
    availability: [{ days: [...everyDay], start: "07:00", end: "20:00" }],
    averageResponseMinutes: 240,
    budgetTier: "premium",
    maxGuestCount: 800,
    repeatClientRate: 65,
    reviewCount: 150,
    sourceLabel: "Official site",
    sourceUrl: "https://www.tacer.biz/",
    tags: ["rentals", "wedding", "corporate", "gala", "tables", "seating"],
  },
  {
    id: 11,
    name: "Mark's Garden",
    type: "Florals",
    location: "Sherman Oaks, CA",
    address: "13838 Ventura Blvd, Sherman Oaks, CA 91423",
    coordinates: { lat: 34.1485, lng: -118.4357 },
    price: "$900 estimate",
    rating: 4.8,
    events: ["Wedding", "Baby Shower", "Funeral", "Fundraiser", "Private Party"],
    services: ["Florals"],
    description: "Los Angeles floral studio for weddings, parties, memorials, and upscale arrangements.",
    pricing: { kind: "flat", basePrice: 900, label: "floral design estimate" },
    availability: [{ days: [...everyDay], start: "07:00", end: "18:00" }],
    averageResponseMinutes: 420,
    budgetTier: "premium",
    repeatClientRate: 70,
    reviewCount: 175,
    sourceLabel: "Official site",
    sourceUrl: "https://marksgarden.com/",
    tags: ["florals", "wedding", "funeral", "memorial", "baby-shower", "gala"],
  },
  {
    id: 12,
    name: "The Bash - Los Angeles Magicians",
    type: "Magic",
    location: "Los Angeles, CA",
    address: "Los Angeles, CA",
    coordinates: { lat: 34.0522, lng: -118.2437 },
    price: "$275 / hour estimate",
    rating: 4.6,
    events: ["Birthday", "Baby Shower", "Private Party", "Corporate"],
    services: ["Magic"],
    description: "Public marketplace page for Los Angeles magicians used as a real-provider proof source.",
    pricing: { kind: "hourly", hourlyRate: 275, minHours: 1, label: "magic performance estimate" },
    availability: [{ days: [...weekend], start: "10:00", end: "20:00" }],
    averageResponseMinutes: 480,
    budgetTier: "standard",
    maxGuestCount: 120,
    reviewCount: 90,
    sourceLabel: "Marketplace page",
    sourceUrl: "https://www.thebash.com/search/magician-los-angeles-ca",
    tags: ["magic", "birthday", "family-friendly", "kids", "entertainment"],
  },
  {
    id: 13,
    name: "The Bash - Los Angeles Princess Parties",
    type: "Character Performers",
    location: "Los Angeles, CA",
    address: "Los Angeles, CA",
    coordinates: { lat: 34.0522, lng: -118.2437 },
    price: "$150 / hour estimate",
    rating: 4.6,
    events: ["Birthday", "Baby Shower", "Private Party"],
    services: ["Character Performers"],
    description: "Public marketplace page for princess and character party performers near Los Angeles.",
    pricing: { kind: "hourly", hourlyRate: 150, minHours: 2, label: "character performer estimate" },
    availability: [{ days: [...weekend], start: "09:00", end: "19:00" }],
    averageResponseMinutes: 480,
    budgetTier: "standard",
    maxGuestCount: 80,
    reviewCount: 72,
    sourceLabel: "Marketplace page",
    sourceUrl: "https://www.thebash.com/search/princess-party-los-angeles-ca",
    tags: ["character", "kids", "birthday", "family-friendly", "costume", "entertainment"],
  },
  {
    id: 14,
    name: "Yelp - Los Angeles Photo Booth Rentals",
    type: "Photo Booth",
    location: "Los Angeles, CA",
    address: "Los Angeles, CA",
    coordinates: { lat: 34.0522, lng: -118.2437 },
    price: "$500 / 3 hours estimate",
    rating: 4.5,
    events: ["Birthday", "Wedding", "Graduation", "Corporate", "Private Party"],
    services: ["Photo Booth"],
    description: "Public Yelp category page used to validate real local photo booth options.",
    pricing: { kind: "hourly", hourlyRate: 125, minHours: 3, setupFee: 125, label: "booth rental estimate" },
    availability: [{ days: [...everyDay], start: "10:00", end: "23:00" }],
    averageResponseMinutes: 360,
    budgetTier: "standard",
    maxGuestCount: 500,
    reviewCount: 120,
    sourceLabel: "Yelp category",
    sourceUrl: "https://www.yelp.com/search?find_desc=Photo+Booth+Rentals&find_loc=Los+Angeles%2C+CA",
    tags: ["photo-booth", "birthday", "wedding", "graduation", "corporate", "party"],
  },
];
