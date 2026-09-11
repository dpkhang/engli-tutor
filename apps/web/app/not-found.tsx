import type { Metadata } from "next";
import { NotFoundPage } from "@/features/layout/ui/not-found-page";

export const metadata: Metadata = {
  title: "Page not found — EngliTutor",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <NotFoundPage />;
}
