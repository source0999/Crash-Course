// ─────────────────────────────────────────
// SECTION: Shared Utilities
// WHAT: Types and functions shared across layout components and the RSC pipeline.
// WHY: Single definition prevents drift — isVideoMedia logic is identical everywhere.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────

import type { DbService } from "@/lib/supabase";

/** Union of all valid layout identifiers. TypeScript catches typos at build time. */
export type Layout = "cinematic" | "grid" | "editorial";

/** A resolved featured slot: config mediaUrl paired with its live DbService row. */
export type FeaturedPair = {
  serviceId: number;
  mediaUrl: string | null;
  service: DbService;
};

/** Props contract for the three pure menu-list layout components. */
export type LayoutProps = { allServices: DbService[] };

// WHY: Centralises the video-vs-image branch — .mp4 extension OR media_type='video'
// both qualify. Called across FeaturedServicesSection and layout components so
// the logic is never duplicated.
export function isVideoMedia(url: string | null, mediaType?: string | null): boolean {
  if (mediaType === "video") return true;
  return /\.mp4(\?|$)/i.test(url ?? "");
}
