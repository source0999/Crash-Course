/**
 * @file app/page.tsx
 *
 * A+ RSC Refactor. Pure Server Component. All data fetching happens here.
 * Zero client-side useEffect. Zero hydration mismatch. Zero CLS on mobile.
 * Data is passed down to LayoutOrchestrator (the explicit client boundary).
 *
 * Agency win: change active_layout/global_hero_url in Supabase → instant
 * server-side re-render for every visitor on next request. No client state.
 *
 * Render order (always):
 *   1. GlobalHero + HeroTextReveal — media RSC; copy motion client
 *   2. LayoutOrchestrator — RevealOnScroll wraps featured + menu layout bands
 *   3. BookNowPill — fixed floating CTA (accent theme-5)
 *   4. VisitUsSection — RevealOnScroll wrap in this file; footer from root layout
 */

import { createServerSupabaseClient } from "@/lib/supabase";
import type { DbService } from "@/lib/supabase";
import { isVideoMedia, type Layout, type FeaturedPair } from "@/lib/utils";
import LayoutOrchestrator from "@/components/layouts/LayoutOrchestrator";
import BookNowPill from "@/components/BookNowPill";
import VisitUsSection from "@/components/VisitUsSection";
import HeroTextReveal from "@/components/HeroTextReveal";
import RevealOnScroll from "@/components/RevealOnScroll";

const DEFAULT_GLOBAL_HERO_URL =
  "https://raw.githubusercontent.com/source0999/Crash-Course/main/public/images/lele1.gif";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  const [servicesRes, featuredRes, configRes] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("site_config")
      .select("value")
      .eq("key", "featured_services")
      .single(),
    supabase
      .from("site_config")
      .select("key, value")
      .in("key", ["active_layout", "global_hero_url"]),
  ]);

  const allServices: DbService[] = servicesRes.data ?? [];

  // WHY: Featured pairs resolved server-side — no client computation, no
  // loading state, no hydration mismatch between server and client renders.
  let featuredPairs: FeaturedPair[] = [];
  if (featuredRes.data?.value) {
    try {
      const rawPairs = JSON.parse(featuredRes.data.value) as Array<
        number | null | { serviceId: number | null; mediaUrl: string | null }
      >;
      const serviceMap = new Map(allServices.map((s) => [s.id, s]));
      featuredPairs = [0, 1, 2].flatMap((index) => {
        const row = rawPairs[index];
        const serviceId = typeof row === "number" ? row : (row?.serviceId ?? null);
        const mediaUrl =
          typeof row === "object" && row !== null ? (row.mediaUrl ?? null) : null;
        if (serviceId === null) return [];
        const service = serviceMap.get(serviceId);
        if (!service) return [];
        return [{ serviceId, mediaUrl, service }];
      });
    } catch (e) {
      // Graceful degradation — featuredPairs stays empty, page renders without featured section
    }
  }

  const activeLayoutRaw = configRes.data?.find((r) => r.key === "active_layout")?.value;
  const activeLayout: Layout =
    activeLayoutRaw === "cinematic" || activeLayoutRaw === "grid" || activeLayoutRaw === "editorial"
      ? activeLayoutRaw
      : "cinematic";

  const globalHeroUrl =
    configRes.data?.find((r) => r.key === "global_hero_url")?.value ?? DEFAULT_GLOBAL_HERO_URL;

  return (
    <>
      {/* ── Global Identity Hero — server-rendered, zero flash ──
          WHY: Rendered in the RSC so the hero image/video is in the initial HTML
          payload — no layout shift, no GIF restart on hydration. */}
      <section className="relative w-full h-[100svh] overflow-hidden bg-theme-4 text-theme-1">
        {isVideoMedia(globalHeroUrl) ? (
          <video
            src={globalHeroUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center 15%" }}
          />
        ) : (
          <img
            src={globalHeroUrl}
            alt="Fades and Facials atmosphere"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center 15%" }}
          />
        )}
        {/* Cinematic vignette — theme-4 mixes only (no hex); keeps copy legible over media. */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in srgb, var(--theme-4) 55%, transparent) 0%, color-mix(in srgb, var(--theme-4) 10%, transparent) 40%, color-mix(in srgb, var(--theme-4) 75%, transparent) 85%, color-mix(in srgb, var(--theme-4) 92%, transparent) 100%)",
          }}
        />
        {/* WHY: HeroTextReveal is the client boundary — it adds staggered Framer Motion
            entrance while the media + vignette stay server-rendered for zero CLS. */}
        <HeroTextReveal />
      </section>

      {/* ── LayoutOrchestrator — explicit client boundary ──
          Receives fully-resolved server data; owns FeaturedServicesSection
          + the active layout component. No data fetching inside. */}
      <LayoutOrchestrator
        allServices={allServices}
        featuredPairs={featuredPairs}
        activeLayout={activeLayout}
      />

      <BookNowPill />

      <div className="w-full bg-theme-1 text-theme-4">
        <RevealOnScroll as="section" data-home-band="visit-wrap">
          <VisitUsSection />
        </RevealOnScroll>
      </div>
    </>
  );
}
