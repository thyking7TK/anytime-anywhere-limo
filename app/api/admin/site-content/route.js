import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { isAuthorizedRequest } from "@/lib/admin-auth";
import { getSiteContent, saveSiteContent } from "@/lib/site-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorizedResponse() {
  return NextResponse.json(
    {
      message:
        "Admin access is not enabled. Set BOOKINGS_ADMIN_KEY and pass it with the request.",
    },
    { status: 401 },
  );
}

export async function GET(request) {
  if (!isAuthorizedRequest(request)) {
    return unauthorizedResponse();
  }

  try {
    const siteContent = await getSiteContent();
    return NextResponse.json({ siteContent });
  } catch (error) {
    console.error("Failed to load site content", error);

    return NextResponse.json(
      { message: "Could not load the CMS content right now." },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  if (!isAuthorizedRequest(request)) {
    return unauthorizedResponse();
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid site content payload." },
      { status: 400 },
    );
  }

  try {
    const siteContent = await saveSiteContent(payload);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/api/site-content");
    return NextResponse.json({ siteContent });
  } catch (error) {
    console.error("Failed to save site content", error);

    return NextResponse.json(
      { message: "Could not save the CMS content right now." },
      { status: 500 },
    );
  }
}
