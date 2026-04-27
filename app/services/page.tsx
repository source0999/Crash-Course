/** @file app/services/page.tsx */

// ─────────────────────────────────────────
// SECTION: Public Services Page
// WHAT: Fetches services and layout preference from Supabase, renders premium cards.
// WHY: Layout is barber-controlled via admin — public page respects that choice.
//   Cards use warm eggshell surface for eye comfort; no blinding whites.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────

import { supabase, type DbService } from "@/lib/supabase";
import { allServices } from "@/lib/services";
import Link from "next/link";

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
    <main
      className="min-h-screen pt-28 pb-24 px-4 md:px-8 lg:px-12"
      style={{ background: "var(--theme-bg)" }}
    >
      <div className="max-w-5xl mx-auto">

        {/* ── Page header ── */}
        <div className="mb-14 text-center">
          <p
            className="text-[11px] uppercase tracking-[0.35em] mb-3"
            style={{ color: "var(--theme-accent)", fontFamily: "var(--font-sans)" }}
          >
            Fades &amp; Facials · Suwanee, GA
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

        {/* ── Featured hero cards ── */}
        {featuredServices.length > 0 && (
          <section className="mb-14">
            <p
              className="text-[10px] uppercase tracking-[0.35em] mb-4"
              style={{ color: "var(--theme-accent)", fontFamily: "var(--font-sans)" }}
            >
              Featured
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredServices.map((service) => (
                <article
                  key={`featured-${service.id}`}
                  className="relative overflow-hidden rounded-2xl"
                  style={{ minHeight: "220px" }}
                >
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{ background: "var(--theme-surface)" }}
                    />
                  )}
                  {/* Gradient overlay — always dark for text readability on any image */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, color-mix(in srgb, var(--theme-bg) 80%, transparent) 0%, transparent 60%)",
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p
                      className="text-sm font-semibold mb-0.5"
                      style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}
                    >
                      {service.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--theme-accent)", fontFamily: "var(--font-sans)" }}
                    >
                      {service.category}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── Service categories ── */}
        <div className="flex flex-col gap-14">
          {categories.map((cat) => {
            const catServices = services.filter((s) => s.category === cat);
            return (
              <div key={cat}>
                {/* Category heading */}
                <div
                  className="flex items-center gap-4 mb-7 pb-3"
                  style={{ borderBottom: "1px solid color-mix(in srgb, var(--theme-text) 8%, transparent)" }}
                >
                  {/* Barber pole mini accent */}
                  <div
                    aria-hidden="true"
                    style={{
                      width: "5px",
                      height: "28px",
                      borderRadius: "99px",
                      overflow: "hidden",
                      flexShrink: 0,
                      backgroundImage:
                        "repeating-linear-gradient(-45deg, var(--theme-accent) 0px, var(--theme-accent) 4px, color-mix(in srgb, var(--theme-text) 8%, transparent) 4px, color-mix(in srgb, var(--theme-text) 8%, transparent) 8px)",
                      backgroundSize: "100% 40px",
                      animation: "barber-pole 1.2s linear infinite",
                    }}
                  />
                  <h2
                    className="text-xl font-bold"
                    style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}
                  >
                    {cat}
                  </h2>
                </div>

                {/* ── Cards layout ── */}
                {layout === "cards" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {catServices.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                        style={{
                          background: "var(--theme-surface)",
                          border: "1px solid color-mix(in srgb, var(--theme-text) 6%, transparent)",
                          boxShadow: "0 4px 24px color-mix(in srgb, var(--theme-bg) 30%, transparent)",
                        }}
                      >
                        {s.image && (
                          <div className="aspect-video overflow-hidden">
                            <img
                              src={s.image}
                              alt={s.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="p-5">
                          <h3
                            className="font-semibold text-lg mb-1"
                            style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}
                          >
                            {s.name}
                          </h3>
                          <p
                            className="font-bold text-base mb-3"
                            style={{ color: "var(--theme-accent)", fontFamily: "var(--font-sans)" }}
                          >
                            {s.price}
                          </p>
                          {s.description && (
                            <p
                              className="text-sm leading-relaxed"
                              style={{
                                color: "color-mix(in srgb, var(--theme-text) 55%, transparent)",
                                fontFamily: "var(--font-sans)",
                                fontWeight: 300,
                              }}
                            >
                              {s.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── List layout ── */}
                {layout === "list" && (
                  <div className="flex flex-col gap-2">
                    {catServices.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-xl px-5 py-4"
                        style={{
                          background: "var(--theme-surface)",
                          border: "1px solid color-mix(in srgb, var(--theme-text) 6%, transparent)",
                        }}
                      >
                        <div className="flex items-center gap-4">
                          {s.image && (
                            <img
                              src={s.image}
                              alt={s.name}
                              className="w-14 h-14 rounded-xl object-cover shrink-0"
                              loading="lazy"
                            />
                          )}
                          <div>
                            <p
                              className="font-medium"
                              style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}
                            >
                              {s.name}
                            </p>
                            {s.description && (
                              <p
                                className="text-sm mt-0.5"
                                style={{
                                  color: "color-mix(in srgb, var(--theme-text) 45%, transparent)",
                                  fontFamily: "var(--font-sans)",
                                }}
                              >
                                {s.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <p
                          className="font-bold text-base ml-4 shrink-0"
                          style={{ color: "var(--theme-accent)", fontFamily: "var(--font-sans)" }}
                        >
                          {s.price}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Minimal layout ── */}
                {layout === "minimal" && (
                  <div>
                    {catServices.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between py-4"
                        style={{ borderBottom: "1px solid color-mix(in srgb, var(--theme-text) 8%, transparent)" }}
                      >
                        <p style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}>
                          {s.name}
                        </p>
                        <p
                          className="font-bold ml-4 shrink-0"
                          style={{ color: "var(--theme-accent)", fontFamily: "var(--font-sans)" }}
                        >
                          {s.price}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Book CTA ── */}
        <div className="mt-20 text-center">
          <Link
            href="/book"
            className="inline-flex items-center justify-center rounded-full px-10 py-4 text-sm uppercase tracking-[0.08em] font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-95 touch-manipulation min-h-[44px]"
            style={{
              background: "var(--theme-accent)",
              color: "var(--theme-bg)",
              fontFamily: "var(--font-sans)",
              boxShadow: "0 8px 32px color-mix(in srgb, var(--theme-accent) 25%, transparent)",
            }}
          >
            Book an Appointment
          </Link>
        </div>
      </div>
    </main>
  );
}
