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
  | "Booth Rentals"
  | "Portable Restrooms";

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
  "Portable Restrooms",
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
    location: "Beverly Grove, Los Angeles",
    address: "8687 Melrose Ave, West Hollywood, CA 90069",
    coordinates: { lat: 34.0811, lng: -118.3824 },
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
    location: "Santa Monica, CA",
    address: "Santa Monica, CA",
    coordinates: { lat: 34.0278, lng: -118.4712 },
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
    location: "Glendale, CA",
    address: "Glendale, CA",
    coordinates: { lat: 34.1467, lng: -118.2551 },
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
    location: "North Hollywood, CA",
    address: "North Hollywood, CA",
    coordinates: { lat: 34.1722, lng: -118.379 },
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
    location: "Hollywood, Los Angeles",
    address: "Hollywood, Los Angeles, CA",
    coordinates: { lat: 34.1019, lng: -118.3269 },
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
    location: "Burbank, CA",
    address: "Burbank, CA",
    coordinates: { lat: 34.1808, lng: -118.309 },
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
    location: "Culver City, CA",
    address: "Culver City, CA",
    coordinates: { lat: 34.0211, lng: -118.3965 },
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
  {
    id: 15,
    name: "Scooter's Jungle El Segundo",
    type: "Venue",
    location: "El Segundo, CA",
    address: "606 Hawaii St, El Segundo, CA 90245",
    coordinates: { lat: 33.9236, lng: -118.3948 },
    price: "$950 estimate",
    capacity: "Private kids party venue",
    rating: 4.6,
    events: ["Birthday", "Private Party", "Baby Shower"],
    services: ["Venue", "Character Performers", "Catering"],
    description: "Indoor party venue built for private kids celebrations, play time, food, and family-friendly hosting.",
    pricing: { kind: "flat", basePrice: 950, label: "private party package estimate" },
    availability: [{ days: [...everyDay], start: "10:00", end: "20:00" }],
    averageResponseMinutes: 260,
    budgetTier: "standard",
    maxGuestCount: 120,
    reviewCount: 165,
    sourceLabel: "Official site",
    sourceUrl: "https://scootersjungle.com/",
    tags: ["kids", "birthday", "indoor-play", "family-friendly", "private-party"],
  },
  {
    id: 16,
    name: "MB2 Raceway Sylmar",
    type: "Venue",
    location: "Sylmar, CA",
    address: "13943 Balboa Blvd, Sylmar, CA 91342",
    coordinates: { lat: 34.3203, lng: -118.4992 },
    price: "$1,450 estimate",
    capacity: "Racing parties and corporate groups",
    rating: 4.5,
    events: ["Birthday", "Corporate", "Graduation", "Private Party"],
    services: ["Venue", "Catering", "Staffing"],
    description: "Indoor kart racing venue for active birthdays, team outings, and private group events.",
    pricing: { kind: "flat", basePrice: 1450, label: "group racing estimate" },
    availability: [{ days: [...everyDay], start: "11:00", end: "22:00" }],
    averageResponseMinutes: 300,
    budgetTier: "standard",
    maxGuestCount: 180,
    reviewCount: 210,
    sourceLabel: "Official site",
    sourceUrl: "https://mb2raceway.com/",
    tags: ["racing", "activity", "birthday", "corporate", "team-event"],
  },
  {
    id: 17,
    name: "NOOR Pasadena",
    type: "Venue",
    location: "Pasadena, CA",
    address: "300 E Colorado Blvd, Pasadena, CA 91101",
    coordinates: { lat: 34.1456, lng: -118.144 },
    price: "$4,200 estimate",
    capacity: "Ballroom and terrace events",
    rating: 4.7,
    events: ["Wedding", "Corporate", "Baby Shower", "Fundraiser", "Private Party"],
    services: ["Venue", "Catering", "AV Production"],
    description: "Pasadena banquet and event venue with ballroom options for weddings, showers, and formal parties.",
    pricing: { kind: "flat", basePrice: 4200, label: "banquet venue estimate" },
    availability: [{ days: [...everyDay], start: "09:00", end: "23:30" }],
    averageResponseMinutes: 240,
    budgetTier: "premium",
    maxGuestCount: 350,
    reviewCount: 195,
    sourceLabel: "Official site",
    sourceUrl: "https://noorevents.com/",
    tags: ["banquet", "wedding", "ballroom", "pasadena", "formal"],
  },
  {
    id: 18,
    name: "Taglyan Complex",
    type: "Venue",
    location: "Hollywood, Los Angeles",
    address: "1201 Vine St, Los Angeles, CA 90038",
    coordinates: { lat: 34.0935, lng: -118.3265 },
    price: "$7,200 estimate",
    capacity: "Grand ballroom",
    rating: 4.8,
    events: ["Wedding", "Fundraiser", "Corporate", "Convention", "Private Party"],
    services: ["Venue", "Catering", "AV Production", "Staffing"],
    description: "Large Hollywood banquet hall for premium weddings, galas, and corporate events.",
    pricing: { kind: "flat", basePrice: 7200, label: "premium ballroom estimate" },
    availability: [{ days: [...everyDay], start: "09:00", end: "23:30" }],
    averageResponseMinutes: 180,
    budgetTier: "luxury",
    maxGuestCount: 500,
    reviewCount: 260,
    sourceLabel: "Official site",
    sourceUrl: "https://www.taglyancomplex.com/",
    tags: ["banquet", "wedding", "gala", "hollywood", "luxury"],
  },
  {
    id: 19,
    name: "Castaway Burbank",
    type: "Venue",
    location: "Burbank, CA",
    address: "1250 E Harvard Rd, Burbank, CA 91501",
    coordinates: { lat: 34.1978, lng: -118.3037 },
    price: "$5,900 estimate",
    capacity: "Hilltop restaurant and event spaces",
    rating: 4.6,
    events: ["Wedding", "Corporate", "Fundraiser", "Private Party", "Graduation"],
    services: ["Venue", "Catering", "Staffing"],
    description: "Hilltop venue with dining and event rooms for weddings, celebrations, and corporate dinners.",
    pricing: { kind: "flat", basePrice: 5900, label: "event space estimate" },
    availability: [{ days: [...everyDay], start: "10:00", end: "23:00" }],
    averageResponseMinutes: 220,
    budgetTier: "premium",
    maxGuestCount: 450,
    reviewCount: 310,
    sourceLabel: "Official site",
    sourceUrl: "https://www.castawayburbank.com/",
    tags: ["venue", "views", "restaurant", "wedding", "corporate"],
  },
  {
    id: 20,
    name: "Heirloom LA",
    type: "Catering",
    location: "East Hollywood, Los Angeles",
    address: "4121 Santa Monica Blvd, Los Angeles, CA 90029",
    coordinates: { lat: 34.0904, lng: -118.2826 },
    price: "$78 / guest estimate",
    rating: 4.8,
    events: ["Wedding", "Corporate", "Baby Shower", "Fundraiser", "Private Party"],
    services: ["Catering", "Staffing"],
    description: "Los Angeles catering studio for thoughtful private, wedding, and corporate menus.",
    pricing: { kind: "perGuest", perGuest: 78, minimum: 1800, serviceFee: 250, label: "per guest estimate" },
    availability: [{ days: [...everyDay], start: "08:00", end: "23:00" }],
    averageResponseMinutes: 180,
    budgetTier: "premium",
    maxGuestCount: 400,
    minGuestCount: 20,
    reviewCount: 140,
    sourceLabel: "Official site",
    sourceUrl: "https://www.heirloomla.com/",
    tags: ["catering", "seasonal", "wedding", "corporate", "private-dining"],
  },
  {
    id: 21,
    name: "Contemporary Catering",
    type: "Catering",
    location: "Santa Monica, CA",
    address: "Santa Monica, CA",
    coordinates: { lat: 34.022, lng: -118.4814 },
    price: "$64 / guest estimate",
    rating: 4.7,
    events: ["Wedding", "Corporate", "Fundraiser", "Birthday", "Private Party"],
    services: ["Catering", "Staffing"],
    description: "Catering provider for corporate events, weddings, and social celebrations around greater LA.",
    pricing: { kind: "perGuest", perGuest: 64, minimum: 1600, serviceFee: 200, label: "per guest estimate" },
    availability: [{ days: [...everyDay], start: "08:00", end: "23:00" }],
    averageResponseMinutes: 210,
    budgetTier: "standard",
    maxGuestCount: 800,
    minGuestCount: 25,
    reviewCount: 118,
    sourceLabel: "Official site",
    sourceUrl: "https://www.contemporarycatering.com/",
    tags: ["catering", "corporate", "wedding", "buffet", "staffing"],
  },
  {
    id: 22,
    name: "Joe's Mobile Music",
    type: "DJ",
    location: "Long Beach, CA",
    address: "Long Beach, CA",
    coordinates: { lat: 33.7879, lng: -118.1704 },
    price: "$425 / 3 hours estimate",
    rating: 4.6,
    events: ["Birthday", "Wedding", "Graduation", "Corporate", "Private Party"],
    services: ["DJ", "AV Production"],
    description: "Mobile DJ service for South Bay, Long Beach, and greater LA celebrations.",
    pricing: { kind: "hourly", hourlyRate: 125, minHours: 3, setupFee: 50, label: "mobile DJ estimate" },
    availability: [
      { days: [...weekdays], start: "16:00", end: "23:00" },
      { days: [...weekend], start: "11:00", end: "23:30" },
    ],
    averageResponseMinutes: 160,
    budgetTier: "standard",
    maxGuestCount: 350,
    reviewCount: 98,
    sourceLabel: "Official site",
    sourceUrl: "https://www.joesmobilemusic.com/",
    tags: ["dj", "long-beach", "mobile", "wedding", "birthday"],
  },
  {
    id: 23,
    name: "Splacer LA Live Music",
    type: "Live Music",
    location: "Downtown Los Angeles",
    address: "Downtown Los Angeles, CA",
    coordinates: { lat: 34.0449, lng: -118.2553 },
    price: "$650 estimate",
    rating: 4.5,
    events: ["Wedding", "Fundraiser", "Corporate", "Private Party", "Funeral"],
    services: ["Live Music"],
    description: "Demo live-music sourcing option for acoustic, jazz, and reception entertainment needs.",
    pricing: { kind: "flat", basePrice: 650, label: "live music estimate" },
    availability: [{ days: [...everyDay], start: "10:00", end: "22:00" }],
    averageResponseMinutes: 420,
    budgetTier: "standard",
    maxGuestCount: 260,
    reviewCount: 64,
    sourceLabel: "Marketplace reference",
    sourceUrl: "https://www.splacer.co/",
    tags: ["live-music", "jazz", "acoustic", "reception", "ceremony"],
  },
  {
    id: 24,
    name: "The Pod Photography",
    type: "Photography",
    location: "Culver City, CA",
    address: "Culver City, CA",
    coordinates: { lat: 34.0059, lng: -118.4117 },
    price: "$1,200 estimate",
    rating: 4.8,
    events: ["Wedding", "Birthday", "Baby Shower", "Corporate", "Private Party"],
    services: ["Photography", "Photo Booth"],
    description: "Photography studio option for portraits, events, and celebration coverage around Los Angeles.",
    pricing: { kind: "flat", basePrice: 1200, label: "event photo estimate" },
    availability: [{ days: [...everyDay], start: "09:00", end: "23:00" }],
    averageResponseMinutes: 200,
    budgetTier: "premium",
    maxGuestCount: 500,
    reviewCount: 150,
    sourceLabel: "Official site",
    sourceUrl: "https://www.thepodphoto.com/",
    tags: ["photography", "event-coverage", "portraits", "wedding", "corporate"],
  },
  {
    id: 25,
    name: "Jardin del Eden Florist",
    type: "Florals",
    location: "Downtown Los Angeles",
    address: "766 Wall St, Los Angeles, CA 90014",
    coordinates: { lat: 34.0398, lng: -118.2492 },
    price: "$650 estimate",
    rating: 4.6,
    events: ["Wedding", "Baby Shower", "Funeral", "Birthday", "Fundraiser"],
    services: ["Florals"],
    description: "Flower District florist option for event florals, memorial arrangements, and celebration installs.",
    pricing: { kind: "flat", basePrice: 650, label: "event florals estimate" },
    availability: [{ days: [...everyDay], start: "07:00", end: "18:00" }],
    averageResponseMinutes: 300,
    budgetTier: "standard",
    reviewCount: 120,
    sourceLabel: "Official site",
    sourceUrl: "https://www.jardindeledenflowers.com/",
    tags: ["florals", "flower-district", "wedding", "memorial", "baby-shower"],
  },
  {
    id: 26,
    name: "Gotham Security",
    type: "Security",
    location: "Los Angeles, CA",
    address: "Los Angeles, CA",
    coordinates: { lat: 34.0618, lng: -118.3005 },
    price: "$90 / hour estimate",
    rating: 4.5,
    events: ["Corporate", "Convention", "Fundraiser", "Private Party", "Wedding"],
    services: ["Security", "Staffing"],
    description: "Event security staffing option for guest flow, access control, and higher-attendance events.",
    pricing: { kind: "hourly", hourlyRate: 90, minHours: 4, label: "security staff estimate" },
    availability: [{ days: [...everyDay], start: "07:00", end: "23:30" }],
    averageResponseMinutes: 180,
    budgetTier: "standard",
    maxGuestCount: 2000,
    reviewCount: 82,
    sourceLabel: "Official site",
    sourceUrl: "https://gothamsecurity.com/",
    tags: ["security", "staffing", "access-control", "corporate", "large-event"],
  },
  {
    id: 27,
    name: "United Site Services LA",
    type: "Portable Restrooms",
    location: "Commerce, CA",
    address: "Commerce, CA",
    coordinates: { lat: 34.0006, lng: -118.1598 },
    price: "$725 estimate",
    rating: 4.4,
    events: ["Convention", "Fundraiser", "Corporate", "Private Party", "Graduation"],
    services: ["Portable Restrooms", "Staffing"],
    description: "Portable restroom and site service provider for outdoor and large-format event logistics.",
    pricing: { kind: "flat", basePrice: 725, label: "restroom logistics estimate" },
    availability: [{ days: [...everyDay], start: "06:00", end: "20:00" }],
    averageResponseMinutes: 360,
    budgetTier: "standard",
    maxGuestCount: 3000,
    reviewCount: 70,
    sourceLabel: "Official site",
    sourceUrl: "https://www.unitedsiteservices.com/",
    tags: ["restrooms", "logistics", "outdoor", "large-event", "delivery"],
  },
  {
    id: 28,
    name: "Classic Party Rentals LA",
    type: "Rentals",
    location: "Inglewood, CA",
    address: "Inglewood, CA",
    coordinates: { lat: 33.9617, lng: -118.3531 },
    price: "$1,150 estimate",
    rating: 4.6,
    events: ["Wedding", "Birthday", "Baby Shower", "Corporate", "Private Party"],
    services: ["Rentals", "Booth Rentals"],
    description: "Party rental option for seating, tables, lounges, booths, and practical event infrastructure.",
    pricing: { kind: "flat", basePrice: 1150, label: "rental package estimate" },
    availability: [{ days: [...everyDay], start: "07:00", end: "20:00" }],
    averageResponseMinutes: 240,
    budgetTier: "standard",
    maxGuestCount: 700,
    reviewCount: 104,
    sourceLabel: "Official site",
    sourceUrl: "https://classicpartyrentals.com/",
    tags: ["rentals", "tables", "chairs", "booth", "wedding", "party"],
  },
];
