// ─────────────────────────────────────────
// SECTION: Gallery Page
// WHAT: Async Server Component — fetches all active gallery items from Supabase and passes them to GalleryGrid.
// WHY: Server-side fetch keeps credentials off the client and enables ISR caching.
// PHASE 4: No changes needed — already live Supabase data.
// ─────────────────────────────────────────

import { supabase, type DbGalleryItem } from "@/lib/supabase";
import GalleryGrid from "./GalleryGrid";

export const revalidate = 60; // ISR: re-fetch at most once per minute

export default async function GalleryPage() {
  let items: DbGalleryItem[] = [];

  try {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    items = data ?? [];
  } catch (err) {
    console.error("[Gallery] Supabase fetch failed:", err);
  }

  return (
    <main className="min-h-screen bg-[#0f1e2e] px-4 pt-28 pb-20 md:px-8 lg:px-12">
      {/* ── Page Header ── */}
      <div className="mb-12 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-brand-accent">
          Fades & Facials
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
          The Work
        </h1>
      </div>

      {/* ── Masonry Grid ── */}
      <GalleryGrid items={items} />
    </main>
  );
}
