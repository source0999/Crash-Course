import { allServices } from "@/lib/services";

// ─────────────────────────────────────────
// SECTION: Category Derivation
// WHAT: Builds the ordered list of unique service categories from the shared service data.
// WHY: Deriving categories prevents duplicated category constants and stays synced with catalog changes.
// PHASE 4: Keep this logic, but derive from database results returned by API/server actions.
// ─────────────────────────────────────────
const serviceCategories = Array.from(new Set(allServices.map((s) => s.category)));

// ─────────────────────────────────────────
// SECTION: Services Page Rendering
// WHAT: Renders category sections with responsive service card grids and booking CTAs.
// WHY: Grouping by category improves scanning while cards keep details and actions consistent.
// PHASE 4: Swap allServices for database-fetched rows without changing card layout components.
// ─────────────────────────────────────────
export default function ServicesPage() {
  return (
    <main className="bg-[#081220] px-6 py-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        {serviceCategories.map((category) => {
          const categoryServices = allServices.filter(
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
                    <img
                      src={service.image}
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
                      <p className="mt-3 text-base text-slate-200">
                        {service.description}
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