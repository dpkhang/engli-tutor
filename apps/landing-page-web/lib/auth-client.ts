"use client";

import {
  authErrorMessage,
  createPagecraftAuthClient,
  normalizePublicUrl,
} from "@landing-page-generator/auth";

export const authClient = createPagecraftAuthClient(
  normalizePublicUrl(process.env.NEXT_PUBLIC_API_URL, "http://localhost:3001"),
);

export const { useSession, signIn, signUp, signOut } = authClient;

export { authErrorMessage };
