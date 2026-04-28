"use client";

// ─────────────────────────────────────────
// SECTION: GalleryGrid
// WHAT: Client-side gallery renderer — masonry, uniform grid, or fullwidth layouts.
// WHY: Layout is chosen by the barber in admin and passed from the server page.
//   Framer Motion whileInView handles staggered entrance — items animate in as
//   they scroll into the viewport, not all at once on load (better for long galleries).
// PHASE 4: No changes needed.
// ─────────────────────────────────────────

import { motion, useReducedMotion } from "framer-motion";
import { DbGalleryItem } from "@/lib/supabase";

type Props = {
  items: DbGalleryItem[];
  layout?: "masonry" | "grid" | "fullwidth";
};

function GalleryMedia({ item, className }: { item: DbGalleryItem; className?: string }) {
  if (item.file_type === "video") {
    return (
      <video
        src={item.file_url}
        autoPlay
        muted
        loop
        playsInline
        className={className ?? "w-full h-full object-cover"}
      />
    );
  }
  return (
    <img
      src={item.file_url}
      alt={item.title ?? "Gallery image"}
      className={className ?? "w-full h-full object-cover"}
      loading="lazy"
    />
  );
}

// WHY: Shared Framer Motion variants — consistent entrance easing across all layouts.
function useCardVariants(reduced: boolean) {
  return {
    hidden: { opacity: 0, scale: reduced ? 1 : 0.94 },
    show: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.55,
        delay: reduced ? 0 : Math.min(i * 0.045, 0.4),
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    }),
  };
}

export default function GalleryGrid({ items, layout = "masonry" }: Props) {
  const reduced = useReducedMotion();
  const variants = useCardVariants(!!reduced);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <p
          className="text-2xl font-light tracking-widest uppercase mb-3"
          style={{
            color: "color-mix(in srgb, var(--theme-text) 30%, transparent)",
            fontFamily: "var(--font-display)",
          }}
        >
          Coming Soon
        </p>
        <p
          className="text-sm tracking-wider"
          style={{
            color: "color-mix(in srgb, var(--theme-text) 20%, transparent)",
            fontFamily: "var(--font-sans)",
          }}
        >
          The portfolio is being built. Check back soon.
        </p>
      </div>
    );
  }

  // ── Uniform grid layout ──
  if (layout === "grid") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            custom={index}
            variants={variants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="aspect-square overflow-hidden rounded-xl"
            style={{ background: "var(--theme-surface)" }}
          >
            <GalleryMedia item={item} className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>
    );
  }

  // ── Full-width stacked layout ──
  if (layout === "fullwidth") {
    return (
      <div className="flex flex-col gap-5 max-w-4xl mx-auto">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            custom={index}
            variants={variants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="w-full overflow-hidden rounded-2xl"
            style={{ background: "var(--theme-surface)" }}
          >
            <GalleryMedia
              item={item}
              className="w-full h-auto block"
            />
          </motion.div>
        ))}
      </div>
    );
  }

  // ── Default: masonry ──
  return (
    <div
      style={{ columns: "var(--gallery-cols)", columnGap: "10px" }}
      className="[--gallery-cols:2] md:[--gallery-cols:3] lg:[--gallery-cols:4]"
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          custom={index}
          variants={variants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="mb-2 md:mb-3 break-inside-avoid overflow-hidden rounded-xl"
          style={{ background: "var(--theme-surface)" }}
        >
          <GalleryMedia item={item} className="w-full h-auto block" />
        </motion.div>
      ))}
    </div>
  );
}
