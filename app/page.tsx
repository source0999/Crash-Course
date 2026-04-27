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
 *   1. GlobalHero — server-rendered from site_config.global_hero_url, zero flash
 *   2. LayoutOrchestrator — client boundary → FeaturedServicesSection + active layout
 *   3. BookNowPill — fixed floating CTA
 *   4. VisitUsSection + footer
 */

import { createServerSupabaseClient } from "@/lib/supabase";
import type { DbService } from "@/lib/supabase";
import { isVideoMedia, type Layout, type FeaturedPair } from "@/lib/utils";
import LayoutOrchestrator from "@/components/layouts/LayoutOrchestrator";
import BookNowPill from "@/components/BookNowPill";
import VisitUsSection from "@/components/VisitUsSection";
import HeroDebugProbe from "@/components/HeroDebugProbe";

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
      <section className="relative w-full h-[100svh] overflow-hidden">
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
        {/* Cinematic vignette: dark at top → transparent → dark at bottom */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(11,19,43,0.55) 0%, rgba(11,19,43,0.1) 40%, rgba(11,19,43,0.75) 85%, rgba(11,19,43,0.95) 100%)",
          }}
        />
        <div
          data-hero-copy-container
          className="relative z-20 flex flex-col items-center justify-center h-full text-center px-6 pt-20"
        >
          <p
            data-hero-subheading
            className="uppercase tracking-[0.35em] text-xs mb-5"
            style={{ color: "rgba(249,247,242,0.6)", fontFamily: "'Manrope', sans-serif" }}
          >
            Luxury Grooming & Spa · Cumming, Georgia
          </p>
          <div
            aria-hidden="true"
            className="mb-6"
            style={{
              width: "7px",
              height: "38px",
              borderRadius: "99px",
              overflow: "hidden",
              flexShrink: 0,
              backgroundImage:
                "repeating-linear-gradient(-45deg, var(--theme-accent) 0px, var(--theme-accent) 5px, color-mix(in srgb, #F9F7F2 18%, transparent) 5px, color-mix(in srgb, #F9F7F2 18%, transparent) 10px)",
              backgroundSize: "100% 40px",
              animation: "barber-pole 3.4s linear infinite",
            }}
          />
          <h1
            data-hero-main-heading
            className="font-serif font-light tracking-[0.03em] mb-6 leading-[0.92] max-w-4xl mx-auto"
            style={{
              fontFamily: "'Bodoni Moda', serif",
              fontSize: "clamp(2rem, 6.5vw, 4.75rem)",
              color: "#F9F7F2",
            }}
          >
            It&apos;s more than a haircut.
            <br />
            <em>It&apos;s an experience.</em>
          </h1>
          <HeroDebugProbe runId="initial" />
        </div>
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

      <div className="w-full" style={{ background: "var(--theme-surface)" }}>
        <VisitUsSection />
      </div>
    </>
  );
}
