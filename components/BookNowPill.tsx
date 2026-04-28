"use client";

// ─────────────────────────────────────────
// SECTION: BookNowPill
// WHAT: Persistent floating CTA anchored to viewport bottom-center with spring float.
// WHY: Keeps booking reachable at all scroll positions. Float animation uses translate3d
//   only — compositor layer, zero repaints. Framer Motion respects prefers-reduced-motion.
// PHASE 4: No changes needed — links to /book internal route.
// ─────────────────────────────────────────

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const MotionLink = motion(Link);

export default function BookNowPill() {
  const reduced = useReducedMotion();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-auto pb-[max(2rem,env(safe-area-inset-bottom))]">
      {/* WHY: Outer motion.div owns the float so the Link's transform stack stays clean. */}
      <motion.div
        animate={reduced ? {} : {
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3.4,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "loop",
        }}
      >
        <MotionLink
          href="/book"
          className="group relative inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm tracking-[0.04em] uppercase font-semibold shadow-md transition-colors duration-200 touch-manipulation min-h-[44px] bg-theme-5 text-theme-4 hover:bg-theme-4 hover:text-theme-1"
          style={{ fontFamily: "var(--font-sans)" }}
          whileHover={reduced ? undefined : { scale: 1.05 }}
          whileTap={reduced ? undefined : { scale: 0.95 }}
          onTouchEnd={(e) => {
            e.preventDefault();
          }}
        >
          <span className="relative z-10">Book Now</span>
        </MotionLink>
      </motion.div>
    </div>
  );
}
