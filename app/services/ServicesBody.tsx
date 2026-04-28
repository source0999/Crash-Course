"use client";

// ─────────────────────────────────────────
// SECTION: ServicesBody
// WHAT: Featured + category grids with scroll reveals, surface-paired type, motion CTAs.
// WHY: theme-text + theme-surface stay paired per palette; Book uses theme-1 on theme-4.
// PHASE 4: Data from RSC parent only.
// ─────────────────────────────────────────

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { DbService } from "@/lib/supabase";
import { formatServicePrice } from "@/lib/utils";
import RevealOnScroll from "@/components/RevealOnScroll";

type Layout = "cards" | "list" | "minimal";

type Props = {
  services: DbService[];
  categories: string[];
  layout: Layout;
  featuredServices: DbService[];
};

const MotionLink = motion(Link);

const BOOK_CTA_CLASS =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 text-[11px] uppercase tracking-[0.12em] font-semibold shadow-md transition-colors duration-200 touch-manipulation min-h-[44px] bg-theme-4 text-theme-1 hover:bg-theme-5 hover:text-black";

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: Math.min(i * 0.06, 0.5),
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const featuredVariants = {
  hidden: { opacity: 0, y: 50 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.1,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

function BookNowLink({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <MotionLink
      href="/book"
      className={BOOK_CTA_CLASS}
      style={{ fontFamily: "var(--font-sans)" }}
      whileHover={reducedMotion ? undefined : { scale: 1.05 }}
      whileTap={reducedMotion ? undefined : { scale: 0.95 }}
      onTouchEnd={(e) => {
        e.preventDefault();
      }}
    >
      Book Now
    </MotionLink>
  );
}

export default function ServicesBody({ services, categories, layout, featuredServices }: Props) {
  const reduced = useReducedMotion();

  return (
    <>
      {featuredServices.length > 0 && (
        <RevealOnScroll as="section" className="mb-14">
          <p
            className="text-[10px] uppercase tracking-[0.35em] mb-4"
            style={{ color: "var(--theme-accent)", fontFamily: "var(--font-sans)" }}
          >
            Featured
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredServices.map((service, i) => (
              <motion.article
                key={`featured-${service.id}`}
                custom={i}
                variants={reduced ? {} : featuredVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
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
                  <div className="absolute inset-0" style={{ background: "var(--theme-surface)" }} />
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, color-mix(in srgb, black 82%, transparent) 0%, transparent 55%)",
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <p className="text-sm font-semibold mb-0.5" style={{ fontFamily: "var(--font-display)" }}>
                    {service.name}
                  </p>
                  <p className="text-xs text-white/85" style={{ fontFamily: "var(--font-sans)" }}>
                    {service.category}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </RevealOnScroll>
      )}

      <div className="flex flex-col gap-14">
        {categories.map((cat) => {
          const catServices = services.filter((s) => s.category === cat);
          return (
            <RevealOnScroll key={cat} as="section">
              <div
                className="flex items-center gap-4 mb-7 pb-3"
                style={{ borderBottom: "1px solid color-mix(in srgb, var(--theme-4) 10%, transparent)" }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: "5px",
                    height: "28px",
                    borderRadius: "99px",
                    overflow: "hidden",
                    flexShrink: 0,
                    backgroundImage:
                      "repeating-linear-gradient(-45deg, var(--theme-accent) 0px, var(--theme-accent) 4px, color-mix(in srgb, var(--theme-4) 12%, transparent) 4px, color-mix(in srgb, var(--theme-4) 12%, transparent) 8px)",
                    backgroundSize: "100% 40px",
                    animation: "barber-pole 1.2s linear infinite",
                  }}
                />
                <h2 className="text-xl font-bold text-theme-4" style={{ fontFamily: "var(--font-display)" }}>
                  {cat}
                </h2>
              </div>

              {layout === "cards" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {catServices.map((s, i) => (
                    <motion.div
                      key={s.id}
                      custom={i}
                      variants={reduced ? {} : cardVariants}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, margin: "-100px" }}
                      className="rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-xl"
                      style={{
                        background: "var(--theme-surface)",
                        border: "1px solid color-mix(in srgb, var(--theme-text) 8%, transparent)",
                        boxShadow: "0 4px 24px color-mix(in srgb, var(--theme-bg) 30%, transparent)",
                      }}
                    >
                      {s.image && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={s.image}
                            alt={s.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
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
                        <p className="font-bold text-xl mb-3" style={{ fontFamily: "var(--font-sans)", color: "var(--theme-text)" }}>
                          {formatServicePrice(s.price)}
                        </p>
                        {s.description && (
                          <p
                            className="text-sm leading-relaxed mb-4"
                            style={{
                              color: "color-mix(in srgb, var(--theme-text) 52%, transparent)",
                              fontFamily: "var(--font-sans)",
                              fontWeight: 300,
                            }}
                          >
                            {s.description}
                          </p>
                        )}
                        <BookNowLink reducedMotion={Boolean(reduced)} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {layout === "list" && (
                <div className="flex flex-col gap-2">
                  {catServices.map((s, i) => (
                    <motion.div
                      key={s.id}
                      custom={i}
                      variants={reduced ? {} : cardVariants}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, margin: "-100px" }}
                      className="flex items-center justify-between rounded-xl px-5 py-4"
                      style={{
                        background: "var(--theme-surface)",
                        border: "1px solid color-mix(in srgb, var(--theme-text) 8%, transparent)",
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
                                color: "color-mix(in srgb, var(--theme-text) 48%, transparent)",
                                fontFamily: "var(--font-sans)",
                              }}
                            >
                              {s.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4 shrink-0">
                        <p className="font-bold text-xl" style={{ fontFamily: "var(--font-sans)", color: "var(--theme-text)" }}>
                          {formatServicePrice(s.price)}
                        </p>
                        <BookNowLink reducedMotion={Boolean(reduced)} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {layout === "minimal" && (
                <div>
                  {catServices.map((s, i) => (
                    <motion.div
                      key={s.id}
                      custom={i}
                      variants={reduced ? {} : cardVariants}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, margin: "-100px" }}
                      className="flex items-center justify-between py-4"
                      style={{ borderBottom: "1px solid color-mix(in srgb, var(--theme-4) 10%, transparent)" }}
                    >
                      <p style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}>
                        {s.name}
                      </p>
                      <div className="flex items-center gap-4 ml-4 shrink-0">
                        <p className="font-bold text-xl" style={{ fontFamily: "var(--font-sans)", color: "var(--theme-text)" }}>
                          {formatServicePrice(s.price)}
                        </p>
                        <BookNowLink reducedMotion={Boolean(reduced)} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </RevealOnScroll>
          );
        })}
      </div>
    </>
  );
}
