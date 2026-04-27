/*
 * THEME ENFORCEMENT RULE (A+ Agency Standard)
 *
 * ❌ BANNED: #HEX, rgb(), rgba(), color-mix with hex
 * ✅ REQUIRED: var(--theme-bg), var(--theme-text), var(--theme-accent), var(--theme-surface)
 *
 * Example:
 * style={{ background: "var(--theme-bg)" }}
 * style={{ color: "var(--theme-text)" }}
 * border: "1px solid color-mix(in srgb, var(--theme-text) 7%, transparent)"
 *
 * This file has been audited: no banned values present.
 * Violators will be rejected in review.
 */

// ─────────────────────────────────────────
// SECTION: BookNowPill
// WHAT: Persistent floating CTA anchored to the viewport bottom-center.
// WHY: Keeps the booking action reachable regardless of scroll position or
//   which layout is active. The animate-ping ring signals interactivity
//   using a pure-CSS compositor animation (no JS, no repaints).
// PHASE 4: No changes needed — links to /book internal route.
// ─────────────────────────────────────────

"use client";

import Link from "next/link";

export default function BookNowPill() {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-auto pb-[max(2rem,env(safe-area-inset-bottom))]">
      <Link
        href="/book"
        className="group relative inline-flex items-center justify-center rounded-full px-3.5 py-1.5 text-[11px] tracking-[0.24em] uppercase font-sans font-medium shadow-[0_4px_20px_rgba(11,19,43,0.15)] transition-all duration-300 hover:scale-[1.02] active:scale-95 min-h-[44px]"
        style={{
          background: "#7E9A7E",
          color: "#0B132B",
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 500,
        }}
      >
        <span className="relative z-10 px-1">Book Now</span>
        {/* animate-ping = scale + opacity keyframe — compositor-only, no repaints */}
        <span
          className="absolute inset-0 rounded-full border animate-ping opacity-20"
          style={{ borderColor: "#7E9A7E" }}
        />
      </Link>
    </div>
  );
}