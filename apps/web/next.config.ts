import path from "node:path";
import type { NextConfig } from "next";

const DEFAULT_API_URL = "https://landing-generator-be.onrender.com";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL).replace(/\/$/, "");

if (!process.env.NEXT_PUBLIC_API_URL?.trim()) {
  console.warn(
    `[web] NEXT_PUBLIC_API_URL unset — using ${DEFAULT_API_URL}. Set it in Vercel/GitLab for production.`,
  );
}

/** On Vercel, proxy API so auth cookies are first-party (stops marketing↔workspace loop). */
const useSameOriginProxy = Boolean(process.env.VERCEL);

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
  async rewrites() {
    if (!useSameOriginProxy) return [];
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
