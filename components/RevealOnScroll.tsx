"use client";

// ─────────────────────────────────────────
// SECTION: RevealOnScroll
// WHAT: Framer Motion whileInView entrance for homepage bands and lists.
// WHY: Keeps RSC parents lean — one client wrapper for scroll choreography.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────

import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

type Props = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
  "data-home-band"?: string;
};

export default function RevealOnScroll({
  children,
  className,
  as = "div",
  "data-home-band": dataHomeBand,
}: Props) {
  const reduced = useReducedMotion();
  const Tag = as === "section" ? motion.section : motion.div;

  return (
    <Tag
      className={className}
      data-home-band={dataHomeBand}
      initial={reduced ? undefined : { opacity: 0, y: 80 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20%" }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      {children}
    </Tag>
  );
}
