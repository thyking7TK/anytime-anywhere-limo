"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function MobileNav({ navItems, activePathname, brandContent }) {
  const [isOpen, setIsOpen] = useState(false);

  function close() {
    setIsOpen(false);
  }

  return (
    <>
      {/* Hamburger button */}
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

      {/*
        Full-screen fixed container — holds both scrim and panel.
        Using a single fixed parent avoids the iOS compositing bug where
        a fixed child's background-color gets dropped when backdrop-filter
        is active anywhere on the page.
      */}
      <div
        className="lg:hidden"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        aria-hidden={!isOpen}
      >
        {/* Scrim — darkens the page behind the panel */}
        <div
          onClick={close}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.72)",
            opacity: isOpen ? 1 : 0,
            transition: "opacity 300ms ease",
          }}
        />

        {/* Drawer panel — absolutely positioned inside the fixed container.
            All visual styles are inline so no Tailwind class can be purged,
            overridden, or composited away. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "288px",
            backgroundColor: "#07080d",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            transform: isOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 300ms ease-out",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "20px 24px" }}>
            <div>
              <p className="font-display text-[1.3rem] leading-none text-white">
                {brandContent.name}
              </p>
              <p className="mt-1 text-[0.62rem] uppercase tracking-[0.3em] text-[var(--accent)]">
                {brandContent.subtitle}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 text-white/60 hover:text-white"
              style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
            >
              ✕
            </button>
          </div>

          {/* Nav links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "20px" }}>
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
                    borderRadius: "12px",
                    padding: "14px 16px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.7)",
                    backgroundColor: isActive ? "rgba(255,255,255,0.06)" : "transparent",
                    border: isActive ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                    textDecoration: "none",
                  }}
                >
                  <span style={{
                    width: "6px", height: "6px", borderRadius: "9999px", flexShrink: 0,
                    backgroundColor: isActive ? "var(--accent)" : "rgba(255,255,255,0.2)",
                  }} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Reserve Now CTA */}
          <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px" }}>
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
    </>
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
        <Link href="/" aria-label={`${brandContent.name || "Autovise Black Car"} home`} className="shrink-0">
          <p className="font-display text-[1.3rem] leading-none tracking-[-0.02em] text-white md:text-[1.8rem]">
            {brandContent.name}
          </p>
          <p className="mt-1 hidden text-[0.72rem] uppercase tracking-[0.28em] text-white/54 sm:block">
            {brandContent.subtitle}
          </p>
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
