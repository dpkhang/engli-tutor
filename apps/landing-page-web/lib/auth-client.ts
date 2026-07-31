"use client";

import { authErrorMessage, createPagecraftAuthClient } from "@landing-page-generator/auth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is missing. Check apps/landing-page-web/.env.local and restart next.");
}

export const authClient = createPagecraftAuthClient(apiUrl);

export const { useSession, signIn, signUp, signOut } = authClient;

export { authErrorMessage };
