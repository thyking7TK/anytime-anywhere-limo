export const maineTourPackages = [
  {
    id: "bar-harbor",
    eyebrow: "Signature Maine Experience",
    title: "Portland to Bar Harbor Private Tour",
    shortTitle: "Bar Harbor Tour",
    duration: "Full Day / Overnight",
    price: "Starting at $1,899",
    pricingOptions: [
      {
        price: "$1,899",
        title: "Standard Full-Day Experience",
        includes: [
          "Private chauffeur for up to 10 hours",
          "Luxury SUV or executive sedan",
          "Portland hotel or airport pickup",
          "Acadia & Bar Harbor scenic stops",
          "Water, chargers, and comfort amenities",
        ],
      },
      {
        price: "$2,900",
        title: "Executive Overnight Experience",
        includes: [
          "Everything in Full-Day Experience",
          "Overnight chauffeur standby",
          "Luxury dinner reservation coordination",
          "Sunrise or sunset Cadillac Mountain trip",
          "Flexible private itinerary adjustments",
        ],
      },
      {
        price: "$5,000+",
        title: "Ultra VIP Multi-Day Coastal Experience",
        includes: [
          "Multi-day private chauffeur service",
          "VIP hotel coordination assistance",
          "Custom scenic photography itinerary",
          "Executive-level privacy & concierge support",
          "Premium luxury experience built around client schedule",
        ],
      },
    ],
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
    route: ["Portland", "Freeport", "Camden", "Acadia", "Bar Harbor"],
    highlights: [
      "Acadia National Park",
      "Cadillac Mountain",
      "Jordan Pond",
      "Ocean Path",
      "Lobster dinner stop",
    ],
    description:
      "A premium chauffeured coastal escape from Portland to Bar Harbor with curated stops, scenic overlooks, and a smooth luxury ride from start to finish.",
  },
  {
    id: "lighthouses",
    eyebrow: "Coastal Photo Route",
    title: "Private Maine Lighthouse Tour",
    shortTitle: "Lighthouse Tour",
    duration: "4-8 Hours",
    price: "Starting at $649",
    pricingOptions: [
      {
        price: "$649",
        title: "Standard Lighthouse Experience",
        includes: [
          "4-hour private chauffeur service",
          "Portland lighthouse route",
          "Oceanfront scenic photo stops",
          "Luxury black car transportation",
        ],
      },
      {
        price: "$950",
        title: "Sunset Dining Experience",
        includes: [
          "Extended coastal touring",
          "Oceanfront dining stop",
          "Golden hour photography stops",
          "Premium evening chauffeur service",
        ],
      },
      {
        price: "$1,500+",
        title: "Full-Day VIP Coastal Photography Tour",
        includes: [
          "Private full-day coastal route",
          "Multiple lighthouse destinations",
          "Flexible itinerary and extended wait times",
          "VIP scenic experience with custom requests",
        ],
      },
    ],
    image:
      "https://images.unsplash.com/photo-1516402707257-787c50fc3898?auto=format&fit=crop&w=1600&q=80",
    route: ["Portland", "Cape Elizabeth", "South Portland", "York"],
    highlights: [
      "Portland Head Light",
      "Bug Light",
      "Two Lights",
      "Nubble Lighthouse",
      "Oceanfront photo stops",
    ],
    description:
      "A clean, scenic, private lighthouse route designed for couples, cruise guests, families, and clients who want classic Maine views without the stress of driving.",
  },
  {
    id: "fall",
    eyebrow: "Seasonal VIP Package",
    title: "VIP Fall Foliage Chauffeur Tour",
    shortTitle: "Fall Foliage Tour",
    duration: "Half Day / Full Day",
    price: "Starting at $995",
    pricingOptions: [
      {
        price: "$995",
        title: "Half-Day Foliage Tour",
        includes: [
          "Half-day private chauffeur",
          "Scenic mountain and foliage routes",
          "Luxury SUV transportation",
          "Private scenic photo stops",
        ],
      },
      {
        price: "$1,750",
        title: "Full-Day Scenic Mountain Route",
        includes: [
          "Full-day private touring",
          "Rangeley and Grafton Notch route",
          "Restaurant and overlook stops",
          "Extended custom route flexibility",
        ],
      },
      {
        price: "$3,000+",
        title: "Weekend Luxury Foliage Escape",
        includes: [
          "Weekend luxury transportation",
          "Hotel and dining coordination",
          "Private scenic itinerary planning",
          "VIP chauffeur availability throughout stay",
        ],
      },
    ],
    image:
      "https://images.unsplash.com/photo-1508189860359-777d945909ef?auto=format&fit=crop&w=1600&q=80",
    route: ["Portland", "Camden", "Rangeley", "Grafton Notch", "Acadia"],
    highlights: [
      "Mountain overlooks",
      "Covered bridges",
      "Private photo stops",
      "Seasonal scenic roads",
      "Hot drink stop",
    ],
    description:
      "A seasonal luxury package for travelers who want Maine's fall colors with professional transportation, premium comfort, and carefully planned scenic stops.",
  },
  {
    id: "kennebunkport",
    eyebrow: "Executive Coastal Escape",
    title: "Kennebunkport Private Coastal Tour",
    shortTitle: "Kennebunkport Tour",
    duration: "4-6 Hours",
    price: "Starting at $549",
    pricingOptions: [
      {
        price: "$549",
        title: "Executive Coastal Ride",
        includes: [
          "Private chauffeur service",
          "Kennebunkport coastal route",
          "Luxury SUV or sedan",
          "Flexible local stops",
        ],
      },
      {
        price: "$850",
        title: "Dining & Shopping Experience",
        includes: [
          "Extended chauffeur availability",
          "Dock Square shopping and dining stops",
          "Oceanfront scenic route",
          "Premium evening transportation",
        ],
      },
      {
        price: "$1,400+",
        title: "Full Luxury Day Experience",
        includes: [
          "Full-day luxury transportation",
          "Custom Maine coastal itinerary",
          "Premium wait-time flexibility",
          "VIP client experience",
        ],
      },
    ],
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    route: [
      "Portland",
      "Kennebunkport",
      "Dock Square",
      "Ocean Avenue",
      "Goose Rocks Beach",
    ],
    highlights: [
      "Dock Square",
      "Ocean Avenue",
      "Boutique shopping",
      "Oceanfront dining",
      "Beachfront views",
    ],
    description:
      "A polished short-route package for business travelers, couples, and weekend visitors who want a luxury New England coastal experience.",
  },
];

export const maineTourIncluded = [
  "Professional chauffeur",
  "Luxury black SUV or sedan",
  "Hotel, airport, or private pickup",
  "Custom route planning",
  "Photo stop coordination",
  "Water, chargers, and clean premium cabin",
];

export function getMaineTourById(tourId) {
  return (
    maineTourPackages.find((tour) => tour.id === tourId) ?? maineTourPackages[0]
  );
}

export function getMaineTourPricingOption(tourId, tierIndex = 0) {
  const tour = getMaineTourById(tourId);
  return tour?.pricingOptions?.[tierIndex] ?? tour?.pricingOptions?.[0] ?? null;
}

export function parseTourPrice(priceLabel) {
  const normalized = String(priceLabel ?? "").replace(/[^0-9.]/g, "");
  const value = Number(normalized);
  return Number.isFinite(value) ? Math.round(value) : 0;
}
