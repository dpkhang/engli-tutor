import { createAuthClient } from "better-auth/react";

export type PagecraftAuthClient = ReturnType<typeof createAuthClient>;

/** Create Better Auth client. `baseURL` must be the public API origin (no trailing slash). */
export function createPagecraftAuthClient(baseURL: string): PagecraftAuthClient {
  const normalized = baseURL.replace(/\/$/, "");
  if (!normalized) {
    throw new Error("Auth baseURL is empty. Set NEXT_PUBLIC_API_URL.");
  }
  return createAuthClient({ baseURL: normalized });
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
