import type { NextConfig } from "next";

// SSR is required for Vercel hosting; do NOT set `output: "export"`.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
