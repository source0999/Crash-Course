/** @file app/layout.tsx */

// ─────────────────────────────────────────
// SECTION: RootLayout
// WHAT: HTML shell that wraps every page — mounts fonts, active theme, Navbar, and Footer.
// WHY: active_theme is fetched server-side so [data-theme] is correct on the very
//   first byte of HTML — zero flash of unstyled theme, no client-side hydration gap.
// PHASE 4: No changes needed — site_config.active_theme row is already live.
// ─────────────────────────────────────────

import type { Metadata } from "next";
import { Syne, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createServerSupabaseClient } from "@/lib/supabase";

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
  let theme = "luxury-dark";

  try {
    const { data } = await supabase
      .from("site_config")
      .select("value")
      .eq("key", "active_theme")
      .single();
    if (data?.value) theme = data.value;
  } catch {
    // Falls back to luxury-dark — site remains styled.
  }

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${syne.variable} ${inter.variable} h-auto antialiased`}
    >
      <body className="min-h-screen flex flex-col overflow-y-auto">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
