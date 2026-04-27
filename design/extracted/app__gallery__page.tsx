// ─────────────────────────────────────────
// SECTION: Gallery Page
// WHAT: Fetches gallery items AND layout preference from Supabase, passes both to GalleryGrid.
// WHY: Layout is barber-controlled via admin — public page must respect that choice.
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
      supabase.from("site_config").select("value").eq("key", "gallery_layout").single(),
    ]);
    if (!galleryResult.error) items = galleryResult.data ?? [];
    if (!configResult.error && configResult.data?.value) {
      layout = configResult.data.value as "masonry" | "grid" | "fullwidth";
    }
  } catch (err) {
    console.error("[Gallery] Fetch failed:", err);
  }

  return (
    <main className="min-h-screen bg-[#0f1e2e] pt-28 pb-20 px-4 md:px-8 lg:px-12">
      <div className="mb-12 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-brand-accent mb-3">Fades & Facials</p>
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">The Work</h1>
      </div>
      <GalleryGrid items={items} layout={layout} />
    </main>
  );
}