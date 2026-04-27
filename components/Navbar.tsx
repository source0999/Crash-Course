"use client";

// ─────────────────────────────────────────
// SECTION: Navbar
// WHAT: Fixed top navigation with Drop Out Flip — transparent over hero, solid on scroll.
// WHY: Spring-driven height shrink (90px → 70px) + background fade gives a premium
//   "weighted drop" without backdrop-filter, which silently breaks iOS WebKit.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/gallery",  label: "Gallery"  },
  { href: "/book",     label: "Book Now" },
  { href: "/admin",    label: "Studio"   },
] as const;

export default function Navbar() {
  const pathname    = usePathname();
  const isHomePage  = pathname === "/";
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const mobileMenuVariants = {
    closed: { opacity: 0, y: -20, transition: { staggerChildren: 0.05, when: "afterChildren" as const } },
    open:   { opacity: 1, y:   0, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  };

  const linkVariants = {
    closed: { opacity: 0, x: -20 },
    open:   { opacity: 1, x:   0 },
  };

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [menuOpen]);

  // showSolid: true on all inner pages, or once scrolled past 50px on the home page
  const showSolid = isScrolled || !isHomePage;

  return (
    <motion.nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 z-[9999] overflow-hidden"
      // Drop Out: spring height shrink gives the premium "snap" feel
      animate={{ height: isScrolled ? "70px" : "90px" }}
      transition={{ type: "spring", stiffness: 220, damping: 32 }}
      style={{
        // Text flips from warm-white over the dark hero to --theme-text on scroll
        color:      showSolid ? "var(--theme-text)" : "var(--color-alabaster)",
        transition: "color 0.3s ease-in-out",
      }}
    >
      {/* ── Solid background layer — spring opacity, no backdrop-filter (iOS safe) ── */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--theme-bg)" }}
        animate={{ opacity: showSolid ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 32 }}
      />

      {/* ── Bottom border — appears with the background ── */}
      <motion.div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "color-mix(in srgb, var(--theme-text) 12%, transparent)" }}
        animate={{ opacity: showSolid ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 32 }}
      />

      {/* ── Content row ── */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group touch-manipulation min-h-[48px]"
        >
          <Image
            src="/images/logo.png"
            alt="Fades & Facials"
            width={48}
            height={48}
            className="transition-transform duration-300 group-hover:scale-110"
            priority
          />
          <span
            className="text-2xl font-light tracking-[0.04em]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Fades &amp; Facials
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest font-medium">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="hover:text-[var(--theme-accent)] transition-colors duration-200 touch-manipulation min-h-[48px] flex items-center"
              style={{ color: pathname === href ? "var(--theme-accent)" : "inherit" }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <motion.button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="md:hidden flex items-center justify-center w-12 h-12 touch-manipulation rounded-2xl hover:bg-white/10 transition-colors"
          onClick={() => setMenuOpen((prev) => !prev)}
          onTouchEnd={(e) => { e.preventDefault(); setMenuOpen((prev) => !prev); }}
          whileTap={{ scale: 0.95 }}
        >
          {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </motion.button>
      </div>

      {/* ── Mobile Menu Overlay ── */}
      <motion.div
        initial="closed"
        animate={menuOpen ? "open" : "closed"}
        variants={mobileMenuVariants}
        className="md:hidden fixed inset-0 z-[9999] pt-20 px-6 overflow-y-auto"
        style={{
          display:    menuOpen ? "block" : "none",
          background: "var(--theme-bg)",
          color:      "var(--theme-text)",
        }}
      >
        <div className="flex flex-col gap-6 text-2xl font-light">
          {[
            { href: "/services", label: "Services"         },
            { href: "/gallery",  label: "Gallery"          },
            { href: "/book",     label: "Book Appointment" },
            { href: "/admin",    label: "Studio Dashboard" },
          ].map((link) => (
            <motion.div key={link.href} variants={linkVariants}>
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                onTouchEnd={(e) => { e.preventDefault(); setMenuOpen(false); }}
                className="block py-4 border-b touch-manipulation transition-colors hover:text-[var(--theme-accent)]"
                style={{
                  borderColor: "color-mix(in srgb, var(--theme-text) 10%, transparent)",
                  color: pathname === link.href ? "var(--theme-accent)" : "var(--theme-text)",
                }}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </div>

        <div
          className="mt-auto pt-12 text-xs uppercase tracking-widest text-center opacity-60"
          style={{ color: "var(--theme-text)" }}
        >
          © sourc3code @2026 • @fadesandfacials
        </div>
      </motion.div>
    </motion.nav>
  );
}
