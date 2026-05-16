import { NextResponse } from "next/server";

import { sendContactInquiryEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeString(value) {
  return String(value ?? "").trim();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid contact form payload." },
      { status: 400 },
    );
  }

  const inquiry = {
    fullName: normalizeString(body?.fullName),
    email: normalizeString(body?.email),
    phone: normalizeString(body?.phone),
    service: normalizeString(body?.service || "General Inquiry"),
    message: normalizeString(body?.message),
  };

  if (!inquiry.fullName || !inquiry.phone || !inquiry.email || !inquiry.message) {
    return NextResponse.json(
      { message: "Please complete all contact form fields." },
      { status: 400 },
    );
  }

  if (!isValidEmail(inquiry.email)) {
    return NextResponse.json(
      { message: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    const result = await sendContactInquiryEmail(inquiry);

    if (!result.enabled) {
      return NextResponse.json(
        { message: "Contact email is not configured yet." },
        { status: 503 },
      );
    }

    if (result.status !== "sent") {
      return NextResponse.json(
        { message: "We could not send your inquiry right now." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        "Your inquiry has been sent. Autovise Black Car will follow up shortly.",
    });
  } catch {
    return NextResponse.json(
      { message: "We could not send your inquiry right now." },
      { status: 500 },
    );
  }
}
