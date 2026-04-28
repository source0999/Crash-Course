/** @file app/services/page.tsx */

// ─────────────────────────────────────────
// SECTION: Public Services Page
// WHAT: Fetches services and layout preference from Supabase; passes to ServicesBody for rendering.
// WHY: Data fetching stays in this RSC; all Framer Motion animations live in ServicesBody
//   (the client boundary) — keeps server payload lean and hydration minimal.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────

import { supabase, type DbService } from "@/lib/supabase";
import { allServices } from "@/lib/services";
import ServicesBody from "./ServicesBody";

export const revalidate = 60;

type Layout = "cards" | "list" | "minimal";

function mapFallback(s: (typeof allServices)[0]): DbService {
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    price: s.price,
    description: s.description,
    image: s.image,
    is_active: true,
    sort_order: s.id,
    created_at: new Date(0).toISOString(),
  };
}

export default async function ServicesPage() {
  let services: DbService[] = [];
  let layout: Layout = "cards";
  let categoryOrder: string[] = [];
  let featuredServiceIds: number[] = [];

  try {
    const [servicesResult, configResult, categoryOrderResult, featuredConfigResult] = await Promise.all([
      supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("site_config")
        .select("value")
        .eq("key", "services_layout")
        .single(),
      supabase
        .from("site_config")
        .select("value")
        .eq("key", "category_order")
        .single(),
      supabase
        .from("site_config")
        .select("value")
        .eq("key", "featured_services")
        .single(),
    ]);

    if (!servicesResult.error) services = servicesResult.data ?? [];
    if (!configResult.error && configResult.data?.value)
      layout = configResult.data.value as Layout;
    if (!categoryOrderResult.error && categoryOrderResult.data?.value) {
      const parsedOrder = JSON.parse(categoryOrderResult.data.value) as string[];
      categoryOrder = [...new Set(parsedOrder)];
    }
    if (!featuredConfigResult.error && featuredConfigResult.data?.value) {
      const parsedFeaturedIds = JSON.parse(featuredConfigResult.data.value) as number[];
      featuredServiceIds = parsedFeaturedIds;
    }
  } catch (err) {
    console.error("[Services] Fetch failed:", err);
  }

  if (services.length === 0) services = allServices.map(mapFallback);

  const categoryNames = [...new Set(services.map((s) => s.category))];
  const categories = [
    ...categoryOrder.filter((name) => categoryNames.includes(name)),
    ...categoryNames.filter((name) => !categoryOrder.includes(name)),
  ];
  const featuredServices =
    featuredServiceIds.length > 0
      ? featuredServiceIds
          .map((id) => services.find((service) => service.id === id))
          .filter((service): service is DbService => Boolean(service))
          .slice(0, 3)
      : services.filter((service) => Boolean(service.is_premium)).slice(0, 3);

  return (
    <main className="min-h-screen pt-28 pb-24 px-4 md:px-8 lg:px-12 bg-theme-1 text-theme-4">
      <div className="max-w-5xl mx-auto">

        {/* ── Page header — stays in RSC for zero hydration overhead ── */}
        <div className="mb-14 text-center">
          <p
            className="text-[11px] uppercase tracking-[0.35em] mb-3"
            style={{ color: "var(--theme-accent)", fontFamily: "var(--font-sans)" }}
          >
            Fades &amp; Facials · Suwanee, GA
          </p>
          <h1
            className="font-bold tracking-tight text-theme-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              lineHeight: 1.05,
            }}
          >
            Services
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

        {/* WHY: ServicesBody is the client boundary for Framer Motion staggered entrance.
            All business data was resolved above in the RSC — zero extra fetches client-side. */}
        <ServicesBody
          services={services}
          categories={categories}
          layout={layout}
          featuredServices={featuredServices}
        />
      </div>
    </main>
  );
}
