"use client";

// ─────────────────────────────────────────
// SECTION: GalleryGrid
// WHAT: Renders gallery media in masonry, grid, or fullwidth layout with stagger animation.
// WHY: Layout is chosen by the barber in admin and passed from the server page.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────
import { DbGalleryItem } from "@/lib/supabase";

type Props = {
  items: DbGalleryItem[];
  layout?: "masonry" | "grid" | "fullwidth";
};

function MediaItem({ item, index }: { item: DbGalleryItem; index: number }) {
  const style = {
    animation: `gallery-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both`,
    animationDelay: `${index * 80}ms`,
    transform: "translateZ(0)",
    WebkitTransform: "translateZ(0)",
  };
  const media =
    item.file_type === "video" ? (
      <video src={item.file_url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
    ) : (
      <img
        src={item.file_url}
        alt={item.title ?? "Gallery image"}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    );
  return { style, media };
}

export default function GalleryGrid({ items, layout = "masonry" }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <p className="text-2xl font-light text-white/40 tracking-widest uppercase">Coming Soon</p>
        <p className="mt-3 text-sm text-white/25 tracking-wider">The portfolio is being built. Check back soon.</p>
      </div>
    );
  }

  if (layout === "grid") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`aspect-square overflow-hidden rounded-lg ${item.show_bg ? "bg-black" : "bg-transparent"}`}
            style={{
              animation: `gallery-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both`,
              animationDelay: `${index * 80}ms`,
              transform: "translateZ(0)",
              WebkitTransform: "translateZ(0)",
            }}
          >
            {item.file_type === "video" ? (
              <video src={item.file_url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
            ) : (
              <img
                src={item.file_url}
                alt={item.title ?? "Gallery image"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  if (layout === "fullwidth") {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="w-full overflow-hidden rounded-xl"
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
                className="w-full h-auto block"
                style={{ maxHeight: "80vh" }}
              />
            ) : (
              <img
                src={item.file_url}
                alt={item.title ?? "Gallery image"}
                className="w-full h-auto block"
                style={{ maxHeight: "80vh", objectFit: "cover" }}
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  // Default: masonry
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
            <video src={item.file_url} autoPlay muted loop playsInline className="w-full h-auto block" />
          ) : (
            <img
              src={item.file_url}
              alt={item.title ?? "Gallery image"}
              className="w-full h-auto block"
              loading="lazy"
            />
          )}
        </div>
      ))}
    </div>
  );
}