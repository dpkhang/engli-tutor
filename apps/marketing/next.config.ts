import path from "node:path";
import type { NextConfig } from "next";

/** Baked into the client bundle. Prefer CI/Vercel env; local fallback is the API on :3001. */
const isProdBuild = process.env.NODE_ENV === "production";
const DEFAULT_API_URL = isProdBuild
  ? "https://api.harrybox.cloud"
  : "http://localhost:3001";
const DEFAULT_APP_URL = isProdBuild ? "https://app.pagecraft-ai.site" : "http://localhost:3000";
const DEFAULT_SITE_URL = isProdBuild ? "https://pagecraft-ai.site" : "http://localhost:3002";

function publicUrl(value: string | undefined, fallback: string): string {
  return (value?.trim() || fallback).replace(/\/$/, "");
}

const apiUrl = publicUrl(process.env.NEXT_PUBLIC_API_URL, DEFAULT_API_URL);
const appUrl = publicUrl(process.env.NEXT_PUBLIC_APP_URL, DEFAULT_APP_URL);
const siteUrl = publicUrl(process.env.NEXT_PUBLIC_SITE_URL, DEFAULT_SITE_URL);
// Keep cookies first-party in production and during localhost development while
// continuing to use the configured upstream API.
const useSameOriginProxy = true;

if (!process.env.NEXT_PUBLIC_API_URL?.trim()) {
  console.warn(
    `[engli-tutor-web] NEXT_PUBLIC_API_URL unset — using ${DEFAULT_API_URL}. Set it in Vercel/GitLab for production.`,
  );
}
if (!process.env.NEXT_PUBLIC_APP_URL?.trim()) {
  console.warn(
    `[engli-tutor-web] NEXT_PUBLIC_APP_URL unset — using ${DEFAULT_APP_URL}. Set it in Vercel/GitLab for production.`,
  );
}
if (!process.env.NEXT_PUBLIC_SITE_URL?.trim()) {
  console.warn(
    `[engli-tutor-web] NEXT_PUBLIC_SITE_URL unset — using ${DEFAULT_SITE_URL}. Set it in Vercel/GitLab for production.`,
  );
}

if (isProdBuild && /localhost|127\.0\.0\.1/.test(appUrl)) {
  throw new Error(
    `[engli-tutor-web] NEXT_PUBLIC_APP_URL must not be localhost in a production build (got ${appUrl}).`,
  );
}

const monorepoRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: monorepoRoot,
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_APP_URL: appUrl,
    NEXT_PUBLIC_SITE_URL: siteUrl,
    NEXT_PUBLIC_AUTH_SAME_ORIGIN: useSameOriginProxy ? "true" : "false",
  },
  transpilePackages: [
    "@engli-tutor/ui",
    "@engli-tutor/auth",
    "@engli-tutor/api-client",
    "@engli-tutor/legal",
  ],
  turbopack: {
    root: monorepoRoot,
  },
  experimental: {
    optimizePackageImports: ["@engli-tutor/ui"],
  },
  images: {
    qualities: [70, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Proxy lives in app/api/[...path]/route.ts (rewrites would bypass it and
  // forward browser Origin → API INVALID_ORIGIN for local domains).
};

export default nextConfig;
