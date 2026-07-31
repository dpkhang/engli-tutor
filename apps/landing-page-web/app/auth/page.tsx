import { redirect } from "next/navigation";

function workspaceLoginUrl(): string {
  const app = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${app}/login`;
}

/** Auth UI runs on workspace so session cookies are first-party. */
export default function AuthRoutePage() {
  redirect(workspaceLoginUrl());
}
