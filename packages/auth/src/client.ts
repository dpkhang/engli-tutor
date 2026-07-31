"use client";

import { createAuthClient } from "better-auth/react";

export function getApiUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
}

/** Workspace app URL (used by marketing). */
export function getWorkspaceUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Marketing site URL (used by workspace). */
export function getMarketingUrl(): string {
  return (process.env.NEXT_PUBLIC_MARKETING_URL ?? "http://localhost:3002").replace(/\/$/, "");
}

export const authClient = createAuthClient({
  baseURL: getApiUrl(),
});

export const { useSession, signIn, signUp, signOut } = authClient;

export function authErrorMessage(error: { message?: string; statusText?: string } | null | undefined): string {
  if (!error) return "Đã xảy ra lỗi. Thử lại.";
  if (error.message) return error.message;
  if (error.statusText) return error.statusText;
  return "Đã xảy ra lỗi. Thử lại.";
}
