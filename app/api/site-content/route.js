import { NextResponse } from "next/server";

import { getSiteContent } from "@/lib/site-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const siteContent = await getSiteContent();
    return NextResponse.json({ siteContent });
  } catch (error) {
    console.error("Failed to load public site content", error);

    return NextResponse.json(
      { message: "Could not load the site content right now." },
      { status: 500 },
    );
  }
}
