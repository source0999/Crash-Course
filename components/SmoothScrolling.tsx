"use client";

// ─────────────────────────────────────────
// SECTION: SmoothScrolling
// WHAT: Lenis smooth-scroll loop bound to requestAnimationFrame.
// WHY: Webflow-grade inertial scroll site-wide without fighting Next layout.
// PHASE 4: No DB.
// ─────────────────────────────────────────

import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

type Props = { children: React.ReactNode };

export default function SmoothScrolling({ children }: Props) {
  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: true,
      touchMultiplier: 1.15,
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
