import Link from "next/link";

import ContactForm from "@/app/contact/contact-form";
import SiteFloatingActions from "@/app/_components/site-floating-actions";
import SiteFooter from "@/app/_components/site-footer";
import SiteHeader from "@/app/_components/site-header";
import { getCatalog } from "@/lib/catalog";
import { getSiteContent } from "@/lib/site-content";

export const revalidate = 300;

export const metadata = {
  title: "Contact & Book",
  description:
    "Reach Autovise Black Car concierge 24/7. Call +1 (207) 880-3733 or email booking@autoviseblackcar.com to reserve airport transfers, executive travel, long-distance rides, or VIP transportation.",
  keywords: [
    "book black car service",
    "contact chauffeur service",
    "luxury transportation booking",
    "black car concierge",
    "reserve private car",
    "airport transfer booking",
    "executive car booking",
    "24/7 car service",
  ],
  alternates: { canonical: "https://autoviseblackcar.com/contact" },
  openGraph: {
    title: "Contact & Book | Autovise Black Car",
    description:
      "Reach concierge 24/7 at +1 (207) 880-3733 or booking@autoviseblackcar.com. Reserve your ride today.",
    url: "https://autoviseblackcar.com/contact",
  },
  twitter: {
    title: "Contact & Book | Autovise Black Car",
    description:
      "Reach concierge 24/7 at +1 (207) 880-3733 or booking@autoviseblackcar.com.",
  },
};

function ContactInfoCard({ label, children }) {
  return (
    <article className="glass-panel soft-lift rounded-[1.4rem] p-6">
      <p className="lux-section-label !mb-0 text-[0.7rem]">{label}</p>
      <div className="mt-4">{children}</div>
    </article>
  );
}

export default async function ContactPage({ searchParams }) {
  const [, siteContent] = await Promise.all([getCatalog(), getSiteContent()]);
  const resolvedSearchParams = (await searchParams) ?? {};

  const contactSection = siteContent.contactSection ?? {};
  const requestedService = Array.isArray(resolvedSearchParams.service)
    ? resolvedSearchParams.service[0]
    : resolvedSearchParams.service;

  const resolvedContactPhone =
    String(contactSection.phoneValue ?? "").trim() || "+1 (207) 880-3733";
  const resolvedContactEmail =
    String(contactSection.emailValue ?? "").trim().toLowerCase() ===
      "book@autovise.com" || !String(contactSection.emailValue ?? "").trim()
      ? "booking@autoviseblackcar.com"
      : String(contactSection.emailValue ?? "").trim();
  const contactPhoneHref = `tel:${resolvedContactPhone.replace(/[^+\d]/g, "")}`;
  const contactEmailHref = `mailto:${resolvedContactEmail}`;

  return (
    <div className="page-shell min-h-screen overflow-x-hidden text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#05060a_0%,#080a0e_40%,#06080f_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.028]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(255,255,255,0.5) 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(255,255,255,0.5) 80px)",
          }}
        />
        <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(200,168,112,0.06),transparent_65%)]" />
      </div>

      <SiteHeader siteContent={siteContent} />

      <main className="relative z-10">
        <section className="px-3 py-16 sm:px-5 md:py-20 lg:py-24">
          <div className="limo-container">
            <p className="lux-section-label">
              {contactSection.label || "Contact"}
            </p>
            <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="order-2 xl:order-1">
                <h1 className="max-w-[760px] font-display text-[1.8rem] leading-[1.05] text-white sm:text-[2.4rem] md:text-[3.4rem] lg:text-[4.2rem]">
                  {contactSection.title || "Ready to book your ride?"}
                </h1>
                <p className="mt-5 max-w-[720px] text-lg leading-8 text-white/66">
                  {contactSection.description ||
                    "Reach out via phone, email, or use the booking form and we'll confirm your reservation with clear pricing before the trip begins."}
                </p>

                <p className="mt-6 text-sm text-white/40">
                  Free cancellation up to 24 hours before pickup. Wait time billed
                  at $40/hr. Extra stops $25-$50.
                </p>

                <div className="mt-8 grid gap-4">
                  <ContactInfoCard
                    label={contactSection.phoneLabel || "Phone"}
                  >
                    <a
                      href={contactPhoneHref}
                      className="block font-display text-[1.4rem] leading-tight text-white sm:text-[1.7rem] md:text-[1.9rem]"
                    >
                      {resolvedContactPhone}
                    </a>
                  </ContactInfoCard>

                  <ContactInfoCard
                    label={contactSection.emailLabel || "Email"}
                  >
                    <a
                      href={contactEmailHref}
                      className="block break-all font-display text-[1.1rem] leading-snug text-white sm:text-[1.4rem] md:text-[1.7rem]"
                    >
                      {resolvedContactEmail}
                    </a>
                  </ContactInfoCard>

                  <ContactInfoCard
                    label={contactSection.availabilityLabel || "Availability"}
                  >
                    <p className="font-display text-[1.3rem] leading-snug text-white sm:text-[1.6rem] md:text-[1.9rem]">
                      {contactSection.availabilityValue || "24/7, 365 days"}
                    </p>
                  </ContactInfoCard>
                </div>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/book"
                    className="lux-button inline-flex min-h-14 items-center justify-center rounded-full bg-[var(--accent)] px-8 text-sm font-bold text-[#0a0a0e] hover:bg-[var(--accent-dark)]"
                  >
                    {contactSection.primaryButtonLabel || "Reserve Now"}
                  </Link>
                  <a
                    href={contactEmailHref}
                    className="lux-button inline-flex min-h-14 items-center justify-center rounded-full border border-white/12 bg-white/3 px-8 text-sm font-semibold text-white hover:border-[var(--accent)] hover:bg-white/6"
                  >
                    {contactSection.secondaryButtonLabel || "Email Us"}
                  </a>
                </div>
              </div>

              <div className="order-1 grid gap-4 xl:order-2">
                <ContactForm initialService={requestedService} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter siteContent={siteContent} />
      <SiteFloatingActions
        contactPhone={resolvedContactPhone}
        callLabel={siteContent.floatingActions?.callLabel || "Call Concierge"}
      />
    </div>
  );
}
