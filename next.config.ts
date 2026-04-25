import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─────────────────────────────────────────
  // MOBILE DEV ACCESS — allowedDevOrigins
  // WHAT: Allows devices on the local network to connect to the Next.js dev server.
  // WHY: Next.js 15 blocks cross-origin requests to dev resources by default.
  //      Without this, phones/tablets on the same WiFi get a blocked HMR connection,
  //      changes don't reflect on device, and scroll/interaction bugs appear "unfixed"
  //      even after correct code changes are applied.
  // HOW TO FIND YOUR IP: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
  //      and look for your IPv4 address under your WiFi adapter.
  // PRODUCTION: This setting only affects the dev server. It has zero effect on builds.
  // ─────────────────────────────────────────
  allowedDevOrigins: ['10.0.0.126'],
  images: {
    qualities: [75, 100],
  },
};

export default nextConfig;
