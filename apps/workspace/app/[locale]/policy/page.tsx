import type { Metadata } from "next";
import { PolicyPage } from "@/features/legal";

export const metadata: Metadata = {
  title: "Privacy Policy — EngliTutor",
  description:
    "How EngliTutor collects, uses, and protects account, learning, voice, and billing data.",
};

export default function PolicyRoutePage() {
  return <PolicyPage />;
}
