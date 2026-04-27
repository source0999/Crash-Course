/** @file app/gallery/page.tsx */

// ─────────────────────────────────────────
// SECTION: Gallery Page
// WHAT: Fetches gallery items and layout preference from Supabase; renders GalleryGrid.
// WHY: Layout is barber-controlled via admin — public page respects that choice.
//   No category fields — clean visual-first portfolio display.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────

import { supabase, type DbGalleryItem } from "@/lib/supabase";
import GalleryGrid from "./GalleryGrid";

export const revalidate = 30;

export default async function GalleryPage() {
  let items: DbGalleryItem[] = [];
  let layout: "masonry" | "grid" | "fullwidth" = "masonry";

  try {
    const [galleryResult, configResult] = await Promise.all([
      supabase
        .from("gallery")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("site_config")
        .select("value")
        .eq("key", "gallery_layout")
        .single(),
    ]);
    if (!galleryResult.error) items = galleryResult.data ?? [];
    if (!configResult.error && configResult.data?.value)
      layout = configResult.data.value as "masonry" | "grid" | "fullwidth";
  } catch (err) {
    console.error("[Gallery] Fetch failed:", err);
  }

  return (
    <main
      className="min-h-screen pt-28 pb-24 px-4 md:px-8 lg:px-12"
      style={{ background: "var(--theme-bg)" }}
    >
      {/* ── Page header ── */}
      <div className="mb-12 text-center">
        <p
          className="text-[11px] uppercase tracking-[0.35em] mb-3"
          style={{ color: "var(--theme-accent)", fontFamily: "var(--font-sans)" }}
        >
          Fades &amp; Facials
        </p>
        <h1
          className="font-bold tracking-tight"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--theme-text)",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            lineHeight: 1.05,
          }}
        >
          The Work
        </h1>
        <div
          className="mx-auto mt-5"
          style={{
            width: "48px",
            height: "2px",
            background: "var(--theme-accent)",
            borderRadius: "1px",
          }}
        />
      </div>

      <GalleryGrid items={items} layout={layout} />
    </main>
  );
}
