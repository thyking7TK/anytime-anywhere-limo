import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { isAuthorizedRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxFileSizeInBytes = 20 * 1024 * 1024;
const cacheControlMaxAge = 60 * 60 * 24 * 30;

function sanitizePathSegment(value, fallback = "vehicle") {
  const safeValue = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return safeValue || fallback;
}

function sanitizeFilename(filename) {
  const safeName = String(filename ?? "vehicle-image")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return safeName || `vehicle-image-${Date.now()}.jpg`;
}

export async function POST(request) {
  if (!isAuthorizedRequest(request)) {
    return NextResponse.json(
      { message: "Unauthorized image upload request." },
      { status: 401 },
    );
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!blobToken) {
    return NextResponse.json(
      {
        message:
          "Blob storage is not connected to this Vercel project yet. Add Blob in Storage, confirm BLOB_READ_WRITE_TOKEN exists, and redeploy.",
      },
      { status: 503 },
    );
  }

  let formData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "Invalid vehicle image upload payload." },
      { status: 400 },
    );
  }

  const vehicleSlug = sanitizePathSegment(formData.get("vehicleSlug"), "vehicle");
  const files = formData.getAll("files").filter((value) => value instanceof File);

  if (files.length === 0) {
    return NextResponse.json(
      { message: "Select at least one image to upload." },
      { status: 400 },
    );
  }

  const invalidFile = files.find(
    (file) => !String(file.type ?? "").startsWith("image/"),
  );

  if (invalidFile) {
    return NextResponse.json(
      { message: "Only image files can be uploaded for vehicles." },
      { status: 400 },
    );
  }

  const oversizedFile = files.find((file) => file.size > maxFileSizeInBytes);

  if (oversizedFile) {
    return NextResponse.json(
      {
        message:
          "Vehicle photos must be 20MB or smaller. Compress the image and try again.",
      },
      { status: 400 },
    );
  }

  try {
    const uploads = await Promise.all(
      files.map(async (file) => {
        const blob = await put(
          `vehicle-images/${vehicleSlug}/${Date.now()}-${sanitizeFilename(file.name)}`,
          file,
          {
            access: "public",
            addRandomSuffix: true,
            cacheControlMaxAge,
            contentType: file.type || undefined,
            multipart: file.size > 4_000_000,
            token: blobToken,
          },
        );

        return {
          url: blob.url,
          pathname: blob.pathname,
          contentType: blob.contentType,
        };
      }),
    );

    return NextResponse.json({ uploads });
  } catch (error) {
    console.error("Vehicle image upload failed", error);

    return NextResponse.json(
      {
        message:
          error?.message ||
          "Could not upload vehicle photos to Blob right now.",
      },
      { status: 500 },
    );
  }
}
