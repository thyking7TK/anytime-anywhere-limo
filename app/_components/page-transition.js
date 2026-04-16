"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Two things this component does:
 *
 * 1. ANIMATION — On first load: bare wrapper (no opacity-0, no blocking animation).
 *    On client-side navigation: new key + animation class → fade+slide.
 *    This fixes the Lighthouse NO_FCP caused by the old approach which always
 *    applied `animation-fill-mode: both` (opacity 0) even on the first paint.
 *
 * 2. FADE-IN ELEMENTS — Manages the global .fade-in system for every page:
 *    - Pre-marks elements already in the viewport as .in-view (synchronously via
 *      getBoundingClientRect) before enabling the animation system, so above-the-fold
 *      content is never hidden.
 *    - Adds .has-animations to <html> to activate CSS opacity hiding.
 *    - Sets up an IntersectionObserver for below-the-fold elements on every page.
 *    This replaces the per-component observer that was only wired up on the home page.
 */
export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [navCount, setNavCount] = useState(0);
  const prevPathRef = useRef(pathname);
  const hasMountedRef = useRef(false);

  // ── Fade-in observer (runs on every page, re-runs on navigation) ──────────
  useEffect(() => {
    // 1. Synchronously pre-mark any .fade-in element already in the viewport.
    //    This must happen BEFORE we add .has-animations, otherwise those elements
    //    would flash invisible for one frame.
    document.querySelectorAll(".fade-in:not(.in-view)").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("in-view");
      }
    });

    // 2. Activate the CSS animation system now that in-viewport elements are safe.
    document.documentElement.classList.add("has-animations");

    // 3. Watch below-the-fold elements and reveal them as the user scrolls.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" },
    );

    document.querySelectorAll(".fade-in:not(.in-view)").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pathname]); // re-run on every navigation so new page elements are observed

  // ── Navigation animation trigger ──────────────────────────────────────────
  useEffect(() => {
    // Skip the very first mount — content must be visible for FCP.
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    // Subsequent pathname changes = client-side navigation → trigger animation.
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      setNavCount((n) => n + 1);
    }
  }, [pathname]);

  // navCount === 0  → first load  → no animation (content immediately visible)
  // navCount  >  0  → navigation  → new key causes remount + animation fires
  return (
    <div
      key={navCount === 0 ? "initial" : navCount}
      className={navCount > 0 ? "page-transition-wrapper" : "page-transition-bare"}
    >
      {children}
    </div>
  );
}
