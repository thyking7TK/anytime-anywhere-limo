export const services = [
  {
    id: "airport",
    title: "Nationwide Airport Transfers",
    eyebrow: "BOS, JFK, LGA, and beyond",
    text: "Private airport transportation to Boston Logan, JFK, LaGuardia, and airports across the country with real-time coordination and chauffeur-level service.",
  },
  {
    id: "corporate",
    title: "Executive & Corporate Travel",
    eyebrow: "Executive movement",
    text: "Reliable black car transportation for business professionals, client pickups, conferences, and executive schedules across major cities.",
  },
  {
    id: "longdistance",
    title: "Long-Distance Private Travel",
    eyebrow: "Door-to-door comfort",
    text: "Comfortable private transportation across state lines with no layovers, no crowds, and no compromise on professionalism.",
  },
  {
    id: "events",
    title: "Event & VIP Transportation",
    eyebrow: "High-touch arrivals",
    text: "Luxury transportation for weddings, private events, galas, and high-end clientele who expect a polished arrival and departure.",
  },
  {
    id: "hourly",
    title: "Hourly Chauffeur Service",
    eyebrow: "On your schedule",
    text: "On-demand luxury transportation by the hour for meetings, city runs, multi-stop itineraries, and dedicated chauffeur support.",
  },
];

export const testimonials = [
  {
    name: "Sarah K.",
    role: "Boston Logan to Portland, Maine",
    quote:
      "Driver was waiting at arrivals before I even had my luggage. Immaculate vehicle, smooth ride the whole way, and exactly the kind of professionalism I hoped for.",
  },
  {
    name: "Michael T.",
    role: "Corporate client - New York",
    quote:
      "We use Autovise for executive travel between New York and Boston. Punctual every time, professional presentation, and the whole experience feels first-class.",
  },
  {
    name: "Amanda & James R.",
    role: "Wedding transportation - Boston, Massachusetts",
    quote:
      "Autovise made the day feel calm and elevated. The vehicle looked exceptional, the chauffeur was polished, and the logistics were handled perfectly.",
  },
];

export const defaultVehicles = [
  {
    slug: "executive-suv",
    name: "GMC Yukon Denali",
    capacity: 6,
    description:
      "Our flagship luxury SUV. The Yukon Denali delivers a commanding premium cabin, leather seating for up to 6 passengers, generous luggage capacity, and the presence every executive transfer deserves.",
    bestFor: "airport transfers, executive travel, VIP transportation, and long-distance rides",
    mood: "Flagship executive SUV",
    accent: "from-amber-100/20 via-transparent to-transparent",
    imageUrls: [],
    active: true,
    displayOrder: 1,
  },
];

export const defaultPricingMatrix = {
  airport: {
    "executive-suv": 650,
  },
  corporate: {
    "executive-suv": 330,
  },
  events: {
    "executive-suv": 375,
  },
  hourly: {
    "executive-suv": 330,
  },
  longdistance: {
    "executive-suv": 650,
  },
};

export const defaultPricingSettings = {
  afterHoursFee: 98,
  weekendFee: 130,
  specialRequestFee: 25,
  extraPassengerFee: 40,
  gratuityRate: 0.18,
  afterHoursStartHour: 22,
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
