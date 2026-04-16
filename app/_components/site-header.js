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
      <button
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex lg:hidden flex-col justify-center items-center gap-[5px] w-11 h-11 rounded-full border border-white/10 bg-white/4 backdrop-blur-sm"
      >
        <span
          className={`block h-px w-5 bg-white/80 transition-transform duration-300 ${isOpen ? "translate-y-[6px] rotate-45" : ""}`}
        />
        <span
          className={`block h-px w-5 bg-white/80 transition-opacity duration-300 ${isOpen ? "opacity-0" : ""}`}
        />
        <span
          className={`block h-px w-5 bg-white/80 transition-transform duration-300 ${isOpen ? "-translate-y-[6px] -rotate-45" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/60 backdrop-blur-[2px]"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-72 flex flex-col lg:hidden border-l border-white/10 bg-[#07080d] backdrop-blur-xl transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
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
            className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 bg-white/4 text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-5">
          {navItems.map(([href, label]) => {
            const isActive = activePathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors ${isActive ? "bg-white/6 text-white border border-white/10" : "text-white/70 hover:bg-white/4 hover:text-white"}`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-[var(--accent)]" : "bg-white/20"}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/8 p-5">
          <Link
            href="/#booking"
            onClick={close}
            className="lux-button flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-bold text-[#0a0a0e]"
          >
            Reserve Now
          </Link>
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
