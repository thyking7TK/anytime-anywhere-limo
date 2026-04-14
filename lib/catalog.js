import { getDatabaseClient, isDatabaseConfigured } from "./database";
import {
  bookingServices,
  defaultAirportRoutes,
  defaultPricingSettings,
  defaultVehicles,
  getDefaultCatalog,
  services,
  slugifyAirportRouteLabel,
  slugifyVehicleName,
  testimonials,
} from "./catalog-shared";

let catalogReadyPromise;

function parseStoredJson(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  return value;
}

function toDisplayVehicle(row) {
  const imageUrls = parseStoredJson(row.image_urls);

  return {
    slug: row.slug,
    name: row.name,
    capacity: row.capacity,
    description: row.description,
    bestFor: row.best_for,
    mood: row.mood,
    accent: row.accent,
    imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
    active: row.active,
    displayOrder: row.display_order,
  };
}

function toDisplayAirportRoute(row) {
  return {
    id: row.id,
    label: row.label,
    endpointA: row.endpoint_a,
    endpointB: row.endpoint_b,
    oneWayPrice: Math.round(row.one_way_cents / 100),
    roundTripPrice: Math.round(row.round_trip_cents / 100),
    active: row.active,
    displayOrder: row.display_order,
  };
}

function coerceNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeVehicleImageUrls(imageUrls = []) {
  if (!Array.isArray(imageUrls)) {
    return [];
  }

  const seenUrls = new Set();

  return imageUrls
    .map((value) => String(value ?? "").trim())
    .filter((value) => value.startsWith("http://") || value.startsWith("https://"))
    .filter((value) => {
      if (seenUrls.has(value)) {
        return false;
      }

      seenUrls.add(value);
      return true;
    })
    .slice(0, 5);
}

function normalizeVehicles(vehicles = []) {
  return vehicles.map((vehicle, index) => ({
    slug:
      slugifyVehicleName(vehicle.slug) ||
      slugifyVehicleName(vehicle.name) ||
      `vehicle-${index + 1}`,
    name: String(vehicle.name ?? "").trim(),
    capacity: Math.max(1, Math.round(coerceNumber(vehicle.capacity, 1))),
    description: String(vehicle.description ?? "").trim(),
    bestFor: String(vehicle.bestFor ?? "").trim(),
    mood: String(vehicle.mood ?? "").trim(),
    accent:
      String(vehicle.accent ?? "").trim() ||
      "from-white/10 via-transparent to-transparent",
    imageUrls: normalizeVehicleImageUrls(vehicle.imageUrls),
    active: Boolean(vehicle.active),
    displayOrder: Math.round(coerceNumber(vehicle.displayOrder, index + 1)),
  }));
}

function normalizePricingSettings(settings = {}) {
  return {
    weekdayHourlyRate: Math.max(
      0,
      Math.round(
        coerceNumber(
          settings.weekdayHourlyRate,
          defaultPricingSettings.weekdayHourlyRate,
        ),
      ),
    ),
    weekendHourlyRate: Math.max(
      0,
      Math.round(
        coerceNumber(
          settings.weekendHourlyRate,
          defaultPricingSettings.weekendHourlyRate,
        ),
      ),
    ),
    hourlyMinimum: Math.max(
      1,
      Math.round(
        coerceNumber(settings.hourlyMinimum, defaultPricingSettings.hourlyMinimum),
      ),
    ),
    customHourlyBasis: Math.max(
      0,
      Math.round(
        coerceNumber(
          settings.customHourlyBasis,
          defaultPricingSettings.customHourlyBasis,
        ),
      ),
    ),
    mileageRate: Math.max(
      0,
      coerceNumber(settings.mileageRate, defaultPricingSettings.mileageRate),
    ),
    profitBuffer: Math.max(
      0,
      Math.round(
        coerceNumber(settings.profitBuffer, defaultPricingSettings.profitBuffer),
      ),
    ),
    waitRate: Math.max(
      0,
      Math.round(coerceNumber(settings.waitRate, defaultPricingSettings.waitRate)),
    ),
    stopFee: Math.max(
      0,
      Math.round(coerceNumber(settings.stopFee, defaultPricingSettings.stopFee)),
    ),
    lateNightPercent: Math.max(
      0,
      Math.min(
        1,
        coerceNumber(
          settings.lateNightPercent,
          defaultPricingSettings.lateNightPercent,
        ),
      ),
    ),
    holidayPercent: Math.max(
      0,
      Math.min(
        1,
        coerceNumber(settings.holidayPercent, defaultPricingSettings.holidayPercent),
      ),
    ),
    lateNightStartHour: Math.min(
      23,
      Math.max(
        0,
        Math.round(
          coerceNumber(
            settings.lateNightStartHour,
            defaultPricingSettings.lateNightStartHour,
          ),
        ),
      ),
    ),
    lateNightEndHour: Math.min(
      23,
      Math.max(
        0,
        Math.round(
          coerceNumber(
            settings.lateNightEndHour,
            defaultPricingSettings.lateNightEndHour,
          ),
        ),
      ),
    ),
    minimumQuote: Math.max(
      0,
      Math.round(
        coerceNumber(settings.minimumQuote, defaultPricingSettings.minimumQuote),
      ),
    ),
  };
}

function normalizeAirportRoutes(routes = []) {
  return routes.map((route, index) => ({
    id:
      slugifyAirportRouteLabel(route.id) ||
      slugifyAirportRouteLabel(route.label) ||
      `airport-route-${index + 1}`,
    label:
      String(route.label ?? "").trim() ||
      `Airport route ${index + 1}`,
    endpointA: String(route.endpointA ?? "").trim(),
    endpointB: String(route.endpointB ?? "").trim(),
    oneWayPrice: Math.max(0, Math.round(coerceNumber(route.oneWayPrice, 0))),
    roundTripPrice: Math.max(
      0,
      Math.round(coerceNumber(route.roundTripPrice, 0)),
    ),
    active: Boolean(route.active),
    displayOrder: Math.round(coerceNumber(route.displayOrder, index + 1)),
  }));
}

function mapSettingsRows(settingsRows = []) {
  const settings = { ...defaultPricingSettings };

  for (const row of settingsRows) {
    const key = row.key;

    if (!(key in settings)) {
      continue;
    }

    settings[key] = row.value_text;
  }

  return normalizePricingSettings(settings);
}

async function seedDefaultCatalog(sql) {
  const [vehicleCountRow] = await sql`
    SELECT COUNT(*)::int AS count FROM vehicles
  `;

  if (vehicleCountRow.count === 0) {
    await sql`
      INSERT INTO vehicles (
        slug,
        name,
        capacity,
        description,
        best_for,
        mood,
        accent,
        active,
        display_order
      ) VALUES ${sql(
        defaultVehicles.map((vehicle) => [
          vehicle.slug,
          vehicle.name,
          vehicle.capacity,
          vehicle.description,
          vehicle.bestFor,
          vehicle.mood,
          vehicle.accent,
          vehicle.active,
          vehicle.displayOrder,
        ]),
      )}
    `;
  }

  const [routeCountRow] = await sql`
    SELECT COUNT(*)::int AS count FROM airport_routes
  `;

  if (routeCountRow.count === 0) {
    await sql`
      INSERT INTO airport_routes (
        id,
        label,
        endpoint_a,
        endpoint_b,
        one_way_cents,
        round_trip_cents,
        active,
        display_order
      ) VALUES ${sql(
        defaultAirportRoutes.map((route) => [
          route.id,
          route.label,
          route.endpointA,
          route.endpointB,
          route.oneWayPrice * 100,
          route.roundTripPrice * 100,
          route.active,
          route.displayOrder,
        ]),
      )}
    `;
  }

  for (const [key, value] of Object.entries(defaultPricingSettings)) {
    await sql`
      INSERT INTO pricing_settings (
        key,
        value_text
      ) VALUES (
        ${key},
        ${String(value)}
      )
      ON CONFLICT (key) DO NOTHING
    `;
  }
}

export async function ensureCatalogReady() {
  if (!isDatabaseConfigured()) {
    return;
  }

  if (!catalogReadyPromise) {
    const sql = getDatabaseClient();

    catalogReadyPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS vehicles (
          slug TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          capacity INTEGER NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          best_for TEXT NOT NULL DEFAULT '',
          mood TEXT NOT NULL DEFAULT '',
          accent TEXT NOT NULL DEFAULT '',
          image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
          active BOOLEAN NOT NULL DEFAULT TRUE,
          display_order INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        ALTER TABLE vehicles
        ADD COLUMN IF NOT EXISTS best_for TEXT NOT NULL DEFAULT ''
      `;

      await sql`
        ALTER TABLE vehicles
        ADD COLUMN IF NOT EXISTS image_urls JSONB NOT NULL DEFAULT '[]'::jsonb
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS pricing_settings (
          key TEXT PRIMARY KEY,
          value_text TEXT NOT NULL
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS airport_routes (
          id TEXT PRIMARY KEY,
          label TEXT NOT NULL,
          endpoint_a TEXT NOT NULL,
          endpoint_b TEXT NOT NULL,
          one_way_cents INTEGER NOT NULL,
          round_trip_cents INTEGER NOT NULL,
          active BOOLEAN NOT NULL DEFAULT TRUE,
          display_order INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await seedDefaultCatalog(sql);
    })();
  }

  return catalogReadyPromise;
}

export {
  bookingServices,
  defaultAirportRoutes,
  defaultPricingSettings,
  defaultVehicles,
  getDefaultCatalog,
  services,
  slugifyAirportRouteLabel,
  slugifyVehicleName,
  testimonials,
};

export async function getCatalog(options = {}) {
  if (!isDatabaseConfigured()) {
    return getDefaultCatalog();
  }

  await ensureCatalogReady();

  const sql = getDatabaseClient();
  const includeInactive = options.includeInactive ?? false;
  const vehiclesRows = includeInactive
    ? await sql`
        SELECT
          slug,
          name,
          capacity,
          description,
          best_for,
          mood,
          accent,
          image_urls,
          active,
          display_order
        FROM vehicles
        ORDER BY display_order ASC, name ASC
      `
    : await sql`
        SELECT
          slug,
          name,
          capacity,
          description,
          best_for,
          mood,
          accent,
          image_urls,
          active,
          display_order
        FROM vehicles
        WHERE active = TRUE
        ORDER BY display_order ASC, name ASC
      `;
  const airportRouteRows = includeInactive
    ? await sql`
        SELECT
          id,
          label,
          endpoint_a,
          endpoint_b,
          one_way_cents,
          round_trip_cents,
          active,
          display_order
        FROM airport_routes
        ORDER BY display_order ASC, label ASC
      `
    : await sql`
        SELECT
          id,
          label,
          endpoint_a,
          endpoint_b,
          one_way_cents,
          round_trip_cents,
          active,
          display_order
        FROM airport_routes
        WHERE active = TRUE
        ORDER BY display_order ASC, label ASC
      `;
  const settingsRows = await sql`
    SELECT key, value_text
    FROM pricing_settings
  `;

  return {
    services,
    bookingServices,
    testimonials,
    vehicles: vehiclesRows.map(toDisplayVehicle),
    pricingSettings: mapSettingsRows(settingsRows),
    airportRoutes: airportRouteRows.map(toDisplayAirportRoute),
  };
}

export async function saveCatalog({ vehicles, pricingSettings, airportRoutes }) {
  if (!isDatabaseConfigured()) {
    throw new Error("Database connection is not configured.");
  }

  await ensureCatalogReady();

  const normalizedVehicles = normalizeVehicles(vehicles);
  const normalizedSettings = normalizePricingSettings(pricingSettings);
  const normalizedAirportRoutes = normalizeAirportRoutes(airportRoutes);
  const vehicleSlugs = normalizedVehicles.map((vehicle) => vehicle.slug);
  const routeIds = normalizedAirportRoutes.map((route) => route.id);
  const sql = getDatabaseClient();

  await sql.begin(async (transaction) => {
    const existingVehicles = await transaction`
      SELECT slug
      FROM vehicles
    `;
    const removedVehicleSlugs = existingVehicles
      .map((row) => row.slug)
      .filter((slug) => !vehicleSlugs.includes(slug));

    for (const removedSlug of removedVehicleSlugs) {
      await transaction`
        DELETE FROM vehicles
        WHERE slug = ${removedSlug}
      `;
    }

    for (const vehicle of normalizedVehicles) {
      await transaction`
        INSERT INTO vehicles (
          slug,
          name,
          capacity,
          description,
          best_for,
          mood,
          accent,
          image_urls,
          active,
          display_order
        ) VALUES (
          ${vehicle.slug},
          ${vehicle.name},
          ${vehicle.capacity},
          ${vehicle.description},
          ${vehicle.bestFor},
          ${vehicle.mood},
          ${vehicle.accent},
          ${transaction.json(vehicle.imageUrls)},
          ${vehicle.active},
          ${vehicle.displayOrder}
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          capacity = EXCLUDED.capacity,
          description = EXCLUDED.description,
          best_for = EXCLUDED.best_for,
          mood = EXCLUDED.mood,
          accent = EXCLUDED.accent,
          image_urls = EXCLUDED.image_urls,
          active = EXCLUDED.active,
          display_order = EXCLUDED.display_order
      `;
    }

    const existingRoutes = await transaction`
      SELECT id
      FROM airport_routes
    `;
    const removedRouteIds = existingRoutes
      .map((row) => row.id)
      .filter((id) => !routeIds.includes(id));

    for (const removedId of removedRouteIds) {
      await transaction`
        DELETE FROM airport_routes
        WHERE id = ${removedId}
      `;
    }

    for (const route of normalizedAirportRoutes) {
      await transaction`
        INSERT INTO airport_routes (
          id,
          label,
          endpoint_a,
          endpoint_b,
          one_way_cents,
          round_trip_cents,
          active,
          display_order
        ) VALUES (
          ${route.id},
          ${route.label},
          ${route.endpointA},
          ${route.endpointB},
          ${route.oneWayPrice * 100},
          ${route.roundTripPrice * 100},
          ${route.active},
          ${route.displayOrder}
        )
        ON CONFLICT (id) DO UPDATE SET
          label = EXCLUDED.label,
          endpoint_a = EXCLUDED.endpoint_a,
          endpoint_b = EXCLUDED.endpoint_b,
          one_way_cents = EXCLUDED.one_way_cents,
          round_trip_cents = EXCLUDED.round_trip_cents,
          active = EXCLUDED.active,
          display_order = EXCLUDED.display_order
      `;
    }

    for (const [key, value] of Object.entries(normalizedSettings)) {
      await transaction`
        INSERT INTO pricing_settings (
          key,
          value_text
        ) VALUES (
          ${key},
          ${String(value)}
        )
        ON CONFLICT (key) DO UPDATE SET
          value_text = EXCLUDED.value_text
      `;
    }
  });

  return getCatalog({ includeInactive: true });
}
