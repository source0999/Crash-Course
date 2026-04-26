/**
 * @file app/layout.tsx
 *
 * Root layout — the single HTML shell that wraps every page in the application.
 * Next.js renders this once and keeps it mounted across client-side navigations,
 * so changes here affect every route without a full page reload.
 *
 * Font loading strategy: `next/font/google` downloads the font files at build
 * time and self-hosts them on the same domain. This eliminates the Google Fonts
 * network request at runtime, improving both performance and privacy (no third-
 * party cookie/tracking exposure to Google's CDN on page load).
 *
 * console.log audit: No console.log statements present in this file.
 */

import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";

// ── Bodoni Moda — the editorial serif ──────────────────────────────────────────
// Display: "swap" means the browser renders fallback text immediately and
// swaps once loaded — prevents invisible text during slow loads.
const bodoni = Bodoni_Moda({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// ── Manrope — the clean sans-serif ────────────────────────────────────────────
// Used for body copy, labels, navigation, and utility UI text.
const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fades and Facials",
  description: "It's an experience",
};

/**
 * RootLayout
 *
 * The application shell. Renders the persistent Navbar and wraps all page
 * content. Injected automatically by Next.js App Router — never imported
 * manually.
 *
 * Font CSS variables (`--font-serif`, `--font-sans`) are applied to
 * the `<html>` element via className so every component in the tree can
 * reference them without prop-drilling or a context provider.
 *
 * `h-auto` on `<html>` is intentional — `h-full` would constrain the
 * document height to the viewport, breaking sticky/fixed positioning and
 * causing scroll issues on iOS Safari where the viewport height shifts as
 * the browser chrome shows and hides.
 *
 * `antialiased` enables `-webkit-font-smoothing: antialiased` and
 * `-moz-osx-font-smoothing: grayscale`, which renders Bodoni Moda and
 * Manrope typefaces at the intended weight on high-DPI screens.
 *
 * @param children - The active page component rendered by Next.js routing.
 * @returns The full HTML document shell with fonts, navbar, and page content.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodoni.variable} ${manrope.variable} h-auto antialiased`}
    >
      <body className="min-h-screen flex flex-col overflow-y-auto">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
