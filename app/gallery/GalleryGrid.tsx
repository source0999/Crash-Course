"use client";

// ─────────────────────────────────────────
// SECTION: GalleryGrid
// WHAT: Client component that renders the masonry grid with staggered entrance animations.
// WHY: Animations require client context; data fetching stays in the Server Component parent.
// PHASE 4: No changes needed — already wired to live Supabase data via props.
// ─────────────────────────────────────────

import type { DbGalleryItem } from "@/lib/supabase";

type Props = {
  items: DbGalleryItem[];
};

export default function GalleryGrid({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <p className="text-2xl font-light text-white/40 tracking-widest uppercase">
          Coming Soon
        </p>
        <p className="mt-3 text-sm text-white/25 tracking-wider">
          The portfolio is being built. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{ columns: "var(--gallery-cols)", columnGap: "12px" }}
      className="[--gallery-cols:2] md:[--gallery-cols:3] lg:[--gallery-cols:4]"
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          className="mb-3 break-inside-avoid overflow-hidden rounded-lg"
          style={{
            animation: `gallery-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both`,
            animationDelay: `${index * 80}ms`,
            transform: "translateZ(0)",
            WebkitTransform: "translateZ(0)",
          }}
        >
          {item.file_type === "video" ? (
            <video
              src={item.file_url}
              autoPlay
              muted
              loop
              playsInline
              className="block h-auto w-full object-cover"
            />
          ) : (
            <img
              src={item.file_url}
              alt={item.title ?? "Gallery image"}
              className="block h-auto w-full object-cover"
              loading="lazy"
            />
          )}
        </div>
      ))}
    </div>
  );
}
