/** @file app/gallery/GalleryGrid.tsx */

// ─────────────────────────────────────────
// SECTION: GalleryGrid
// WHAT: Client-side gallery renderer — masonry, uniform grid, or fullwidth layouts.
// WHY: Layout is chosen by the barber in admin and passed from the server page.
//   No category fields — clean, distraction-free visual portfolio.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────

"use client";

import { DbGalleryItem } from "@/lib/supabase";

type Props = {
  items: DbGalleryItem[];
  layout?: "masonry" | "grid" | "fullwidth";
};

const ANIMATION_BASE: React.CSSProperties = {
  animation: "gallery-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
  transform: "translateZ(0)",
  WebkitTransform: "translateZ(0)",
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

export default function GalleryGrid({ items, layout = "masonry" }: Props) {
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
          <div
            key={item.id}
            className="aspect-square overflow-hidden rounded-xl"
            style={{
              ...ANIMATION_BASE,
              animationDelay: `${index * 60}ms`,
              background: "var(--theme-surface)",
            }}
          >
            <GalleryMedia item={item} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    );
  }

  // ── Full-width stacked layout ──
  if (layout === "fullwidth") {
    return (
      <div className="flex flex-col gap-5 max-w-4xl mx-auto">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="w-full overflow-hidden rounded-2xl"
            style={{
              ...ANIMATION_BASE,
              animationDelay: `${index * 60}ms`,
              background: "var(--theme-surface)",
            }}
          >
            <GalleryMedia
              item={item}
              className="w-full h-auto block"
            />
          </div>
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
        <div
          key={item.id}
          className="mb-2 md:mb-3 break-inside-avoid overflow-hidden rounded-xl"
          style={{
            ...ANIMATION_BASE,
            animationDelay: `${index * 60}ms`,
            background: "var(--theme-surface)",
          }}
        >
          <GalleryMedia item={item} className="w-full h-auto block" />
        </div>
      ))}
    </div>
  );
}
