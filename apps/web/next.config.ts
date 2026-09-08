import path from "node:path";
import type { NextConfig } from "next";

const DEFAULT_API_URL =
  process.env.NODE_ENV === "production"
    ? "https://pkbc7gf23n.ap-southeast-1.awsapprunner.com"
    : "http://localhost:3001";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL).replace(/\/$/, "");

if (!process.env.NEXT_PUBLIC_API_URL?.trim()) {
  console.warn(
    `[web] NEXT_PUBLIC_API_URL unset — using ${DEFAULT_API_URL}. Set it in Vercel/GitLab to the AWS App Runner URL.`,
  );
}

// Always proxy API calls through the frontend origin. This keeps auth cookies
// first-party on both Vercel domains and localhost while the upstream can still
// be the production AWS App Runner API.
const useSameOriginProxy = true;

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_SITE_URL: (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://pagecraft-ai.site").replace(/\/$/, ""),
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
  // Proxy lives in app/api/[...path]/route.ts (rewrites would bypass it and
  // forward browser Origin → API INVALID_ORIGIN for local domains).
};

export default nextConfig;
