import { redirect } from "next/navigation";
import { getAuthHref } from "@/features/auth/model/session";

/** Auth UI runs on workspace so session cookies are first-party. */
export default function AuthRoutePage() {
  redirect(getAuthHref());
}
