import type { Metadata } from "next";
import { SessionSyncPage } from "@/features/auth";

export const metadata: Metadata = {
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default function SessionSyncRoutePage() {
  return <SessionSyncPage />;
}
