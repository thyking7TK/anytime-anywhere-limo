import { Resend } from "resend";

import { formatCurrency, formatRideLocalTimestamp, getServiceById } from "./booking";

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
      "Anytime Anywhere Limo <onboarding@resend.dev>",
    notificationEmail: process.env.BOOKING_NOTIFICATION_EMAIL,
    replyToEmail: process.env.BOOKING_REPLY_TO_EMAIL,
    sendCustomerConfirmations:
      process.env.BOOKING_SEND_CUSTOMER_CONFIRMATIONS === "true",
  };
}

function buildBookingSummary(booking) {
  const serviceTitle =
    getServiceById(booking.service)?.title ?? booking.service ?? "Service";
  const when = formatRideLocalTimestamp(booking.rideLocalAt);

  return {
    serviceTitle,
    when,
    total: formatCurrency(booking.estimate.total),
    deposit: formatCurrency(booking.estimate.deposit),
  };
}

function buildAdminHtml(booking) {
  const summary = buildBookingSummary(booking);

  return `
    <div style="font-family:Arial,sans-serif;background:#0b0d11;color:#f7f1e8;padding:24px;">
      <div style="max-width:640px;margin:0 auto;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px;background:#14171d;">
        <p style="letter-spacing:0.28em;text-transform:uppercase;font-size:12px;color:#d1ae72;margin:0 0 16px;">
          New Booking Request
        </p>
        <h1 style="font-size:34px;line-height:1.1;margin:0 0 12px;">${escapeHtml(booking.reference)}</h1>
        <p style="margin:0 0 24px;color:#d2cec7;">
          ${escapeHtml(booking.fullName)} requested ${escapeHtml(summary.serviceTitle.toLowerCase())} in a ${escapeHtml(booking.vehicle.toLowerCase())}.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#a6a29b;">Passenger</td><td style="padding:8px 0;">${escapeHtml(booking.fullName)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Email</td><td style="padding:8px 0;">${escapeHtml(booking.email)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Phone</td><td style="padding:8px 0;">${escapeHtml(booking.phone)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Service</td><td style="padding:8px 0;">${escapeHtml(summary.serviceTitle)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Vehicle</td><td style="padding:8px 0;">${escapeHtml(booking.vehicle)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Passengers</td><td style="padding:8px 0;">${escapeHtml(booking.passengers)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">When</td><td style="padding:8px 0;">${escapeHtml(summary.when)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Pickup</td><td style="padding:8px 0;">${escapeHtml(booking.pickup)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Drop-off</td><td style="padding:8px 0;">${escapeHtml(booking.dropoff)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Estimate</td><td style="padding:8px 0;">${escapeHtml(summary.total)} total, ${escapeHtml(summary.deposit)} deposit</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;vertical-align:top;">Notes</td><td style="padding:8px 0;">${escapeHtml(booking.requests || "No special requests.")}</td></tr>
        </table>
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
    `Vehicle: ${booking.vehicle}`,
    `Passengers: ${booking.passengers}`,
    `When: ${summary.when}`,
    `Pickup: ${booking.pickup}`,
    `Drop-off: ${booking.dropoff}`,
    `Estimate: ${summary.total} total, ${summary.deposit} deposit`,
    `Notes: ${booking.requests || "No special requests."}`,
  ].join("\n");
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
          We received your booking request for ${escapeHtml(summary.serviceTitle.toLowerCase())}. A team member will follow up with final confirmation details.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#a6a29b;">Service</td><td style="padding:8px 0;">${escapeHtml(summary.serviceTitle)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Vehicle</td><td style="padding:8px 0;">${escapeHtml(booking.vehicle)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">When</td><td style="padding:8px 0;">${escapeHtml(summary.when)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Pickup</td><td style="padding:8px 0;">${escapeHtml(booking.pickup)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Drop-off</td><td style="padding:8px 0;">${escapeHtml(booking.dropoff)}</td></tr>
          <tr><td style="padding:8px 0;color:#a6a29b;">Estimate</td><td style="padding:8px 0;">${escapeHtml(summary.total)} total</td></tr>
        </table>
      </div>
    </div>
  `;
}

function buildCustomerText(booking) {
  const summary = buildBookingSummary(booking);

  return [
    `We received your booking request (${booking.reference}).`,
    "",
    `Service: ${summary.serviceTitle}`,
    `Vehicle: ${booking.vehicle}`,
    `When: ${summary.when}`,
    `Pickup: ${booking.pickup}`,
    `Drop-off: ${booking.dropoff}`,
    `Estimate: ${summary.total} total`,
    "",
    "A team member will follow up with final confirmation details.",
  ].join("\n");
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
      subject: `New limo booking: ${booking.reference}`,
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
        subject: `We received your booking request (${booking.reference})`,
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
