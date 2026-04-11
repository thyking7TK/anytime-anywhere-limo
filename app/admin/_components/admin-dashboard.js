"use client";

import { useCallback, useEffect, useState } from "react";

import { formatCurrency, services } from "@/lib/booking";
import {
  defaultPricingSettings,
  slugifyVehicleName,
} from "@/lib/catalog-shared";

const storageKey = "anytime-anywhere-admin-key";
const bookingStatuses = ["pending", "confirmed", "completed", "cancelled"];

function createEmptyVehicle(index = 0) {
  return {
    slug: `vehicle-${Date.now()}-${index}`,
    name: "",
    capacity: 2,
    description: "",
    mood: "",
    accent: "from-white/10 via-transparent to-transparent",
    active: true,
    displayOrder: index + 1,
  };
}

function normalizeCurrencyInput(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : 0;
}

function normalizeDecimalInput(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export default function AdminDashboard() {
  const [keyInput, setKeyInput] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [catalog, setCatalog] = useState(null);
  const [savingCatalog, setSavingCatalog] = useState(false);
  const [catalogMessage, setCatalogMessage] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");

  useEffect(() => {
    const savedKey = window.localStorage.getItem(storageKey);

    if (savedKey) {
      setAdminKey(savedKey);
      setKeyInput(savedKey);
    }
  }, []);

  const loadDashboard = useCallback(async (key = adminKey) => {
    setLoading(true);
    setLoadError("");

    try {
      const [catalogResponse, bookingsResponse] = await Promise.all([
        fetch("/api/admin/catalog", {
          headers: {
            "x-admin-key": key,
          },
        }),
        fetch("/api/bookings", {
          headers: {
            "x-admin-key": key,
          },
        }),
      ]);

      const catalogData = await catalogResponse.json().catch(() => ({}));
      const bookingsData = await bookingsResponse.json().catch(() => ({}));

      if (!catalogResponse.ok || !bookingsResponse.ok) {
        throw new Error(
          catalogData.message ||
            bookingsData.message ||
            "Could not load the dashboard.",
        );
      }

      setCatalog(catalogData.catalog);
      setBookings(bookingsData.bookings ?? []);
    } catch (error) {
      setLoadError(error.message || "Could not load the dashboard.");
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    if (adminKey) {
      void loadDashboard(adminKey);
    }
  }, [adminKey, loadDashboard]);

  function unlockDashboard(event) {
    event.preventDefault();

    const nextKey = keyInput.trim();

    if (!nextKey) {
      setLoadError("Enter the admin key to open the dashboard.");
      return;
    }

    window.localStorage.setItem(storageKey, nextKey);
    setAdminKey(nextKey);
  }

  function lockDashboard() {
    window.localStorage.removeItem(storageKey);
    setAdminKey("");
    setKeyInput("");
    setCatalog(null);
    setBookings([]);
    setLoadError("");
    setCatalogMessage("");
    setBookingMessage("");
  }

  function updateVehicle(index, field, value) {
    setCatalog((currentCatalog) => {
      const vehicles = [...currentCatalog.vehicles];
      const currentVehicle = vehicles[index];
      const nextVehicle = {
        ...currentVehicle,
        [field]: value,
      };

      if (field === "name" && (!currentVehicle.name || currentVehicle.slug.startsWith("vehicle-"))) {
        nextVehicle.slug = slugifyVehicleName(value) || currentVehicle.slug;
      }

      vehicles[index] = nextVehicle;

      return {
        ...currentCatalog,
        vehicles,
      };
    });
    setCatalogMessage("");
  }

  function addVehicle() {
    setCatalog((currentCatalog) => ({
      ...currentCatalog,
      vehicles: [
        ...currentCatalog.vehicles,
        createEmptyVehicle(currentCatalog.vehicles.length),
      ],
    }));
    setCatalogMessage("");
  }

  function updatePricing(serviceId, vehicleSlug, value) {
    setCatalog((currentCatalog) => ({
      ...currentCatalog,
      pricingMatrix: {
        ...currentCatalog.pricingMatrix,
        [serviceId]: {
          ...currentCatalog.pricingMatrix[serviceId],
          [vehicleSlug]: normalizeCurrencyInput(value),
        },
      },
    }));
    setCatalogMessage("");
  }

  function updatePricingSetting(key, value) {
    setCatalog((currentCatalog) => ({
      ...currentCatalog,
      pricingSettings: {
        ...currentCatalog.pricingSettings,
        [key]:
          key === "gratuityRate"
            ? normalizeDecimalInput(value, defaultPricingSettings.gratuityRate)
            : normalizeCurrencyInput(value),
      },
    }));
    setCatalogMessage("");
  }

  async function saveCatalog() {
    setSavingCatalog(true);
    setCatalogMessage("");

    try {
      const response = await fetch("/api/admin/catalog", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          vehicles: catalog.vehicles.map((vehicle, index) => ({
            ...vehicle,
            displayOrder: index + 1,
          })),
          pricingMatrix: catalog.pricingMatrix,
          pricingSettings: catalog.pricingSettings,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.errors?.join(" ") || data.message || "Could not save catalog.",
        );
      }

      setCatalog(data.catalog);
      setCatalogMessage("Vehicles and pricing saved.");
    } catch (error) {
      setCatalogMessage(error.message || "Could not save catalog.");
    } finally {
      setSavingCatalog(false);
    }
  }

  async function changeBookingStatus(bookingId, status) {
    setBookingMessage("");

    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          id: bookingId,
          status,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not update booking status.");
      }

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId ? data.booking : booking,
        ),
      );
      setBookingMessage(`Booking ${data.booking.reference} updated to ${status}.`);
    } catch (error) {
      setBookingMessage(error.message || "Could not update booking status.");
    }
  }

  if (!adminKey) {
    return (
      <div className="min-h-screen px-6 py-12 text-white">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Admin access
          </p>
          <h1 className="mt-4 font-display text-5xl text-white">
            Booking dashboard
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/66">
            Enter the admin key from your Vercel environment variables to manage
            bookings, vehicles, and fees.
          </p>

          <form onSubmit={unlockDashboard} className="mt-8 grid gap-4">
            <input
              type="password"
              value={keyInput}
              onChange={(event) => setKeyInput(event.target.value)}
              placeholder="Enter BOOKINGS_ADMIN_KEY"
              className="w-full rounded-[1.15rem] border border-white/10 bg-white/6 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[var(--accent)]"
            />
            <button
              type="submit"
              className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-[#16110a]"
            >
              Open dashboard
            </button>
          </form>

          {loadError ? (
            <p className="mt-4 text-sm text-amber-200">{loadError}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
              Admin dashboard
            </p>
            <h1 className="mt-3 font-display text-5xl text-white">
              Bookings, vehicles, and fees
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadDashboard()}
              className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/6"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={lockDashboard}
              className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/6"
            >
              Lock
            </button>
          </div>
        </div>

        {loading && !catalog ? (
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-white/70">
            Loading dashboard...
          </div>
        ) : null}

        {loadError ? (
          <div className="mb-6 rounded-[1.5rem] border border-amber-200/30 bg-amber-200/10 px-4 py-3 text-sm text-amber-100">
            {loadError}
          </div>
        ) : null}

        {catalog ? (
          <div className="grid gap-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
                    Bookings
                  </p>
                  <h2 className="mt-2 font-display text-4xl text-white">
                    Recent bookings
                  </h2>
                </div>
                {bookingMessage ? (
                  <p className="text-sm text-[var(--accent-strong)]">
                    {bookingMessage}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4">
                {bookings.map((booking) => (
                  <article
                    key={booking.id}
                    className="rounded-[1.5rem] border border-white/8 bg-black/15 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="grid gap-2">
                        <p className="text-sm font-semibold text-white">
                          {booking.reference}
                        </p>
                        <p className="text-sm text-white/72">
                          {booking.fullName} · {booking.email} · {booking.phone}
                        </p>
                        <p className="text-sm text-white/62">
                          {booking.serviceTitle} in {booking.vehicle}
                        </p>
                        <p className="text-sm text-white/62">
                          {booking.pickup} to {booking.dropoff}
                        </p>
                        <p className="text-sm text-white/62">
                          {booking.when} · {formatCurrency(booking.estimatedTotal)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={booking.status}
                          onChange={(event) =>
                            changeBookingStatus(booking.id, event.target.value)
                          }
                          className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white"
                        >
                          {bookingStatuses.map((status) => (
                            <option key={status} value={status} className="bg-[#101319]">
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </article>
                ))}

                {bookings.length === 0 ? (
                  <p className="text-sm text-white/60">No bookings yet.</p>
                ) : null}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
                    Fleet
                  </p>
                  <h2 className="mt-2 font-display text-4xl text-white">
                    Available cars
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={addVehicle}
                  className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/6"
                >
                  Add vehicle
                </button>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {catalog.vehicles.map((vehicle, index) => (
                  <article
                    key={vehicle.slug}
                    className="rounded-[1.5rem] border border-white/8 bg-black/15 p-5"
                  >
                    <div className="grid gap-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">
                            Name
                          </span>
                          <input
                            type="text"
                            value={vehicle.name}
                            onChange={(event) =>
                              updateVehicle(index, "name", event.target.value)
                            }
                            className="w-full rounded-[1rem] border border-white/10 bg-white/6 px-4 py-3 text-sm text-white"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">
                            Capacity
                          </span>
                          <input
                            type="number"
                            min="1"
                            value={vehicle.capacity}
                            onChange={(event) =>
                              updateVehicle(index, "capacity", event.target.value)
                            }
                            className="w-full rounded-[1rem] border border-white/10 bg-white/6 px-4 py-3 text-sm text-white"
                          />
                        </label>
                      </div>

                      <label className="block">
                        <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">
                          Description
                        </span>
                        <textarea
                          rows={3}
                          value={vehicle.description}
                          onChange={(event) =>
                            updateVehicle(index, "description", event.target.value)
                          }
                          className="w-full rounded-[1rem] border border-white/10 bg-white/6 px-4 py-3 text-sm text-white"
                        />
                      </label>

                      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
                        <label className="block">
                          <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">
                            Mood tag
                          </span>
                          <input
                            type="text"
                            value={vehicle.mood}
                            onChange={(event) =>
                              updateVehicle(index, "mood", event.target.value)
                            }
                            className="w-full rounded-[1rem] border border-white/10 bg-white/6 px-4 py-3 text-sm text-white"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">
                            Accent class
                          </span>
                          <input
                            type="text"
                            value={vehicle.accent}
                            onChange={(event) =>
                              updateVehicle(index, "accent", event.target.value)
                            }
                            className="w-full rounded-[1rem] border border-white/10 bg-white/6 px-4 py-3 text-sm text-white"
                          />
                        </label>

                        <label className="mt-7 inline-flex items-center gap-2 text-sm text-white/70">
                          <input
                            type="checkbox"
                            checked={vehicle.active}
                            onChange={(event) =>
                              updateVehicle(index, "active", event.target.checked)
                            }
                          />
                          Active
                        </label>
                      </div>

                      <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                        Slug: {vehicle.slug}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
                  Pricing
                </p>
                <h2 className="mt-2 font-display text-4xl text-white">
                  Base rates and fees
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
                  <thead>
                    <tr className="text-white/45">
                      <th className="pr-4">Service</th>
                      {catalog.vehicles.map((vehicle) => (
                        <th key={vehicle.slug} className="pr-4">
                          {vehicle.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service) => (
                      <tr key={service.id}>
                        <td className="pr-4 text-white">{service.title}</td>
                        {catalog.vehicles.map((vehicle) => (
                          <td key={vehicle.slug} className="pr-4">
                            <input
                              type="number"
                              min="0"
                              value={catalog.pricingMatrix?.[service.id]?.[vehicle.slug] ?? 0}
                              onChange={(event) =>
                                updatePricing(
                                  service.id,
                                  vehicle.slug,
                                  event.target.value,
                                )
                              }
                              className="w-28 rounded-[0.9rem] border border-white/10 bg-white/6 px-3 py-2 text-sm text-white"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["afterHoursFee", "After-hours fee"],
                  ["weekendFee", "Weekend fee"],
                  ["specialRequestFee", "Special request fee"],
                  ["extraPassengerFee", "Extra passenger fee"],
                  ["afterHoursStartHour", "After-hours start"],
                  ["afterHoursEndHour", "After-hours end"],
                ].map(([settingKey, label]) => (
                  <label key={settingKey} className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">
                      {label}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={catalog.pricingSettings?.[settingKey] ?? 0}
                      onChange={(event) =>
                        updatePricingSetting(settingKey, event.target.value)
                      }
                      className="w-full rounded-[1rem] border border-white/10 bg-white/6 px-4 py-3 text-sm text-white"
                    />
                  </label>
                ))}

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">
                    Gratuity rate
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={catalog.pricingSettings?.gratuityRate ?? 0}
                    onChange={(event) =>
                      updatePricingSetting("gratuityRate", event.target.value)
                    }
                    className="w-full rounded-[1rem] border border-white/10 bg-white/6 px-4 py-3 text-sm text-white"
                  />
                </label>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {catalogMessage ? (
                  <p className="text-sm text-[var(--accent-strong)]">
                    {catalogMessage}
                  </p>
                ) : (
                  <p className="text-sm text-white/50">
                    Changes here update the public booking page and all new pricing
                    estimates.
                  </p>
                )}

                <button
                  type="button"
                  onClick={saveCatalog}
                  disabled={savingCatalog}
                  className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-[#16110a] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingCatalog ? "Saving..." : "Save vehicles and fees"}
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
