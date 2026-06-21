import type { DiscoveryQuestion, EventTaxonomyProfile } from "./types";

const sharedQuestions: DiscoveryQuestion[] = [
  {
    id: "guestCount",
    label: "Estimated guest count",
    placeholder: "60",
    type: "number",
  },
  {
    id: "budgetTier",
    label: "Budget feel",
    options: ["Economy", "Standard", "Premium", "Luxury"],
    type: "select",
  },
  {
    id: "venueStyle",
    label: "Venue style",
    placeholder: "Backyard, hotel, banquet hall, park...",
    type: "text",
  },
];

const questionBank: Record<string, DiscoveryQuestion[]> = {
  birthday: [
    { id: "age", label: "Age being celebrated", placeholder: "18, 21, 40...", type: "text" },
    { id: "theme", label: "Theme or vibe", placeholder: "Pool, BBQ, glam, superhero...", type: "text" },
    { id: "hasPool", label: "Pool party?", type: "boolean" },
    { id: "atHome", label: "Backyard or home event?", type: "boolean" },
    { id: "needsKidsEntertainment", label: "Kids entertainment needed?", type: "boolean" },
  ],
  wedding: [
    { id: "ceremonyAndReception", label: "Ceremony and reception?", type: "boolean" },
    { id: "indoorOutdoor", label: "Indoor or outdoor?", options: ["Indoor", "Outdoor", "Both"], type: "select" },
    { id: "religiousNeeds", label: "Religious or cultural requirements", placeholder: "Armenian, Jewish, Catholic...", type: "text" },
    { id: "openBar", label: "Open bar or alcohol service?", type: "boolean" },
    { id: "formalDinner", label: "Seated formal dinner?", type: "boolean" },
  ],
  quinceanera: [
    { id: "court", label: "Court of honor?", type: "boolean" },
    { id: "entrance", label: "Grand entrance or program?", type: "boolean" },
    { id: "danceStyle", label: "Music style", placeholder: "Latin, banda, DJ, live...", type: "text" },
    { id: "dressAndPhotos", label: "Formal photo session?", type: "boolean" },
  ],
  mitzvah: [
    { id: "kosher", label: "Kosher catering needed?", type: "boolean" },
    { id: "serviceLocation", label: "Synagogue or separate party venue?", type: "text" },
    { id: "kidsAdults", label: "Kids, adults, or both?", options: ["Kids", "Adults", "Both"], type: "select" },
    { id: "danceGames", label: "DJ games or dance floor?", type: "boolean" },
  ],
  corporate: [
    { id: "presentation", label: "Presentation or stage content?", type: "boolean" },
    { id: "networking", label: "Networking time?", type: "boolean" },
    { id: "openBar", label: "Open bar?", type: "boolean" },
    { id: "training", label: "Training or breakout rooms?", type: "boolean" },
    { id: "tradeShow", label: "Exhibitors or sponsor booths?", type: "boolean" },
  ],
  conference: [
    { id: "registration", label: "Registration/check-in required?", type: "boolean" },
    { id: "breakouts", label: "Breakout rooms?", type: "boolean" },
    { id: "liveStream", label: "Live streaming?", type: "boolean" },
    { id: "sponsors", label: "Sponsor or exhibitor booths?", type: "boolean" },
  ],
  graduation: [
    { id: "schoolLevel", label: "School level", options: ["High school", "College", "Graduate", "Other"], type: "select" },
    { id: "ceremony", label: "Ceremony/program?", type: "boolean" },
    { id: "photoMoments", label: "Photo moments or backdrop?", type: "boolean" },
  ],
  "baby-shower": [
    { id: "brunch", label: "Brunch style?", type: "boolean" },
    { id: "genderReveal", label: "Gender reveal moment?", type: "boolean" },
    { id: "giftTable", label: "Gift table and seating needed?", type: "boolean" },
  ],
  funeral: [
    { id: "serviceType", label: "Memorial, funeral, wake, or repass?", type: "text" },
    { id: "programs", label: "Printed programs?", type: "boolean" },
    { id: "liveStreaming", label: "Live streaming for remote guests?", type: "boolean" },
    { id: "religiousNeeds", label: "Religious or cultural needs", type: "text" },
  ],
  fundraiser: [
    { id: "program", label: "Stage program or speeches?", type: "boolean" },
    { id: "donorTiering", label: "VIP donor experience?", type: "boolean" },
    { id: "auction", label: "Auction or pledge moment?", type: "boolean" },
  ],
  "private-party": [
    { id: "partyStyle", label: "Party style", placeholder: "BBQ, block party, pool, holiday...", type: "text" },
    { id: "outdoor", label: "Outdoor setup?", type: "boolean" },
    { id: "music", label: "Music or entertainment?", type: "boolean" },
    { id: "alcohol", label: "Alcohol friendly?", type: "boolean" },
  ],
};

export function getDynamicQuestions(profile: EventTaxonomyProfile) {
  return [...sharedQuestions, ...(questionBank[profile.id] ?? questionBank["private-party"])];
}
