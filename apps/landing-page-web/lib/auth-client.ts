"use client";

import { authErrorMessage, createPagecraftAuthClient } from "@landing-page-generator/auth";

const useSameOrigin = process.env.NEXT_PUBLIC_AUTH_SAME_ORIGIN === "true";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const authClient = useSameOrigin
  ? createPagecraftAuthClient()
  : createPagecraftAuthClient(apiUrl);

export const { useSession, signIn, signUp, signOut } = authClient;

export { authErrorMessage };
