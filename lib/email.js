import { Resend } from "resend";

import {
  formatCurrency,
  formatRideLocalTimestamp,
  getBookingServiceById,
} from "./booking";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getEmailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    from:
      process.env.BOOKING_FROM_EMAIL ||
      "Autovise Black Car <onboarding@resend.dev>",
    notificationEmail: process.env.BOOKING_NOTIFICATION_EMAIL,
    replyToEmail: process.env.BOOKING_REPLY_TO_EMAIL,
    sendCustomerConfirmations:
      process.env.BOOKING_SEND_CUSTOMER_CONFIRMATIONS === "true",
  };
}

function buildBookingSummary(booking) {
  const serviceTitle =
    booking.serviceTitle ??
    getBookingServiceById(booking.service)?.title ??
    booking.service ??
    "Service";
  const when = formatRideLocalTimestamp(booking.rideLocalAt);
  const returnWhen = formatRideLocalTimestamp(booking.returnLocalAt);
  const total = formatCurrency(booking.estimate.total);
  const quoteMode = booking.estimate.quoteMode ?? "instant";
  const breakdownRows = Array.isArray(booking.estimate.lineItems)
    ? booking.estimate.lineItems
        .filter((item) => Number(item?.amount) > 0)
        .map((item) => ({
          label: item.label,
          value: formatCurrency(item.amount),
        }))
    : [];

  return {
    serviceTitle,
    when,
    returnWhen,
    total,
    quoteMode,
    breakdownRows,
  };
}

function buildBreakdownHtml(summary) {
  if (!summary.breakdownRows.length) {
    return "<p style=\"margin:16px 0 0;color:#a6a29b;\">Quote breakdown unavailable.</p>";
  }

  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
      ${summary.breakdownRows
        .map(
          (row) => `
            <tr>
              <td style="padding:6px 0;color:#a6a29b;">${escapeHtml(row.label)}</td>
              <td style="padding:6px 0;text-align:right;">${escapeHtml(row.value)}</td>
            </tr>
          `,
        )
        .join("")}
    </table>
  `;
}

function buildBreakdownText(summary) {
  if (!summary.breakdownRows.length) {
    return "Quote breakdown unavailable.";
  }

  return summary.breakdownRows
    .map((row) => `${row.label}: ${row.value}`)
    .join("\n");
}

function buildAdminHtml(booking) {
  const summary = buildBookingSummary(booking);

  return `
    <div style="font-family:Arial,sans-serif;background:#0b0d11;color:#f7f1e8;padding:24px;">
      <div style="max-width:680px;margin:0 auto;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px;background:#14171d;">
        <p style="letter-spacing:0.28em;text-transform:uppercase;font-size:12px;color:#d1ae72;margin:0 0 16px;">
          New Booking Request
        </p>
        <h1 style="font-size:34px;line-height:1.1;margin:0 0 12px;">${escapeHtml(booking.reference)}</h1>
        <p style="margin:0 0 24px;color:#d2cec7;">
          ${escapeHtml(booking.fullName)} requested ${escapeHtml(summary.serviceTitle.toLowerCase())}.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#a6a29b;">Passenger</td><td style="padding:8px 0;">${escapeHtml(booking.fullName)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Email</td><td style="padding:8px 0;">${escapeHtml(booking.email)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Phone</td><td style="padding:8px 0;">${escapeHtml(booking.phone)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Service</td><td style="padding:8px 0;">${escapeHtml(summary.serviceTitle)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Preferred vehicle</td><td style="padding:8px 0;">${escapeHtml(booking.vehicle || "Vehicle to be confirmed")}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Passengers / bags</td><td style="padding:8px 0;">${escapeHtml(booking.passengers)} passengers, ${escapeHtml(booking.bags)} bags</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Pickup</td><td style="padding:8px 0;">${escapeHtml(booking.pickup)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Drop-off</td><td style="padding:8px 0;">${escapeHtml(booking.dropoff)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">When</td><td style="padding:8px 0;">${escapeHtml(summary.when)}</td></tr>
          ${
            booking.roundTrip && summary.returnWhen
              ? `<tr><td style="padding:8px 0;color:#a6a29b;">Return</td><td style="padding:8px 0;">${escapeHtml(summary.returnWhen)}</td></tr>`
              : ""
          }
          ${
            booking.airportRouteLabel
              ? `<tr><td style="padding:8px 0;color:#a6a29b;">Airport route</td><td style="padding:8px 0;">${escapeHtml(booking.airportRouteLabel)}</td></tr>`
              : ""
          }
          ${
            booking.airline
              ? `<tr><td style="padding:8px 0;color:#a6a29b;">Airline</td><td style="padding:8px 0;">${escapeHtml(booking.airline)}</td></tr>`
              : ""
          }
          ${
            booking.flightNumber
              ? `<tr><td style="padding:8px 0;color:#a6a29b;">Flight number</td><td style="padding:8px 0;">${escapeHtml(booking.flightNumber)}</td></tr>`
              : ""
          }
          ${
            booking.requestedHours
              ? `<tr><td style="padding:8px 0;color:#a6a29b;">Requested hours</td><td style="padding:8px 0;">${escapeHtml(booking.requestedHours)}</td></tr>`
              : ""
          }
          ${
            booking.estimatedTripHours
              ? `<tr><td style="padding:8px 0;color:#a6a29b;">Estimated hours</td><td style="padding:8px 0;">${escapeHtml(booking.estimatedTripHours)}</td></tr>`
              : ""
          }
          ${
            booking.estimatedTripMiles
              ? `<tr><td style="padding:8px 0;color:#a6a29b;">Estimated miles</td><td style="padding:8px 0;">${escapeHtml(booking.estimatedTripMiles)}</td></tr>`
              : ""
          }
          <tr><td style="padding:8px 0;color:#a6a29b;">Estimate</td><td style="padding:8px 0;">${escapeHtml(summary.total)} (${escapeHtml(summary.quoteMode)} quote)</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;vertical-align:top;">Notes</td><td style="padding:8px 0;">${escapeHtml(booking.requests || "No special requests.")}</td></tr>
        </table>
        ${buildBreakdownHtml(summary)}
      </div>
    </div>
  `;
}

function buildAdminText(booking) {
  const summary = buildBookingSummary(booking);

  return [
    `New booking request: ${booking.reference}`,
    "",
    `Passenger: ${booking.fullName}`,
    `Email: ${booking.email}`,
    `Phone: ${booking.phone}`,
    `Service: ${summary.serviceTitle}`,
    `Preferred vehicle: ${booking.vehicle || "Vehicle to be confirmed"}`,
    `Passengers / bags: ${booking.passengers} passengers, ${booking.bags} bags`,
    `Pickup: ${booking.pickup}`,
    `Drop-off: ${booking.dropoff}`,
    `When: ${summary.when}`,
    booking.roundTrip && summary.returnWhen ? `Return: ${summary.returnWhen}` : "",
    booking.airportRouteLabel ? `Airport route: ${booking.airportRouteLabel}` : "",
    booking.airline ? `Airline: ${booking.airline}` : "",
    booking.flightNumber ? `Flight number: ${booking.flightNumber}` : "",
    booking.requestedHours ? `Requested hours: ${booking.requestedHours}` : "",
    booking.estimatedTripHours ? `Estimated hours: ${booking.estimatedTripHours}` : "",
    booking.estimatedTripMiles ? `Estimated miles: ${booking.estimatedTripMiles}` : "",
    `Estimate: ${summary.total} (${summary.quoteMode} quote)`,
    "",
    buildBreakdownText(summary),
    "",
    `Notes: ${booking.requests || "No special requests."}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildCustomerHtml(booking) {
  const summary = buildBookingSummary(booking);

  return `
    <div style="font-family:Arial,sans-serif;background:#0b0d11;color:#f7f1e8;padding:24px;">
      <div style="max-width:640px;margin:0 auto;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px;background:#14171d;">
        <p style="letter-spacing:0.28em;text-transform:uppercase;font-size:12px;color:#d1ae72;margin:0 0 16px;">
          Booking Received
        </p>
        <h1 style="font-size:34px;line-height:1.1;margin:0 0 12px;">Reference ${escapeHtml(booking.reference)}</h1>
        <p style="margin:0 0 24px;color:#d2cec7;">
          Thank you. Your booking request has been received. A member of Autovise Black Car will confirm your trip shortly.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#a6a29b;">Service</td><td style="padding:8px 0;">${escapeHtml(summary.serviceTitle)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Pickup</td><td style="padding:8px 0;">${escapeHtml(booking.pickup)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Drop-off</td><td style="padding:8px 0;">${escapeHtml(booking.dropoff)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">When</td><td style="padding:8px 0;">${escapeHtml(summary.when)}</td></tr>
          ${
            booking.roundTrip && summary.returnWhen
              ? `<tr><td style="padding:8px 0;color:#a6a29b;">Return</td><td style="padding:8px 0;">${escapeHtml(summary.returnWhen)}</td></tr>`
              : ""
          }
          <tr><td style="padding:8px 0;color:#a6a29b;">Estimated total</td><td style="padding:8px 0;">${escapeHtml(summary.total)}</td></tr>
        </table>
        ${buildBreakdownHtml(summary)}
      </div>
    </div>
  `;
}

function buildCustomerText(booking) {
  const summary = buildBookingSummary(booking);

  return [
    `Thank you. Your booking request has been received (${booking.reference}).`,
    "",
    `Service: ${summary.serviceTitle}`,
    `Pickup: ${booking.pickup}`,
    `Drop-off: ${booking.dropoff}`,
    `When: ${summary.when}`,
    booking.roundTrip && summary.returnWhen ? `Return: ${summary.returnWhen}` : "",
    `Estimated total: ${summary.total}`,
    "",
    buildBreakdownText(summary),
    "",
    "A member of Autovise Black Car will confirm your trip shortly.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function getEmailSetupStatus() {
  const config = getEmailConfig();

  return {
    enabled: Boolean(config.apiKey && config.notificationEmail),
    canSendCustomerConfirmations: Boolean(
      config.apiKey && config.sendCustomerConfirmations,
    ),
  };
}

export async function sendBookingEmails(booking) {
  const config = getEmailConfig();

  if (!config.apiKey || !config.notificationEmail) {
    return {
      enabled: false,
      admin: "skipped",
      customer: "skipped",
    };
  }

  const resend = new Resend(config.apiKey);
  const tasks = [
    resend.emails.send({
      from: config.from,
      to: config.notificationEmail,
      subject: `New Autovise booking: ${booking.reference}`,
      html: buildAdminHtml(booking),
      text: buildAdminText(booking),
      replyTo: booking.email,
    }),
  ];

  if (config.sendCustomerConfirmations) {
    tasks.push(
      resend.emails.send({
        from: config.from,
        to: booking.email,
        subject: `We received your Autovise request (${booking.reference})`,
        html: buildCustomerHtml(booking),
        text: buildCustomerText(booking),
        replyTo: config.replyToEmail || config.notificationEmail,
      }),
    );
  }

  const [adminResult, customerResult] = await Promise.allSettled(tasks);

  return {
    enabled: true,
    admin: adminResult.status === "fulfilled" ? "sent" : "failed",
    customer:
      tasks.length > 1
        ? customerResult?.status === "fulfilled"
          ? "sent"
          : "failed"
        : "skipped",
    adminError:
      adminResult.status === "rejected" ? String(adminResult.reason) : undefined,
    customerError:
      customerResult?.status === "rejected"
        ? String(customerResult.reason)
        : undefined,
  };
}
