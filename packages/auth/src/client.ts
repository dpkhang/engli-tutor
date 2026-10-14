import { createAuthClient } from "better-auth/react";
import { oneTimeTokenClient } from "better-auth/client/plugins";

type EngliAuthClientOptions = {
  baseURL?: string;
  plugins: [ReturnType<typeof oneTimeTokenClient>];
};

export type EngliAuthClient = ReturnType<typeof createAuthClient<EngliAuthClientOptions>>;

/**
 * Create Better Auth client.
 * - With `baseURL`: talk to API directly (local FE → Fly/API host).
 * - Without: same-origin `/api/auth` (Vercel rewrite → API; first-party cookies).
 */
export function createEngliAuthClient(baseURL?: string): EngliAuthClient {
  return createAuthClient<EngliAuthClientOptions>({
    baseURL: baseURL && baseURL.length > 0 ? baseURL.replace(/\/$/, "") : undefined,
    plugins: [oneTimeTokenClient()],
  });
}

export function authErrorMessage(
  error: { message?: string; statusText?: string } | null | undefined,
  fallback = "Something went wrong. Try again.",
): string {
  if (!error) return fallback;
  if (error.message) return error.message;
  if (error.statusText) return error.statusText;
  return fallback;
}

export function normalizePublicUrl(value: string | undefined, fallback: string): string {
  return (value && value.length > 0 ? value : fallback).replace(/\/$/, "");
}
