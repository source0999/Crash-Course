// ─────────────────────────────────────────
// SECTION: Public Services Page
// WHAT: Fetches services and layout preference from Supabase, renders accordingly.
// WHY: Layout is barber-controlled via admin — public page respects that choice.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────
import { supabase, type DbService } from "@/lib/supabase";
import { allServices } from "@/lib/services";

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
    if (!configResult.error && configResult.data?.value) {
      layout = configResult.data.value as Layout;
    }
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

  if (services.length === 0) {
    services = allServices.map(mapFallback);
  }

  // WHY: Universal centering ensures accessibility on long pages. Explicit save buttons and currency symbols provide professional UI feedback.
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
    <main className="min-h-screen bg-[#0f1e2e] pt-28 pb-20 px-4 md:px-8 lg:px-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-brand-accent mb-3">
            Fades & Facials
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            Services
          </h1>
        </div>

        {featuredServices.length > 0 && (
          // WHY: Rule of 5 and Image Guards preserve luxury layout rhythm. Grouped selection and GIF support enable high-fidelity curation.
          <section className="mb-12">
            <p className="mb-3 text-xs tracking-[0.3em] uppercase text-brand-accent">Featured Hero</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {featuredServices.map((service) => (
                <article key={`featured-hero-${service.id}`} className="relative overflow-hidden rounded-xl border border-white/10 bg-black/30">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={`${service.name} featured media`}
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <div className="h-56 w-full bg-white/5" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 p-4">
                    <p className="text-sm font-semibold text-white">{service.name}</p>
                    <p className="text-xs text-brand-accent">{service.category}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Categories */}
        <div className="flex flex-col gap-12">
          {categories.map((cat) => {
            const catServices = services.filter((s) => s.category === cat);
            return (
              <div key={cat}>
                <h2 className="text-xl font-bold text-white mb-6 pb-2 border-b border-white/10">
                  {cat}
                </h2>

                {/* Cards layout */}
                {layout === "cards" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {catServices.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-xl border border-white/10 bg-white/5 p-5"
                      >
                        {s.image && (
                          <img
                            src={s.image}
                            alt={`${s.name} service image`}
                            className="mb-3 h-40 w-full rounded-lg object-cover border border-white/10"
                          />
                        )}
                        <h3 className="text-white font-semibold text-lg mb-1">
                          {s.name}
                        </h3>
                        <p className="text-brand-accent font-bold text-base mb-2">
                          {s.price}
                        </p>
                        {s.description && (
                          <p className="text-white/50 text-sm">{s.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* List layout */}
                {layout === "list" && (
                  <div className="flex flex-col gap-2">
                    {catServices.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4"
                      >
                        <div className="flex items-center gap-3">
                          {s.image && (
                            <img
                              src={s.image}
                              alt={`${s.name} service image`}
                              className="h-16 w-16 rounded-lg object-cover border border-white/10"
                            />
                          )}
                          <div>
                            <p className="text-white font-medium">{s.name}</p>
                            {s.description && (
                              <p className="text-white/40 text-sm mt-0.5">
                                {s.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-brand-accent font-bold text-base ml-4 shrink-0">
                          {s.price}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Minimal layout */}
                {layout === "minimal" && (
                  <div>
                    {catServices.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between border-b border-white/10 py-3"
                      >
                        <p className="text-white">{s.name}</p>
                        <p className="text-brand-accent font-bold ml-4 shrink-0">
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

        {/* Book CTA */}
        <div className="mt-16 text-center">
          <a
            href="/booking"
            className="inline-block rounded-lg bg-brand-accent px-8 py-4 text-black font-semibold text-base hover:opacity-90 transition touch-manipulation min-h-[44px]"
          >
            Book an Appointment
          </a>
        </div>
      </div>
    </main>
  );
}
