import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@landing-page-generator/ui", "@landing-page-generator/auth"],
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};

export default nextConfig;
