"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function MobileNav({ navItems, activePathname, brandContent }) {
  const [isOpen, setIsOpen] = useState(false);
  // Portal requires document — only available after client mount.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll while drawer is open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  function close() {
    setIsOpen(false);
  }

  /*
    WHY A PORTAL?
    The <header> has backdrop-filter: blur() which forces a new GPU
    compositing layer in BOTH Chrome and Safari. Any fixed/absolute child
    inside that stacking context is composited relative to the header layer,
    not the viewport — the browser blends the content behind the header
    through the child even when backgroundColor is fully opaque.

    createPortal moves the overlay to document.body, completely outside
    the header's stacking context. The panel is then a plain absolutely-
    positioned child of a viewport-fixed div, painted and composited
    independently with no ancestor filter in the chain.
  */
  const overlay = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        // Prevent interaction when closed so taps fall through to the page.
        pointerEvents: isOpen ? "auto" : "none",
      }}
    >
      {/* ── SCRIM ───────────────────────────────────────────────────────
          Semi-transparent — click it to close. Separate from the panel. */}
      <div
        aria-hidden="true"
        onClick={close}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.75)",
          opacity: isOpen ? 1 : 0,
          transition: "opacity 300ms ease",
          // No backdrop-filter here — just a plain rgba fill.
        }}
      />

      {/* ── PANEL ───────────────────────────────────────────────────────
          Fully opaque. No backdrop-filter, no rgba, no opacity < 1.
          backgroundColor is a solid hex value with no alpha channel.
          All styles are inline — nothing can be purged or overridden. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(288px, 85vw)",
          // SOLID — hex with no alpha. This is the opaque surface.
          backgroundColor: "#07080d",
          borderLeft: "1px solid rgba(200,168,112,0.15)",
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms ease-out",
          // No filter, no backdropFilter, no opacity.
          overflowY: "auto",
        }}
      >
        {/* Panel header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "20px 24px",
          flexShrink: 0,
        }}>
          <BrandLogo brandContent={brandContent} />
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "36px", height: "36px", borderRadius: "9999px",
              border: "1px solid rgba(255,255,255,0.1)",
              backgroundColor: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "16px" }}>
          {navItems.map(([href, label]) => {
            const isActive = activePathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                aria-current={isActive ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  borderRadius: "10px",
                  padding: "13px 14px",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.72)",
                  backgroundColor: isActive ? "rgba(255,255,255,0.07)" : "transparent",
                  border: isActive ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                  textDecoration: "none",
                }}
              >
                <span style={{
                  width: "6px", height: "6px", borderRadius: "9999px", flexShrink: 0,
                  backgroundColor: isActive ? "var(--accent)" : "rgba(255,255,255,0.22)",
                }} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Reserve Now CTA */}
        <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "16px" }}>
          <Link
            href="/#booking"
            onClick={close}
            className="lux-button"
            style={{
              display: "flex",
              minHeight: "48px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "9999px",
              backgroundColor: "var(--accent)",
              padding: "0 24px",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "#0a0a0e",
              textDecoration: "none",
            }}
          >
            Reserve Now
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Hamburger — stays inside the header */}
      <button
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex lg:hidden flex-col justify-center items-center gap-[5px] w-11 h-11 rounded-full border border-white/10 bg-white/4"
      >
        <span className={`block h-px w-5 bg-white/80 transition-transform duration-300 ${isOpen ? "translate-y-[6px] rotate-45" : ""}`} />
        <span className={`block h-px w-5 bg-white/80 transition-opacity duration-300 ${isOpen ? "opacity-0" : ""}`} />
        <span className={`block h-px w-5 bg-white/80 transition-transform duration-300 ${isOpen ? "-translate-y-[6px] -rotate-45" : ""}`} />
      </button>

      {/* Portal renders the overlay as a direct child of <body>,
          completely outside the header's backdrop-filter stacking context. */}
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}

function BrandLogo({ brandContent }) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div>
        <p className="font-display text-[1.3rem] leading-none tracking-[-0.02em] text-white md:text-[1.8rem]">
          {brandContent.name || "Autovise Black Car"}
        </p>
        <p className="mt-1 hidden text-[0.7rem] uppercase tracking-[0.28em] text-white/54 sm:block">
          {brandContent.subtitle || "Nationwide Luxury Transportation"}
        </p>
      </div>
    );
  }

  return (
    <Image
      src="/logo.jpg"
      alt="Autovise Black Car — Nationwide Luxury Transportation"
      width={780}
      height={312}
      priority
      onError={() => setImgError(true)}
      className="h-10 w-auto md:h-14 mix-blend-lighten"
    />
  );
}

export default function SiteHeader({ siteContent }) {
  const pathname = usePathname();
  const brandContent = siteContent?.brand ?? {};
  const navigationContent = siteContent?.navigation ?? {};

  const navItems = [
    ["/services", navigationContent.services || "Services"],
    ["/coverage", "Coverage"],
    ["/rates", "Rates"],
    ["/reviews", navigationContent.reviews || "Reviews"],
    ["/faq", "FAQ"],
    ["/contact", navigationContent.contact || "Contact"],
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-white/6 bg-[rgba(5,6,10,0.72)] backdrop-blur-xl">
      <div className="limo-container flex min-h-[64px] items-center justify-between gap-4 md:min-h-[80px] md:gap-6">
        <Link href="/" aria-label="Autovise Black Car — Nationwide Luxury Transportation" className="shrink-0">
          <BrandLogo brandContent={brandContent} />
        </Link>

        <nav className="hidden items-center gap-3 text-[0.98rem] text-white/84 lg:flex">
          {navItems.map(([href, label]) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                className={`nav-link ${isActive ? "is-active" : ""}`}
                href={href}
                aria-current={isActive ? "page" : undefined}
              >
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/#booking"
          className="lux-button hidden min-h-14 items-center justify-center rounded-full bg-[var(--accent)] px-7 text-sm font-bold text-[#0a0a0e] shadow-[0_8px_24px_rgba(200,168,112,0.28)] hover:bg-[var(--accent-dark)] md:inline-flex"
        >
          {navigationContent.reserve || "Book Now"}
        </Link>

        <MobileNav
          navItems={navItems}
          activePathname={pathname}
          brandContent={brandContent}
        />
      </div>
    </header>
  );
}
