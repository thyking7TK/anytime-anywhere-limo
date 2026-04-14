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

export const bookingServices = [
  {
    id: "hourly",
    title: "Hourly Service",
    eyebrow: "Starting at $110/hour",
    text: "Ideal for executive schedules, city runs, private events, and dedicated chauffeur service with a 3-hour minimum.",
  },
  {
    id: "airport",
    title: "Flat-Rate Airport Transfer",
    eyebrow: "Portland to Logan from $650",
    text: "Use a flat-rate airport quote for configured routes like Portland, Maine to Boston Logan Airport, with round-trip pricing when needed.",
  },
  {
    id: "custom",
    title: "Custom Trip",
    eyebrow: "Long-distance private travel",
    text: "Built for interstate and custom transportation requests that need a time, mileage, and service-buffer quote.",
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
    bestFor:
      "airport transfers, executive travel, VIP transportation, and long-distance rides",
    mood: "Flagship executive SUV",
    accent: "from-amber-100/20 via-transparent to-transparent",
    imageUrls: [],
    active: true,
    displayOrder: 1,
  },
];

export const defaultAirportRoutes = [
  {
    id: "portland-me-boston-logan",
    label: "Portland, ME ↔ Boston Logan Airport",
    endpointA: "Portland, ME",
    endpointB: "Boston Logan Airport",
    oneWayPrice: 650,
    roundTripPrice: 1200,
    active: true,
    displayOrder: 1,
  },
];

export const defaultPricingSettings = {
  weekdayHourlyRate: 110,
  weekendHourlyRate: 130,
  hourlyMinimum: 3,
  customHourlyBasis: 120,
  mileageRate: 1.5,
  profitBuffer: 100,
  waitRate: 40,
  stopFee: 35,
  lateNightPercent: 0.15,
  holidayPercent: 0.2,
  lateNightStartHour: 22,
  lateNightEndHour: 6,
  minimumQuote: 330,
};

export function slugifyVehicleName(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function slugifyAirportRouteLabel(label) {
  return String(label ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function getDefaultCatalog() {
  return {
    services,
    bookingServices,
    testimonials,
    vehicles: defaultVehicles.map((vehicle) => ({ ...vehicle })),
    pricingSettings: { ...defaultPricingSettings },
    airportRoutes: defaultAirportRoutes.map((route) => ({ ...route })),
  };
}
