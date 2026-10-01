"use client";

import { memo } from "react";
import { OnboardingBackdrop } from "../onboarding-backdrop";
import { WelcomeScreen } from "../welcome-screen";

export type WelcomePageViewProps = {
  firstName: string;
  onFinished: () => void | Promise<void>;
};

export const WelcomePageView = memo(function WelcomePageView({
  firstName,
  onFinished,
}: WelcomePageViewProps) {
  return (
    <main className="relative min-h-svh overflow-hidden bg-background">
      <OnboardingBackdrop />
      <WelcomeScreen firstName={firstName} onFinished={onFinished} />
    </main>
  );
});
