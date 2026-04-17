"use client";

/**
 * BookingPanelLazy
 *
 * Why this file exists:
 *   next/dynamic with { ssr: false } cannot be called inside a Server Component.
 *   This thin "use client" wrapper is the bridge — the Server Component (page.js)
 *   renders this file, and *this* file defers the heavy booking-form bundle so it
 *   never blocks the initial paint.
 *
 * Effect on metrics:
 *   • The entire AnytimeAnywhereLimoWebsite JS chunk (~booking form, state, fetch
 *     logic, payment flow) is excluded from the initial JS payload.
 *   • React does not attempt to hydrate it before first paint.
 *   • The hero h1 (LCP element) appears with the very first HTML byte — no JS gate.
 *   • After first paint the browser downloads and mounts the booking form in the
 *     background; functionality is fully preserved.
 */

import dynamic from "next/dynamic";

const BookingForm = dynamic(
  () => import("./anytime-anywhere-limo-website"),
  {
    ssr: false,

    // Shape-matching skeleton shown while the booking JS chunk loads.
    // Matches the glass-panel aside dimensions so layout does not shift (no CLS).
    loading: () => (
      <aside
        id="booking"
        className="booking-panel glass-panel min-w-0 overflow-hidden rounded-[1.4rem] p-6 md:p-8"
        aria-label="Loading booking form"
      >
        <div className="animate-pulse">
          {/* Header area */}
          <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="h-3 w-28 rounded-full bg-white/8" />
              <div className="h-8 w-52 rounded-lg bg-white/7" />
              <div className="h-3 w-64 rounded-full bg-white/5" />
            </div>
            <div className="h-9 w-28 rounded-full bg-white/6" />
          </div>

          {/* Form field placeholders */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-16 rounded-full bg-white/6" />
                <div className="h-14 rounded-[1.2rem] bg-white/5" />
              </div>
            ))}
          </div>

          {/* Submit button placeholder */}
          <div className="mt-6 h-14 rounded-full bg-white/8" />
        </div>
      </aside>
    ),
  }
);

export default function BookingPanelLazy({ initialCatalog, initialSiteContent }) {
  return (
    <BookingForm
      initialCatalog={initialCatalog}
      initialSiteContent={initialSiteContent}
    />
  );
}
