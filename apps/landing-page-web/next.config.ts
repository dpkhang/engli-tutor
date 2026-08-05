import path from "node:path";
import type { NextConfig } from "next";

/** Baked into the client bundle. Prefer CI/Vercel env; fallback keeps prod deploys working. */
const DEFAULT_API_URL = "https://landing-generator-be.onrender.com";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL).replace(/\/$/, "");
// Keep cookies first-party in production and during localhost development while
// continuing to use the configured upstream API.
const useSameOriginProxy = true;

if (!process.env.NEXT_PUBLIC_API_URL?.trim()) {
  console.warn(
    `[landing-page-web] NEXT_PUBLIC_API_URL unset — using ${DEFAULT_API_URL}. Set it in Vercel/GitLab for production.`,
  );
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_AUTH_SAME_ORIGIN: useSameOriginProxy ? "true" : "false",
  },
  transpilePackages: [
    "@landing-page-generator/ui",
    "@landing-page-generator/auth",
    "@landing-page-generator/api-client",
  ],
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
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
