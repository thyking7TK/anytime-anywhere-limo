import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { isAuthorizedRequest } from "@/lib/admin-auth";
import { getCatalog, saveCatalog } from "@/lib/catalog";
import {
  defaultPricingSettings,
  services,
  slugifyVehicleName,
} from "@/lib/catalog-shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validateCatalogPayload(payload = {}) {
  const errors = [];
  const vehicles = Array.isArray(payload.vehicles) ? payload.vehicles : [];

  if (vehicles.length === 0) {
    errors.push("Add at least one vehicle.");
  }

  const activeVehicleCount = vehicles.filter((vehicle) => Boolean(vehicle?.active))
    .length;

  if (activeVehicleCount === 0) {
    errors.push("Keep at least one active vehicle on the live site.");
  }

  const seenSlugs = new Set();

  for (const vehicle of vehicles) {
    const name = String(vehicle.name ?? "").trim();
    const slug = slugifyVehicleName(vehicle.slug || vehicle.name);
    const capacity = Number(vehicle.capacity);

    if (!name) {
      errors.push("Each vehicle needs a name.");
    }

    if (!slug) {
      errors.push(`Vehicle "${name || "Untitled"}" needs a valid slug.`);
    } else if (seenSlugs.has(slug)) {
      errors.push(`Vehicle slug "${slug}" is duplicated.`);
    } else {
      seenSlugs.add(slug);
    }

    if (!Number.isInteger(capacity) || capacity < 1) {
      errors.push(`Vehicle "${name || slug}" needs a valid capacity.`);
    }

    const imageUrls = Array.isArray(vehicle.imageUrls) ? vehicle.imageUrls : [];

    if (imageUrls.length > 5) {
      errors.push(`Vehicle "${name || slug}" can only have up to 5 images.`);
    }

    for (const imageUrl of imageUrls) {
      const normalizedUrl = String(imageUrl ?? "").trim();

      if (
        !normalizedUrl.startsWith("https://") &&
        !normalizedUrl.startsWith("http://")
      ) {
        errors.push(
          `Vehicle "${name || slug}" has an invalid image URL.`,
        );
      }
    }
  }

  const pricingSettings = payload.pricingSettings ?? {};
  const gratuityRate = Number(
    pricingSettings.gratuityRate ?? defaultPricingSettings.gratuityRate,
  );

  if (!Number.isFinite(gratuityRate) || gratuityRate < 0 || gratuityRate > 1) {
    errors.push("Gratuity rate must be a decimal between 0 and 1.");
  }

  const pricingMatrix = payload.pricingMatrix ?? {};

  for (const service of services) {
    for (const slug of seenSlugs) {
      const amount = Number(pricingMatrix?.[service.id]?.[slug]);

      if (!Number.isFinite(amount) || amount < 0) {
        errors.push(
          `Pricing for ${service.title} / ${slug} must be a valid non-negative number.`,
        );
      }
    }
  }

  return errors;
}

export async function GET(request) {
  if (!isAuthorizedRequest(request)) {
    return NextResponse.json(
      {
        message:
          "Admin access is not enabled. Set BOOKINGS_ADMIN_KEY and pass it with the request.",
      },
      { status: 401 },
    );
  }

  try {
    const catalog = await getCatalog({ includeInactive: true });
    return NextResponse.json({ catalog });
  } catch (error) {
    console.error("Failed to load admin catalog", error);

    return NextResponse.json(
      { message: "Could not load the admin catalog right now." },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  if (!isAuthorizedRequest(request)) {
    return NextResponse.json(
      {
        message:
          "Admin access is not enabled. Set BOOKINGS_ADMIN_KEY and pass it with the request.",
      },
      { status: 401 },
    );
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid catalog payload." },
      { status: 400 },
    );
  }

  const errors = validateCatalogPayload(payload);

  if (errors.length > 0) {
    return NextResponse.json(
      {
        message: "Please fix the catalog fields before saving.",
        errors,
      },
      { status: 400 },
    );
  }

  try {
    const catalog = await saveCatalog(payload);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/api/catalog");
    return NextResponse.json({ catalog });
  } catch (error) {
    console.error("Failed to save admin catalog", error);

    return NextResponse.json(
      { message: "Could not save the admin catalog right now." },
      { status: 500 },
    );
  }
}
