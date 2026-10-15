"use client";

import { authErrorMessage, createEngliAuthClient, startSessionSync } from "@engli-tutor/auth";
import { getAppUrl } from "@/features/auth";

const useSameOrigin = process.env.NEXT_PUBLIC_AUTH_SAME_ORIGIN === "true";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const authClient = useSameOrigin
  ? createEngliAuthClient()
  : createEngliAuthClient(apiUrl);

export const { useSession, signIn, signUp, signOut } = authClient;

export { authErrorMessage };

/** Share the fresh session with the workspace host, then continue to `next`. */
export async function redirectAfterSignIn(next: string): Promise<void> {
  const absolute = new URL(next, window.location.href).toString();
  const synced = await startSessionSync(authClient, getAppUrl(), absolute);
  if (!synced) window.location.assign(next);
}
