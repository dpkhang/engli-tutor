"use client";

import { useState } from "react";
import { simulateSignIn } from "@/features/auth/model/session";
import {
  SocialAuthButtonsView,
  type SocialAuthButtonsProps,
  type SocialProvider,
} from "./social-auth-buttons.view";

export type { SocialAuthButtonsProps };

export function SocialAuthButtons({ mode, disabled, className }: SocialAuthButtonsProps) {
  const [pending, setPending] = useState<SocialProvider | null>(null);

  return (
    <SocialAuthButtonsView
      mode={mode}
      disabled={disabled}
      className={className}
      pending={pending}
      onProviderClick={(provider) => {
        setPending(provider.id);
        void simulateSignIn({
          email: `demo@${provider.id}.com`,
          name: `Demo ${provider.label}`,
          provider: provider.id,
          mode,
        }).catch(() => {
          setPending(null);
        });
      }}
    />
  );
}
