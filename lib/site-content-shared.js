import {
  services as baseServices,
  testimonials as baseTestimonials,
} from "./catalog-shared";

function clone(value) {
  return structuredClone(value);
}

function normalizeString(value, fallback = "") {
  if (value === undefined || value === null) {
    return fallback;
  }

  return String(value).trim();
}

function normalizeStringArray(values, fallback = []) {
  if (!Array.isArray(values)) {
    return clone(fallback);
  }

  return values
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);
}

export function getDefaultSiteContent() {
  return {
    brand: {
      name: "Anytime, Anywhere",
      subtitle: "Luxury Limo Service",
    },
    navigation: {
      howItWorks: "How It Works",
      services: "Services",
      fleet: "Fleet",
      reviews: "Reviews",
      contact: "Contact",
      reserve: "Reserve Now",
    },
    hero: {
      eyebrow: "Chauffeur-level transportation",
      kicker: "Executive arrivals. Event-ready entrances.",
      title: "Luxury rides that feel calm, exact, and completely handled.",
      description:
        "Anytime, Anywhere blends modern online booking with a classic chauffeur experience. Reserve airport transfers, corporate travel, or event transportation with a vehicle that matches the moment.",
      primaryButtonLabel: "Get Instant Estimate",
      secondaryButtonLabel: "Explore Fleet",
      bookingEyebrow: "Reserve your ride",
      bookingTitle: "Request a booking",
      bookingDescription:
        "Estimate updates instantly as you choose the service, vehicle, timing, and trip details.",
      bookingPill: "Instant quote",
    },
    bookingUi: {
      successLabel: "Booking saved",
      pricingNote:
        "Instant quote is a starting estimate based on service type, vehicle, timing, and party size. Final pricing can shift for distance, waiting time, tolls, or custom itinerary details.",
      unavailableMessage:
        "Vehicles are currently being updated. Booking is temporarily unavailable.",
      unavailableFleetMessage:
        "No vehicles are currently available for booking.",
      submitButtonLabel: "Request Booking",
      unavailableButtonLabel: "Booking unavailable",
    },
    heroStats: [
      {
        value: "24/7",
        text: "Reservation support for early departures, late arrivals, and schedule-sensitive rides.",
      },
      {
        value: "Live",
        text: "Quotes update instantly while the customer chooses the service, vehicle, and timing.",
      },
      {
        value: "3",
        text: "Vehicle tiers available for discreet executive travel or more celebratory arrivals.",
      },
      {
        value: "3",
        text: "Core service types covering airport, corporate, and special-event transportation.",
      },
    ],
    proof: {
      text:
        "Airport transfers, executive travel, and special-event service with live quotes, saved reservations, and a booking experience that feels polished from the first click.",
      chips: [
        "Flight tracking",
        "Transparent pricing",
        "24/7 reservations",
        "Professional chauffeurs",
      ],
    },
    howItWorks: {
      label: "How it works",
      title: "A smooth booking flow from quote to curbside pickup.",
      description:
        "Built for airport runs, executive schedules, and important nights out. Enter the trip, confirm the details, and let the logistics stay handled.",
      steps: [
        {
          step: "Step 01",
          title: "Enter trip details",
          text: "Add pickup, destination, timing, service type, and any special notes that help us shape the ride correctly.",
        },
        {
          step: "Step 02",
          title: "See a live estimate",
          text: "Pricing updates instantly as the service, vehicle, schedule, and passenger count change.",
        },
        {
          step: "Step 03",
          title: "Send the request",
          text: "Your booking is saved through the live backend and can be reviewed from the admin dashboard.",
        },
        {
          step: "Step 04",
          title: "Ride with confidence",
          text: "The request is ready for follow-up, confirmation, and chauffeur coordination without starting from scratch.",
        },
      ],
    },
    servicesSection: {
      label: "Services",
      title: "Transportation built around timing, image, and comfort.",
      description:
        "Whether the priority is being early for a flight or making an entrance for a celebration, the experience is designed to feel composed from pickup to drop-off.",
    },
    services: baseServices.map((service) => ({
      id: service.id,
      title: service.title,
      eyebrow: service.eyebrow,
      text: service.text,
    })),
    fleetSection: {
      label: "Fleet",
      title: "Match the vehicle to the occasion.",
      description:
        "The fleet is selected to feel polished in motion and confident at the curb, whether the trip is discreet, executive, or more celebratory.",
    },
    reviewsSection: {
      label: "Client notes",
      title: "A more composed ride changes the whole day.",
    },
    testimonials: baseTestimonials.map((item) => ({
      name: item.name,
      role: item.role,
      quote: item.quote,
    })),
    contactSection: {
      label: "Contact",
      title: "Reserve the next ride with confidence.",
      description:
        "From the first quote to the final arrival, the experience is built to feel clear, elevated, and easy to trust.",
      primaryButtonLabel: "Get Instant Estimate",
      secondaryButtonLabel: "Contact Us",
      phoneLabel: "Concierge line",
      phoneValue: "(555) 000-0000",
      emailLabel: "Email",
      emailValue: "bookings@anytimeanywhere.com",
      availabilityLabel: "Availability",
      availabilityValue: "24/7 by reservation for airport, corporate, and event travel.",
    },
    footer: {
      legal: "Copyright 2026 Anytime, Anywhere. All rights reserved.",
      description:
        "Luxury limo service for airport, corporate, and special event transportation.",
    },
    floatingActions: {
      callLabel: "Call Concierge",
      bookLabel: "Book Your Ride",
    },
  };
}

export function normalizeSiteContent(input = {}) {
  const defaults = getDefaultSiteContent();

  const services = defaults.services.map((defaultService) => {
    const override =
      Array.isArray(input.services) &&
      input.services.find((service) => service?.id === defaultService.id);

    return {
      id: defaultService.id,
      title: normalizeString(override?.title, defaultService.title),
      eyebrow: normalizeString(override?.eyebrow, defaultService.eyebrow),
      text: normalizeString(override?.text, defaultService.text),
    };
  });

  const testimonials = Array.isArray(input.testimonials) && input.testimonials.length > 0
    ? input.testimonials.map((item, index) => ({
        name: normalizeString(item?.name, defaults.testimonials[index]?.name || `Client ${index + 1}`),
        role: normalizeString(item?.role, defaults.testimonials[index]?.role || "Client"),
        quote: normalizeString(item?.quote, defaults.testimonials[index]?.quote || ""),
      }))
    : clone(defaults.testimonials);

  const heroStats = Array.isArray(input.heroStats) && input.heroStats.length > 0
    ? input.heroStats.slice(0, 6).map((item, index) => ({
        value: normalizeString(item?.value, defaults.heroStats[index]?.value || `${index + 1}`),
        text: normalizeString(item?.text, defaults.heroStats[index]?.text || ""),
      }))
    : clone(defaults.heroStats);

  const howItWorksSteps =
    Array.isArray(input.howItWorks?.steps) && input.howItWorks.steps.length > 0
      ? input.howItWorks.steps.slice(0, 8).map((item, index) => ({
          step: normalizeString(item?.step, defaults.howItWorks.steps[index]?.step || `Step ${String(index + 1).padStart(2, "0")}`),
          title: normalizeString(item?.title, defaults.howItWorks.steps[index]?.title || ""),
          text: normalizeString(item?.text, defaults.howItWorks.steps[index]?.text || ""),
        }))
      : clone(defaults.howItWorks.steps);

  return {
    brand: {
      name: normalizeString(input.brand?.name, defaults.brand.name),
      subtitle: normalizeString(input.brand?.subtitle, defaults.brand.subtitle),
    },
    navigation: {
      howItWorks: normalizeString(input.navigation?.howItWorks, defaults.navigation.howItWorks),
      services: normalizeString(input.navigation?.services, defaults.navigation.services),
      fleet: normalizeString(input.navigation?.fleet, defaults.navigation.fleet),
      reviews: normalizeString(input.navigation?.reviews, defaults.navigation.reviews),
      contact: normalizeString(input.navigation?.contact, defaults.navigation.contact),
      reserve: normalizeString(input.navigation?.reserve, defaults.navigation.reserve),
    },
    hero: {
      eyebrow: normalizeString(input.hero?.eyebrow, defaults.hero.eyebrow),
      kicker: normalizeString(input.hero?.kicker, defaults.hero.kicker),
      title: normalizeString(input.hero?.title, defaults.hero.title),
      description: normalizeString(input.hero?.description, defaults.hero.description),
      primaryButtonLabel: normalizeString(
        input.hero?.primaryButtonLabel,
        defaults.hero.primaryButtonLabel,
      ),
      secondaryButtonLabel: normalizeString(
        input.hero?.secondaryButtonLabel,
        defaults.hero.secondaryButtonLabel,
      ),
      bookingEyebrow: normalizeString(
        input.hero?.bookingEyebrow,
        defaults.hero.bookingEyebrow,
      ),
      bookingTitle: normalizeString(input.hero?.bookingTitle, defaults.hero.bookingTitle),
      bookingDescription: normalizeString(
        input.hero?.bookingDescription,
        defaults.hero.bookingDescription,
      ),
      bookingPill: normalizeString(input.hero?.bookingPill, defaults.hero.bookingPill),
    },
    bookingUi: {
      successLabel: normalizeString(
        input.bookingUi?.successLabel,
        defaults.bookingUi.successLabel,
      ),
      pricingNote: normalizeString(
        input.bookingUi?.pricingNote,
        defaults.bookingUi.pricingNote,
      ),
      unavailableMessage: normalizeString(
        input.bookingUi?.unavailableMessage,
        defaults.bookingUi.unavailableMessage,
      ),
      unavailableFleetMessage: normalizeString(
        input.bookingUi?.unavailableFleetMessage,
        defaults.bookingUi.unavailableFleetMessage,
      ),
      submitButtonLabel: normalizeString(
        input.bookingUi?.submitButtonLabel,
        defaults.bookingUi.submitButtonLabel,
      ),
      unavailableButtonLabel: normalizeString(
        input.bookingUi?.unavailableButtonLabel,
        defaults.bookingUi.unavailableButtonLabel,
      ),
    },
    heroStats,
    proof: {
      text: normalizeString(input.proof?.text, defaults.proof.text),
      chips: normalizeStringArray(input.proof?.chips, defaults.proof.chips).slice(0, 8),
    },
    howItWorks: {
      label: normalizeString(input.howItWorks?.label, defaults.howItWorks.label),
      title: normalizeString(input.howItWorks?.title, defaults.howItWorks.title),
      description: normalizeString(
        input.howItWorks?.description,
        defaults.howItWorks.description,
      ),
      steps: howItWorksSteps,
    },
    servicesSection: {
      label: normalizeString(input.servicesSection?.label, defaults.servicesSection.label),
      title: normalizeString(input.servicesSection?.title, defaults.servicesSection.title),
      description: normalizeString(
        input.servicesSection?.description,
        defaults.servicesSection.description,
      ),
    },
    services,
    fleetSection: {
      label: normalizeString(input.fleetSection?.label, defaults.fleetSection.label),
      title: normalizeString(input.fleetSection?.title, defaults.fleetSection.title),
      description: normalizeString(
        input.fleetSection?.description,
        defaults.fleetSection.description,
      ),
    },
    reviewsSection: {
      label: normalizeString(input.reviewsSection?.label, defaults.reviewsSection.label),
      title: normalizeString(input.reviewsSection?.title, defaults.reviewsSection.title),
    },
    testimonials,
    contactSection: {
      label: normalizeString(input.contactSection?.label, defaults.contactSection.label),
      title: normalizeString(input.contactSection?.title, defaults.contactSection.title),
      description: normalizeString(
        input.contactSection?.description,
        defaults.contactSection.description,
      ),
      primaryButtonLabel: normalizeString(
        input.contactSection?.primaryButtonLabel,
        defaults.contactSection.primaryButtonLabel,
      ),
      secondaryButtonLabel: normalizeString(
        input.contactSection?.secondaryButtonLabel,
        defaults.contactSection.secondaryButtonLabel,
      ),
      phoneLabel: normalizeString(input.contactSection?.phoneLabel, defaults.contactSection.phoneLabel),
      phoneValue: normalizeString(input.contactSection?.phoneValue, defaults.contactSection.phoneValue),
      emailLabel: normalizeString(input.contactSection?.emailLabel, defaults.contactSection.emailLabel),
      emailValue: normalizeString(input.contactSection?.emailValue, defaults.contactSection.emailValue),
      availabilityLabel: normalizeString(
        input.contactSection?.availabilityLabel,
        defaults.contactSection.availabilityLabel,
      ),
      availabilityValue: normalizeString(
        input.contactSection?.availabilityValue,
        defaults.contactSection.availabilityValue,
      ),
    },
    footer: {
      legal: normalizeString(input.footer?.legal, defaults.footer.legal),
      description: normalizeString(input.footer?.description, defaults.footer.description),
    },
    floatingActions: {
      callLabel: normalizeString(input.floatingActions?.callLabel, defaults.floatingActions.callLabel),
      bookLabel: normalizeString(input.floatingActions?.bookLabel, defaults.floatingActions.bookLabel),
    },
  };
}

export function getSiteServiceById(siteContent, serviceId) {
  const content = normalizeSiteContent(siteContent);
  return content.services.find((service) => service.id === serviceId) || null;
}
