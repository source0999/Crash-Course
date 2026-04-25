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

  try {
    const [servicesResult, configResult] = await Promise.all([
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
    ]);

    if (!servicesResult.error) services = servicesResult.data ?? [];
    if (!configResult.error && configResult.data?.value) {
      layout = configResult.data.value as Layout;
    }
  } catch (err) {
    console.error("[Services] Fetch failed:", err);
  }

  if (services.length === 0) {
    services = allServices.map(mapFallback);
  }

  const categories = [...new Set(services.map((s) => s.category))];

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
                        <div>
                          <p className="text-white font-medium">{s.name}</p>
                          {s.description && (
                            <p className="text-white/40 text-sm mt-0.5">
                              {s.description}
                            </p>
                          )}
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
