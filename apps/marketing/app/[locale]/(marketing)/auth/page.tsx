import { redirect } from "next/navigation";
import { getAuthHref } from "@/features/auth";

export default function AuthRoutePage() {
  redirect(getAuthHref());
}
