import path from "node:path";
import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
if (!apiUrl) {
  throw new Error(
    "[landing-page-web] NEXT_PUBLIC_API_URL is required in .env.local (e.g. https://landing-generator-be.onrender.com)",
  );
}

const nextConfig: NextConfig = {
  // Force-inline into the client bundle (Turbopack/monorepo often misses package/app fallbacks)
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
  },
  transpilePackages: ["@landing-page-generator/ui", "@landing-page-generator/auth"],
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
