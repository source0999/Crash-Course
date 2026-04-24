import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.0.0.126'],
  images: {
    qualities: [75, 100],
  },
};

export default nextConfig;
