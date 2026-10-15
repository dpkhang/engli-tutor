"use client";

import {
  authErrorMessage,
  createEngliAuthClient,
  normalizePublicUrl,
  startSessionSync,
} from "@engli-tutor/auth";

const useSameOrigin = process.env.NEXT_PUBLIC_AUTH_SAME_ORIGIN === "true";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const authClient = useSameOrigin
  ? createEngliAuthClient()
  : createEngliAuthClient(apiUrl);

export const { useSession, signIn, signUp, signOut } = authClient;

export { authErrorMessage };

export function getMarketingUrl(): string {
  return normalizePublicUrl(process.env.NEXT_PUBLIC_MARKETING_URL, "http://localhost:3002");
}

export function useSameOriginAuth(): boolean {
  return useSameOrigin;
}

/** Share the fresh session with the marketing host, then continue to `next`. */
export async function redirectAfterSignIn(next: string): Promise<void> {
  const absolute = new URL(next, window.location.href).toString();
  const synced = await startSessionSync(authClient, getMarketingUrl(), absolute);
  if (!synced) window.location.replace(next);
}
