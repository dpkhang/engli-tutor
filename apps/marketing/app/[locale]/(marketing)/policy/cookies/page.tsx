import type { Metadata } from "next";
import { CookiesPage } from "@/features/legal";

export const metadata: Metadata = {
  title: "Cookie Policy — EngliTutor",
  description: "Which cookies and browser storage EngliTutor uses, why they are needed, and how to control them.",
};

export default function CookiePolicyRoutePage() {
  return <CookiesPage />;
}
