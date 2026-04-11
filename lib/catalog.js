import { getDatabaseClient, isDatabaseConfigured } from "./database";
import {
  defaultPricingMatrix,
  defaultPricingSettings,
  defaultVehicles,
  getDefaultCatalog,
  services,
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

function coerceNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function createEmptyPricingMatrix(vehicles) {
  return services.reduce((serviceAccumulator, service) => {
    serviceAccumulator[service.id] = vehicles.reduce((vehicleAccumulator, vehicle) => {
      vehicleAccumulator[vehicle.slug] = 0;
      return vehicleAccumulator;
    }, {});

    return serviceAccumulator;
  }, {});
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
      slugifyVehicleName(vehicle.slug) || slugifyVehicleName(vehicle.name) || `vehicle-${index + 1}`,
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
    afterHoursFee: Math.max(
      0,
      Math.round(coerceNumber(settings.afterHoursFee, defaultPricingSettings.afterHoursFee)),
    ),
    weekendFee: Math.max(
      0,
      Math.round(coerceNumber(settings.weekendFee, defaultPricingSettings.weekendFee)),
    ),
    specialRequestFee: Math.max(
      0,
      Math.round(
        coerceNumber(
          settings.specialRequestFee,
          defaultPricingSettings.specialRequestFee,
        ),
      ),
    ),
    extraPassengerFee: Math.max(
      0,
      Math.round(
        coerceNumber(
          settings.extraPassengerFee,
          defaultPricingSettings.extraPassengerFee,
        ),
      ),
    ),
    gratuityRate: Math.max(
      0,
      coerceNumber(settings.gratuityRate, defaultPricingSettings.gratuityRate),
    ),
    afterHoursStartHour: Math.min(
      23,
      Math.max(
        0,
        Math.round(
          coerceNumber(
            settings.afterHoursStartHour,
            defaultPricingSettings.afterHoursStartHour,
          ),
        ),
      ),
    ),
    afterHoursEndHour: Math.min(
      23,
      Math.max(
        0,
        Math.round(
          coerceNumber(
            settings.afterHoursEndHour,
            defaultPricingSettings.afterHoursEndHour,
          ),
        ),
      ),
    ),
  };
}

function normalizePricingMatrix(pricingMatrix = {}, vehicles = defaultVehicles) {
  const nextMatrix = createEmptyPricingMatrix(vehicles);

  for (const service of services) {
    for (const vehicle of vehicles) {
      nextMatrix[service.id][vehicle.slug] = Math.max(
        0,
        Math.round(
          coerceNumber(
            pricingMatrix?.[service.id]?.[vehicle.slug],
            defaultPricingMatrix?.[service.id]?.[vehicle.slug] ?? 0,
          ),
        ),
      );
    }
  }

  return nextMatrix;
}

function mapSettingsRows(settingsRows = []) {
  const settings = { ...defaultPricingSettings };

  for (const row of settingsRows) {
    const key = row.key;
    const value = row.value_text;

    if (!(key in settings)) {
      continue;
    }

    settings[key] = coerceNumber(value, settings[key]);
  }

  return normalizePricingSettings(settings);
}

function mapPricingRows(pricingRows = [], vehicles = defaultVehicles) {
  const matrix = createEmptyPricingMatrix(vehicles);

  for (const row of pricingRows) {
    if (!matrix[row.service_id] || !(row.vehicle_slug in matrix[row.service_id])) {
      continue;
    }

    matrix[row.service_id][row.vehicle_slug] = Math.round(row.amount_cents / 100);
  }

  return matrix;
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

  const [pricingCountRow] = await sql`
    SELECT COUNT(*)::int AS count FROM pricing_rules
  `;

  if (pricingCountRow.count === 0) {
    const pricingRows = [];

    for (const service of services) {
      for (const vehicle of defaultVehicles) {
        pricingRows.push([
          service.id,
          vehicle.slug,
          defaultPricingMatrix[service.id][vehicle.slug] * 100,
        ]);
      }
    }

    await sql`
      INSERT INTO pricing_rules (
        service_id,
        vehicle_slug,
        amount_cents
      ) VALUES ${sql(pricingRows)}
    `;
  }

  const [settingsCountRow] = await sql`
    SELECT COUNT(*)::int AS count FROM pricing_settings
  `;

  if (settingsCountRow.count === 0) {
    await sql`
      INSERT INTO pricing_settings (
        key,
        value_text
      ) VALUES ${sql(
        Object.entries(defaultPricingSettings).map(([key, value]) => [
          key,
          String(value),
        ]),
      )}
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
        CREATE TABLE IF NOT EXISTS pricing_rules (
          service_id TEXT NOT NULL,
          vehicle_slug TEXT NOT NULL REFERENCES vehicles(slug) ON DELETE CASCADE,
          amount_cents INTEGER NOT NULL,
          PRIMARY KEY (service_id, vehicle_slug)
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS pricing_settings (
          key TEXT PRIMARY KEY,
          value_text TEXT NOT NULL
        )
      `;

      await seedDefaultCatalog(sql);
    })();
  }

  return catalogReadyPromise;
}

export {
  defaultPricingMatrix,
  defaultPricingSettings,
  defaultVehicles,
  getDefaultCatalog,
  services,
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

  const vehicles = vehiclesRows.map(toDisplayVehicle);
  const vehicleSet = vehicles;
  const pricingRows = includeInactive
    ? await sql`
        SELECT service_id, vehicle_slug, amount_cents
        FROM pricing_rules
      `
    : await sql`
        SELECT pricing_rules.service_id, pricing_rules.vehicle_slug, pricing_rules.amount_cents
        FROM pricing_rules
        INNER JOIN vehicles ON vehicles.slug = pricing_rules.vehicle_slug
        WHERE vehicles.active = TRUE
      `;
  const settingsRows = await sql`
    SELECT key, value_text
    FROM pricing_settings
  `;

  return {
    services,
    testimonials,
    vehicles: vehicleSet.map((vehicle) => ({ ...vehicle })),
    pricingMatrix: mapPricingRows(pricingRows, vehicleSet),
    pricingSettings: mapSettingsRows(settingsRows),
  };
}

export async function saveCatalog({ vehicles, pricingMatrix, pricingSettings }) {
  if (!isDatabaseConfigured()) {
    throw new Error("Database connection is not configured.");
  }

  await ensureCatalogReady();

  const normalizedVehicles = normalizeVehicles(vehicles);
  const normalizedSettings = normalizePricingSettings(pricingSettings);
  const normalizedPricing = normalizePricingMatrix(pricingMatrix, normalizedVehicles);
  const vehicleSlugs = normalizedVehicles.map((vehicle) => vehicle.slug);
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

    for (const service of services) {
      for (const vehicle of normalizedVehicles) {
        await transaction`
          INSERT INTO pricing_rules (
            service_id,
            vehicle_slug,
            amount_cents
          ) VALUES (
            ${service.id},
            ${vehicle.slug},
            ${normalizedPricing[service.id][vehicle.slug] * 100}
          )
          ON CONFLICT (service_id, vehicle_slug) DO UPDATE SET
            amount_cents = EXCLUDED.amount_cents
        `;
      }
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
