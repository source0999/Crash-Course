"use client";

// ─────────────────────────────────────────
// SECTION: SmoothScrolling
// WHAT: Lenis smooth-scroll loop bound to requestAnimationFrame.
// WHY: Webflow-grade inertial scroll site-wide without fighting Next layout.
// PHASE 4: No DB.
// ─────────────────────────────────────────

import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";

type Props = { children: React.ReactNode };

export default function SmoothScrolling({ children }: Props) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // WHY iOS: Lenis only calls preventDefault on touch when isSmooth is true for that event;
    // isSmooth = (syncTouch && touch) || (smoothWheel && wheel). Keep syncTouch false so
    // touch scrolling stays native; wheel smoothing only (see node_modules @studio-freight/lenis onVirtualScroll).
    const lenis = new Lenis({
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.15,
      gestureOrientation: "vertical",
    });
    lenisRef.current = lenis;

    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenisRef.current = null;
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    function handleScrollReset() {
      lenisRef.current?.scrollTo(0, { immediate: true });
    }

    window.addEventListener("app:scroll-to-top", handleScrollReset);
    return () => {
      window.removeEventListener("app:scroll-to-top", handleScrollReset);
    };
  }, []);

  return <>{children}</>;
}
