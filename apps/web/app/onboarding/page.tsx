import type { Metadata } from "next";
import { Suspense } from "react";
import { OnboardingPage } from "@/features/onboarding";

export const metadata: Metadata = {
  title: "Set up your path — EngliTutor",
};

export default function OnboardingRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
          Preparing your setup…
        </div>
      }
    >
      <OnboardingPage />
    </Suspense>
  );
}
