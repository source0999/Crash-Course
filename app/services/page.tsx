import { allServices, type Service } from "@/lib/services";
import { supabase, type DbService } from "@/lib/supabase";

// ─────────────────────────────────────────
// SECTION: Category Derivation
// WHAT: Builds the ordered list of unique service categories from the shared service data.
// WHY: Deriving categories prevents duplicated category constants and stays synced with catalog changes.
// PHASE 4: Keep this logic, but derive from database results returned by API/server actions.
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// SECTION: Services Page Rendering
// WHAT: Renders category sections with responsive service card grids and booking CTAs.
// WHY: Grouping by category improves scanning while cards keep details and actions consistent.
// PHASE 4: Swap allServices for database-fetched rows without changing card layout components.
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// SECTION: Static → DB shape adapter
// WHAT: Maps each `Service` from lib/services.ts into a `DbService` object.
// WHY: Fallback rows must match the same shape as Supabase so one render path can use either source.
// NOTE: `created_at` uses epoch ISO string only as a placeholder — real rows from DB carry true timestamps.
// ─────────────────────────────────────────
function mapStaticServiceToDb(s: Service): DbService {
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    price: s.price,
    description: s.description,
    image: s.image,
    is_active: true,
    created_at: new Date(0).toISOString(),
  };
}

// ─────────────────────────────────────────
// SECTION: ServicesPage (async Server Component)
// WHAT: Loads active services from Supabase, or falls back to the hardcoded catalog.
// WHY: Server fetch keeps secrets off the client; try/catch + empty check covers network, RLS, and empty tables.
// FLOW: (1) query → (2) on failure or empty, substitute allServices → (3) derive categories → (4) render grid.
// ─────────────────────────────────────────
export default async function ServicesPage() {
  // Accumulator for rows we will render (either from DB or fallback).
  let services: DbService[] = [];

  try {
    // Chain: table "services", all columns, only active rows, stable sort by category then id.
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("category", { ascending: true })
      .order("id", { ascending: true });

    // Supabase returns { error } instead of throwing — we normalize by throwing so one catch handles everything.
    if (error) throw error;
    services = data ?? [];
  } catch (err) {
    // Log for dev overlay / Vercel logs. Some error shapes (e.g. Postgrest) stringify as "{}" in the console.
    console.error("[ServicesPage] Supabase fetch failed, using fallback:", err);
  }

  // After a failed fetch or an empty table, `services` is still [] — substitute static catalog so the page never blanks.
  if (services.length === 0) {
    services = allServices.map(mapStaticServiceToDb);
  }

  // Unique category labels in first-seen order (depends on current sort of `services`).
  const serviceCategories = Array.from(
    new Set(services.map((s) => s.category)),
  );

  return (
    <main className="bg-[#081220] px-6 py-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        {serviceCategories.map((category) => {
          // All services belonging to this section’s category (same array, filtered per heading).
          const categoryServices = services.filter(
            (service) => service.category === category,
          );

          return (
            <section key={category} className="mb-14 last:mb-0">
              <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
                {category}
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categoryServices.map((service) => (
                  <article
                    key={service.id}
                    className="overflow-hidden rounded-xl bg-[#0a1628]"
                  >
                    {/* DB allows null image — fallback path keeps cards valid if a row is missing media. */}
                    <img
                      src={service.image ?? "/images/services/fade.gif"}
                      alt={service.name}
                      className="h-52 w-full object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-2xl font-semibold text-white">
                        {service.name}
                      </h3>
                      <p className="mt-2 text-lg font-semibold text-[#c9a96e]">
                        ${service.price}
                      </p>
                      {/* description is string | null on DbService — empty string avoids rendering "null" text. */}
                      <p className="mt-3 text-base text-slate-200">
                        {service.description ?? ""}
                      </p>
                      <a
                        href="/booking"
                        className="mt-6 inline-block rounded-md bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-400"
                      >
                        Book Now
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
