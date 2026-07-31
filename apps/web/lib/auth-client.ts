"use client";

import {
  createPagecraftAuthClient,
  normalizePublicUrl,
} from "@landing-page-generator/auth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is missing. Check apps/web/.env.local and restart next.");
}

export const authClient = createPagecraftAuthClient(apiUrl);

export const { useSession, signIn, signUp, signOut } = authClient;

export function getMarketingUrl(): string {
  return normalizePublicUrl(process.env.NEXT_PUBLIC_MARKETING_URL, "http://localhost:3002");
}
