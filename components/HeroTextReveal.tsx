"use client";

// ─────────────────────────────────────────
// SECTION: HeroTextReveal
// WHAT: Staggered Framer Motion reveal for hero copy — subheading, barber pole, heading only.
// WHY: Extracted from the RSC hero so client-side spring animations can run on mount
//   without blocking the server-rendered layout. The outer section (media + vignette)
//   stays as a pure Server Component for zero-CLS performance.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────

import { motion, useReducedMotion } from "framer-motion";

// WHY: Consistent easing across all staggered children — same curve as Framer Motion spring default.
const EASE = [0.22, 1, 0.36, 1] as const;

export default function HeroTextReveal() {
  const reduced = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduced ? 0 : 0.13, delayChildren: reduced ? 0 : 0.15 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: reduced ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: EASE },
    },
  };

  return (
    <motion.div
      data-hero-copy-container
      className="relative z-20 flex flex-col items-center justify-center h-full text-center px-6 pt-20"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* ── Subheading ── */}
      <motion.p
        data-hero-subheading
        variants={item}
        className="uppercase tracking-[0.35em] text-xs mb-5"
        style={{
          color: "color-mix(in srgb, white 72%, transparent)",
          fontFamily: "'Manrope', sans-serif",
        }}
      >
        Luxury Grooming &amp; Spa · Cumming, Georgia
      </motion.p>

      {/* ── Barber pole accent ── */}
      <motion.div
        aria-hidden="true"
        variants={item}
        className="mb-6"
        style={{
          width: "7px",
          height: "38px",
          borderRadius: "99px",
          overflow: "hidden",
          flexShrink: 0,
          backgroundImage:
            "repeating-linear-gradient(-45deg, var(--theme-accent) 0px, var(--theme-accent) 5px, color-mix(in srgb, var(--color-lavender) 18%, transparent) 5px, color-mix(in srgb, var(--color-lavender) 18%, transparent) 10px)",
          backgroundSize: "100% 40px",
          animation: "barber-pole 3.4s linear infinite",
        }}
      />

      {/* ── Main heading ── */}
      <motion.h1
        data-hero-main-heading
        variants={item}
        className="font-serif font-light tracking-[0.03em] mb-6 leading-[0.92] max-w-4xl mx-auto text-white"
        style={{
          fontFamily: "'Bodoni Moda', serif",
          fontSize: "clamp(2rem, 6.5vw, 4.75rem)",
        }}
      >
        It&apos;s more than a haircut.
        <br />
        <em>It&apos;s an experience.</em>
      </motion.h1>
    </motion.div>
  );
}
