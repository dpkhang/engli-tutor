import type { Metadata } from "next";
import { Suspense } from "react";
import { WelcomePage } from "@/features/onboarding/ui/welcome-page";

export const metadata: Metadata = {
  title: "Welcome — EngliTutor",
};

export default function WelcomeRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
          Opening your workspace…
        </div>
      }
    >
      <WelcomePage />
    </Suspense>
  );
}
