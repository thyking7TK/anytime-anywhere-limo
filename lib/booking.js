import {
  defaultPricingMatrix,
  defaultPricingSettings,
  defaultVehicles,
  getDefaultCatalog,
  services,
  testimonials,
} from "./catalog-shared";

export { getDefaultCatalog, services, testimonials };

export const fleet = defaultVehicles;
export const serviceBaseRates = defaultPricingMatrix;
export const defaultForm = {
  fullName: "",
  email: "",
  phone: "",
  service: "airport",
  pickup: "Portland, ME",
  dropoff: "Boston Logan International Airport (BOS)",
  roundTrip: false,
  date: "",
  time: "",
  vehicle: "executive-suv",
  passengers: "2",
  requests: "",
};

export const defaultBookingTimeZone = "America/New_York"; // East Coast primary operations

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getCatalogPricingSettings(catalog = {}) {
  return {
    ...defaultPricingSettings,
    ...(catalog.pricingSettings ?? {}),
  };
}

export function getCatalogVehicles(catalog = {}) {
  return Array.isArray(catalog.vehicles)
    ? catalog.vehicles
    : getDefaultCatalog().vehicles;
}

export function getCatalogPricingMatrix(catalog = {}) {
  return catalog.pricingMatrix ?? getDefaultCatalog().pricingMatrix;
}

export function computeStartingRates(catalog = {}) {
  const vehicles = getCatalogVehicles(catalog);
  const pricingMatrix = getCatalogPricingMatrix(catalog);

  return vehicles.reduce((accumulator, vehicle) => {
    const values = services
      .map((service) => pricingMatrix?.[service.id]?.[vehicle.slug] ?? 0)
      .filter((value) => Number.isFinite(value));
    accumulator[vehicle.slug] = values.length > 0 ? Math.min(...values) : 0;
    return accumulator;
  }, {});
}

export const startingRates = computeStartingRates();

export function normalizeBookingForm(input = {}) {
  return {
    fullName: String(input.fullName ?? "").trim(),
    email: String(input.email ?? "").trim(),
    phone: String(input.phone ?? "").trim(),
    service: String(input.service ?? defaultForm.service),
    pickup: String(input.pickup ?? "").trim(),
    dropoff: String(input.dropoff ?? "").trim(),
    roundTrip: Boolean(input.roundTrip),
    date: String(input.date ?? ""),
    time: String(input.time ?? ""),
    vehicle: String(input.vehicle ?? defaultForm.vehicle),
    passengers: String(input.passengers ?? defaultForm.passengers),
    requests: String(input.requests ?? "").trim(),
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

export function getServiceById(serviceId) {
  return services.find((service) => service.id === serviceId) ?? null;
}

export function getVehicleBySlug(vehicleSlug, catalog = {}) {
  return getCatalogVehicles(catalog).find((vehicle) => vehicle.slug === vehicleSlug) ?? null;
}

export function calculateEstimate(formInput, catalog = {}) {
  const form = normalizeBookingForm(formInput);
  const vehicles = getCatalogVehicles(catalog);
  const pricingMatrix = getCatalogPricingMatrix(catalog);
  const pricingSettings = getCatalogPricingSettings(catalog);
  const vehicle = getVehicleBySlug(form.vehicle, { vehicles }) ?? vehicles[0] ?? null;
  const oneWayRate = vehicle ? pricingMatrix?.[form.service]?.[vehicle.slug] ?? 0 : 0;
  const roundTripSurcharge = form.roundTrip ? oneWayRate : 0;
  const baseRate = oneWayRate + roundTripSurcharge;
  const passengers = Number(form.passengers);
  const extraPassengerCount = vehicle
    ? Math.max(0, passengers - vehicle.capacity)
    : 0;
  const passengerAdjustment =
    extraPassengerCount * pricingSettings.extraPassengerFee;
  const bookingTime = buildDateTime(form.date, form.time);
  const hour = bookingTime?.getHours() ?? 12;
  const isWeekend = bookingTime ? [0, 5, 6].includes(bookingTime.getDay()) : false;
  const afterHoursFee =
    hour < pricingSettings.afterHoursEndHour ||
    hour >= pricingSettings.afterHoursStartHour
      ? pricingSettings.afterHoursFee
      : 0;
  const weekendFee = isWeekend ? pricingSettings.weekendFee : 0;
  const requestsFee = form.requests ? pricingSettings.specialRequestFee : 0;
  const subtotal =
    baseRate +
    passengerAdjustment +
    afterHoursFee +
    weekendFee +
    requestsFee;
  const gratuity = Math.round(subtotal * pricingSettings.gratuityRate);
  const total = subtotal + gratuity;
  const deposit = Math.round(total * 0.2);

  return {
    baseRate: oneWayRate,
    roundTripSurcharge,
    afterHoursFee,
    weekendFee,
    passengerAdjustment,
    requestsFee,
    gratuity,
    total,
    deposit,
  };
}

export function validateBooking(formInput, options = {}) {
  const form = normalizeBookingForm(formInput);
  const nextErrors = {};
  const digitsOnlyPhone = form.phone.replace(/\D/g, "");
  const passengers = Number(form.passengers);
  const vehicle = getVehicleBySlug(form.vehicle, options.catalog);
  const bookingTime = buildDateTime(form.date, form.time);
  const rideLocalTimestamp = buildRideLocalTimestamp(form.date, form.time);
  const nowLocalTimestamp =
    options.currentLocalTimestamp ??
    getCurrentLocalTimestamp(options.timeZone ?? defaultBookingTimeZone);

  if (!getServiceById(form.service)) {
    nextErrors.service = "Choose a valid service.";
  }

  if (!vehicle) {
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
