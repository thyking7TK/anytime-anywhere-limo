import {
  bookingServices,
  defaultAirportRoutes,
  defaultPricingSettings,
  defaultVehicles,
  getDefaultCatalog,
  services,
  testimonials,
} from "./catalog-shared.js";

export { bookingServices, getDefaultCatalog, services, testimonials };

export const fleet = defaultVehicles;
export const defaultBookingTimeZone = "America/New_York";

export const defaultForm = {
  fullName: "",
  email: "",
  phone: "",
  service: "custom",
  pickup: "",
  dropoff: "",
  date: "",
  time: "",
  vehicle: "executive-suv",
  passengers: "2",
  bags: "0",
  requests: "",
  requestedHours: "3",
  estimatedStops: "0",
  eventType: "",
  airportRouteId: defaultAirportRoutes[0]?.id ?? "",
  airline: "",
  flightNumber: "",
  roundTrip: false,
  returnDate: "",
  returnTime: "",
  estimatedTripHours: "",
  estimatedTripMiles: "",
  extraStops: "0",
  waitHours: "0",
  holidayOrEvent: false,
};

function normalizeBoolean(value) {
  if (typeof value === "string") {
    return ["true", "1", "yes", "on"].includes(value.trim().toLowerCase());
  }

  return Boolean(value);
}

function normalizeString(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function coerceNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundMoney(value) {
  return Math.round(Number(value) || 0);
}

function normalizeLocation(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function createBreakdown({
  quoteMode,
  pricingModel,
  total,
  lineItems,
  note,
  details = {},
  matchedRoute = null,
}) {
  return {
    quoteMode,
    pricingModel,
    total: roundMoney(total),
    deposit: 0,
    lineItems,
    note,
    details,
    matchedRoute,
  };
}

export function getBookingPaymentAmountCents(estimate) {
  if (
    !estimate ||
    estimate.quoteMode !== "instant" ||
    !Number.isFinite(Number(estimate.total)) ||
    Number(estimate.total) <= 0
  ) {
    return 0;
  }

  return roundMoney(Number(estimate.total) * 100);
}

function withMinimumThreshold(total, settings, lineItems) {
  const minimumQuote = Math.max(0, roundMoney(settings.minimumQuote));

  if (!minimumQuote || total >= minimumQuote) {
    return roundMoney(total);
  }

  lineItems.push({
    key: "minimum-threshold",
    label: "Minimum service threshold",
    amount: minimumQuote - roundMoney(total),
  });

  return minimumQuote;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrencyPrecise(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number(value) % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getCatalogPricingSettings(catalog = {}) {
  return {
    ...defaultPricingSettings,
    ...(catalog.pricingSettings ?? {}),
  };
}

export function getCatalogVehicles(catalog = {}) {
  if (Array.isArray(catalog.vehicles)) {
    return catalog.vehicles;
  }

  return getDefaultCatalog().vehicles;
}

export function getCatalogAirportRoutes(catalog = {}) {
  if (Array.isArray(catalog.airportRoutes)) {
    return catalog.airportRoutes;
  }

  return getDefaultCatalog().airportRoutes;
}

export function computeStartingRates(catalog = {}) {
  const vehicles = getCatalogVehicles(catalog);
  const settings = getCatalogPricingSettings(catalog);
  const airportRoutes = getCatalogAirportRoutes(catalog).filter(
    (route) => route.active !== false,
  );
  const hourlyStart = Math.max(
    settings.minimumQuote,
    settings.hourlyMinimum * settings.weekdayHourlyRate,
  );
  const airportStart = airportRoutes.length
    ? Math.min(...airportRoutes.map((route) => roundMoney(route.oneWayPrice)))
    : hourlyStart;
  const startingRate = Math.min(hourlyStart, airportStart);

  return vehicles.reduce((accumulator, vehicle) => {
    accumulator[vehicle.slug] = startingRate;
    return accumulator;
  }, {});
}

export const startingRates = computeStartingRates();

export function normalizeBookingForm(input = {}) {
  return {
    fullName: normalizeString(input.fullName),
    email: normalizeString(input.email),
    phone: normalizeString(input.phone),
    service: normalizeString(input.service, defaultForm.service),
    pickup: normalizeString(input.pickup),
    dropoff: normalizeString(input.dropoff),
    date: normalizeString(input.date),
    time: normalizeString(input.time),
    vehicle: normalizeString(input.vehicle, defaultForm.vehicle),
    passengers: normalizeString(input.passengers, defaultForm.passengers),
    bags: normalizeString(input.bags, defaultForm.bags),
    requests: normalizeString(input.requests),
    requestedHours: normalizeString(
      input.requestedHours,
      defaultForm.requestedHours,
    ),
    estimatedStops: normalizeString(
      input.estimatedStops,
      defaultForm.estimatedStops,
    ),
    eventType: normalizeString(input.eventType),
    airportRouteId: normalizeString(
      input.airportRouteId,
      defaultForm.airportRouteId,
    ),
    airline: normalizeString(input.airline),
    flightNumber: normalizeString(input.flightNumber),
    roundTrip: normalizeBoolean(input.roundTrip),
    returnDate: normalizeString(input.returnDate),
    returnTime: normalizeString(input.returnTime),
    estimatedTripHours: normalizeString(input.estimatedTripHours),
    estimatedTripMiles: normalizeString(input.estimatedTripMiles),
    extraStops: normalizeString(input.extraStops, defaultForm.extraStops),
    waitHours: normalizeString(input.waitHours, defaultForm.waitHours),
    holidayOrEvent: normalizeBoolean(input.holidayOrEvent),
  };
}

export function buildDateTime(date, time) {
  if (!date || !time) {
    return null;
  }

  const combined = new Date(`${date}T${time}`);
  return Number.isNaN(combined.getTime()) ? null : combined;
}

export function buildRideLocalTimestamp(date, time) {
  if (!date || !time) {
    return null;
  }

  return `${date}T${time}`;
}

export function getCurrentLocalTimestamp(timeZone = defaultBookingTimeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter
    .formatToParts(new Date())
    .reduce((accumulator, part) => {
      if (part.type !== "literal") {
        accumulator[part.type] = part.value;
      }

      return accumulator;
    }, {});

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function isWeekend(dateInput) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return [0, 6].includes(date.getDay());
}

export function isLateNight(time, settings = defaultPricingSettings) {
  const timeValue =
    typeof time === "string"
      ? time
      : time instanceof Date
        ? `${String(time.getHours()).padStart(2, "0")}:${String(
            time.getMinutes(),
          ).padStart(2, "0")}`
        : "";

  const hour = Number.parseInt(String(timeValue).slice(0, 2), 10);

  if (!Number.isFinite(hour)) {
    return false;
  }

  return hour >= settings.lateNightStartHour || hour < settings.lateNightEndHour;
}

export function getHourlyRate(date, settings = defaultPricingSettings) {
  return isWeekend(date)
    ? roundMoney(settings.weekendHourlyRate)
    : roundMoney(settings.weekdayHourlyRate);
}

export function getServiceById(serviceId) {
  return services.find((service) => service.id === serviceId) ?? null;
}

export function getBookingServiceById(serviceId) {
  return bookingServices.find((service) => service.id === serviceId) ?? null;
}

export function getVehicleBySlug(vehicleSlug, catalog = {}) {
  return getCatalogVehicles(catalog).find((vehicle) => vehicle.slug === vehicleSlug) ?? null;
}

export function getAirportRouteById(routeId, catalog = {}) {
  return (
    getCatalogAirportRoutes(catalog).find(
      (route) => route.id === routeId && route.active !== false,
    ) ?? null
  );
}

export function findMatchingAirportRoute(pickup, dropoff, catalog = {}) {
  const pickupValue = normalizeLocation(pickup);
  const dropoffValue = normalizeLocation(dropoff);

  return (
    getCatalogAirportRoutes(catalog).find((route) => {
      if (route.active === false) {
        return false;
      }

      const endpointA = normalizeLocation(route.endpointA);
      const endpointB = normalizeLocation(route.endpointB);

      return (
        (pickupValue.includes(endpointA) && dropoffValue.includes(endpointB)) ||
        (pickupValue.includes(endpointB) && dropoffValue.includes(endpointA))
      );
    }) ?? null
  );
}

export function calculateHourlyQuote(
  hours,
  date,
  options = {},
  settings = defaultPricingSettings,
) {
  const requestedHours = Math.max(0, coerceNumber(hours, 0));
  const billableHours = Math.max(requestedHours, settings.hourlyMinimum);
  const rate = getHourlyRate(date, settings);
  const extraStops = Math.max(0, roundMoney(options.extraStops));
  const waitHours = Math.max(0, coerceNumber(options.waitHours, 0));
  const waitCharge = roundMoney(waitHours * settings.waitRate);
  const stopCharge = roundMoney(extraStops * settings.stopFee);
  const timeCharge = roundMoney(billableHours * rate);
  let totalBeforeSurcharges = timeCharge + waitCharge + stopCharge;
  const lineItems = [
    {
      key: "time-charge",
      label: `Billable hours (${billableHours} x ${formatCurrency(rate)})`,
      amount: timeCharge,
    },
  ];

  if (stopCharge > 0) {
    lineItems.push({
      key: "stop-charge",
      label: `Estimated stops (${extraStops} x ${formatCurrency(settings.stopFee)})`,
      amount: stopCharge,
    });
  }

  if (waitCharge > 0) {
    lineItems.push({
      key: "wait-charge",
      label: `Wait time (${waitHours} x ${formatCurrency(settings.waitRate)})`,
      amount: waitCharge,
    });
  }

  if (options.isLateNight) {
    const lateNightCharge = roundMoney(
      totalBeforeSurcharges * settings.lateNightPercent,
    );
    totalBeforeSurcharges += lateNightCharge;
    lineItems.push({
      key: "late-night",
      label: `Late-night surcharge (${Math.round(
        settings.lateNightPercent * 100,
      )}%)`,
      amount: lateNightCharge,
    });
  }

  if (options.isHoliday) {
    const holidayCharge = roundMoney(
      totalBeforeSurcharges * settings.holidayPercent,
    );
    totalBeforeSurcharges += holidayCharge;
    lineItems.push({
      key: "holiday",
      label: `Holiday / event surcharge (${Math.round(
        settings.holidayPercent * 100,
      )}%)`,
      amount: holidayCharge,
    });
  }

  const total = withMinimumThreshold(totalBeforeSurcharges, settings, lineItems);

  return createBreakdown({
    quoteMode: "instant",
    pricingModel: "hourly",
    total,
    lineItems,
    note:
      "Final pricing may adjust for route changes, additional stops, excess wait time, tolls, and special event demand.",
    details: {
      requestedHours,
      billableHours,
      rate,
      extraStops,
      waitHours,
      isLateNight: Boolean(options.isLateNight),
      isHoliday: Boolean(options.isHoliday),
    },
  });
}

export function calculateAirportQuote(
  pickup,
  dropoff,
  roundTrip,
  catalog = {},
  routeId,
) {
  const route =
    (routeId ? getAirportRouteById(routeId, catalog) : null) ??
    findMatchingAirportRoute(pickup, dropoff, catalog);

  if (!route) {
    return createBreakdown({
      quoteMode: "request",
      pricingModel: "airport",
      total: 0,
      lineItems: [],
      matchedRoute: null,
      note:
        "This airport route needs a custom quote. Submit the request and Autovise will confirm pricing shortly.",
      details: {
        roundTrip: Boolean(roundTrip),
      },
    });
  }

  const settings = getCatalogPricingSettings(catalog);
  const lineItems = [
    {
      key: "airport-route",
      label: roundTrip
        ? `Flat-rate route (${route.label}, round trip)`
        : `Flat-rate route (${route.label})`,
      amount: roundTrip
        ? roundMoney(route.roundTripPrice)
        : roundMoney(route.oneWayPrice),
    },
  ];
  const total = withMinimumThreshold(lineItems[0].amount, settings, lineItems);

  return createBreakdown({
    quoteMode: "instant",
    pricingModel: "airport",
    total,
    lineItems,
    matchedRoute: {
      id: route.id,
      label: route.label,
    },
    note:
      "Flat-rate airport pricing covers the configured route shown here. Additional wait time, added stops, tolls, and itinerary changes may change the final invoice.",
    details: {
      roundTrip: Boolean(roundTrip),
    },
  });
}

export function calculateCustomQuote(
  hours,
  miles,
  options = {},
  settings = defaultPricingSettings,
) {
  const estimatedHours = Math.max(0, coerceNumber(hours, 0));
  const estimatedMiles = Math.max(0, coerceNumber(miles, 0));

  if (!estimatedHours || !estimatedMiles) {
    return createBreakdown({
      quoteMode: "request",
      pricingModel: "custom",
      total: 0,
      lineItems: [],
      note:
        "Enter estimated hours and miles to preview a custom quote. Otherwise, submit the request and Autovise will quote it manually.",
      details: {},
    });
  }

  const extraStops = Math.max(0, roundMoney(options.extraStops));
  const waitHours = Math.max(0, coerceNumber(options.waitHours, 0));
  const timeCharge = roundMoney(estimatedHours * settings.customHourlyBasis);
  const mileageCharge = roundMoney(estimatedMiles * settings.mileageRate);
  const buffer = roundMoney(settings.profitBuffer);
  const stopCharge = roundMoney(extraStops * settings.stopFee);
  const waitCharge = roundMoney(waitHours * settings.waitRate);
  let totalBeforeSurcharges =
    timeCharge + mileageCharge + buffer + stopCharge + waitCharge;
  const lineItems = [
    {
      key: "time-charge",
      label: `Time charge (${estimatedHours} x ${formatCurrency(
        settings.customHourlyBasis,
      )})`,
      amount: timeCharge,
    },
    {
      key: "mileage-charge",
      label: `Mileage charge (${estimatedMiles} x ${formatCurrencyPrecise(
        settings.mileageRate,
      )})`,
      amount: mileageCharge,
    },
    {
      key: "profit-buffer",
      label: "Service buffer",
      amount: buffer,
    },
  ];

  if (stopCharge > 0) {
    lineItems.push({
      key: "stop-charge",
      label: `Extra stops (${extraStops} x ${formatCurrency(settings.stopFee)})`,
      amount: stopCharge,
    });
  }

  if (waitCharge > 0) {
    lineItems.push({
      key: "wait-charge",
      label: `Wait time (${waitHours} x ${formatCurrency(settings.waitRate)})`,
      amount: waitCharge,
    });
  }

  if (options.isLateNight) {
    const lateNightCharge = roundMoney(
      totalBeforeSurcharges * settings.lateNightPercent,
    );
    totalBeforeSurcharges += lateNightCharge;
    lineItems.push({
      key: "late-night",
      label: `Late-night surcharge (${Math.round(
        settings.lateNightPercent * 100,
      )}%)`,
      amount: lateNightCharge,
    });
  }

  if (options.isHoliday) {
    const holidayCharge = roundMoney(
      totalBeforeSurcharges * settings.holidayPercent,
    );
    totalBeforeSurcharges += holidayCharge;
    lineItems.push({
      key: "holiday",
      label: `Holiday / event surcharge (${Math.round(
        settings.holidayPercent * 100,
      )}%)`,
      amount: holidayCharge,
    });
  }

  const total = withMinimumThreshold(totalBeforeSurcharges, settings, lineItems);

  return createBreakdown({
    quoteMode: "instant",
    pricingModel: "custom",
    total,
    lineItems,
    note:
      "Final pricing may be adjusted for route changes, additional stops, tolls, excess wait time, and special event demand.",
    details: {
      estimatedHours,
      estimatedMiles,
      extraStops,
      waitHours,
      isLateNight: Boolean(options.isLateNight),
      isHoliday: Boolean(options.isHoliday),
    },
  });
}

export function calculateEstimate(formInput, catalog = {}) {
  const form = normalizeBookingForm(formInput);
  const settings = getCatalogPricingSettings(catalog);
  const bookingTime = buildDateTime(form.date, form.time);
  const lateNight = isLateNight(form.time, settings);

  switch (form.service) {
    case "hourly":
      return calculateHourlyQuote(
        form.requestedHours,
        bookingTime ?? new Date(),
        {
          extraStops: form.estimatedStops,
          waitHours: 0,
          isHoliday: false,
          isLateNight: lateNight,
        },
        settings,
      );
    case "custom":
      return calculateCustomQuote(
        form.estimatedTripHours,
        form.estimatedTripMiles,
        {
          extraStops: form.extraStops,
          waitHours: form.waitHours,
          isHoliday: form.holidayOrEvent,
          isLateNight: lateNight,
        },
        settings,
      );
    case "airport":
    default:
      return calculateAirportQuote(
        form.pickup,
        form.dropoff,
        form.roundTrip,
        catalog,
        form.airportRouteId,
      );
  }
}

export function validateBooking(formInput, options = {}) {
  const form = normalizeBookingForm(formInput);
  const nextErrors = {};
  const digitsOnlyPhone = form.phone.replace(/\D/g, "");
  const passengers = Number(form.passengers);
  const bags = Number(form.bags);
  const vehicle = getVehicleBySlug(form.vehicle, options.catalog);
  const bookingTime = buildDateTime(form.date, form.time);
  const rideLocalTimestamp = buildRideLocalTimestamp(form.date, form.time);
  const nowLocalTimestamp =
    options.currentLocalTimestamp ??
    getCurrentLocalTimestamp(options.timeZone ?? defaultBookingTimeZone);

  if (!getBookingServiceById(form.service)) {
    nextErrors.service = "Choose a valid service type.";
  }

  if (options.catalog && !vehicle) {
    nextErrors.vehicle = "Choose a valid vehicle.";
  }

  if (!form.fullName) {
    nextErrors.fullName = "Please enter the passenger or contact name.";
  }

  if (!form.email) {
    nextErrors.email = "An email address is required for the booking summary.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    nextErrors.email = "Enter a valid email address.";
  }

  if (digitsOnlyPhone.length < 10) {
    nextErrors.phone = "Enter a valid phone number.";
  }

  if (!form.pickup) {
    nextErrors.pickup = "Please enter a pickup location.";
  }

  if (!form.dropoff) {
    nextErrors.dropoff = "Please enter a destination.";
  }

  if (!form.date) {
    nextErrors.date = "Choose the service date.";
  }

  if (!form.time) {
    nextErrors.time = "Choose the pickup time.";
  } else if (!bookingTime) {
    nextErrors.time = "Choose a valid pickup time.";
  }

  if (rideLocalTimestamp && rideLocalTimestamp <= nowLocalTimestamp) {
    nextErrors.time = "Pickup time must be in the future.";
  }

  if (!Number.isInteger(passengers) || passengers < 1) {
    nextErrors.passengers = "Passenger count must be at least 1.";
  } else if (vehicle && passengers > vehicle.capacity) {
    nextErrors.passengers = `Choose a larger vehicle for more than ${vehicle.capacity} passengers.`;
  }

  if (!Number.isInteger(bags) || bags < 0) {
    nextErrors.bags = "Bag count must be zero or greater.";
  }

  if (form.service === "hourly") {
    const requestedHours = Number(form.requestedHours);
    const estimatedStops = Number(form.estimatedStops);

    if (!Number.isFinite(requestedHours) || requestedHours <= 0) {
      nextErrors.requestedHours = "Enter the requested number of hours.";
    }

    if (!Number.isFinite(estimatedStops) || estimatedStops < 0) {
      nextErrors.estimatedStops = "Estimated stops must be zero or greater.";
    }
  }

  if (form.service === "airport") {
    const airportRoute = getAirportRouteById(form.airportRouteId, options.catalog);

    if (!airportRoute) {
      nextErrors.airportRouteId = "Choose a configured airport route.";
    }

    if (form.roundTrip) {
      if (!form.returnDate) {
        nextErrors.returnDate = "Choose the return date.";
      }

      if (!form.returnTime) {
        nextErrors.returnTime = "Choose the return time.";
      }

      const returnLocalTimestamp = buildRideLocalTimestamp(
        form.returnDate,
        form.returnTime,
      );

      if (
        rideLocalTimestamp &&
        returnLocalTimestamp &&
        returnLocalTimestamp <= rideLocalTimestamp
      ) {
        nextErrors.returnTime = "Return trip must be after the first ride.";
      }
    }
  }

  if (form.service === "custom") {
    const estimatedTripHours = Number(form.estimatedTripHours);
    const estimatedTripMiles = Number(form.estimatedTripMiles);
    const extraStops = Number(form.extraStops);
    const waitHours = Number(form.waitHours);

    if (!Number.isFinite(estimatedTripHours) || estimatedTripHours <= 0) {
      nextErrors.estimatedTripHours =
        "Enter the estimated trip duration in hours.";
    }

    if (!Number.isFinite(estimatedTripMiles) || estimatedTripMiles <= 0) {
      nextErrors.estimatedTripMiles =
        "Enter the estimated trip distance in miles.";
    }

    if (!Number.isFinite(extraStops) || extraStops < 0) {
      nextErrors.extraStops = "Extra stops must be zero or greater.";
    }

    if (!Number.isFinite(waitHours) || waitHours < 0) {
      nextErrors.waitHours = "Wait time must be zero or greater.";
    }
  }

  return nextErrors;
}

export function formatRideTime(dateTime) {
  return dateTime?.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRideLocalTimestamp(localTimestamp) {
  if (!localTimestamp) {
    return "";
  }

  const [datePart, timePart] = String(localTimestamp).split("T");

  if (!datePart || !timePart) {
    return "";
  }

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour = 0, minute = 0] = timePart.slice(0, 5).split(":").map(Number);

  if (!year || !month || !day) {
    return "";
  }

  const dateOnly = new Date(Date.UTC(year, month - 1, day));
  const dateTime = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }).format(dateOnly);
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  }).format(dateOnly);
  const dayLabel = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    timeZone: "UTC",
  }).format(dateOnly);
  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(dateTime);

  return `${weekday}, ${monthLabel} ${dayLabel}, ${timeLabel}`;
}
