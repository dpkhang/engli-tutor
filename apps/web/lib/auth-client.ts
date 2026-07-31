"use client";

import {
  createPagecraftAuthClient,
  normalizePublicUrl,
} from "@landing-page-generator/auth";

export const authClient = createPagecraftAuthClient(
  normalizePublicUrl(process.env.NEXT_PUBLIC_API_URL, "http://localhost:3001"),
);

export const { useSession, signIn, signUp, signOut } = authClient;

export function getMarketingUrl(): string {
  return normalizePublicUrl(process.env.NEXT_PUBLIC_MARKETING_URL, "http://localhost:3002");
}
