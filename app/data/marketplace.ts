export type MarketplaceItem = {
  id: number;
  name: string;
  type: "Venue" | "Vendor" | "Entertainment" | "Rental" | "Invitation";
  location: string;
  price: string;
  capacity?: string;
  rating: number;
  tags: string[];
  description: string;
};

export const marketplaceItems: MarketplaceItem[] = [
  {
    id: 1,
    name: "The Atrium House",
    type: "Venue",
    location: "Los Angeles, CA",
    price: "$4,800",
    capacity: "180 guests",
    rating: 4.96,
    tags: ["Wedding", "Corporate", "Private Party"],
    description: "Sunlit garden venue with indoor-outdoor flow and turnkey staffing.",
  },
  {
    id: 2,
    name: "Maison Table Catering",
    type: "Vendor",
    location: "Pasadena, CA",
    price: "$92 / guest",
    rating: 4.91,
    tags: ["Wedding", "Fundraiser", "Corporate"],
    description: "Seasonal menus, passed bites, plated dinners, and bar service.",
  },
  {
    id: 3,
    name: "Studio Eleven Rentals",
    type: "Rental",
    location: "Santa Monica, CA",
    price: "$1,250",
    rating: 4.88,
    tags: ["Birthday", "Baby Shower", "Private Party"],
    description: "Modern lounge seating, tableware, linens, bars, and staging pieces.",
  },
  {
    id: 4,
    name: "Soundline Collective",
    type: "Entertainment",
    location: "Long Beach, CA",
    price: "$2,100",
    rating: 4.94,
    tags: ["Graduation", "Corporate", "Convention"],
    description: "DJs, live musicians, hosts, speakers, lighting, and audio production.",
  },
  {
    id: 5,
    name: "Paper Bloom Studio",
    type: "Invitation",
    location: "Online",
    price: "$180",
    rating: 4.9,
    tags: ["Wedding", "Baby Shower", "Fundraiser"],
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
    tags: ["Seminar", "Convention", "Corporate"],
    description: "Flexible conference venue with expo floor, breakout rooms, and AV.",
  },
];

export const eventTypes = [
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

export const marketplaceTypes = [
  "All",
  "Venue",
  "Vendor",
  "Entertainment",
  "Rental",
  "Invitation",
] as const;
