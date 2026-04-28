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
  title: "Fades and Facials",
  description: "It's an experience",
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
        <ThemePreferenceSync />
        <Navbar />
        <div className="flex min-h-0 flex-1 flex-col">
          <SmoothScrolling>{children}</SmoothScrolling>
        </div>
        <Footer />
      </body>
    </html>
  );
}
