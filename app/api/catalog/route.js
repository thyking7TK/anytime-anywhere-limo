import { NextResponse } from "next/server";

import { getCatalog } from "@/lib/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalog = await getCatalog();
    return NextResponse.json({ catalog });
  } catch (error) {
    console.error("Failed to load public catalog", error);

    return NextResponse.json(
      { message: "Could not load vehicle catalog right now." },
      { status: 500 },
    );
  }
}
