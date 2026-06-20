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
  | "Staffing"
  | "Booth Rentals";

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
  name: string;
  type: ServiceName;
  location: string;
  price: string;
  capacity?: string;
  rating: number;
  events: EventType[];
  services: ServiceName[];
  description: string;
  pricing: PricingModel;
  availability: AvailabilityWindow[];
};

export type QuoteContext = {
  date?: string;
  startTime?: string;
  durationHours: number;
  guests: number;
};

export type EventPlanPreset = {
  recommended: ServiceName[];
  more: ServiceName[];
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
    more: ["Live Music", "DJ", "Photo Booth", "Transportation", "Registration"],
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
    more: ["Photography", "Transportation", "DJ", "Live Music", "Printed Materials"],
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
    more: ["DJ", "Photography", "Florals", "Registration", "Printed Materials"],
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

export function quoteItem(item: MarketplaceItem, context: QuoteContext) {
  if (item.pricing.kind === "flat") {
    return item.pricing.basePrice;
  }

  if (item.pricing.kind === "hourly") {
    const billableHours = Math.max(context.durationHours, item.pricing.minHours);

    return billableHours * item.pricing.hourlyRate + (item.pricing.setupFee ?? 0);
  }

  return Math.max(
    context.guests * item.pricing.perGuest + (item.pricing.serviceFee ?? 0),
    item.pricing.minimum,
  );
}

export function isAvailableAt(item: MarketplaceItem, date?: string, startTime?: string) {
  if (!date || !startTime) {
    return true;
  }

  const day = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
    new Date(`${date}T12:00:00`),
  );

  return item.availability.some(
    (window) =>
      window.days.includes(day) &&
      startTime >= window.start &&
      startTime <= window.end,
  );
}

export const marketplaceItems: MarketplaceItem[] = [
  {
    id: 1,
    name: "The Atrium House",
    type: "Venue",
    location: "Los Angeles, CA",
    price: "$4,800",
    capacity: "180 guests",
    rating: 4.96,
    events: ["Wedding", "Corporate", "Private Party", "Birthday"],
    services: ["Venue"],
    description: "Sunlit garden venue with indoor-outdoor flow and turnkey staffing.",
    pricing: { kind: "flat", basePrice: 4800, label: "site rental" },
    availability: [
      { days: [...weekdays], start: "09:00", end: "22:00" },
      { days: [...weekend], start: "10:00", end: "23:00" },
    ],
  },
  {
    id: 2,
    name: "Maison Table Catering",
    type: "Catering",
    location: "Pasadena, CA",
    price: "$92 / guest",
    rating: 4.91,
    events: ["Wedding", "Fundraiser", "Corporate", "Birthday", "Funeral"],
    services: ["Catering", "Staffing"],
    description: "Seasonal menus, passed bites, plated dinners, and bar service.",
    pricing: { kind: "perGuest", perGuest: 92, minimum: 1800, label: "per guest" },
    availability: [{ days: [...everyDay], start: "08:00", end: "22:00" }],
  },
  {
    id: 3,
    name: "Studio Eleven Rentals",
    type: "Rentals",
    location: "Santa Monica, CA",
    price: "$1,250",
    rating: 4.88,
    events: ["Birthday", "Baby Shower", "Private Party", "Wedding"],
    services: ["Rentals"],
    description: "Modern lounge seating, tableware, linens, bars, and staging pieces.",
    pricing: { kind: "flat", basePrice: 1250, label: "rental package" },
    availability: [{ days: [...everyDay], start: "07:00", end: "20:00" }],
  },
  {
    id: 4,
    name: "Soundline DJ Co.",
    type: "DJ",
    location: "Long Beach, CA",
    price: "$300 / 3 hours",
    rating: 4.94,
    events: ["Birthday", "Graduation", "Corporate", "Convention", "Private Party", "Wedding"],
    services: ["DJ", "AV Production"],
    description: "High-energy DJs with clean sound, dance lighting, and event hosting.",
    pricing: { kind: "hourly", hourlyRate: 100, minHours: 3, label: "$300 for 3 hours" },
    availability: [
      { days: [...weekdays], start: "14:00", end: "23:00" },
      { days: [...weekend], start: "10:00", end: "23:30" },
    ],
  },
  {
    id: 5,
    name: "Paper Bloom Studio",
    type: "Invitations",
    location: "Online",
    price: "$180",
    rating: 4.9,
    events: ["Wedding", "Baby Shower", "Fundraiser", "Birthday", "Private Party"],
    services: ["Invitations", "Printed Materials"],
    description: "Digital and printed invitation suites with RSVP tracking.",
    pricing: { kind: "flat", basePrice: 180, label: "starter suite" },
    availability: [{ days: [...weekdays], start: "09:00", end: "17:00" }],
  },
  {
    id: 6,
    name: "Civic Hall West",
    type: "Venue",
    location: "Anaheim, CA",
    price: "$8,400",
    capacity: "620 guests",
    rating: 4.84,
    events: ["Seminar", "Convention", "Corporate", "Fundraiser"],
    services: ["Venue", "AV Production", "Booth Rentals"],
    description: "Flexible conference venue with expo floor, breakout rooms, and AV.",
    pricing: { kind: "flat", basePrice: 8400, label: "daily venue rental" },
    availability: [{ days: [...everyDay], start: "08:00", end: "20:00" }],
  },
  {
    id: 7,
    name: "Sweet Crumb Atelier",
    type: "Cake & Desserts",
    location: "Glendale, CA",
    price: "$320",
    rating: 4.93,
    events: ["Birthday", "Wedding", "Baby Shower", "Graduation", "Private Party"],
    services: ["Cake & Desserts"],
    description: "Custom cakes, dessert tables, themed pastries, and delivery setup.",
    pricing: { kind: "flat", basePrice: 320, label: "custom cake" },
    availability: [{ days: [...weekdays, ...weekend], start: "08:00", end: "19:00" }],
  },
  {
    id: 8,
    name: "Lumen Photo House",
    type: "Photography",
    location: "Los Angeles, CA",
    price: "$1,600",
    rating: 4.89,
    events: ["Birthday", "Wedding", "Graduation", "Corporate", "Baby Shower"],
    services: ["Photography"],
    description: "Event photography packages with polished galleries and fast turnaround.",
    pricing: { kind: "hourly", hourlyRate: 250, minHours: 4, setupFee: 600, label: "4-hour minimum" },
    availability: [{ days: [...everyDay], start: "08:00", end: "22:00" }],
  },
  {
    id: 9,
    name: "Grace & Stem Florals",
    type: "Florals",
    location: "Burbank, CA",
    price: "$750",
    rating: 4.95,
    events: ["Wedding", "Baby Shower", "Funeral", "Fundraiser", "Private Party"],
    services: ["Florals"],
    description: "Floral design for celebrations, memorials, tablescapes, and stages.",
    pricing: { kind: "flat", basePrice: 750, label: "design package" },
    availability: [{ days: [...everyDay], start: "07:00", end: "18:00" }],
  },
  {
    id: 10,
    name: "Serenity Memorial Chapel",
    type: "Venue",
    location: "Pasadena, CA",
    price: "$2,900",
    capacity: "140 guests",
    rating: 4.92,
    events: ["Funeral"],
    services: ["Venue", "Live Streaming", "Printed Programs"],
    description: "Quiet memorial venue with streaming support and family coordination.",
    pricing: { kind: "flat", basePrice: 2900, label: "memorial block" },
    availability: [{ days: [...everyDay], start: "09:00", end: "18:00" }],
  },
  {
    id: 11,
    name: "Legacy Program Press",
    type: "Printed Programs",
    location: "Online",
    price: "$240",
    rating: 4.87,
    events: ["Funeral", "Seminar", "Convention"],
    services: ["Printed Programs", "Printed Materials"],
    description: "Elegant programs, signage, keepsakes, and rush print coordination.",
    pricing: { kind: "flat", basePrice: 240, label: "print package" },
    availability: [{ days: [...weekdays], start: "08:00", end: "18:00" }],
  },
  {
    id: 12,
    name: "ClearCast Streaming",
    type: "Live Streaming",
    location: "Los Angeles, CA",
    price: "$680",
    rating: 4.86,
    events: ["Funeral", "Seminar", "Corporate", "Convention"],
    services: ["Live Streaming", "AV Production"],
    description: "Private live streams, recording, microphones, cameras, and tech support.",
    pricing: { kind: "hourly", hourlyRate: 170, minHours: 3, setupFee: 170, label: "streaming crew" },
    availability: [{ days: [...everyDay], start: "08:00", end: "20:00" }],
  },
  {
    id: 13,
    name: "Metro Guest Transport",
    type: "Transportation",
    location: "Los Angeles, CA",
    price: "$950",
    rating: 4.81,
    events: ["Wedding", "Funeral", "Corporate", "Convention"],
    services: ["Transportation"],
    description: "Shuttles, black cars, guest routing, and timed pickup coordination.",
    pricing: { kind: "hourly", hourlyRate: 190, minHours: 5, label: "charter block" },
    availability: [{ days: [...everyDay], start: "06:00", end: "23:00" }],
  },
  {
    id: 14,
    name: "Summit Badge & Check-in",
    type: "Registration",
    location: "Online",
    price: "$650",
    rating: 4.88,
    events: ["Seminar", "Convention", "Corporate", "Fundraiser"],
    services: ["Registration", "Printed Materials", "Staffing"],
    description: "Registration pages, badges, QR check-in, and onsite welcome staff.",
    pricing: { kind: "flat", basePrice: 650, label: "check-in kit" },
    availability: [{ days: [...weekdays], start: "07:00", end: "18:00" }],
  },
  {
    id: 15,
    name: "Velvet Strings Trio",
    type: "Live Music",
    location: "Los Angeles, CA",
    price: "$450 / hour",
    rating: 4.97,
    events: ["Wedding", "Fundraiser", "Funeral", "Corporate", "Private Party"],
    services: ["Live Music"],
    description: "String trio, acoustic sets, and ceremony music with tailored set lists.",
    pricing: { kind: "hourly", hourlyRate: 450, minHours: 2, label: "live trio" },
    availability: [{ days: [...everyDay], start: "09:00", end: "21:00" }],
  },
  {
    id: 16,
    name: "Wonder Arc Magic",
    type: "Magic",
    location: "Orange County, CA",
    price: "$275 / hour",
    rating: 4.9,
    events: ["Birthday", "Baby Shower", "Private Party", "Corporate"],
    services: ["Magic"],
    description: "Close-up magic, stage sets, family shows, and strolling performance.",
    pricing: { kind: "hourly", hourlyRate: 275, minHours: 1, label: "magic performance" },
    availability: [{ days: [...weekend], start: "10:00", end: "20:00" }],
  },
  {
    id: 17,
    name: "Hero Party Cast",
    type: "Character Performers",
    location: "Los Angeles, CA",
    price: "$150 / hour",
    rating: 4.85,
    events: ["Birthday", "Baby Shower", "Private Party"],
    services: ["Character Performers"],
    description: "Costumed characters, princesses, superheroes, clowns, and party hosts.",
    pricing: { kind: "hourly", hourlyRate: 150, minHours: 2, label: "character performer" },
    availability: [{ days: [...weekend], start: "09:00", end: "19:00" }],
  },
  {
    id: 18,
    name: "Flashbox Photo Booths",
    type: "Photo Booth",
    location: "Los Angeles, CA",
    price: "$500 / 3 hours",
    rating: 4.83,
    events: ["Birthday", "Wedding", "Graduation", "Corporate", "Private Party"],
    services: ["Photo Booth"],
    description: "Open-air booths, props, instant galleries, prints, and branded overlays.",
    pricing: { kind: "hourly", hourlyRate: 125, minHours: 3, setupFee: 125, label: "booth rental" },
    availability: [{ days: [...everyDay], start: "10:00", end: "23:00" }],
  },
];
