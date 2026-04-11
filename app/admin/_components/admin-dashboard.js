"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useState } from "react";

import { formatCurrency } from "@/lib/booking";
import {
  defaultPricingSettings,
  services as catalogServices,
  slugifyVehicleName,
} from "@/lib/catalog-shared";
import { getDefaultSiteContent } from "@/lib/site-content-shared";

const storageKey = "anytime-anywhere-admin-key";
const bookingStatuses = ["pending", "confirmed", "completed", "cancelled"];
const vehicleImageLimit = 5;
const sidebarSections = [
  ["overview", "Overview"],
  ["bookings", "Bookings"],
  ["brand-hero", "Brand & Hero"],
  ["homepage-flow", "Homepage Flow"],
  ["services-reviews", "Services & Reviews"],
  ["contact-footer", "Contact & Footer"],
  ["fleet-pricing", "Fleet & Pricing"],
];

const panelClassName =
  "rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl";
const inputClassName =
  "w-full rounded-[1rem] border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[var(--accent)] focus:bg-white/7";
const textareaClassName = `${inputClassName} min-h-[120px] resize-y`;
const buttonClassName =
  "rounded-full border border-white/12 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[var(--accent)] hover:bg-white/6";
const primaryButtonClassName =
  "rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-[#16110a] transition hover:bg-[var(--accent-dark)]";

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

function normalizeCurrencyInput(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : fallback;
}

function normalizeIntegerInput(value, fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(number)));
}

function normalizeDecimalInput(value, fallback = 0, min = 0, max = 1) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, number));
}

function createEmptyVehicle(index = 0) {
  return {
    slug: `vehicle-${Date.now()}-${index}`,
    name: "",
    capacity: 2,
    description: "",
    mood: "",
    accent: "from-white/10 via-transparent to-transparent",
    imageUrls: [],
    active: true,
    displayOrder: index + 1,
  };
}

function createEmptyHeroStat(index = 0) {
  return {
    value: `0${index + 1}`,
    text: "",
  };
}

function createEmptyHowItWorksStep(index = 0) {
  return {
    step: `Step ${String(index + 1).padStart(2, "0")}`,
    title: "",
    text: "",
  };
}

function createEmptyTestimonial(index = 0) {
  return {
    name: `Client ${index + 1}`,
    role: "Client",
    quote: "",
  };
}

function statusTone(status) {
  switch (status) {
    case "confirmed":
      return "border-emerald-300/30 bg-emerald-400/10 text-emerald-100";
    case "completed":
      return "border-sky-300/30 bg-sky-400/10 text-sky-100";
    case "cancelled":
      return "border-rose-300/30 bg-rose-400/10 text-rose-100";
    default:
      return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }
}

function formatStatus(status) {
  const value = String(status ?? "").trim();
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "Pending";
}

function Section({ id, label, title, description, actions, children }) {
  return (
    <section id={`admin-${id}`} className={`${panelClassName} scroll-mt-28 p-6 md:p-8`}>
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">
            {label}
          </p>
          <h2 className="mt-3 font-display text-[2.25rem] leading-none text-white md:text-[3rem]">
            {title}
          </h2>
          {description ? (
            <p className="mt-3 max-w-[760px] text-sm leading-7 text-white/64">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function TextField({ label, value, onChange, className = "", type = "text" }) {
  return (
    <label className={classNames("block", className)}>
      <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">
        {label}
      </span>
      <input type={type} value={value} onChange={onChange} className={inputClassName} />
    </label>
  );
}

function TextAreaField({ label, value, onChange, rows = 4, className = "" }) {
  return (
    <label className={classNames("block", className)}>
      <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">
        {label}
      </span>
      <textarea rows={rows} value={value} onChange={onChange} className={textareaClassName} />
    </label>
  );
}

function MetricCard({ label, value, text }) {
  return (
    <article className="rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-white/40">{label}</p>
      <p className="mt-3 font-display text-4xl leading-none text-white">{value}</p>
      <p className="mt-3 text-sm leading-7 text-white/62">{text}</p>
    </article>
  );
}

export default function AdminDashboard() {
  const [keyInput, setKeyInput] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [catalog, setCatalog] = useState(null);
  const [siteContent, setSiteContent] = useState(getDefaultSiteContent);
  const [savingCatalog, setSavingCatalog] = useState(false);
  const [savingSiteContent, setSavingSiteContent] = useState(false);
  const [catalogMessage, setCatalogMessage] = useState("");
  const [siteMessage, setSiteMessage] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [uploadingVehicleSlugs, setUploadingVehicleSlugs] = useState([]);

  useEffect(() => {
    const savedKey = window.localStorage.getItem(storageKey);

    if (savedKey) {
      setAdminKey(savedKey);
      setKeyInput(savedKey);
    }
  }, []);

  const loadDashboard = useCallback(
    async (key = adminKey) => {
      if (!key) {
        return;
      }

      setLoading(true);
      setLoadError("");

      try {
        const [catalogResponse, siteContentResponse, bookingsResponse] = await Promise.all([
          fetch("/api/admin/catalog", {
            headers: { "x-admin-key": key },
            cache: "no-store",
          }),
          fetch("/api/admin/site-content", {
            headers: { "x-admin-key": key },
            cache: "no-store",
          }),
          fetch("/api/bookings", {
            headers: { "x-admin-key": key },
            cache: "no-store",
          }),
        ]);

        const [catalogData, siteContentData, bookingsData] = await Promise.all([
          catalogResponse.json().catch(() => ({})),
          siteContentResponse.json().catch(() => ({})),
          bookingsResponse.json().catch(() => ({})),
        ]);

        if (!catalogResponse.ok || !siteContentResponse.ok || !bookingsResponse.ok) {
          throw new Error(
            catalogData.message ||
              siteContentData.message ||
              bookingsData.message ||
              "Could not load the CMS dashboard.",
          );
        }

        setCatalog(catalogData.catalog);
        setSiteContent(siteContentData.siteContent ?? getDefaultSiteContent());
        setBookings(bookingsData.bookings ?? []);
      } catch (error) {
        setLoadError(error.message || "Could not load the CMS dashboard.");
      } finally {
        setLoading(false);
      }
    },
    [adminKey],
  );

  useEffect(() => {
    if (adminKey) {
      void loadDashboard(adminKey);
    }
  }, [adminKey, loadDashboard]);

  function mutateSiteContent(recipe) {
    setSiteContent((current) => {
      const next = structuredClone(current ?? getDefaultSiteContent());
      recipe(next);
      return next;
    });
    setSiteMessage("");
  }

  function mutateCatalog(recipe) {
    setCatalog((current) => {
      if (!current) {
        return current;
      }

      const next = structuredClone(current);
      recipe(next);
      return next;
    });
    setCatalogMessage("");
  }

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
    setSiteContent(getDefaultSiteContent());
    setBookings([]);
    setLoadError("");
    setCatalogMessage("");
    setSiteMessage("");
    setBookingMessage("");
    setActiveSection("overview");
  }

  function jumpTo(sectionId) {
    setActiveSection(sectionId);
    document.getElementById(`admin-${sectionId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function updateSiteSection(section, field, value) {
    mutateSiteContent((next) => {
      next[section][field] = value;
    });
  }

  function updateService(index, field, value) {
    mutateSiteContent((next) => {
      next.services[index][field] = value;
    });
  }

  function updateHeroStat(index, field, value) {
    mutateSiteContent((next) => {
      next.heroStats[index][field] = value;
    });
  }

  function updateProofChip(index, value) {
    mutateSiteContent((next) => {
      next.proof.chips[index] = value;
    });
  }

  function updateHowItWorksField(field, value) {
    mutateSiteContent((next) => {
      next.howItWorks[field] = value;
    });
  }

  function updateHowItWorksStep(index, field, value) {
    mutateSiteContent((next) => {
      next.howItWorks.steps[index][field] = value;
    });
  }

  function updateTestimonial(index, field, value) {
    mutateSiteContent((next) => {
      next.testimonials[index][field] = value;
    });
  }

  function updateVehicle(index, field, value) {
    mutateCatalog((next) => {
      const vehicle = next.vehicles[index];
      const previousSlug = vehicle.slug;
      const shouldRefreshSlug =
        field === "name" && String(vehicle.slug ?? "").startsWith("vehicle-");

      if (field === "capacity") {
        vehicle.capacity = normalizeIntegerInput(value, vehicle.capacity, 1, 30);
      } else if (field === "active") {
        vehicle.active = Boolean(value);
      } else {
        vehicle[field] = value;
      }

      if (shouldRefreshSlug) {
        const nextSlug = slugifyVehicleName(value) || previousSlug;

        if (nextSlug !== previousSlug) {
          vehicle.slug = nextSlug;

          for (const service of catalogServices) {
            next.pricingMatrix[service.id][nextSlug] =
              next.pricingMatrix[service.id][previousSlug] ?? 0;
            delete next.pricingMatrix[service.id][previousSlug];
          }
        }
      }
    });
  }

  function addVehicle() {
    mutateCatalog((next) => {
      const vehicle = createEmptyVehicle(next.vehicles.length);
      next.vehicles.push(vehicle);

      for (const service of catalogServices) {
        next.pricingMatrix[service.id][vehicle.slug] = 0;
      }
    });
  }

  function removeVehicle(index) {
    if (!catalog || catalog.vehicles.length <= 1) {
      setCatalogMessage("Keep at least one vehicle in the live catalog.");
      return;
    }

    mutateCatalog((next) => {
      const [vehicle] = next.vehicles.splice(index, 1);

      if (!vehicle) {
        return;
      }

      for (const service of catalogServices) {
        delete next.pricingMatrix[service.id][vehicle.slug];
      }
    });
  }

  function moveVehicle(index, direction) {
    mutateCatalog((next) => {
      const target = index + direction;

      if (target < 0 || target >= next.vehicles.length) {
        return;
      }

      const [vehicle] = next.vehicles.splice(index, 1);
      next.vehicles.splice(target, 0, vehicle);
    });
  }

  function updatePricing(serviceId, vehicleSlug, value) {
    mutateCatalog((next) => {
      next.pricingMatrix[serviceId][vehicleSlug] = normalizeCurrencyInput(
        value,
        next.pricingMatrix[serviceId][vehicleSlug] ?? 0,
      );
    });
  }

  function updatePricingSetting(key, value) {
    mutateCatalog((next) => {
      if (key === "gratuityRate") {
        next.pricingSettings[key] = normalizeDecimalInput(
          value,
          defaultPricingSettings.gratuityRate,
        );
        return;
      }

      const fallback = defaultPricingSettings[key];
      const max = key.includes("Hour") ? 23 : Number.MAX_SAFE_INTEGER;
      next.pricingSettings[key] = normalizeIntegerInput(value, fallback, 0, max);
    });
  }

  function appendVehicleImages(index, imageUrls) {
    mutateCatalog((next) => {
      next.vehicles[index].imageUrls = [
        ...(next.vehicles[index].imageUrls ?? []),
        ...imageUrls,
      ].slice(0, vehicleImageLimit);
    });
  }

  function removeVehicleImage(index, imageUrl) {
    mutateCatalog((next) => {
      next.vehicles[index].imageUrls = (next.vehicles[index].imageUrls ?? []).filter(
        (value) => value !== imageUrl,
      );
    });
  }

  async function handleVehicleImageUpload(index, fileList) {
    const files = Array.from(fileList ?? []);
    const vehicle = catalog?.vehicles?.[index];

    if (!vehicle || files.length === 0) {
      return;
    }

    const remainingSlots = vehicleImageLimit - (vehicle.imageUrls?.length ?? 0);

    if (remainingSlots <= 0) {
      setCatalogMessage("Each vehicle can only have up to 5 images.");
      return;
    }

    setUploadingVehicleSlugs((current) =>
      current.includes(vehicle.slug) ? current : [...current, vehicle.slug],
    );

    try {
      const formData = new FormData();

      formData.append("vehicleSlug", vehicle.slug);

      files.slice(0, remainingSlots).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/admin/vehicle-images", {
        method: "POST",
        headers: { "x-admin-key": adminKey },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Could not upload vehicle photos right now.",
        );
      }

      const uploadedImages = Array.isArray(data.uploads)
        ? data.uploads.map((uploadEntry) => uploadEntry?.url).filter(Boolean)
        : [];

      if (!uploadedImages.length) {
        throw new Error("The upload finished without returning any image URLs.");
      }

      appendVehicleImages(index, uploadedImages);
      setCatalogMessage("Vehicle photos uploaded. Save the fleet section to publish them.");
    } catch (error) {
      setCatalogMessage(error.message || "Could not upload vehicle photos.");
    } finally {
      setUploadingVehicleSlugs((current) =>
        current.filter((slug) => slug !== vehicle.slug),
      );
    }
  }

  async function saveSiteContent() {
    setSavingSiteContent(true);
    setSiteMessage("");

    try {
      const response = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify(siteContent),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not save the CMS content.");
      }

      setSiteContent(data.siteContent ?? getDefaultSiteContent());
      await loadDashboard(adminKey);
      setSiteMessage("Homepage content saved.");
    } catch (error) {
      setSiteMessage(error.message || "Could not save the CMS content.");
    } finally {
      setSavingSiteContent(false);
    }
  }

  async function saveCatalog() {
    if (!catalog) {
      return;
    }

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
        throw new Error(data.errors?.join(" ") || data.message || "Could not save the catalog.");
      }

      setCatalog(data.catalog);
      await loadDashboard(adminKey);
      setCatalogMessage("Fleet and pricing saved.");
    } catch (error) {
      setCatalogMessage(error.message || "Could not save the catalog.");
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
        body: JSON.stringify({ id: bookingId, status }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not update booking status.");
      }

      setBookings((current) =>
        current.map((booking) => (booking.id === bookingId ? data.booking : booking)),
      );
      setBookingMessage(`Booking ${data.booking.reference} updated to ${status}.`);
    } catch (error) {
      setBookingMessage(error.message || "Could not update booking status.");
    }
  }

  if (!adminKey) {
    return (
      <div className="min-h-screen px-5 py-12 text-white md:px-8">
        <div className={`mx-auto max-w-xl p-8 md:p-10 ${panelClassName}`}>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">CMS access</p>
          <h1 className="mt-4 font-display text-[3rem] leading-none text-white">
            Admin dashboard
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/66">
            Enter your admin key to manage bookings, homepage content, vehicles,
            pricing, and vehicle photos from one place.
          </p>
          <form onSubmit={unlockDashboard} className="mt-8 grid gap-4">
            <input
              type="password"
              value={keyInput}
              onChange={(event) => setKeyInput(event.target.value)}
              placeholder="Enter BOOKINGS_ADMIN_KEY"
              className={inputClassName}
            />
            <button type="submit" className={primaryButtonClassName}>
              Open dashboard
            </button>
          </form>
          {loadError ? (
            <p className="mt-4 rounded-[1rem] border border-amber-200/25 bg-amber-200/10 px-4 py-3 text-sm text-amber-100">
              {loadError}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  const activeVehicles = catalog?.vehicles?.filter((vehicle) => vehicle.active).length ?? 0;
  const pendingBookings = bookings.filter((booking) => booking.status === "pending").length;
  const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed").length;
  const bookingValue = bookings.reduce(
    (total, booking) => total + Number(booking.estimatedTotal ?? 0),
    0,
  );
  const lowestStartingRate =
    catalog?.vehicles?.length && catalog?.pricingMatrix
      ? Math.min(
          ...catalogServices.flatMap((service) =>
            catalog.vehicles.map(
              (vehicle) => catalog.pricingMatrix?.[service.id]?.[vehicle.slug] ?? 0,
            ),
          ),
        )
      : 0;

  return (
    <div className="min-h-screen px-4 py-6 text-white md:px-6 xl:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
              Full CMS dashboard
            </p>
            <h1 className="mt-3 font-display text-[2.8rem] leading-none text-white md:text-[4rem]">
              Manage the whole booking site
            </h1>
            <p className="mt-3 max-w-[800px] text-sm leading-7 text-white/66">
              Update the live homepage copy, manage bookings, change vehicles and
              pricing, and keep the public site current without touching code.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a href="/" target="_blank" rel="noreferrer" className={buttonClassName}>
              Open live site
            </a>
            <button type="button" onClick={() => loadDashboard()} className={buttonClassName}>
              Refresh
            </button>
            <button type="button" onClick={lockDashboard} className={buttonClassName}>
              Lock
            </button>
          </div>
        </div>

        {loading && !catalog ? (
          <div className={`${panelClassName} mb-6 px-6 py-5 text-white/68`}>
            Loading dashboard...
          </div>
        ) : null}

        {loadError ? (
          <div className="mb-6 rounded-[1.25rem] border border-amber-200/25 bg-amber-200/10 px-4 py-3 text-sm text-amber-100">
            {loadError}
          </div>
        ) : null}

        {catalog ? (
          <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className={`${panelClassName} h-fit p-5 xl:sticky xl:top-24`}>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
                Navigation
              </p>
              <nav className="mt-5 grid gap-2">
                {sidebarSections.map(([id, label]) => {
                  const isActive = activeSection === id;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => jumpTo(id)}
                      aria-current={isActive ? "page" : undefined}
                      className={classNames(
                        "group relative overflow-hidden rounded-[1.1rem] border px-4 py-3 text-left text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50",
                        isActive
                          ? "translate-x-1 border-[rgba(210,176,107,0.42)] bg-[rgba(210,176,107,0.14)] text-white shadow-[0_18px_36px_rgba(210,176,107,0.12)]"
                          : "border-white/8 bg-black/15 text-white/68 hover:translate-x-1 hover:border-white/14 hover:bg-white/6 hover:text-white hover:shadow-[0_16px_32px_rgba(0,0,0,0.18)]",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={classNames(
                          "absolute inset-y-2 left-2 w-1.5 rounded-full bg-[var(--accent)] transition-all duration-300 ease-out",
                          isActive
                            ? "opacity-100 scale-y-100"
                            : "opacity-0 scale-y-50 group-hover:opacity-70 group-hover:scale-y-75",
                        )}
                      />
                      <span
                        aria-hidden="true"
                        className={classNames(
                          "absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(210,176,107,0.18),transparent_58%)] transition-opacity duration-300 ease-out",
                          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                        )}
                      />
                      <span
                        className={classNames(
                          "relative flex items-center justify-between gap-3 pl-3 transition-transform duration-300 ease-out",
                          isActive ? "translate-x-1" : "group-hover:translate-x-1",
                        )}
                      >
                        <span>{label}</span>
                        <span
                          aria-hidden="true"
                          className={classNames(
                            "h-2.5 w-2.5 rounded-full border border-white/20 bg-white/12 transition-all duration-300 ease-out",
                            isActive
                              ? "scale-100 border-[var(--accent)] bg-[var(--accent)] shadow-[0_0_18px_rgba(210,176,107,0.65)]"
                              : "scale-75 opacity-45 group-hover:scale-90 group-hover:opacity-100",
                          )}
                        />
                      </span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={saveSiteContent}
                  disabled={savingSiteContent}
                  className={primaryButtonClassName}
                >
                  {savingSiteContent ? "Saving content..." : "Save site content"}
                </button>
                <button
                  type="button"
                  onClick={saveCatalog}
                  disabled={savingCatalog}
                  className={buttonClassName}
                >
                  {savingCatalog ? "Saving fleet..." : "Save fleet & pricing"}
                </button>
              </div>

              {siteMessage ? <p className="mt-4 text-sm text-[var(--accent-strong)]">{siteMessage}</p> : null}
              {catalogMessage ? <p className="mt-2 text-sm text-[var(--accent-strong)]">{catalogMessage}</p> : null}
              {bookingMessage ? <p className="mt-2 text-sm text-[var(--accent-strong)]">{bookingMessage}</p> : null}

              <div className="mt-6 rounded-[1.3rem] border border-white/8 bg-black/15 p-4 text-sm text-white/66">
                <p>{bookings.length} saved bookings</p>
                <p className="mt-2">{activeVehicles} active vehicles</p>
                <p className="mt-2">{siteContent.testimonials.length} testimonials live</p>
                <p className="mt-2">{siteContent.proof.chips.length} proof chips showing</p>
              </div>
            </aside>

            <div className="grid gap-6">
              <Section
                id="overview"
                label="Overview"
                title="Operational snapshot"
                description="A quick read on what is live right now so you can move straight to the right section."
              >
                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                  <MetricCard label="Pending bookings" value={pendingBookings} text="Requests still waiting for follow-up or confirmation." />
                  <MetricCard label="Confirmed rides" value={confirmedBookings} text="Bookings already moved into a more final state." />
                  <MetricCard label="Active vehicles" value={activeVehicles} text="Vehicles customers can currently choose on the public site." />
                  <MetricCard label="Quoted value" value={formatCurrency(bookingValue)} text="Total estimated booking value across the saved list." />
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.7rem] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/66">
                    The CMS sections below control brand copy, hero content, proof,
                    how-it-works steps, service descriptions, testimonials, contact
                    details, the footer, the vehicle lineup, photo galleries, and
                    the live pricing matrix.
                  </div>
                  <div className="rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                      Pricing baseline
                    </p>
                    <p className="mt-4 font-display text-4xl leading-none text-white">
                      from {formatCurrency(lowestStartingRate)}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-white/66">
                      Lowest starting rate across the live pricing matrix.
                    </p>
                  </div>
                </div>
              </Section>

              <Section
                id="bookings"
                label="Bookings"
                title="Recent booking requests"
                description="Each saved booking is here with live status controls for your workflow."
              >
                <div className="grid gap-4">
                  {bookings.map((booking) => (
                    <article key={booking.id} className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="grid gap-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="text-base font-semibold text-white">{booking.reference}</p>
                            <span className={classNames("rounded-full border px-3 py-1 text-[0.7rem] uppercase tracking-[0.24em]", statusTone(booking.status))}>
                              {formatStatus(booking.status)}
                            </span>
                          </div>
                          <p className="text-sm text-white/72">
                            {booking.fullName} | {booking.email} | {booking.phone}
                          </p>
                          <p className="text-sm text-white/62">
                            {booking.serviceTitle} in {booking.vehicle}
                          </p>
                          <p className="text-sm text-white/62">
                            {booking.pickup} to {booking.dropoff}
                          </p>
                          <p className="text-sm text-white/62">
                            {booking.when} | {formatCurrency(booking.estimatedTotal)}
                          </p>
                          {booking.requests ? (
                            <p className="text-sm text-white/52">Notes: {booking.requests}</p>
                          ) : null}
                        </div>

                        <select
                          value={booking.status}
                          onChange={(event) => changeBookingStatus(booking.id, event.target.value)}
                          className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white outline-none"
                        >
                          {bookingStatuses.map((status) => (
                            <option key={status} value={status} className="bg-[#101319]">
                              {formatStatus(status)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </article>
                  ))}
                  {bookings.length === 0 ? (
                    <p className="text-sm text-white/60">No bookings have been saved yet.</p>
                  ) : null}
                </div>
              </Section>

              <Section id="brand-hero" label="Homepage CMS" title="Brand, navigation, and hero">
                <div className="grid gap-6">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <TextField label="Brand name" value={siteContent.brand.name} onChange={(event) => updateSiteSection("brand", "name", event.target.value)} />
                    <TextField label="Brand subtitle" value={siteContent.brand.subtitle} onChange={(event) => updateSiteSection("brand", "subtitle", event.target.value)} />
                  </div>

                  <div className="grid gap-4 rounded-[1.6rem] border border-white/8 bg-black/20 p-5 md:grid-cols-2 xl:grid-cols-3">
                    {[
                      ["howItWorks", "How it works"],
                      ["services", "Services"],
                      ["fleet", "Fleet"],
                      ["reviews", "Reviews"],
                      ["contact", "Contact"],
                      ["reserve", "Reserve button"],
                    ].map(([field, label]) => (
                      <TextField
                        key={field}
                        label={label}
                        value={siteContent.navigation[field]}
                        onChange={(event) => updateSiteSection("navigation", field, event.target.value)}
                      />
                    ))}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <TextAreaField label="Hero title" rows={3} className="lg:col-span-2" value={siteContent.hero.title} onChange={(event) => updateSiteSection("hero", "title", event.target.value)} />
                    <TextField label="Hero eyebrow" value={siteContent.hero.eyebrow} onChange={(event) => updateSiteSection("hero", "eyebrow", event.target.value)} />
                    <TextField label="Hero kicker" value={siteContent.hero.kicker} onChange={(event) => updateSiteSection("hero", "kicker", event.target.value)} />
                    <TextAreaField label="Hero description" rows={4} className="lg:col-span-2" value={siteContent.hero.description} onChange={(event) => updateSiteSection("hero", "description", event.target.value)} />
                    <TextField label="Primary CTA label" value={siteContent.hero.primaryButtonLabel} onChange={(event) => updateSiteSection("hero", "primaryButtonLabel", event.target.value)} />
                    <TextField label="Secondary CTA label" value={siteContent.hero.secondaryButtonLabel} onChange={(event) => updateSiteSection("hero", "secondaryButtonLabel", event.target.value)} />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <TextField label="Booking panel eyebrow" value={siteContent.hero.bookingEyebrow} onChange={(event) => updateSiteSection("hero", "bookingEyebrow", event.target.value)} />
                    <TextField label="Booking panel title" value={siteContent.hero.bookingTitle} onChange={(event) => updateSiteSection("hero", "bookingTitle", event.target.value)} />
                    <TextAreaField label="Booking panel description" rows={3} className="lg:col-span-2" value={siteContent.hero.bookingDescription} onChange={(event) => updateSiteSection("hero", "bookingDescription", event.target.value)} />
                    <TextField label="Booking panel pill" value={siteContent.hero.bookingPill} onChange={(event) => updateSiteSection("hero", "bookingPill", event.target.value)} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextField label="Floating call label" value={siteContent.floatingActions.callLabel} onChange={(event) => updateSiteSection("floatingActions", "callLabel", event.target.value)} />
                      <TextField label="Floating book label" value={siteContent.floatingActions.bookLabel} onChange={(event) => updateSiteSection("floatingActions", "bookLabel", event.target.value)} />
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-white/60">Hero stats under the headline</p>
                      <button type="button" onClick={() => mutateSiteContent((next) => { if (next.heroStats.length < 6) next.heroStats.push(createEmptyHeroStat(next.heroStats.length)); })} className={buttonClassName}>Add stat</button>
                    </div>
                    <div className="mt-5 grid gap-4 xl:grid-cols-2">
                      {siteContent.heroStats.map((item, index) => (
                        <div key={`hero-stat-${index}`} className="rounded-[1.2rem] border border-white/8 bg-white/4 p-4">
                          <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)_auto]">
                            <TextField label="Value" value={item.value} onChange={(event) => updateHeroStat(index, "value", event.target.value)} />
                            <TextAreaField label="Supporting text" rows={3} value={item.text} onChange={(event) => updateHeroStat(index, "text", event.target.value)} />
                            <div className="pt-8"><button type="button" onClick={() => mutateSiteContent((next) => { if (next.heroStats.length > 1) next.heroStats.splice(index, 1); })} className={buttonClassName}>Remove</button></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>

              <Section id="homepage-flow" label="Homepage CMS" title="Proof bar and how-it-works">
                <div className="grid gap-6">
                  <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
                    <TextAreaField label="Proof text" rows={4} value={siteContent.proof.text} onChange={(event) => updateSiteSection("proof", "text", event.target.value)} />
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-white/60">Proof chips</p>
                      <button type="button" onClick={() => mutateSiteContent((next) => { if (next.proof.chips.length < 8) next.proof.chips.push(""); })} className={buttonClassName}>Add chip</button>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {siteContent.proof.chips.map((chip, index) => (
                        <div key={`proof-${index}`} className="flex items-center gap-3 rounded-[1rem] border border-white/8 bg-white/4 p-3">
                          <input value={chip} onChange={(event) => updateProofChip(index, event.target.value)} className={inputClassName} />
                          <button type="button" onClick={() => mutateSiteContent((next) => { if (next.proof.chips.length > 1) next.proof.chips.splice(index, 1); })} className="text-sm font-semibold text-amber-100">Remove</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <TextField label="Section label" value={siteContent.howItWorks.label} onChange={(event) => updateHowItWorksField("label", event.target.value)} />
                      <TextAreaField label="Section title" rows={3} className="lg:col-span-2" value={siteContent.howItWorks.title} onChange={(event) => updateHowItWorksField("title", event.target.value)} />
                      <TextAreaField label="Section description" rows={4} className="lg:col-span-2" value={siteContent.howItWorks.description} onChange={(event) => updateHowItWorksField("description", event.target.value)} />
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-white/60">How-it-works steps</p>
                      <button type="button" onClick={() => mutateSiteContent((next) => { if (next.howItWorks.steps.length < 8) next.howItWorks.steps.push(createEmptyHowItWorksStep(next.howItWorks.steps.length)); })} className={buttonClassName}>Add step</button>
                    </div>
                    <div className="mt-4 grid gap-4">
                      {siteContent.howItWorks.steps.map((item, index) => (
                        <div key={`step-${index}`} className="rounded-[1.2rem] border border-white/8 bg-white/4 p-4">
                          <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)_auto]">
                            <div className="grid gap-4">
                              <TextField label="Step label" value={item.step} onChange={(event) => updateHowItWorksStep(index, "step", event.target.value)} />
                              <TextField label="Step title" value={item.title} onChange={(event) => updateHowItWorksStep(index, "title", event.target.value)} />
                            </div>
                            <TextAreaField label="Step description" rows={4} value={item.text} onChange={(event) => updateHowItWorksStep(index, "text", event.target.value)} />
                            <div className="pt-8"><button type="button" onClick={() => mutateSiteContent((next) => { if (next.howItWorks.steps.length > 1) next.howItWorks.steps.splice(index, 1); })} className={buttonClassName}>Remove</button></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>

              <Section id="services-reviews" label="Homepage CMS" title="Services and reviews">
                <div className="grid gap-6">
                  <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <TextField label="Services section label" value={siteContent.servicesSection.label} onChange={(event) => updateSiteSection("servicesSection", "label", event.target.value)} />
                      <TextAreaField label="Services section title" rows={3} className="lg:col-span-2" value={siteContent.servicesSection.title} onChange={(event) => updateSiteSection("servicesSection", "title", event.target.value)} />
                      <TextAreaField label="Services section description" rows={4} className="lg:col-span-2" value={siteContent.servicesSection.description} onChange={(event) => updateSiteSection("servicesSection", "description", event.target.value)} />
                    </div>
                    <div className="mt-5 grid gap-4 xl:grid-cols-3">
                      {siteContent.services.map((service, index) => (
                        <div key={service.id} className="rounded-[1.2rem] border border-white/8 bg-white/4 p-4">
                          <TextField label="Eyebrow" value={service.eyebrow} onChange={(event) => updateService(index, "eyebrow", event.target.value)} />
                          <div className="mt-4"><TextField label="Title" value={service.title} onChange={(event) => updateService(index, "title", event.target.value)} /></div>
                          <div className="mt-4"><TextAreaField label="Description" rows={5} value={service.text} onChange={(event) => updateService(index, "text", event.target.value)} /></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <TextField label="Reviews section label" value={siteContent.reviewsSection.label} onChange={(event) => updateSiteSection("reviewsSection", "label", event.target.value)} />
                      <TextAreaField label="Reviews section title" rows={3} className="lg:col-span-2" value={siteContent.reviewsSection.title} onChange={(event) => updateSiteSection("reviewsSection", "title", event.target.value)} />
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-white/60">Testimonials</p>
                      <button type="button" onClick={() => mutateSiteContent((next) => { if (next.testimonials.length < 8) next.testimonials.push(createEmptyTestimonial(next.testimonials.length)); })} className={buttonClassName}>Add testimonial</button>
                    </div>
                    <div className="mt-4 grid gap-4">
                      {siteContent.testimonials.map((item, index) => (
                        <div key={`testimonial-${index}`} className="rounded-[1.2rem] border border-white/8 bg-white/4 p-4">
                          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                            <div className="grid gap-4">
                              <TextField label="Name" value={item.name} onChange={(event) => updateTestimonial(index, "name", event.target.value)} />
                              <TextField label="Role" value={item.role} onChange={(event) => updateTestimonial(index, "role", event.target.value)} />
                            </div>
                            <TextAreaField label="Quote" rows={4} value={item.quote} onChange={(event) => updateTestimonial(index, "quote", event.target.value)} />
                            <div className="pt-8"><button type="button" onClick={() => mutateSiteContent((next) => { if (next.testimonials.length > 1) next.testimonials.splice(index, 1); })} className={buttonClassName}>Remove</button></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>

              <Section id="contact-footer" label="Homepage CMS" title="Contact and footer">
                <div className="grid gap-6">
                  <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <TextField label="Section label" value={siteContent.contactSection.label} onChange={(event) => updateSiteSection("contactSection", "label", event.target.value)} />
                      <TextAreaField label="Section title" rows={3} className="lg:col-span-2" value={siteContent.contactSection.title} onChange={(event) => updateSiteSection("contactSection", "title", event.target.value)} />
                      <TextAreaField label="Section description" rows={4} className="lg:col-span-2" value={siteContent.contactSection.description} onChange={(event) => updateSiteSection("contactSection", "description", event.target.value)} />
                      <TextField label="Primary CTA label" value={siteContent.contactSection.primaryButtonLabel} onChange={(event) => updateSiteSection("contactSection", "primaryButtonLabel", event.target.value)} />
                      <TextField label="Secondary CTA label" value={siteContent.contactSection.secondaryButtonLabel} onChange={(event) => updateSiteSection("contactSection", "secondaryButtonLabel", event.target.value)} />
                      {[
                        ["phoneLabel", "Phone label"],
                        ["phoneValue", "Phone value"],
                        ["emailLabel", "Email label"],
                        ["emailValue", "Email value"],
                        ["availabilityLabel", "Availability label"],
                        ["availabilityValue", "Availability value"],
                      ].map(([field, label]) => (
                        <TextField
                          key={field}
                          label={label}
                          value={siteContent.contactSection[field]}
                          onChange={(event) => updateSiteSection("contactSection", field, event.target.value)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <TextField label="Footer legal line" value={siteContent.footer.legal} onChange={(event) => updateSiteSection("footer", "legal", event.target.value)} />
                      <TextAreaField label="Footer description" rows={3} className="lg:col-span-2" value={siteContent.footer.description} onChange={(event) => updateSiteSection("footer", "description", event.target.value)} />
                    </div>
                  </div>
                </div>
              </Section>

              <Section
                id="fleet-pricing"
                label="Operations"
                title="Fleet, vehicle media, and pricing"
                actions={
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={addVehicle} className={buttonClassName}>
                      Add vehicle
                    </button>
                    <button type="button" onClick={saveCatalog} disabled={savingCatalog} className={primaryButtonClassName}>
                      {savingCatalog ? "Saving..." : "Save fleet & pricing"}
                    </button>
                  </div>
                }
              >
                <div className="grid gap-6">
                  <div className="grid gap-4 xl:grid-cols-2">
                    {catalog.vehicles.map((vehicle, index) => (
                      <article key={vehicle.slug} className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
                        <div className="flex flex-wrap justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-white/42">Vehicle {index + 1}</p>
                            <p className="mt-2 text-sm text-white/60">Update the public vehicle card and booking option.</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => moveVehicle(index, -1)} disabled={index === 0} className={buttonClassName}>Up</button>
                            <button type="button" onClick={() => moveVehicle(index, 1)} disabled={index === catalog.vehicles.length - 1} className={buttonClassName}>Down</button>
                            <button type="button" onClick={() => removeVehicle(index)} className={buttonClassName}>Remove</button>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          <TextField label="Name" value={vehicle.name} onChange={(event) => updateVehicle(index, "name", event.target.value)} />
                          <TextField label="Capacity" type="number" value={vehicle.capacity} onChange={(event) => updateVehicle(index, "capacity", event.target.value)} />
                          <TextAreaField label="Description" rows={4} className="sm:col-span-2" value={vehicle.description} onChange={(event) => updateVehicle(index, "description", event.target.value)} />
                          <TextField label="Mood tag" value={vehicle.mood} onChange={(event) => updateVehicle(index, "mood", event.target.value)} />
                          <TextField label="Accent class" value={vehicle.accent} onChange={(event) => updateVehicle(index, "accent", event.target.value)} />
                          <label className="inline-flex items-center gap-3 rounded-[1rem] border border-white/8 bg-white/4 px-4 py-3 text-sm text-white/74 sm:col-span-2">
                            <input type="checkbox" checked={vehicle.active} onChange={(event) => updateVehicle(index, "active", event.target.checked)} />
                            Show this vehicle on the live booking site
                          </label>
                        </div>

                        <div className="mt-5 rounded-[1.2rem] border border-white/8 bg-white/4 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Vehicle photos</p>
                              <p className="mt-2 text-sm text-white/62">
                                {(vehicle.imageUrls ?? []).length} / {vehicleImageLimit} saved
                              </p>
                            </div>
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-sm font-semibold text-white hover:bg-white/6">
                              <span>{uploadingVehicleSlugs.includes(vehicle.slug) ? "Uploading..." : "Upload images"}</span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                disabled={uploadingVehicleSlugs.includes(vehicle.slug)}
                                onChange={(event) => {
                                  void handleVehicleImageUpload(index, event.target.files);
                                  event.target.value = "";
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {(vehicle.imageUrls ?? []).map((imageUrl) => (
                              <div key={imageUrl} className="overflow-hidden rounded-[1rem] border border-white/8 bg-black/20">
                                <img src={imageUrl} alt={`${vehicle.name || "Vehicle"} photo`} className="h-40 w-full object-cover" loading="lazy" />
                                <div className="flex items-center justify-between gap-3 px-3 py-2">
                                  <p className="truncate text-xs text-white/45">{imageUrl.split("/").pop()}</p>
                                  <button type="button" onClick={() => removeVehicleImage(index, imageUrl)} className="text-xs font-semibold text-amber-100 hover:text-white">Remove</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
                        <thead>
                          <tr className="text-white/45">
                            <th className="pr-4">Service</th>
                            {catalog.vehicles.map((vehicle) => (
                              <th key={vehicle.slug} className="pr-4">{vehicle.name || "Untitled vehicle"}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {catalogServices.map((service) => (
                            <tr key={service.id}>
                              <td className="pr-4 text-white">{service.title}</td>
                              {catalog.vehicles.map((vehicle) => (
                                <td key={vehicle.slug} className="pr-4">
                                  <input
                                    type="number"
                                    min="0"
                                    value={catalog.pricingMatrix?.[service.id]?.[vehicle.slug] ?? 0}
                                    onChange={(event) => updatePricing(service.id, vehicle.slug, event.target.value)}
                                    className="w-28 rounded-[0.95rem] border border-white/10 bg-white/6 px-3 py-2 text-sm text-white outline-none"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {[
                        ["afterHoursFee", "After-hours fee"],
                        ["weekendFee", "Weekend fee"],
                        ["specialRequestFee", "Special request fee"],
                        ["extraPassengerFee", "Extra passenger fee"],
                        ["afterHoursStartHour", "After-hours start (0-23)"],
                        ["afterHoursEndHour", "After-hours end (0-23)"],
                      ].map(([field, label]) => (
                        <TextField
                          key={field}
                          label={label}
                          type="number"
                          value={catalog.pricingSettings?.[field] ?? 0}
                          onChange={(event) => updatePricingSetting(field, event.target.value)}
                        />
                      ))}
                      <TextField
                        label="Gratuity rate (decimal)"
                        type="number"
                        value={catalog.pricingSettings?.gratuityRate ?? 0}
                        onChange={(event) => updatePricingSetting("gratuityRate", event.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </Section>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
