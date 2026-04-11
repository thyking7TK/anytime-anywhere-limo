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

export const fleet = [
  {
    name: "Luxury Sedan",
    capacity: 3,
    details: "Quiet, tailored comfort for solo travelers, couples, and airport runs.",
    mood: "Discreet arrival",
    accent: "from-amber-100/20 via-transparent to-transparent",
  },
  {
    name: "Executive SUV",
    capacity: 6,
    details: "A refined premium cabin with extra luggage room and a more commanding presence.",
    mood: "Most requested",
    accent: "from-sky-100/18 via-transparent to-transparent",
  },
  {
    name: "Stretch Limo",
    capacity: 8,
    details: "A celebratory statement piece for entrances, group nights, and photo-ready moments.",
    mood: "Signature experience",
    accent: "from-rose-100/18 via-transparent to-transparent",
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

export const serviceBaseRates = {
  airport: {
    "Luxury Sedan": 95,
    "Executive SUV": 145,
    "Stretch Limo": 295,
  },
  corporate: {
    "Luxury Sedan": 120,
    "Executive SUV": 175,
    "Stretch Limo": 340,
  },
  events: {
    "Luxury Sedan": 155,
    "Executive SUV": 235,
    "Stretch Limo": 425,
  },
};

export const startingRates = fleet.reduce((accumulator, vehicle) => {
  const values = Object.values(serviceBaseRates).map(
    (service) => service[vehicle.name],
  );
  accumulator[vehicle.name] = Math.min(...values);
  return accumulator;
}, {});

export const defaultForm = {
  fullName: "",
  email: "",
  phone: "",
  service: "airport",
  pickup: "",
  dropoff: "",
  date: "",
  time: "",
  vehicle: "Executive SUV",
  passengers: "2",
  requests: "",
};

export const defaultBookingTimeZone = "America/New_York";

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function normalizeBookingForm(input = {}) {
  return {
    fullName: String(input.fullName ?? "").trim(),
    email: String(input.email ?? "").trim(),
    phone: String(input.phone ?? "").trim(),
    service: String(input.service ?? defaultForm.service),
    pickup: String(input.pickup ?? "").trim(),
    dropoff: String(input.dropoff ?? "").trim(),
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

export function getVehicleByName(vehicleName) {
  return fleet.find((vehicle) => vehicle.name === vehicleName) ?? null;
}

export function calculateEstimate(formInput) {
  const form = normalizeBookingForm(formInput);
  const vehicle = getVehicleByName(form.vehicle) ?? fleet[1];
  const baseRate = serviceBaseRates[form.service]?.[vehicle.name] ?? 0;
  const passengers = Number(form.passengers);
  const extraPassengerCount = Math.max(0, passengers - vehicle.capacity);
  const passengerAdjustment = extraPassengerCount * 35;
  const bookingTime = buildDateTime(form.date, form.time);
  const hour = bookingTime?.getHours() ?? 12;
  const isWeekend = bookingTime ? [0, 5, 6].includes(bookingTime.getDay()) : false;
  const afterHoursFee = hour < 6 || hour >= 22 ? 35 : 0;
  const weekendFee = isWeekend ? 40 : 0;
  const requestsFee = form.requests ? 25 : 0;
  const subtotal = baseRate + passengerAdjustment + afterHoursFee + weekendFee + requestsFee;
  const gratuity = Math.round(subtotal * 0.18);
  const total = subtotal + gratuity;
  const deposit = Math.round(total * 0.2);

  return {
    baseRate,
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
  const vehicle = getVehicleByName(form.vehicle);
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
