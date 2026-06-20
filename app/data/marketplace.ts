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
  | "Entertainment"
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
};

export type EventPlanPreset = {
  recommended: ServiceName[];
  more: ServiceName[];
};

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

export const allServices: ServiceName[] = [
  "Venue",
  "Catering",
  "Cake & Desserts",
  "Entertainment",
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
      "Entertainment",
      "Rentals",
      "Invitations",
      "Photography",
    ],
    more: ["Florals", "AV Production", "Transportation", "Staffing"],
  },
  Wedding: {
    recommended: [
      "Venue",
      "Catering",
      "Florals",
      "Photography",
      "Rentals",
      "Invitations",
      "Entertainment",
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
      "Entertainment",
    ],
    more: ["AV Production", "Transportation", "Staffing", "Cake & Desserts"],
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
    more: ["Entertainment", "Transportation", "Registration", "Printed Materials"],
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
    more: ["Photography", "Transportation", "Entertainment", "Printed Materials"],
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
    more: ["Photography", "AV Production", "Rentals", "Entertainment"],
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
    more: ["Entertainment", "Transportation", "Staffing"],
  },
  Fundraiser: {
    recommended: [
      "Venue",
      "Catering",
      "AV Production",
      "Invitations",
      "Entertainment",
      "Staffing",
    ],
    more: ["Photography", "Florals", "Registration", "Printed Materials"],
  },
  "Private Party": {
    recommended: [
      "Venue",
      "Catering",
      "Entertainment",
      "Rentals",
      "Photography",
      "Invitations",
    ],
    more: ["Florals", "Transportation", "Staffing", "Cake & Desserts"],
  },
};

export const marketplaceTypes = ["All", ...allServices] as const;

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
  },
  {
    id: 4,
    name: "Soundline Collective",
    type: "Entertainment",
    location: "Long Beach, CA",
    price: "$2,100",
    rating: 4.94,
    events: ["Birthday", "Graduation", "Corporate", "Convention", "Private Party"],
    services: ["Entertainment", "AV Production"],
    description: "DJs, live musicians, hosts, speakers, lighting, and audio production.",
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
  },
];
