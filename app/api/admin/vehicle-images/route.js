import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { isAuthorizedRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid upload request." },
      { status: 400 },
    );
  }

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!isAuthorizedRequest(request)) {
          throw new Error("Unauthorized image upload request.");
        }

        if (!pathname.startsWith("vehicle-images/")) {
          throw new Error("Vehicle images must be uploaded to the vehicle-images folder.");
        }

        return {
          allowedContentTypes: ["image/*"],
          maximumSizeInBytes: 20 * 1024 * 1024,
          cacheControlMaxAge: 60 * 60 * 24 * 30,
          addRandomSuffix: true,
          tokenPayload: clientPayload,
        };
      },
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Vehicle image upload failed", error);

    return NextResponse.json(
      {
        message:
          error?.message ||
          "Could not prepare the vehicle image upload right now.",
      },
      { status: 400 },
    );
  }
}
