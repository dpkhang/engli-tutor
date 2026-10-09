import { networkInterfaces } from "node:os";
import path from "node:path";
import type { NextConfig } from "next";

// Lets phones on the same Wi-Fi open the dev server by LAN IP without HMR being blocked.
const lanDevOrigins = Object.values(networkInterfaces())
  .flat()
  .filter((net) => net && net.family === "IPv4" && !net.internal)
  .map((net) => net!.address);

const DEFAULT_API_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.harrybox.cloud"
    : "http://localhost:3001";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL).replace(/\/$/, "");

if (!process.env.NEXT_PUBLIC_API_URL?.trim()) {
  console.warn(
    `[web] NEXT_PUBLIC_API_URL unset — using ${DEFAULT_API_URL}. Set it in GitLab for production.`,
  );
}

// Always proxy API calls through the frontend origin. This keeps auth cookies
// first-party on both Vercel domains and localhost while the upstream can still
// be the production API.
const useSameOriginProxy = true;

const monorepoRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: monorepoRoot,
  allowedDevOrigins: lanDevOrigins,
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_SITE_URL: (
      process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://app.harrybox.cloud"
    ).replace(/\/$/, ""),
    NEXT_PUBLIC_AUTH_SAME_ORIGIN: useSameOriginProxy ? "true" : "false",
  },
  transpilePackages: [
    "@engli-tutor/ui",
    "@engli-tutor/auth",
    "@engli-tutor/api-client",
    "@engli-tutor/legal",
  ],
  experimental: {
    optimizePackageImports: ["@engli-tutor/ui"],
  },
  turbopack: {
    root: monorepoRoot,
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
    ];
  },
  // Proxy lives in app/api/[...path]/route.ts (rewrites would bypass it and
  // forward browser Origin → API INVALID_ORIGIN for local domains).
};

export default nextConfig;
