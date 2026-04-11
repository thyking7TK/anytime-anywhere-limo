export const services = [
  {
    id: "airport",
    title: "Airport Transfers",
    eyebrow: "Precision arrivals",
    text: "Reliable pickups, curbside coordination, and polished chauffeurs who track flights in real time.",
  },
  {
    id: "corporate",
    title: "Corporate Travel",
    eyebrow: "Executive movement",
    text: "Client-ready vehicles for meetings, roadshows, conferences, and last-minute schedule changes.",
  },
  {
    id: "events",
    title: "Special Events",
    eyebrow: "Occasion worthy",
    text: "Elevated transportation for weddings, proms, galas, birthdays, and nights designed to feel effortless.",
  },
];

export const testimonials = [
  {
    name: "Jordan M.",
    role: "Airport client",
    quote:
      "Booking felt polished, the driver was waiting early, and the ride set the tone for the entire trip.",
  },
  {
    name: "Ashley T.",
    role: "Executive assistant",
    quote:
      "We booked a same-day transfer for a client and it still felt white-glove. Fast response, immaculate vehicle.",
  },
  {
    name: "Daniel R.",
    role: "Event booking",
    quote:
      "The limo made the night. It looked premium, arrived on time, and the entire experience felt seamless.",
  },
];

export const defaultVehicles = [
  {
    slug: "luxury-sedan",
    name: "Luxury Sedan",
    capacity: 3,
    description:
      "Quiet, tailored comfort for solo travelers, couples, and airport runs.",
    mood: "Discreet arrival",
    accent: "from-amber-100/20 via-transparent to-transparent",
    imageUrls: [],
    active: true,
    displayOrder: 1,
  },
  {
    slug: "executive-suv",
    name: "Executive SUV",
    capacity: 6,
    description:
      "A refined premium cabin with extra luggage room and a more commanding presence.",
    mood: "Most requested",
    accent: "from-sky-100/18 via-transparent to-transparent",
    imageUrls: [],
    active: true,
    displayOrder: 2,
  },
  {
    slug: "stretch-limo",
    name: "Stretch Limo",
    capacity: 8,
    description:
      "A celebratory statement piece for entrances, group nights, and photo-ready moments.",
    mood: "Signature experience",
    accent: "from-rose-100/18 via-transparent to-transparent",
    imageUrls: [],
    active: true,
    displayOrder: 3,
  },
];

export const defaultPricingMatrix = {
  airport: {
    "luxury-sedan": 95,
    "executive-suv": 145,
    "stretch-limo": 295,
  },
  corporate: {
    "luxury-sedan": 120,
    "executive-suv": 175,
    "stretch-limo": 340,
  },
  events: {
    "luxury-sedan": 155,
    "executive-suv": 235,
    "stretch-limo": 425,
  },
};

export const defaultPricingSettings = {
  afterHoursFee: 35,
  weekendFee: 40,
  specialRequestFee: 25,
  extraPassengerFee: 35,
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
