import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─────────────────────────────────────────
  // MOBILE DEV ACCESS — allowedDevOrigins
  // WHY: Next.js 15 blocks cross-origin dev requests by default; phones on WiFi need this.
  // PRODUCTION: zero effect on builds.
  // ─────────────────────────────────────────
  allowedDevOrigins: ['10.0.0.126', '100.82.31.124'],

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eioptwfwdgqnkcbeaoqp.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
