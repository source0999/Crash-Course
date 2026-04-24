type Service = {
  id: number;
  name: string;
  description: string;
  gif: string;
  reversed: boolean;
};

const services: Service[] = [
  {
    id: 1,
    name: "Fades",
    description: "Clean, precise fades tailored to your style.",
    gif: "/images/services/fade.gif",
    reversed: false,
  },
  {
    id: 2,
    name: "Facials",
    description: "Skin treatments that refresh and restore.",
    gif: "/images/services/facial.gif",
    reversed: true,
  },
  {
    id: 3,
    name: "Straight Razor Shave",
    description: "A classic hot towel shave experience.",
    gif: "/images/services/barbergif1.gif",
    reversed: false,
  },
];

export default function Home() {
  return (
    <>
      <section
        className="relative flex min-h-screen items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/images/lele1.gif')" }}
      >
        <div className="absolute inset-0 z-0 bg-black/50" />

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

      {services.map((service, index) => (
        <section
          key={service.id}
          className={`flex w-full flex-col ${
            service.reversed ? "md:flex-row-reverse" : "md:flex-row"
          } ${index % 2 === 0 ? "bg-[#0f1e2e]" : "bg-[#0a1628]"}`}
        >
          <div className="w-full md:w-1/2">
            <img
              src={service.gif}
              alt={service.name}
              className="h-72 w-full object-cover md:h-full"
            />
          </div>
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