"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function MobileNav({ navItems, activePathname, brandContent }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function close() {
    setIsOpen(false);
  }

  const overlay = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: isOpen ? "auto" : "none",
      }}
    >
      <div
        aria-hidden="true"
        onClick={close}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.75)",
          opacity: isOpen ? 1 : 0,
          transition: "opacity 300ms ease",
        }}
      />

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
          backgroundColor: "#07080d",
          borderLeft: "1px solid rgba(200,168,112,0.15)",
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms ease-out",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            padding: "20px 24px",
            flexShrink: 0,
          }}
        >
          <BrandLogo brandContent={brandContent} />
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "9999px",
              border: "1px solid rgba(255,255,255,0.1)",
              backgroundColor: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            ×
          </button>
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            padding: "16px",
          }}
        >
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
                  backgroundColor: isActive
                    ? "rgba(255,255,255,0.07)"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "1px solid transparent",
                  textDecoration: "none",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "9999px",
                    flexShrink: 0,
                    backgroundColor: isActive
                      ? "var(--accent)"
                      : "rgba(255,255,255,0.22)",
                  }}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            marginTop: "auto",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: "16px",
            display: "grid",
            gap: "10px",
          }}
        >
          <Link
            href="/book"
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
          <Link
            href="/maine-touring-packages"
            onClick={close}
            style={{
              display: "flex",
              minHeight: "48px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "9999px",
              border: "1px solid rgba(255,255,255,0.12)",
              backgroundColor: "rgba(255,255,255,0.03)",
              padding: "0 24px",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "#ffffff",
              textDecoration: "none",
            }}
          >
            Private Touring
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full border border-white/10 bg-white/4 lg:hidden"
      >
        <span
          className={`block h-px w-5 bg-white/80 transition-transform duration-300 ${
            isOpen ? "translate-y-[6px] rotate-45" : ""
          }`}
        />
        <span
          className={`block h-px w-5 bg-white/80 transition-opacity duration-300 ${
            isOpen ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-px w-5 bg-white/80 transition-transform duration-300 ${
            isOpen ? "-translate-y-[6px] -rotate-45" : ""
          }`}
        />
      </button>

      {mounted ? createPortal(overlay, document.body) : null}
    </>
  );
}

function BrandLogo() {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <Image
        src="/logo.png"
        alt=""
        aria-hidden="true"
        width={356}
        height={257}
        priority
        className="h-9 w-auto md:h-11"
      />

      <p className="font-display text-[1.15rem] leading-none tracking-[-0.02em] text-white md:text-[1.55rem]">
        Autovise Black Car
      </p>
    </div>
  );
}

export default function SiteHeader({ siteContent }) {
  const pathname = usePathname();
  const brandContent = siteContent?.brand ?? {};
  const navigationContent = siteContent?.navigation ?? {};

  const navItems = [
    ["/services", navigationContent.services || "Services"],
    ["/coverage", "Coverage"],
    ["/reviews", navigationContent.reviews || "Reviews"],
    ["/faq", "FAQ"],
    ["/contact", navigationContent.contact || "Contact"],
  ];

  return (
    <header className="fixed top-0 z-30 w-full border-b border-white/6 bg-[rgba(5,6,10,0.72)] backdrop-blur-xl sm:sticky">
      <div className="limo-container flex min-h-[64px] items-center justify-between gap-3 md:min-h-[80px] md:gap-6">
        <Link
          href="/"
          aria-label="Autovise Black Car - Nationwide Luxury Transportation"
          className="shrink-0"
        >
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

        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/maine-touring-packages"
            className="lux-button inline-flex min-h-10 w-[88px] items-center justify-center rounded-full bg-[var(--accent)] px-3 text-center text-[0.62rem] font-bold leading-[1.05] text-[#0a0a0e] shadow-[0_8px_24px_rgba(200,168,112,0.2)] hover:bg-[var(--accent-dark)] sm:hidden"
          >
            Maine Touring
          </Link>
          <Link
            href="/book"
            className="lux-button inline-flex min-h-10 min-w-[58px] items-center justify-center rounded-full bg-[var(--accent)] px-3 text-center text-[0.66rem] font-bold text-[#0a0a0e] shadow-[0_8px_24px_rgba(200,168,112,0.28)] hover:bg-[var(--accent-dark)] sm:hidden"
          >
            Book
          </Link>
          <Link
            href="/maine-touring-packages"
            className="lux-button hidden min-h-10 min-w-[146px] items-center justify-center whitespace-nowrap rounded-full bg-[var(--accent)] px-5 text-center text-[0.72rem] font-bold text-[#0a0a0e] shadow-[0_8px_24px_rgba(200,168,112,0.2)] hover:bg-[var(--accent-dark)] sm:inline-flex sm:text-xs md:min-h-14 md:min-w-[168px] md:px-6 md:text-sm"
          >
            Maine Touring
          </Link>
          <Link
            href="/book"
            className="lux-button hidden min-h-10 items-center justify-center rounded-full bg-[var(--accent)] px-4 text-[0.72rem] font-bold text-[#0a0a0e] shadow-[0_8px_24px_rgba(200,168,112,0.28)] hover:bg-[var(--accent-dark)] sm:inline-flex sm:px-5 sm:text-xs md:min-h-14 md:px-7 md:text-sm"
          >
            <span className="sm:hidden">Book</span>
            <span className="hidden sm:inline">
              {navigationContent.reserve || "Book Now"}
            </span>
          </Link>
        </div>

        <MobileNav
          navItems={navItems}
          activePathname={pathname}
          brandContent={brandContent}
        />
      </div>
    </header>
  );
}
