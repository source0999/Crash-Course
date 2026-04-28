/** @file app/layout.tsx */

// ─────────────────────────────────────────
// SECTION: RootLayout
// WHAT: HTML shell that wraps every page — mounts fonts, active theme, Navbar, and Footer.
// WHY: active_theme is fetched server-side so [data-theme] is correct on the very
//   first byte of HTML — zero flash of unstyled theme, no client-side hydration gap.
// PHASE 4: No changes needed — site_config.active_theme row is already live.
// Lenis: SmoothScrolling wraps layout {children} only so main scroll is inertial; chrome stays outside.
// ─────────────────────────────────────────

import type { Metadata } from "next";
import { Syne, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThemePreferenceSync from "@/components/ThemePreferenceSync";
import SmoothScrolling from "@/components/SmoothScrolling";
import ScrollToTopOnMount from "@/components/ScrollToTopOnMount";
import RouteChangeScrollToTop from "@/components/RouteChangeScrollToTop";
import { createServerSupabaseClient } from "@/lib/supabase";
import { normalizeThemeFromDb } from "@/lib/theme";

// ── Syne — bold geometric display face for headlines ─────────────────────────
const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// ── Inter — clean neutral sans-serif for body text ───────────────────────────
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fades & Facials — Premium Barber & Skincare Studio",
    template: "%s | Fades & Facials",
  },
  description:
    "Premium barber and facial services. Expert fades, hot shaves, beard care, and luxury skincare treatments in a relaxed, upscale studio.",
  keywords: ["barber", "fades", "facials", "beard care", "hot shave", "barbershop", "haircut", "skincare"],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Fades & Facials — Premium Barber & Skincare Studio",
    description: "Expert fades, hot shaves, beard care, and luxury skincare treatments.",
    siteName: "Fades & Facials",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fades & Facials",
    description: "Premium barber and facial services.",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  let themeRaw: string | null = null;

  try {
    const { data } = await supabase
      .from("site_config")
      .select("value")
      .eq("key", "active_theme")
      .single();
    if (data?.value) themeRaw = data.value;
  } catch {
    // Falls back via normalizeThemeFromDb.
  }

  const theme = normalizeThemeFromDb(themeRaw);

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${syne.variable} ${inter.variable} h-auto antialiased`}
    >
      <body className="min-h-screen flex flex-col overflow-y-auto">
        <ScrollToTopOnMount />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HairSalon",
              name: "Fades & Facials",
              description:
                "Premium barber and facial services. Expert fades, hot shaves, beard care, and luxury skincare treatments.",
              url: "https://fadesandfacials.com",
              priceRange: "$$",
              sameAs: ["https://www.instagram.com/fadesandfacials"],
            }),
          }}
        />
        <ThemePreferenceSync />
        <Navbar />
        <div className="flex min-h-0 flex-1 flex-col">
          <SmoothScrolling>
            <RouteChangeScrollToTop />
            {children}
          </SmoothScrolling>
        </div>
        <Footer />
      </body>
    </html>
  );
}
