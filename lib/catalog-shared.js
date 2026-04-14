export const services = [
  {
    id: "airport",
    title: "Nationwide Airport Transfers",
    eyebrow: "BOS · JFK · LGA · and beyond",
    text: "Flat-rate private transfers to Boston Logan, JFK, LaGuardia, and airports across the country. Real-time flight tracking — your chauffeur is ready before you land.",
  },
  {
    id: "corporate",
    title: "Executive & Corporate Travel",
    eyebrow: "Executive movement",
    text: "Reliable black car service for business professionals across major cities. Meetings, client pickups, roadshows, and conference travel handled with total discretion.",
  },
  {
    id: "longdistance",
    title: "Long-Distance Private Travel",
    eyebrow: "Coast to coast comfort",
    text: "Comfortable, door-to-door service across state lines. From Maine to New York — and beyond — with no layovers, no crowds, and no compromises.",
  },
  {
    id: "events",
    title: "Event & VIP Transportation",
    eyebrow: "Occasion worthy",
    text: "Elevated transportation for weddings, private events, galas, and high-end clientele who expect a flawless arrival and departure.",
  },
  {
    id: "hourly",
    title: "Hourly Chauffeur Service",
    eyebrow: "On your schedule",
    text: "On-demand luxury transportation wherever you are. Book by the hour for multi-stop runs, city tours, or any occasion requiring a dedicated professional.",
  },
];

export const testimonials = [
  {
    name: "Sarah K.",
    role: "Boston Logan → Portland, ME",
    quote:
      "Driver was waiting at arrivals before I even had my luggage. Immaculate Denali, smooth ride the whole way. I will never take a rideshare to the airport again.",
  },
  {
    name: "Michael T.",
    role: "Corporate client — New York",
    quote:
      "We use Autovise for all our executive runs between New York and Boston. Punctual every single time, professional presentation, and the flat rate means zero billing surprises.",
  },
  {
    name: "Amanda & James R.",
    role: "Wedding — Boston, MA",
    quote:
      "Made our wedding day completely stress-free. The Denali was spotless, the chauffeur was dressed impeccably, and the whole experience felt genuinely first-class.",
  },
];

export const defaultVehicles = [
  {
    slug: "executive-suv",
    name: "GMC Yukon Denali",
    capacity: 6,
    description:
      "Our flagship luxury SUV. The Yukon Denali delivers a commanding, premium cabin with leather seating for up to 6 passengers, generous luggage capacity, and the presence that every executive transfer deserves.",
    bestFor: "airport transfers, corporate travel, weddings, and long-distance rides",
    mood: "Our flagship vehicle",
    accent: "from-amber-100/20 via-transparent to-transparent",
    imageUrls: [],
    active: true,
    displayOrder: 1,
  },
];

export const defaultPricingMatrix = {
  // Portland → Boston Logan flat rate: $650 | Portland → PWM: $95 starting
  airport: {
    "executive-suv": 650,
  },
  // $110/hour weekday · 3-hour minimum shown as base
  corporate: {
    "executive-suv": 330,
  },
  // $125/hour · 3-hour minimum shown as base
  events: {
    "executive-suv": 375,
  },
  // $110/hour weekday · 3-hour minimum
  hourly: {
    "executive-suv": 330,
  },
  // Base rate for long-distance; mileage added via special requests
  longdistance: {
    "executive-suv": 650,
  },
};

export const defaultPricingSettings = {
  afterHoursFee: 98,   // late night after 10PM: +15% of $650 base
  weekendFee: 130,     // holidays/events: +20% of $650 base
  specialRequestFee: 25,
  extraPassengerFee: 40,
  gratuityRate: 0.18,
  afterHoursStartHour: 22,  // 10PM
  afterHoursEndHour: 6,
};

export function slugifyVehicleName(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function getDefaultCatalog() {
  return {
    services,
    testimonials,
    vehicles: defaultVehicles.map((vehicle) => ({ ...vehicle })),
    pricingMatrix: structuredClone(defaultPricingMatrix),
    pricingSettings: { ...defaultPricingSettings },
  };
}
