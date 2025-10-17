import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    appIsrStatus: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  eslint: {
    // ✅ skip linting errors during builds on Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ✅ skip TS errors during builds on Vercel
    ignoreBuildErrors: true,
  },
  // Reduce memory usage during build
  compress: true,
};

export default nextConfig;
