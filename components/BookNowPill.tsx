/** @file components/BookNowPill.tsx */

// ─────────────────────────────────────────
// SECTION: BookNowPill
// WHAT: Persistent floating CTA anchored to viewport bottom-center.
// WHY: Keeps the booking action reachable at all scroll positions across all
//   layouts. Uses var(--theme-accent) so it automatically matches whichever
//   Dual Flicker theme is active without any component-level changes.
// PHASE 4: No changes needed — links to /book internal route.
// ─────────────────────────────────────────

"use client";

import Link from "next/link";

export default function BookNowPill() {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-auto pb-[max(2rem,env(safe-area-inset-bottom))]">
      <Link
        href="/book"
        className="group relative inline-flex items-center justify-center rounded-full px-6 py-3 text-sm tracking-[0.04em] uppercase font-medium shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-95 touch-manipulation min-h-[44px]"
        style={{
          background: "var(--theme-accent)",
          color: "var(--theme-text)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <span className="relative z-10">Book Now</span>
        {/* animate-ping = scale + opacity keyframe — compositor-only, no repaints */}
        <span
          className="absolute inset-0 rounded-full border animate-ping opacity-20"
          style={{ borderColor: "var(--theme-accent)" }}
        />
      </Link>
    </div>
  );
}
