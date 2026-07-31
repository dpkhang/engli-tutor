"use client";

import { authErrorMessage, createPagecraftAuthClient } from "@landing-page-generator/auth";

// Inlined at build via next.config `env` (always set — see next.config.ts fallback).
const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

export const authClient = createPagecraftAuthClient(apiUrl);

export const { useSession, signIn, signUp, signOut } = authClient;

export { authErrorMessage };
