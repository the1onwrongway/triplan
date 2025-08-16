import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Ignore ESLint errors during production builds (Vercel)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;