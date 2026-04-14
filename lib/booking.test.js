import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateAirportQuote,
  calculateCustomQuote,
  calculateHourlyQuote,
  getDefaultCatalog,
} from "./booking.js";

test("hourly quotes enforce the 3-hour minimum on weekdays", () => {
  const quote = calculateHourlyQuote(2, new Date("2026-04-15T14:00:00"));

  assert.equal(quote.quoteMode, "instant");
  assert.equal(quote.total, 330);
  assert.equal(quote.details.billableHours, 3);
});

test("airport quotes return the configured Portland to Logan flat rates", () => {
  const catalog = getDefaultCatalog();
  const routeId = catalog.airportRoutes[0].id;

  const oneWay = calculateAirportQuote(
    "Portland, ME",
    "Boston Logan Airport",
    false,
    catalog,
    routeId,
  );
  const roundTrip = calculateAirportQuote(
    "Portland, ME",
    "Boston Logan Airport",
    true,
    catalog,
    routeId,
  );

  assert.equal(oneWay.total, 650);
  assert.equal(roundTrip.total, 1200);
});

test("custom quotes follow time + mileage + buffer pricing", () => {
  const quote = calculateCustomQuote(3, 150);

  assert.equal(quote.quoteMode, "instant");
  assert.equal(quote.total, 685);
});

test("custom quotes apply late-night and holiday surcharges after add-ons", () => {
  const quote = calculateCustomQuote(2, 40, {
    extraStops: 1,
    waitHours: 1,
    isLateNight: true,
    isHoliday: true,
  });

  assert.equal(quote.quoteMode, "instant");
  assert.ok(quote.total > 0);
  assert.ok(quote.lineItems.some((item) => item.key === "late-night"));
  assert.ok(quote.lineItems.some((item) => item.key === "holiday"));
});
