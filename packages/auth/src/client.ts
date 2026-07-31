import { createAuthClient } from "better-auth/react";

export type PagecraftAuthClient = ReturnType<typeof createAuthClient>;

/**
 * Create Better Auth client.
 * - With `baseURL`: talk to API directly (local FE → Render).
 * - Without: same-origin `/api/auth` (Vercel rewrite → API; first-party cookies).
 */
export function createPagecraftAuthClient(baseURL?: string): PagecraftAuthClient {
  if (baseURL && baseURL.length > 0) {
    return createAuthClient({ baseURL: baseURL.replace(/\/$/, "") });
  }
  return createAuthClient();
}

export function authErrorMessage(
  error: { message?: string; statusText?: string } | null | undefined,
): string {
  if (!error) return "Đã xảy ra lỗi. Thử lại.";
  if (error.message) return error.message;
  if (error.statusText) return error.statusText;
  return "Đã xảy ra lỗi. Thử lại.";
}

export function normalizePublicUrl(value: string | undefined, fallback: string): string {
  return (value && value.length > 0 ? value : fallback).replace(/\/$/, "");
}
