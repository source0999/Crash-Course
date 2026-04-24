import { allServices } from "@/lib/services";

// ─────────────────────────────────────────
// SECTION: Homepage Service Preview Selection
// WHAT: Picks three featured services and adds alternating layout direction metadata.
// WHY: Keeps the homepage lightweight while reusing the shared service catalog.
// PHASE 4: Keep this selector logic, but source allServices from database-backed fetches.
// ─────────────────────────────────────────
const previewServices = allServices
  .filter((s) => [1, 6, 4].includes(s.id))
  .map((service, index) => ({ ...service, reversed: index % 2 !== 0 }));

// ─────────────────────────────────────────
// SECTION: Home Page Composition
// WHAT: Renders the hero section followed by alternating featured service cards.
// WHY: Combines brand-first messaging with quick access to key bookable services.
// PHASE 4: Keep this UI structure and feed it with live service records from Supabase.
// ─────────────────────────────────────────
export default function Home() {
  return (
    <>
      {/* Full-screen hero with animated GIF background */}
      <section
        className="relative flex min-h-screen items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/images/lele1.gif')" }}
      >
        {/* Dark overlay for readability over the GIF */}
        <div className="absolute inset-0 z-0 bg-black/50" />

        {/* Foreground hero content layered above overlay */}
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Fades &amp; Facials
          </h1>
          <p className="mt-4 text-lg text-gray-100 sm:text-xl">
            Premium cuts, clean fades, and self-care that hits different.
          </p>
          <button
            type="button"
            className="mt-8 rounded-md bg-amber-500 px-7 py-3 text-base font-semibold text-black shadow-lg transition hover:bg-amber-400"
          >
            Book Now
          </button>
        </div>
      </section>

      {/* Services preview cards rendered from shared data with alternating layout */}
      {previewServices.map((service, index) => (
        <section
          key={service.id}
          className={`flex w-full flex-col ${
            service.reversed ? "md:flex-row-reverse" : "md:flex-row"
          } ${index % 2 === 0 ? "bg-[#0f1e2e]" : "bg-[#0a1628]"}`}
        >
          {/* GIF column */}
          <div className="w-full md:w-1/2">
            <img
              src={service.image}
              alt={service.name}
              className="h-72 w-full object-cover md:h-full"
            />
          </div>
          {/* Text and CTA column */}
          <div className="flex w-full items-center px-8 py-12 md:w-1/2 md:px-16">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                {service.name}
              </h2>
              <p className="mt-4 text-lg font-light text-slate-200">
                {service.description}
              </p>
              <a
                href="/booking"
                className="mt-8 inline-block rounded-md bg-amber-500 px-6 py-3 text-base font-semibold text-black transition hover:bg-amber-400"
              >
                Book This Service
              </a>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}